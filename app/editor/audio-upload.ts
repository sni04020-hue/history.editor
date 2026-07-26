import type { PerformanceAudioAsset } from "../../content/portal";

const MAX_AUDIO_BYTES = 4 * 1024 * 1024;

export async function uploadEditorAudio(file: File): Promise<PerformanceAudioAsset> {
  if (!file.type.startsWith("audio/")) throw new Error("음성 파일을 선택해 주세요.");
  if (file.size > MAX_AUDIO_BYTES) throw new Error("음성 파일은 4MB 이하만 올릴 수 있습니다.");
  const form = new FormData();
  form.set("file", file);
  const response = await fetch("/api/upload-audio", { method: "POST", body: form });
  const text = await response.text();
  let data: { audio?: PerformanceAudioAsset; error?: string } = {};
  try { data = JSON.parse(text) as typeof data; }
  catch { throw new Error(response.ok ? "서버 응답을 확인하지 못했습니다." : `음성 파일을 올리지 못했습니다. (${response.status})`); }
  if (!response.ok || !data.audio) throw new Error(data.error ?? "음성 파일을 올리지 못했습니다.");
  return data.audio;
}
