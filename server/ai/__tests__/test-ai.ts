import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { z } from "zod";
import {
  AIAuthenticationError,
  AIInvalidResponseError,
  AIJsonParseError,
  AIModelNotFoundError,
  AINetworkError,
  AIRateLimitError,
  AISchemaValidationError,
  AITimeoutError,
  AIService,
  Gemma4ApiProvider,
  extractJsonValue,
  loadAIConfig,
  type AILogEvent,
} from "../index";
import { FakeAIProvider } from "../testing";
import type { GeminiGenerateParams, GeminiGenerateResponse, GeminiModel, GeminiTransport } from "../transport/gemini-client";

class MockGeminiTransport implements GeminiTransport {
  readonly generateCalls: GeminiGenerateParams[] = [];
  readonly models: GeminiModel[];
  generateResponse: GeminiGenerateResponse = { text: "ok", finishReason: "STOP", tokenUsage: null };
  error: unknown = null;
  delayMs = 0;

  constructor(models: GeminiModel[] = [{ name: "models/gemma-4-26b-a4b-it" }]) {
    this.models = models;
  }

  async generateContent(params: GeminiGenerateParams) {
    this.generateCalls.push(params);
    await this.wait(params.request.signal);
    if (this.error) {
      throw this.error;
    }
    return this.generateResponse;
  }

  async listModels(params: { signal?: AbortSignal }) {
    await this.wait(params.signal);
    if (this.error) {
      throw this.error;
    }
    return this.models;
  }

  private async wait(signal?: AbortSignal) {
    if (!this.delayMs) {
      return;
    }
    await Promise.race([
      sleep(this.delayMs),
      new Promise<void>((_, reject) => {
        signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
      }),
    ]);
  }
}

const validEnv = {
  GEMINI_API_KEY: "fake-key",
  GEMMA_MODEL: "gemma-4-26b-a4b-it",
  GEMMA_TIMEOUT_MS: "120000",
  GEMMA_MAX_OUTPUT_TOKENS: "8192",
};
const forbiddenPublicSecretNames = ["EXPO_PUBLIC_GEMINI_API_KEY", "EXPO_PUBLIC_GOOGLE_API_KEY", "EXPO_PUBLIC_GEMMA_API_KEY"];
function listFiles(relativePath: string): string[] {
  const absolutePath = join(process.cwd(), relativePath);
  if (!statSync(absolutePath).isDirectory()) {
    return [relativePath];
  }
  return readdirSync(absolutePath).flatMap((entry) => {
    const childPath = join(relativePath, entry);
    const childStats = statSync(join(process.cwd(), childPath));
    return childStats.isDirectory() ? listFiles(childPath) : [childPath];
  });
}

const expoCodeFiles = ["app.json", ...listFiles("src/app"), ...listFiles("src/components"), ...listFiles("src/features")].filter((file) =>
  /\.(json|ts|tsx)$/.test(file),
);

function createProvider(transport = new MockGeminiTransport(), logs: AILogEvent[] = []) {
  return {
    provider: new Gemma4ApiProvider({
      config: loadAIConfig(validEnv),
      transport,
      logger: {
        info: (event) => logs.push(event),
        error: (event) => logs.push(event),
      },
    }),
    transport,
    logs,
  };
}

