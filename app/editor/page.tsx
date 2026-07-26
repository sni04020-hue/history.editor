import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import { getPortalDocument, listPortalRevisions } from "../../lib/portal-store";
import PortalEditorClient from "./portal-editor-client";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  const user = await requireChatGPTUser("/editor");
  if (user.email.toLowerCase() !== "bucaner0914@gmail.com") return <main className="editor-access"><h1>편집 권한이 없습니다</h1><p>이 편집실은 사이트 소유자만 사용할 수 있습니다.</p><a href={chatGPTSignOutPath("/editor")}>다른 계정으로 로그인</a></main>;
  const [document, revisions] = await Promise.all([getPortalDocument(), listPortalRevisions()]);
  return <PortalEditorClient initialDocument={document} initialRevisions={revisions} userEmail={user.email} />;
}
