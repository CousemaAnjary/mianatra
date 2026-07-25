import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  AIAuthenticationError,
  AIJsonParseError,
  AIJsonTruncatedError,
  AINetworkError,
  AIRateLimitError,
  AISchemaValidationError,
  AITimeoutError,
  AIService,
  GeminiMobileProvider,
  GeminiRestTransport,
  extractJsonValue,
  type GeminiGenerateParams,
  type GeminiGenerateResponse,
  type GeminiMobileTransport,
} from "../src/services/ai";
import {
  GeminiApiKeyMissingError,
  GemmaModelUnsupportedError,
  createAISettingsService,
} from "../src/features/ai-settings/services/ai-settings.service";

class MemorySettingsRepository {
  readonly values = new Map<string, string>();

  async get(key: string) {
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string) {
    this.values.set(key, value);
    return { key, value, updatedAt: "2026-07-25T00:00:00.000Z" };
  }

  async remove(key: string) {
    this.values.delete(key);
  }
}

class MockGeminiMobileTransport implements GeminiMobileTransport {
  readonly calls: GeminiGenerateParams[] = [];
  response: GeminiGenerateResponse = { text: "OK", finishReason: "STOP", tokenUsage: null };
  error: unknown = null;
  delayMs = 0;

  async generateContent(params: GeminiGenerateParams): Promise<GeminiGenerateResponse> {
    this.calls.push(params);
    if (this.delayMs > 0) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, this.delayMs);
        params.request.signal.addEventListener(
          "abort",
          () => {
            clearTimeout(timeout);
            reject(new DOMException("Aborted", "AbortError"));
          },
          { once: true },
        );
      });
    }
    if (this.error) {
      throw this.error;
    }
    return this.response;
  }
}

function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

