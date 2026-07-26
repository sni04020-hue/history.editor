import { notFound } from "next/navigation";
import { findCourse, getPortalDocument } from "../../../../lib/portal-store";
import { ContentPageView, LockedPanel } from "../../../portal-components";

export const dynamic = "force-dynamic";

export default async function EpiloguePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = findCourse(await getPortalDocument(), courseId);
  if (!course) notFound();
  if (course.epilogueLocked) return <LockedPanel course={course} title={`${course.title} 에필로그`} message="모든 핵심 시간선의 복원이 끝난 뒤 공개됩니다." />;
  return <ContentPageView course={course} page={course.epilogue} type="epilogue" />;
}
