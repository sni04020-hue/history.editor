import { notFound } from "next/navigation";
import { findCourse, getPortalDocument } from "../../../../lib/portal-store";
import StoryPageClient from "../../../story-page-client";
import { LockedPanel } from "../../../portal-components";

export const dynamic = "force-dynamic";

export default async function ProloguePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = findCourse(await getPortalDocument(), courseId);
  if (!course) notFound();
  if (course.prologueLocked) return <LockedPanel course={course} title={`${course.title} 프롤로그`} message={course.lockMessage} />;
  return <StoryPageClient document={course.prologue} portalBackHref={`/course/${course.id}`} portalBackLabel={`${course.title} 메인`} />;
}
