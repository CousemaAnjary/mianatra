import type { CoursePage } from "@/src/db";

export type PreparedCoursePageImage = {
  pageId: string;
  pageIndex: number;
  imageBase64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

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

async function uriToBase64(uri: string) {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read page image."));
    reader.onloadend = () => {
      const result = String(reader.result ?? "");
      const marker = ";base64,";
      const markerIndex = result.indexOf(marker);
      resolve(markerIndex >= 0 ? result.slice(markerIndex + marker.length) : result);
    };
    reader.readAsDataURL(blob);
  });
}

export async function prepareCoursePageImage(page: CoursePage): Promise<PreparedCoursePageImage> {
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
    imageBase64: await uriToBase64(page.localUri),
  };
}
