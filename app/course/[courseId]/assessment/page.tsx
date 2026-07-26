import { notFound } from "next/navigation";
import { findCourse, getPortalDocument } from "../../../../lib/portal-store";
import { LockedPanel } from "../../../portal-components";
import PerformanceAssessmentClient from "./performance-assessment-client";

export const dynamic = "force-dynamic";

export default async function PerformanceAssessmentPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = findCourse(await getPortalDocument(), courseId);
  if (!course) notFound();
  if (course.assessmentLocked) return <LockedPanel course={course} title={`${course.title} 수행평가`} message={course.lockMessage} />;
  if (!course.assessment) notFound();
  return <PerformanceAssessmentClient course={course} page={course.assessment} />;
}