async function main() {
  const settings = new MemorySettingsRepository();
  const transport = new MockGeminiMobileTransport();
  const service = createAISettingsService({ settings, transport, timeoutMs: 20 });

  assert.equal(await service.getGeminiApiKey(), null, "clé absente");
  assert.equal(await service.setGeminiApiKey("   "), null, "clé vide supprimée");
  assert.equal(await service.getGeminiApiKey(), null, "clé vide considérée absente");
  assert.equal(await service.setGeminiApiKey("  key-one  "), "key-one", "clé trimée");
  assert.equal(await service.getGeminiApiKey(), "key-one", "clé enregistrée");
  assert.equal(await service.setGeminiApiKey("key-two"), "key-two", "clé remplacée");
  assert.equal(await service.getGeminiApiKey(), "key-two", "nouvelle clé relue");
  await service.removeGeminiApiKey();
  assert.equal(await service.getGeminiApiKey(), null, "clé supprimée");

  assert.equal(await service.getGemmaModel(), "gemma-4-26b-a4b-it", "modèle par défaut");
  assert.equal(await service.setGemmaModel("gemma-4-31b-it"), "gemma-4-31b-it", "modèle alternatif");
  await assert.rejects(() => service.setGemmaModel("gemini-pro"), GemmaModelUnsupportedError, "modèle invalide");

  assert.equal(await service.isAIEnabled(), false, "IA désactivée par défaut");
  assert.equal(await service.createConfiguredMobileAIService(), null, "provider non créé si IA désactivée");
  await service.setAIEnabled(true);
  await assert.rejects(() => service.createConfiguredMobileAIService(), GeminiApiKeyMissingError, "provider non créé sans clé");
  await service.setGeminiApiKey("valid-key");
  const configuredService = await service.createConfiguredMobileAIService();
  assert.notEqual(configuredService, null, "provider créé avec configuration valide");
  if (!configuredService) {
    throw new Error("Configured AI service was expected.");
  }

  const textResponse = await configuredService.generateText({ prompt: "Ping" });
  assert.equal(textResponse.text, "OK", "génération texte simulée");
  assert.equal(transport.calls.at(-1)?.apiKey, "valid-key", "clé injectée dans le transport");
  assert.equal(transport.calls.at(-1)?.model, "gemma-4-31b-it", "modèle injecté dans le transport");

  transport.error = new AIAuthenticationError();
  assert.notEqual(configuredService, null, "service configuré disponible pour les tests d'erreur");
  await assert.rejects(() => configuredService.generateText({ prompt: "Ping" }), AIAuthenticationError, "clé invalide simulée");
  transport.error = new AIRateLimitError();
  await assert.rejects(() => configuredService.generateText({ prompt: "Ping" }), AIRateLimitError, "quota dépassé simulé");
  transport.error = new AINetworkError();
  await assert.rejects(() => configuredService.generateText({ prompt: "Ping" }), AINetworkError, "erreur réseau simulée");
  transport.error = null;
  transport.delayMs = 100;
  await assert.rejects(() => configuredService.generateText({ prompt: "Ping" }), AITimeoutError, "timeout simulé");
  transport.delayMs = 0;

  const imageProvider = new GeminiMobileProvider({ apiKey: "valid-key", model: "gemma-4-26b-a4b-it", transport });
  await imageProvider.generateFromImage({ prompt: "Image", imageBase64: "abc", mimeType: "image/png" });
  assert.equal(transport.calls.at(-1)?.imageBase64, "abc", "image base64 transmise");
  assert.equal(transport.calls.at(-1)?.options?.thinkingLevel, "minimal", "thinking minimal transmis au transport");

  assert.deepEqual(extractJsonValue("{\"ok\":true}"), { ok: true }, "réponse JSON brute valide");
  assert.deepEqual(extractJsonValue("```json\n{\"ok\":true}\n```"), { ok: true }, "JSON dans bloc Markdown");
  assert.deepEqual(extractJsonValue("Voici le résultat: {\"ok\":true} fin."), { ok: true }, "texte autour d'un unique objet JSON équilibré");
  assert.throws(() => extractJsonValue("{\"ok\":true"), AIJsonTruncatedError, "JSON tronqué rejeté sans réparation");
  assert.throws(() => extractJsonValue("{ invalid }"), AIJsonParseError, "JSON syntaxiquement invalide distingué");

  transport.response = { text: "{\"ok\":true}", finishReason: "STOP", tokenUsage: null };
  const structuredService = new AIService(imageProvider);
  assert.equal(
    (await structuredService.generateStructuredFromImage({ prompt: "Image", imageBase64: "abc", mimeType: "image/png" }, z.object({ ok: z.boolean() }))).ok,
    true,
    "sortie structurée image valide",
  );
  transport.response = { text: "{\"ok\":\"bad\"}", finishReason: "STOP", tokenUsage: null };
  await assert.rejects(
    () => structuredService.generateStructuredFromImage({ prompt: "Image", imageBase64: "abc", mimeType: "image/png" }, z.object({ ok: z.boolean() })),
    AISchemaValidationError,
    "sortie Zod invalide distinguée",
  );

  let capturedRequestBody: unknown = null;
  const restTransport = new GeminiRestTransport({
    fetchFn: async (_url, init) => {
      capturedRequestBody = JSON.parse(String(init?.body));
      return new Response(
        JSON.stringify({
          candidates: [
            {
              finishReason: "STOP",
              content: {
                parts: [
                  { text: "raisonnement interne", thought: true },
                  { text: "{\"ok\":true}" },
                ],
              },
            },
          ],
          usageMetadata: { candidatesTokenCount: 12, promptTokenCount: 4, totalTokenCount: 16 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    },
  });
  const restResponse = await restTransport.generateContent({
    apiKey: "valid-key",
    model: "gemma-4-26b-a4b-it",
    prompt: "Image",
    imageBase64: "abc",
    mimeType: "image/png",
    options: { maxOutputTokens: 32 },
    request: { signal: new AbortController().signal, timeoutMs: 1000 },
  });
  assert.equal(restResponse.text, "{\"ok\":true}", "partie de réflexion ignorée");
  assert.equal(restResponse.diagnostics?.candidateCount, 1, "diagnostic candidateCount");
  assert.equal(restResponse.diagnostics?.partCount, 2, "diagnostic partCount");
  assert.equal(restResponse.diagnostics?.thoughtPartCount, 1, "diagnostic thoughtPartCount");
  assert.equal(restResponse.diagnostics?.responseTextLength, 11, "diagnostic responseTextLength");
  assert.equal(restResponse.diagnostics?.firstNonWhitespaceCharacter, "{", "diagnostic premier caractère");
  assert.equal(restResponse.diagnostics?.lastNonWhitespaceCharacter, "}", "diagnostic dernier caractère");
  assert.equal(restResponse.diagnostics?.outputTokenCount, 12, "diagnostic outputTokenCount");
  assert.notEqual(capturedRequestBody, null, "requête REST capturée");
  const generationConfig = (capturedRequestBody as { generationConfig?: Record<string, unknown> }).generationConfig;
  assert.equal(generationConfig?.responseMimeType, "application/json", "responseMimeType application/json envoyé");
  assert.deepEqual(generationConfig?.thinkingConfig, { thinkingLevel: "minimal" }, "thinkingLevel minimal envoyé");

  transport.response = { text: "OK", finishReason: "STOP", tokenUsage: null };
  const testSuccess = await service.testGeminiConfiguration();
  assert.equal(testSuccess.success, true, "test de configuration réussi");
  transport.error = new AIAuthenticationError();
  const testFailure = await service.testGeminiConfiguration();
  assert.equal(testFailure.success, false, "test de configuration échoué");
  assert.equal(testFailure.errorCode, "GEMINI_API_KEY_INVALID", "erreur métier de clé invalide retournée sans appel réel");

  const srcFiles = walkFiles(join(process.cwd(), "src")).filter((file) => /\.(ts|tsx)$/.test(file));
  const srcContent = srcFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(srcContent, /GEMINI_API_KEY\s*=/, "aucune clé Gemini codée en dur");
  assert.doesNotMatch(srcContent, /from\s+["'].*server\/ai|import\(["'].*server\/ai/, "aucune dépendance server/ai dans src");
  assert.doesNotMatch(srcContent, /@google\/genai/, "aucune dépendance @google/genai dans le bundle Expo");

  console.log("ai settings tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
