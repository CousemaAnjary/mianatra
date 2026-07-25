import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  AIAuthenticationError,
  AIModelNotFoundError,
  AIProviderUnavailableError,
  AIRateLimitError,
  AITimeoutError,
  AIService,
  type AIImageInput,
  type AIProvider,
  type AIProviderStatus,
  type AIRequestOptions,
  type AITextInput,
  type AITextResponse,
} from "../src/services/ai";
import {
  CoursePageAnalysisAIUnavailableError,
  CoursePageAnalysisImageError,
  CoursePageAnalysisJsonError,
  CoursePageAnalysisKeyInvalidError,
  CoursePageAnalysisKeyMissingError,
  CoursePageAnalysisModelError,
  CoursePageAnalysisProviderError,
  CoursePageAnalysisQuotaError,
  CoursePageAnalysisSchemaError,
  CoursePageAnalysisTimeoutError,
  analyzeCoursePage,
  type CoursePageAnalysis,
  type CoursePageAnalysisInput,
} from "../src/features/course-analysis";
import { GeminiApiKeyMissingError } from "../src/features/ai-settings/services/ai-settings.service";

class FakeImageProvider implements AIProvider {
  readonly name = "fake-image";
  readonly imageCalls: AIImageInput[] = [];
  responseText = JSON.stringify(validAnalysis());
  error: unknown = null;

  async getStatus(): Promise<AIProviderStatus> {
    return {
      provider: this.name,
      configured: true,
      available: true,
      model: "fake",
      modelAvailable: true,
      checkedAt: "2026-07-25T00:00:00.000Z",
      latencyMs: 1,
      errorCode: null,
    };
  }

  async generateText(_input: AITextInput, _options?: AIRequestOptions): Promise<AITextResponse> {
    throw new Error("Course analysis must use image generation.");
  }

  async generateFromImage(input: AIImageInput, _options?: AIRequestOptions): Promise<AITextResponse> {
    this.imageCalls.push(input);
    if (this.error) {
      throw this.error;
    }
    return {
      text: this.responseText,
      provider: this.name,
      model: "fake",
      requestId: "fake-request",
      durationMs: 1,
      finishReason: "STOP",
      tokenUsage: null,
    };
  }
}

function validInput(input: Partial<CoursePageAnalysisInput> = {}): CoursePageAnalysisInput {
  return {
    courseId: null,
    pageIndex: 0,
    imageBase64: "ZmFrZS1pbWFnZQ==",
    mimeType: "image/png",
    knownSubject: "Mathématiques",
    knownGrade: "2nde",
    additionalInstructions: null,
    ...input,
  };
}

function validAnalysis(input: Partial<CoursePageAnalysis> = {}): CoursePageAnalysis {
  return {
    detectedTitle: "Fonctions affines",
    detectedSubject: "Mathématiques",
    detectedLevel: "2nde",
    concepts: [{ name: "Fonction affine", description: "Expression de la forme ax + b." }],
    definitions: ["Une fonction affine s'écrit f(x)=ax+b."],
    formulas: ["f(x)=ax+b"],
    examples: ["f(x)=2x+3"],
    dates: [],
    keywords: ["fonction", "affine"],
    partialSummary: "La page introduit les fonctions affines.",
    warnings: [],
    confidence: 0.8,
    ...input,
  };
}

function serviceWith(provider: FakeImageProvider) {
  return new AIService(provider);
}

function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

async function assertAnalysisRejects(error: unknown, expected: new (...args: never[]) => Error, label: string) {
  const provider = new FakeImageProvider();
  provider.error = error;
  await assert.rejects(() => analyzeCoursePage(validInput(), { aiService: serviceWith(provider) }), expected, label);
}

async function assertSchemaRejects(output: Partial<CoursePageAnalysis>, label: string) {
  const provider = new FakeImageProvider();
  provider.responseText = JSON.stringify({ ...validAnalysis(), ...output });
  await assert.rejects(() => analyzeCoursePage(validInput(), { aiService: serviceWith(provider) }), CoursePageAnalysisSchemaError, label);
}

