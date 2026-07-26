import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../../../chatgpt-auth";
import { findCourse, getPortalDocument } from "../../../../lib/portal-store";
import EditorClient from "../../editor-client";

export const dynamic = "force-dynamic";

export default async function PrologueEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await requireChatGPTUser(`/editor/prologue/${courseId}`);
  if (user.email.toLowerCase() !== "bucaner0914@gmail.com") return <main className="editor-access"><h1>편집 권한이 없습니다</h1></main>;
  const course = findCourse(await getPortalDocument(), courseId);
  if (!course) notFound();
  return <EditorClient initialDocument={course.prologue} initialRevisions={[]} userEmail={user.email} saveEndpoint="/api/portal/prologue" courseId={course.id} publicHref={`/course/${course.id}/prologue`} />;
}
