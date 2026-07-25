import type { CoursePage } from "@/src/db";

export type PreparedCoursePageImage = {
  pageId: string;
  pageIndex: number;
  imageBase64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

export class CoursePageImageReadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CoursePageImageReadError";
  }
}

function mimeTypeFromUri(uri: string): PreparedCoursePageImage["mimeType"] {
  const lower = uri.toLocaleLowerCase();
  if (lower.includes(".jpg") || lower.includes(".jpeg")) {
    return "image/jpeg";
  }
  if (lower.includes(".webp")) {
    return "image/webp";
  }
  return "image/png";
}

function parseDataUri(uri: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i.exec(uri.trim());
  if (!match) {
    return null;
  }
  return {
    mimeType: match[1].toLocaleLowerCase() as PreparedCoursePageImage["mimeType"],
    imageBase64: match[2],
  };
}

async function uriToBase64(uri: string, readAsBase64 = defaultReadAsBase64) {
  try {
    return await readAsBase64(uri);
  } catch {
    throw new CoursePageImageReadError("Impossible de lire le fichier local de cette page.");
  }
}

async function defaultReadAsBase64(uri: string) {
  if (!uri.trim()) {
    throw new CoursePageImageReadError("Le fichier local de cette page est introuvable.");
  }
  const FileSystem = await import("expo-file-system/legacy");
  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export async function prepareCoursePageImage(
  page: CoursePage,
  options: { readAsBase64?: (uri: string) => Promise<string> } = {},
): Promise<PreparedCoursePageImage> {
  const dataUri = parseDataUri(page.localUri);
  if (dataUri) {
    return {
      pageId: page.id,
      pageIndex: page.pageIndex,
      ...dataUri,
    };
  }

  return {
    pageId: page.id,
    pageIndex: page.pageIndex,
    mimeType: mimeTypeFromUri(page.localUri),
    imageBase64: await uriToBase64(page.localUri, options.readAsBase64),
  };
}
