import { getAuthorizedEditor } from "../../../lib/editor-auth";
import { recordStoryImage } from "../../../lib/story-store";

type Bucket = { put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string; cacheControl: string } }): Promise<unknown> };

export async function POST(request: Request) {
  const editor = await getAuthorizedEditor();
  if (!editor) return Response.json({ error: "편집 권한이 없습니다." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "이미지 파일을 선택해 주세요." }, { status: 400 });
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return Response.json({ error: "이미지 크기를 확인하지 못했습니다." }, { status: 400 });
  if (file.size > 25 * 1024 * 1024) return Response.json({ error: "이미지는 25MB 이하만 올릴 수 있습니다." }, { status: 413 });

  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as { BUCKET?: Bucket }).BUCKET;
  if (!bucket) return Response.json({ error: "이미지 저장소를 사용할 수 없습니다." }, { status: 503 });
  const extension = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const key = `story-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
  await recordStoryImage({ key, name: file.name, type: file.type, width, height, email: editor.email });
  return Response.json({ image: { src: `/api/media/${encodeURIComponent(key)}?v=${Date.now()}`, alt: file.name.replace(/\.[^.]+$/, ""), width, height } });
}
