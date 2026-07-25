import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  AllCoursePagesAnalysisFailedError,
  CoursePageAnalysisKeyInvalidError,
  CoursePageAnalysisProviderError,
  CoursePageAnalysisTimeoutError,
  DuplicatePageIndexError,
  analyzeCoursePages,
  type AnalyzeCoursePagesInput,
  type AnalyzeSinglePage,
  type CoursePageAnalysis,
} from "../src/features/course-analysis";

function page(pageIndex: number, input: Partial<AnalyzeCoursePagesInput["pages"][number]> = {}) {
  return {
    pageId: `page-${pageIndex}`,
    pageIndex,
    imageBase64: `base64-${pageIndex}`,
    mimeType: "image/png" as const,
    ...input,
  };
}

function input(pages: AnalyzeCoursePagesInput["pages"]): AnalyzeCoursePagesInput {
  return {
    courseId: "course-1",
    pages,
    knownSubject: "Mathématiques",
    knownGrade: "2nde",
    additionalInstructions: null,
  };
}

function analysis(data: Partial<CoursePageAnalysis> = {}): CoursePageAnalysis {
  return {
    detectedTitle: "Fonctions",
    detectedSubject: "Mathématiques",
    detectedLevel: "2nde",
    concepts: [{ name: "Fonction affine", description: "Forme ax+b" }],
    definitions: ["Definition A"],
    formulas: ["f(x)=ax+b"],
    examples: ["f(x)=2x+1"],
    dates: [],
    keywords: ["fonction"],
    partialSummary: "Résumé A.",
    warnings: [],
    confidence: 0.8,
    ...data,
  };
}

function walkFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    return statSync(fullPath).isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function scriptedAnalyzer(script: Record<number, CoursePageAnalysis | Error | Array<CoursePageAnalysis | Error>>) {
  const calls: number[] = [];
  const attempts = new Map<number, number>();
  const analyzeSinglePage: AnalyzeSinglePage = async (pageInput) => {
    calls.push(pageInput.pageIndex);
    const attempt = (attempts.get(pageInput.pageIndex) ?? 0) + 1;
    attempts.set(pageInput.pageIndex, attempt);
    const item = script[pageInput.pageIndex];
    const value = Array.isArray(item) ? item[Math.min(attempt - 1, item.length - 1)] : item;
    if (value instanceof Error) {
      throw value;
    }
    return value;
  };
  return { analyzeSinglePage, calls, attempts };
}