async function main() {
  assert.equal(loadAIConfig(validEnv).GEMMA_MODEL, "gemma-4-26b-a4b-it", "configuration valide");
  assert.throws(() => loadAIConfig({ ...validEnv, GEMINI_API_KEY: "" }), /AI environment variables/, "clé absente");
  assert.throws(() => loadAIConfig({ ...validEnv, GEMMA_MODEL: "gemma-3" }), /AI environment variables/, "modèle non autorisé");
  assert.throws(() => loadAIConfig({ ...validEnv, GEMMA_TIMEOUT_MS: "0" }), /AI environment variables/, "timeout invalide");
  assert.throws(() => loadAIConfig({ ...validEnv, EXPO_PUBLIC_GEMINI_API_KEY: "public-secret" }), /Forbidden public/, "clé publique interdite");
  for (const relativePath of expoCodeFiles) {
    const content = readFileSync(join(process.cwd(), relativePath), "utf8");
    for (const secretName of forbiddenPublicSecretNames) {
      assert.equal(content.includes(secretName), false, `clé publique interdite absente de ${relativePath}`);
    }
  }

  const fake = new FakeAIProvider({ textResponse: "{\"ok\":true}", imageResponse: "{\"image\":true}" });
  const service = new AIService(fake);
  assert.equal((await service.getStatus()).available, true, "AIService avec provider injecté");
  assert.equal((await service.generateText({ prompt: "test" })).text, "{\"ok\":true}", "génération texte fake");
  assert.equal((await service.generateStructured({ prompt: "json" }, z.object({ ok: z.boolean() }))).ok, true, "sortie structurée valide");
  assert.equal((await service.generateStructuredFromImage({ prompt: "image", imageBase64: "abc", mimeType: "image/png" }, z.object({ image: z.boolean() }))).image, true, "génération image structurée");
  assert.equal(fake.calls.length, 4, "FakeAIProvider enregistre les appels");
  await assert.rejects(() => new FakeAIProvider({ error: new AIRateLimitError() }).generateText({ prompt: "x" }), AIRateLimitError, "FakeAIProvider simule une erreur");
  assert.notEqual(new AIService(new FakeAIProvider({ textResponse: "one" })), new AIService(new FakeAIProvider({ textResponse: "two" })), "isolation entre instances");

  const { provider, transport, logs } = createProvider();
  assert.equal((await provider.getStatus()).modelAvailable, true, "statut valide");
  assert.equal((await createProvider(new MockGeminiTransport([{ name: "models/other" }])).provider.getStatus()).errorCode, "AI_MODEL_NOT_FOUND", "modèle absent");
  assert.equal((await provider.generateText({ prompt: "hello" }, { requestId: "req-text" })).text, "ok", "génération texte valide");
  transport.generateResponse = { text: "  ", finishReason: null, tokenUsage: null };
  await assert.rejects(() => provider.generateText({ prompt: "hello" }, { requestId: "empty" }), AIInvalidResponseError, "réponse vide rejetée");
  transport.generateResponse = { text: "image ok", finishReason: "STOP", tokenUsage: null };
  assert.equal((await provider.generateFromImage({ prompt: "describe", imageBase64: "abc", mimeType: "image/jpeg" })).text, "image ok", "génération image valide");
  assert.equal(transport.generateCalls.at(-1)?.model, "gemma-4-26b-a4b-it", "modèle configuré transmis au transport");
  await assert.rejects(() => provider.generateFromImage({ prompt: "describe", imageBase64: "", mimeType: "image/png" }), z.ZodError, "base64 vide rejeté");
  await assert.rejects(
    () =>
      provider.generateFromImage({
        prompt: "describe",
        imageBase64: "abc",
        mimeType: "image/gif" as "image/png",
      }),
    z.ZodError,
    "MIME invalide rejeté",
  );
  const aborted = new AbortController();
  aborted.abort();
  await assert.rejects(() => provider.generateText({ prompt: "hello" }, { signal: aborted.signal }), /AI request signal was already aborted/, "signal déjà annulé");

  const slowTransport = new MockGeminiTransport();
  slowTransport.delayMs = 100;
  await assert.rejects(() => createProvider(slowTransport).provider.generateText({ prompt: "slow" }, { timeoutMs: 1 }), AITimeoutError, "timeout");

  const authTransport = new MockGeminiTransport();
  authTransport.error = { status: 401 };
  await assert.rejects(() => createProvider(authTransport).provider.generateText({ prompt: "x" }), AIAuthenticationError, "erreur auth");
  const rateTransport = new MockGeminiTransport();
  rateTransport.error = { status: 429 };
  await assert.rejects(() => createProvider(rateTransport).provider.generateText({ prompt: "x" }), AIRateLimitError, "rate limit");
  const networkTransport = new MockGeminiTransport();
  networkTransport.error = new TypeError("fetch failed");
  await assert.rejects(() => createProvider(networkTransport).provider.generateText({ prompt: "x" }), AINetworkError, "erreur réseau");

  assert.deepEqual(extractJsonValue("{\"a\":1}"), { a: 1 }, "JSON strict");
  assert.deepEqual(extractJsonValue("```json\n{\"a\":1}\n```"), { a: 1 }, "JSON Markdown");
  assert.deepEqual(extractJsonValue("Voici {\"a\":1}"), { a: 1 }, "JSON parasite non ambigu");
  assert.throws(() => extractJsonValue("{\"a\":1} suite"), AIJsonParseError, "JSON ambigu rejeté");
  assert.throws(() => extractJsonValue("{ invalid }"), AIJsonParseError, "JSON syntaxiquement invalide");
  await assert.rejects(() => service.generateStructured({ prompt: "json" }, z.object({ ok: z.string() })), AISchemaValidationError, "JSON valide schéma invalide");
  await assert.rejects(() => service.generateStructured({ prompt: "json" }, z.object({ missing: z.boolean() })), AISchemaValidationError, "propriété absente rejetée");

  assert.equal(logs.some((event) => JSON.stringify(event).includes("fake-key")), false, "aucune clé dans les logs");
  assert.equal(logs.some((event) => JSON.stringify(event).includes("abc")), false, "aucun base64 dans les logs");
  assert.equal(logs.some((event) => JSON.stringify(event).includes("hello")), false, "aucun prompt dans les logs");
  assert.equal(transport.generateCalls.length > 0, true, "aucune vraie requête Gemini effectuée");

  const notFoundTransport = new MockGeminiTransport();
  notFoundTransport.error = { status: 404 };
  await assert.rejects(() => createProvider(notFoundTransport).provider.generateText({ prompt: "x" }), AIModelNotFoundError, "modèle introuvable typé");

  process.stdout.write("ai tests OK\n");
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
