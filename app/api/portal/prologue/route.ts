import { getAuthorizedEditor } from "../../../../lib/editor-auth";
import { getPortalDocument, savePortalDocument } from "../../../../lib/portal-store";
import type { StoryDocument } from "../../../../content/story";

export async function POST(request: Request) {
  const editor = await getAuthorizedEditor();
  if (!editor) return Response.json({ error: "편집 권한이 없습니다." }, { status: 403 });
  try {
    const body = await request.json() as { courseId?: string; document?: StoryDocument };
    const portal = await getPortalDocument();
    const course = portal.courses.find((item) => item.id === body.courseId);
    if (!course || !body.document || body.document.schemaVersion !== 1) return Response.json({ error: "과목 또는 프롤로그 형식이 올바르지 않습니다." }, { status: 400 });
    course.prologue = body.document;
    const version = await savePortalDocument(portal, editor.email);
    return Response.json({ version, revisions: [] });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "저장하지 못했습니다." }, { status: 500 });
  }
}