async function main() {
  const provider = new FakeImageProvider();
  const analysis = await analyzeCoursePage(validInput(), { aiService: serviceWith(provider) });
  assert.equal(analysis.detectedTitle, "Fonctions affines", "analyse valide");
  assert.equal(provider.imageCalls.length, 1, "appel image unique");
  assert.equal(provider.imageCalls[0].imageBase64, "ZmFrZS1pbWFnZQ==", "image transmise");
  assert.match(provider.imageCalls[0].prompt, /JSON valide/, "prompt métier transmis");

  await assertSchemaRejects({ detectedTitle: "" }, "titre vide rejeté");
  await assertSchemaRejects({ detectedSubject: "" }, "matière vide rejetée");
  await assertSchemaRejects({ concepts: [{ name: "", description: null }] }, "concept invalide rejeté");

  const emptyArraysProvider = new FakeImageProvider();
  emptyArraysProvider.responseText = JSON.stringify(
    validAnalysis({
      concepts: [],
      definitions: [],
      formulas: [],
      examples: [],
      dates: [],
      keywords: [],
      warnings: [],
    }),
  );
  assert.equal((await analyzeCoursePage(validInput(), { aiService: serviceWith(emptyArraysProvider) })).concepts.length, 0, "tableaux vides acceptés");

  const confidenceZeroProvider = new FakeImageProvider();
  confidenceZeroProvider.responseText = JSON.stringify(validAnalysis({ confidence: 0 }));
  assert.equal((await analyzeCoursePage(validInput(), { aiService: serviceWith(confidenceZeroProvider) })).confidence, 0, "confiance 0 acceptée");

  const confidenceOneProvider = new FakeImageProvider();
  confidenceOneProvider.responseText = JSON.stringify(validAnalysis({ confidence: 1 }));
  assert.equal((await analyzeCoursePage(validInput(), { aiService: serviceWith(confidenceOneProvider) })).confidence, 1, "confiance 1 acceptée");
  await assertSchemaRejects({ confidence: 1.2 }, "confiance hors plage rejetée");

  await assert.rejects(() => analyzeCoursePage(validInput({ imageBase64: "   " }), { aiService: serviceWith(new FakeImageProvider()) }), CoursePageAnalysisImageError, "base64 vide rejeté");
  await assert.rejects(
    () => analyzeCoursePage({ ...validInput(), mimeType: "image/gif" } as unknown as CoursePageAnalysisInput, { aiService: serviceWith(new FakeImageProvider()) }),
    CoursePageAnalysisImageError,
    "MIME invalide rejeté",
  );
  await assert.rejects(() => analyzeCoursePage(validInput(), { aiService: null }), CoursePageAnalysisAIUnavailableError, "IA désactivée");
  await assert.rejects(
    () => analyzeCoursePage(validInput(), { aiService: async () => {
      throw new GeminiApiKeyMissingError();
    } }),
    CoursePageAnalysisKeyMissingError,
    "clé absente",
  );

  await assertAnalysisRejects(new AITimeoutError(), CoursePageAnalysisTimeoutError, "timeout");
  await assertAnalysisRejects(new AIRateLimitError(), CoursePageAnalysisQuotaError, "quota");
  await assertAnalysisRejects(new AIAuthenticationError(), CoursePageAnalysisKeyInvalidError, "clé invalide");
  await assertAnalysisRejects(new AIModelNotFoundError(), CoursePageAnalysisModelError, "modèle indisponible");
  await assertAnalysisRejects(new AIProviderUnavailableError(), CoursePageAnalysisProviderError, "provider indisponible");

  const invalidJsonProvider = new FakeImageProvider();
  invalidJsonProvider.responseText = "pas du json";
  await assert.rejects(() => analyzeCoursePage(validInput(), { aiService: serviceWith(invalidJsonProvider) }), CoursePageAnalysisJsonError, "sortie JSON invalide");
  await assertSchemaRejects({ detectedLevel: "" }, "schéma invalide");

  const warningProvider = new FakeImageProvider();
  warningProvider.responseText = JSON.stringify(validAnalysis({ warnings: ["Page floue sur le bord droit."] }));
  assert.equal((await analyzeCoursePage(validInput(), { aiService: serviceWith(warningProvider) })).warnings[0], "Page floue sur le bord droit.", "avertissement page floue");

  const featureFiles = walkFiles(join(process.cwd(), "src", "features", "course-analysis")).filter((file) => /\.(ts|tsx)$/.test(file));
  const featureContent = featureFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(featureContent, /GeminiMobileProvider|Gemma4ApiProvider/, "aucun import du provider concret");
  assert.doesNotMatch(featureContent, /settingsRepository|db\.|drizzle|expo-sqlite/, "aucune persistance DB");
  assert.doesNotMatch(featureContent, /score|progress|concept_progress/, "aucun calcul de suivi métier");
  assert.doesNotMatch(featureContent, /fetch\(/, "aucun fetch direct");
  assert.equal(provider.name, "fake-image", "aucun appel réel Gemini pendant les tests");

  console.log("course analysis tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
