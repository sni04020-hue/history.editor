import { notFound } from "next/navigation";
import { findCourse, getPortalDocument } from "../../../../lib/portal-store";
import { ContentPageView, LockedPanel } from "../../../portal-components";

export const dynamic = "force-dynamic";

export default async function GuidePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = findCourse(await getPortalDocument(), courseId);
  if (!course) notFound();
  if (course.guideLocked) return <LockedPanel course={course} title={`${course.title} 수업, 평가 안내`} message={course.lockMessage} />;
  return <ContentPageView course={course} page={course.guide} type="guide" />;
}