async function main() {
  const one = scriptedAnalyzer({ 0: analysis() });
  const oneResult = await analyzeCoursePages(input([page(0)]), { analyzeSinglePage: one.analyzeSinglePage });
  assert.equal(oneResult.successfulPageCount, 1, "une page réussie");
  assert.equal(oneResult.detectedTitle, "Fonctions", "format global pour une page");

  const multiple = scriptedAnalyzer({
    2: analysis({ detectedTitle: "Chapitre", detectedSubject: "Math", confidence: 0.5, partialSummary: "Page deux." }),
    0: analysis({ detectedTitle: "Chapitre", detectedSubject: "Math", confidence: 1, partialSummary: "Page zero." }),
    1: analysis({ detectedTitle: "Autre titre", detectedSubject: "Physique", detectedLevel: null, confidence: null, partialSummary: "Page un." }),
  });
  const merged = await analyzeCoursePages(input([page(2), page(0), page(1)]), { analyzeSinglePage: multiple.analyzeSinglePage });
  assert.deepEqual(multiple.calls, [0, 1, 2], "pages traitées dans l'ordre");
  assert.equal(merged.successfulPageCount, 3, "plusieurs pages réussies");
  assert.equal(merged.detectedTitle, "Chapitre", "titre majoritaire choisi");
  assert.equal(merged.detectedSubject, "Math", "matière majoritaire choisie");
  assert.equal(merged.detectedLevel, "2nde", "niveau nul ignoré");
  assert.equal(merged.confidence, 0.75, "moyenne de confiance");
  assert.equal(merged.inconsistencies.some((item) => item.field === "subject"), true, "matière contradictoire signalée");

  const tie = scriptedAnalyzer({
    0: analysis({ detectedTitle: "Premier" }),
    1: analysis({ detectedTitle: "Second" }),
  });
  assert.equal((await analyzeCoursePages(input([page(0), page(1)]), { analyzeSinglePage: tie.analyzeSinglePage })).detectedTitle, "Premier", "égalité résolue par la première page");

  await assert.rejects(() => analyzeCoursePages(input([page(0), page(0, { pageId: "other" })]), { analyzeSinglePage: one.analyzeSinglePage }), DuplicatePageIndexError, "index dupliqué rejeté");
  await assert.rejects(
    () => analyzeCoursePages(input([page(0), page(1), page(2), page(3), page(4), page(5)]), { analyzeSinglePage: one.analyzeSinglePage }),
    /Multi-page analysis input is invalid/,
    "plus de cinq pages rejeté",
  );

  const concepts = scriptedAnalyzer({
    0: analysis({ concepts: [{ name: " Fonction affine ", description: "Courte" }], definitions: ["Definition A"], formulas: ["F"], examples: ["Ex"], dates: ["2024"], keywords: ["Mot"], partialSummary: "Même résumé." }),
    1: analysis({ concepts: [{ name: "fonction   AFFINE", description: "Description beaucoup plus détaillée" }], definitions: ["definition a"], formulas: ["F"], examples: ["Ex"], dates: ["2024"], keywords: ["mot"], partialSummary: "Même résumé." }),
  });
  const conceptResult = await analyzeCoursePages(input([page(0), page(1)]), { analyzeSinglePage: concepts.analyzeSinglePage });
  assert.equal(conceptResult.concepts.length, 1, "concept dédupliqué");
  assert.equal(conceptResult.concepts[0].description, "Description beaucoup plus détaillée", "description la plus détaillée conservée");
  assert.deepEqual(conceptResult.concepts[0].sourcePageIndexes, [0, 1], "sourcePageIndexes fusionnés");
  assert.deepEqual(conceptResult.definitions, ["Definition A"], "listes dédupliquées");
  assert.equal(conceptResult.summary, "Même résumé.", "résumé dédupliqué");

  const partialFailure = scriptedAnalyzer({
    0: analysis({ warnings: ["Page floue"] }),
    1: new CoursePageAnalysisKeyInvalidError(),
  });
  const partialResult = await analyzeCoursePages(input([page(0), page(1)]), { analyzeSinglePage: partialFailure.analyzeSinglePage });
  assert.equal(partialResult.successfulPageCount, 1, "page en erreur mais résultat global produit");
  assert.equal(partialResult.failedPageCount, 1, "page échouée signalée");
  assert.equal(partialResult.pageResults[1].status, "failed", "résultat individuel conservé");
  assert.equal(partialResult.warnings.some((warning) => warning.includes("Page floue")), true, "avertissement conservé");

  const allFailure = scriptedAnalyzer({
    0: new CoursePageAnalysisKeyInvalidError("secret-key-123"),
    1: new CoursePageAnalysisKeyInvalidError("base64-sensitive"),
  });
  await assert.rejects(
    async () => {
      try {
        await analyzeCoursePages(input([page(0), page(1)]), { analyzeSinglePage: allFailure.analyzeSinglePage });
      } catch (error) {
        assert.ok(error instanceof AllCoursePagesAnalysisFailedError, "toutes les pages en erreur");
        assert.equal(error.pageCount, 2, "nombre de pages dans l'erreur globale");
        assert.doesNotMatch(JSON.stringify(error), /secret-key-123|base64-sensitive/, "aucune donnée sensible dans les erreurs");
        throw error;
      }
    },
    AllCoursePagesAnalysisFailedError,
    "erreur globale explicite",
  );

  const retry = scriptedAnalyzer({
    0: [new CoursePageAnalysisTimeoutError(), analysis()],
  });
  let doneCount = 0;
  const retryWithProgress = await analyzeCoursePages(input([page(0)]), {
    analyzeSinglePage: retry.analyzeSinglePage,
    onPageDone: () => {
      doneCount += 1;
    },
  });
  assert.equal(retryWithProgress.pageResults[0].attemptsCount, 2, "retry sur timeout avec progression");
  assert.equal(doneCount, 1, "progression notifiée une seule fois par page malgré le retry");

  const retryWithoutProgress = scriptedAnalyzer({
    0: [new CoursePageAnalysisTimeoutError(), analysis()],
  });
  const retryResult = await analyzeCoursePages(input([page(0)]), { analyzeSinglePage: retryWithoutProgress.analyzeSinglePage });
  assert.equal(retryResult.pageResults[0].attemptsCount, 2, "retry sur timeout");

  const noRetry = scriptedAnalyzer({
    0: new CoursePageAnalysisKeyInvalidError(),
  });
  await assert.rejects(() => analyzeCoursePages(input([page(0)]), { analyzeSinglePage: noRetry.analyzeSinglePage }), AllCoursePagesAnalysisFailedError, "aucun retry sur clé invalide");
  assert.equal(noRetry.attempts.get(0), 1, "clé invalide tentée une fois");

  const twoAttempts = scriptedAnalyzer({
    0: [new CoursePageAnalysisProviderError(), new CoursePageAnalysisTimeoutError(), analysis()],
  });
  await assert.rejects(() => analyzeCoursePages(input([page(0)]), { analyzeSinglePage: twoAttempts.analyzeSinglePage }), AllCoursePagesAnalysisFailedError, "maximum deux essais");
  assert.equal(twoAttempts.attempts.get(0), 2, "maximum deux essais par page");

  const featureFiles = walkFiles(join(process.cwd(), "src", "features", "course-analysis")).filter((file) => /\.(ts|tsx)$/.test(file));
  const featureContent = featureFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(featureContent, /GeminiMobileProvider|Gemma4ApiProvider/, "aucun provider concret");
  assert.doesNotMatch(featureContent, /settingsRepository|db\.|drizzle|expo-sqlite/, "aucune persistance DB");
  assert.doesNotMatch(featureContent, /revisionSheets|exercisesRepository|conceptProgress/, "aucune génération fiche/exercices/suivi");
  assert.doesNotMatch(featureContent, /fetch\(/, "aucun fetch direct");
  assert.equal(multiple.calls.length > 0, true, "aucun appel réel Gemini");

  console.log("course pages analysis tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
