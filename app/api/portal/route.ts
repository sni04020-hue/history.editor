import { getAuthorizedEditor } from "../../../lib/editor-auth";
import { getPortalDocument, listPortalRevisions, restorePortalRevision, savePortalDocument } from "../../../lib/portal-store";
import type { PortalDocument } from "../../../content/portal";

export const dynamic = "force-dynamic";

export async function GET() {
  const editor = await getAuthorizedEditor();
  if (!editor) return Response.json({ error: "편집 권한이 없습니다." }, { status: 403 });
  const [document, revisions] = await Promise.all([getPortalDocument(), listPortalRevisions()]);
  return Response.json({ document, revisions });
}

export async function POST(request: Request) {
  const editor = await getAuthorizedEditor();
  if (!editor) return Response.json({ error: "편집 권한이 없습니다." }, { status: 403 });
  try {
    const body = await request.json() as { action?: string; document?: PortalDocument; revisionId?: number };
    if (body.action === "restore") {
      if (!Number.isInteger(body.revisionId)) return Response.json({ error: "복원할 저장본이 올바르지 않습니다." }, { status: 400 });
      const restored = await restorePortalRevision(body.revisionId as number, editor.email);
      return Response.json({ ...restored, revisions: await listPortalRevisions() });
    }
    if (!body.document || body.document.schemaVersion !== 2 || !Array.isArray(body.document.courses)) return Response.json({ error: "저장할 내용의 형식이 올바르지 않습니다." }, { status: 400 });
    const version = await savePortalDocument(body.document, editor.email);
    return Response.json({ version, revisions: await listPortalRevisions() });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "저장하지 못했습니다." }, { status: 500 });
  }
}
