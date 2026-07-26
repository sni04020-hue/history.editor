import { getAuthorizedEditor } from "../../../lib/editor-auth";
import { recordStoryAudio } from "../../../lib/story-store";

type Bucket = { put(key: string, value: ArrayBuffer, options: { httpMetadata: { contentType: string; cacheControl: string } }): Promise<unknown> };

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const editor = await getAuthorizedEditor();
  if (!editor) return Response.json({ error: "편집 권한이 없습니다." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.type.startsWith("audio/")) return Response.json({ error: "음성 파일을 선택해 주세요." }, { status: 400 });
  if (file.size > MAX_AUDIO_BYTES) return Response.json({ error: "음성 파일은 4MB 이하만 올릴 수 있습니다." }, { status: 413 });

  const { env } = await import("cloudflare:workers");
  const bucket = (env as unknown as { BUCKET?: Bucket }).BUCKET;
  if (!bucket) return Response.json({ error: "음성 저장소를 사용할 수 없습니다." }, { status: 503 });
  const extension = (file.name.split(".").pop() ?? "mp3").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
  const key = `voice-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" } });
  await recordStoryAudio({ key, name: file.name, type: file.type, email: editor.email });
  return Response.json({ audio: { src: `/api/media/${encodeURIComponent(key)}?v=${Date.now()}`, name: file.name, mimeType: file.type } });
}
