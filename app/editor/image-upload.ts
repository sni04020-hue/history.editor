import type { StoryImageAsset } from "../../content/story";

// Leave enough room for multipart metadata even when the hosting layer caps a request at 5 MiB.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_LONG_EDGE = 4096;
const MIN_LONG_EDGE = 1280;

type PreparedImage = {
  file: File;
  width: number;
  height: number;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("이 이미지 형식은 브라우저에서 읽을 수 없습니다. PNG, JPEG 또는 WebP 파일을 선택해 주세요.")); };
    image.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("이미지를 자동으로 압축하지 못했습니다.")), "image/webp", quality));
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일을 선택해 주세요.");
  const image = await loadImage(file);
  const originalWidth = image.naturalWidth;
  const originalHeight = image.naturalHeight;
  if (!originalWidth || !originalHeight) throw new Error("이미지 크기를 확인하지 못했습니다.");

  const originalLongEdge = Math.max(originalWidth, originalHeight);
  if (file.size <= MAX_UPLOAD_BYTES && originalLongEdge <= MAX_LONG_EDGE) return { file, width: originalWidth, height: originalHeight };

  let longEdge = Math.min(originalLongEdge, MAX_LONG_EDGE);
  const minimumLongEdge = Math.min(originalLongEdge, MIN_LONG_EDGE);
  let best: { blob: Blob; width: number; height: number } | null = null;
  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";

  while (longEdge >= minimumLongEdge) {
    const scale = longEdge / originalLongEdge;
    const width = Math.max(1, Math.round(originalWidth * scale));
    const height = Math.max(1, Math.round(originalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("이 브라우저에서는 이미지 자동 압축을 사용할 수 없습니다.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    for (const quality of [0.92, 0.86, 0.8, 0.74, 0.68]) {
      const blob = await canvasBlob(canvas, quality);
      if (!best || blob.size < best.blob.size) best = { blob, width, height };
      if (blob.size <= MAX_UPLOAD_BYTES) {
        return { file: new File([blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() }), width, height };
      }
    }
    longEdge = Math.floor(longEdge * 0.8);
  }

  if (!best) throw new Error("이미지를 자동으로 압축하지 못했습니다.");
  if (best.blob.size > MAX_UPLOAD_BYTES) throw new Error("이미지 용량을 자동으로 줄이지 못했습니다. 다른 이미지 파일을 선택해 주세요.");
  return { file: new File([best.blob], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() }), width: best.width, height: best.height };
}

async function responsePayload(response: Response): Promise<{ image?: StoryImageAsset; error?: string }> {
  const text = await response.text();
  try { return JSON.parse(text) as { image?: StoryImageAsset; error?: string }; }
  catch {
    if (response.status === 413 || /payload too large/i.test(text)) throw new Error("이미지가 너무 커서 올리지 못했습니다. 자동 압축 후에도 제한을 넘었습니다.");
    throw new Error(response.ok ? "서버 응답을 확인하지 못했습니다." : `이미지를 올리지 못했습니다. (${response.status})`);
  }
}

export async function uploadEditorImage(file: File): Promise<StoryImageAsset> {
  const prepared = await prepareImageForUpload(file);
  const form = new FormData();
  form.set("file", prepared.file);
  form.set("width", String(prepared.width));
  form.set("height", String(prepared.height));
  const response = await fetch("/api/upload", { method: "POST", body: form });
  const data = await responsePayload(response);
  if (!response.ok || !data.image) throw new Error(data.error ?? "이미지를 올리지 못했습니다.");
  return data.image;
}
