import { notFound } from "next/navigation";
import { findTopic, getPortalDocument } from "../../../../../../lib/portal-store";
import { LockedPanel } from "../../../../../portal-components";
import AfterLogClient from "./after-log-client";

export const dynamic = "force-dynamic";

export default async function AfterLogPage({ params }: { params: Promise<{ courseId: string; topicId: string }> }) {
  const { courseId, topicId } = await params;
  const { course, topic } = findTopic(await getPortalDocument(), courseId, topicId);
  if (!course || !topic) notFound();
  if (topic.locked) return <LockedPanel course={course} title={topic.title} message={topic.lockMessage} />;
  return <AfterLogClient course={course} topic={topic} />;
}
