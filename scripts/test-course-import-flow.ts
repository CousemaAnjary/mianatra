import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import type { Subject } from "../src/db";
import {
  findCourseImportSubjectByNormalizedName,
  normalizeCourseImportSubjectName,
  resolveCourseImportSubjectForCreation,
  resolveInitialCourseImportSubject,
  shouldReuseCompiledCourse,
} from "../src/features/course-import";

const now = "2026-07-26T00:00:00.000Z";

function subject(input: Partial<Subject> = {}): Subject {
  return {
    id: "subject-svt",
    name: "SVT",
    icon: "leaf",
    color: "#2E7D70",
    isDefault: true,
    createdAt: now,
    ...input,
  };
}

function read(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

async function main() {
  const subjects = [
    subject(),
    subject({ id: "subject-math", name: "Mathématiques", icon: "square-root-alt" }),
  ];

  assert.deepEqual(
    resolveInitialCourseImportSubject({
      requestedSubjectId: "subject-math",
      subjects,
      defaultSubjectName: "SVT",
    }),
    { subjectName: "Mathématiques", selectedSubjectId: "subject-math" },
    "subjectId valide préselectionné",
  );
  assert.deepEqual(
    resolveInitialCourseImportSubject({
      requestedSubjectId: "missing",
      subjects,
      defaultSubjectName: "SVT",
    }),
    { subjectName: "SVT", selectedSubjectId: "subject-svt" },
    "subjectId invalide ignoré proprement",
  );
  assert.equal(normalizeCourseImportSubjectName("  Sciences   physiques "), "Sciences physiques", "nom matière trimé et normalisé");
  assert.equal(findCourseImportSubjectByNormalizedName(subjects, " svt ")?.id, "subject-svt", "comparaison normalisée réutilise la matière existante");
  assert.equal(findCourseImportSubjectByNormalizedName(subjects, "mathématiques")?.id, "subject-math", "comparaison insensible à la casse");

  let createCount = 0;
  const existing = await resolveCourseImportSubjectForCreation({
    subjectName: "  svt ",
    selectedSubjectId: null,
    subjects,
    getOrCreateSubject: async () => {
      createCount += 1;
      return subject({ id: "created" });
    },
  });
  assert.equal(existing.id, "subject-svt", "matière existante non dupliquée");
  assert.equal(createCount, 0, "aucune création pour une matière existante");

  const selected = await resolveCourseImportSubjectForCreation({
    subjectName: "Mathématiques",
    selectedSubjectId: "subject-math",
    subjects,
    getOrCreateSubject: async () => {
      throw new Error("existing selected subject should be reused");
    },
  });
  assert.equal(selected.id, "subject-math", "changement vers une matière existante possible");

  const created = await resolveCourseImportSubjectForCreation({
    subjectName: " Histoire ",
    selectedSubjectId: null,
    subjects,
    getOrCreateSubject: async (name) => {
      createCount += 1;
      return subject({ id: "subject-history", name });
    },
  });
  assert.equal(created.id, "subject-history", "nouvelle matière créée");
  assert.equal(created.name, "Histoire", "nouvelle matière créée avec nom normalisé");
  assert.equal(createCount, 1, "nouvelle matière créée une seule fois dans la résolution");

  await assert.rejects(
    () =>
      resolveCourseImportSubjectForCreation({
        subjectName: "   ",
        selectedSubjectId: null,
        subjects,
        getOrCreateSubject: async () => subject({ id: "never" }),
      }),
    /COURSE_IMPORT_SUBJECT_NAME_EMPTY/,
    "nom vide refusé",
  );
  assert.equal(shouldReuseCompiledCourse(null), false, "aucun courseId -> création autorisée");
  assert.equal(shouldReuseCompiledCourse("course-1"), true, "courseId déjà compilé -> création réutilisée");

  const addSource = read("src/app/course/add/index.tsx");
  const subjectSource = read("src/app/subject/[subjectId]/index.tsx");
  assert.match(subjectSource, /pathname: "\/course\/add"[\s\S]*subjectId: detail\.subject\.id/, "Ajouter un cours transmet le vrai subjectId");
  assert.match(addSource, /useLocalSearchParams/, "l'ajout lit subjectId depuis la route");
  assert.match(addSource, /resolveInitialCourseImportSubject/, "l'ajout préselectionne une matière réelle valide");
  assert.match(addSource, /resolveCourseImportSubjectForCreation/, "l'ajout résout matière existante ou nouvelle sans doublon");
  assert.match(addSource, /isCompileInFlightRef/, "double clic Compiler bloqué");
  assert.match(addSource, /isSaveInFlightRef/, "double clic Enregistrer bloqué");
  assert.match(addSource, /shouldReuseCompiledCourse\(compiledCourseId\)/, "retour étape précédente sans deuxième création");
  assert.match(addSource, /processing\.retry/, "retry IA reste dans le contrôleur de traitement");
  assert.doesNotMatch(addSource + subjectSource, /demoCourse|demoCourses|demo-data|demoSession/, "aucun fallback démo dans ajout depuis matière");

  console.log("course import flow tests OK");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
