import { notFound } from "next/navigation";
import { findCourse, getPortalDocument } from "../../../../lib/portal-store";
import { LockedPanel } from "../../../portal-components";
import TopicsClient from "./topics-client";

export const dynamic = "force-dynamic";

export default async function TopicsPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = findCourse(await getPortalDocument(), courseId);
  if (!course) notFound();
  if (course.topicsLocked) return <LockedPanel course={course} title={`${course.title} 시간선 탐사`} message={course.lockMessage} />;
  return <TopicsClient course={course} />;
}
