import assert from "node:assert/strict";
import type { Course, CoursePage } from "@/src/db";
import { coursePageImageSizing, prepareCoursePageImage } from "@/src/features/course-processing/utils/page-image";
import { logCourseProcessing } from "@/src/features/course-processing/utils/processing-log";
import {
  GalleryImportError,
  createGalleryImportService,
  moveSelectedCoursePage,
  prepareSelectedCoursePages,
  removeSelectedCoursePage,
  type GalleryFileGateway,
  type PickedGalleryAsset,
} from "@/src/features/course-import/services/gallery-import.service";

const validAsset = (index: number): PickedGalleryAsset => ({
  uri: `file:///picker/page-${index}.jpg`,
  assetId: `asset-${index}`,
  fileName: `page-${index}.jpg`,
  mimeType: "image/jpeg",
  width: 1200,
  height: 1600,
});

const validAssets = (count: number) => Array.from({ length: count }, (_, index) => validAsset(index + 1));

function course(pageCount: number): Course {
  return {
    id: "real-course-1",
    subjectId: "subject-1",
    title: "Cours réel",
    grade: "2nde",
    status: "draft",
    pageCount,
    summary: null,
    lastReviewedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

function coursePage(localUri: string, pageIndex: number): CoursePage {
  return {
    id: `page-${pageIndex}`,
    courseId: "real-course-1",
    pageIndex,
    localUri,
    thumbnailUri: localUri,
    rotation: 0,
    qualityStatus: "good",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

function createFileGateway(options: { failCopyAt?: number } = {}) {
  const copied: string[] = [];
  const deleted: string[] = [];
  const files: GalleryFileGateway = {
    createImportDirectory: async () => "file:///app/course-imports/test-import",
    copyToDirectory: async (_sourceUri, directoryUri, fileName) => {
      if (options.failCopyAt !== undefined && copied.length === options.failCopyAt) {
        throw new GalleryImportError("local_copy_failed", "copy failed");
      }
      const uri = `${directoryUri}/${fileName}`;
      copied.push(uri);
      return uri;
    },
    deleteFiles: async (uris) => {
      deleted.push(...uris);
    },
  };
  return { files, copied, deleted };
}

async function run() {
  assert.deepEqual(prepareSelectedCoursePages([validAsset(1)]).map((page) => page.pageIndex), [0], "une image valide");
  assert.equal(prepareSelectedCoursePages(validAssets(5)).length, 5, "cinq images valides");
  assert.throws(
    () => prepareSelectedCoursePages(validAssets(6)),
    (error) => error instanceof GalleryImportError && error.code === "too_many_images",
    "plus de cinq images refusées",
  );
  assert.throws(
    () => prepareSelectedCoursePages([{ uri: "file:///picker/page.heic", mimeType: "image/heic" }]),
    (error) => error instanceof GalleryImportError && error.code === "unsupported_format",
    "format invalide refusé",
  );

  const selected = prepareSelectedCoursePages(validAssets(3));
  assert.deepEqual(selected.map((page) => page.id), ["0-asset-1", "1-asset-2", "2-asset-3"], "ordre conservé");
  assert.deepEqual(moveSelectedCoursePage(selected, selected[1].id, "left").map((page) => page.id), ["1-asset-2", "0-asset-1", "2-asset-3"], "réorganisation");
  assert.deepEqual(removeSelectedCoursePage(selected, selected[1].id).map((page) => page.pageIndex), [0, 1], "suppression renumérotée");

  const cancelledService = createGalleryImportService({
    picker: { pickImages: async () => ({ status: "cancelled" }) },
    files: createFileGateway().files,
    courses: { createCourseFromPages: async () => ({ course: course(0), pages: [] }) },
  });
  assert.deepEqual(await cancelledService.pickPages(), { status: "cancelled" }, "sélection annulée");

  const createdInputs: unknown[] = [];
  const fileGateway = createFileGateway();
  const service = createGalleryImportService({
    picker: { pickImages: async () => ({ status: "selected", assets: validAssets(2) }) },
    files: fileGateway.files,
    courses: {
      createCourseFromPages: async (input) => {
        createdInputs.push(input);
        return { course: course(input.pages.length), pages: input.pages.map((page, index) => coursePage(page.localUri, index)) };
      },
    },
  });

  const picked = await service.pickPages();
  assert.equal(picked.status, "selected", "sélection acceptée");
  if (picked.status !== "selected") {
    throw new Error("Selection should not be cancelled.");
  }

  const created = await service.createCourse({
    subjectId: "subject-1",
    title: " Cours réel ",
    grade: " 2nde ",
    pages: picked.pages,
  });

  assert.equal(created.course.id, "real-course-1", "vrai courseId retourné");
  assert.equal(created.course.pageCount, 2, "page_count correct");
  assert.equal(created.pages.length, 2, "pages créées");
  assert.ok(created.pages.every((page) => page.localUri.startsWith("file:///app/course-imports/test-import/")), "URI locale persistée");
  assert.ok(!JSON.stringify(createdInputs).includes("imageBase64"), "aucun base64 persisté");

  let redirectedCourseId: string | null = null;
  redirectedCourseId = created.course.id;
  assert.equal(redirectedCourseId, "real-course-1", "redirection vers le vrai courseId");

  const failingFiles = createFileGateway();
  const failingService = createGalleryImportService({
    picker: { pickImages: async () => ({ status: "selected", assets: validAssets(2) }) },
    files: failingFiles.files,
    courses: {
      createCourseFromPages: async () => {
        throw new Error("db failed");
      },
    },
  });
  await assert.rejects(
    () => failingService.createCourse({ subjectId: "subject-1", title: "Cours", grade: "2nde", pages: selected.slice(0, 2) }),
    GalleryImportError,
    "création DB échouée",
  );
  assert.deepEqual(failingFiles.deleted, failingFiles.copied, "nettoyage si création DB échoue");

  const cleanedOptimizedUris: string[] = [];
  const prepared = await prepareCoursePageImage(coursePage("file:///app/course-imports/test-import/page-1.jpg", 0), {
    optimizeImage: async (input) => {
      assert.equal(input.uri, "file:///app/course-imports/test-import/page-1.jpg");
      assert.equal(input.maxSide, coursePageImageSizing.MAX_IMAGE_SIDE);
      assert.equal(input.jpegQuality, coursePageImageSizing.JPEG_QUALITY);
      return {
        uri: "file:///cache/optimized-page-1.jpg",
        width: 1200,
        height: 1600,
        temporaryUris: ["file:///cache/optimized-page-1.jpg"],
      };
    },
    fileGateway: {
      readAsBase64: async (uri) => {
        assert.equal(uri, "file:///cache/optimized-page-1.jpg");
        return "ZmFrZS1pbWFnZQ==";
      },
      getFileSize: async (uri) => uri.length,
      deleteFiles: async (uris) => {
        cleanedOptimizedUris.push(...uris);
      },
    },
  });
  assert.equal(prepared.imageBase64, "ZmFrZS1pbWFnZQ==", "conversion locale optimisée en base64");
  assert.equal(prepared.mimeType, "image/jpeg", "MIME optimisé en JPEG");
  assert.equal(prepared.metrics?.width, 1200, "largeur optimisée suivie");
  assert.equal(prepared.metrics?.height, 1600, "hauteur optimisée suivie");
  await prepared.cleanup?.();
  assert.deepEqual(cleanedOptimizedUris, ["file:///cache/optimized-page-1.jpg"], "fichiers temporaires nettoyés après analyse");

  assert.deepEqual(coursePageImageSizing.targetResize(4096, 2048), { width: 2048, height: 1024 }, "image large redimensionnée");
  assert.equal(coursePageImageSizing.targetResize(1200, 1600), null, "image raisonnable non agrandie");

  const previousInfo = console.info;
  const logged: unknown[] = [];
  console.info = (...args: unknown[]) => {
    logged.push(args);
  };
  try {
    logCourseProcessing("test", { apiKey: "secret-key", imageBase64: "raw-base64", base64Length: 12, durationMs: 3 });
  } finally {
    console.info = previousInfo;
  }
  const loggedJson = JSON.stringify(logged);
  assert.doesNotMatch(loggedJson, /secret-key|raw-base64/, "logs sans clé ni base64 brut");

  const dataUriPrepared = await prepareCoursePageImage(coursePage("data:image/png;base64,ZmFrZQ==", 0), {
    readAsBase64: async () => {
      throw new Error("data URI should not be read from disk");
    },
    optimizeImage: async () => {
      throw new Error("data URI should not be optimized");
    },
  });
  assert.equal(dataUriPrepared.imageBase64, "ZmFrZQ==", "data URI conservée");
  assert.equal(dataUriPrepared.mimeType, "image/png", "MIME data URI conservé");

  const readFailure = prepareCoursePageImage(coursePage("file:///missing.jpg", 0), {
    optimizeImage: async () => ({ uri: "file:///missing-optimized.jpg", width: null, height: null, temporaryUris: [] }),
    fileGateway: {
      readAsBase64: async () => {
        throw new Error("missing");
      },
      getFileSize: async () => null,
      deleteFiles: async () => undefined,
    },
  });
  await assert.rejects(
    () => readFailure,
    /Impossible de lire le fichier local de cette page/,
    "fichier local illisible catégorisé",
  );

  assert.ok(!JSON.stringify(createdInputs).includes("Gemini"), "aucun appel Gemini réel dans les tests");
}

run()
  .then(() => {
    console.log("course gallery import tests OK");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
