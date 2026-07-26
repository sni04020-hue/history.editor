import Link from "next/link";
import { notFound } from "next/navigation";
import { findTopic, getPortalDocument } from "../../../../../../lib/portal-store";
import { LockedPanel, PortalHeader } from "../../../../../portal-components";
import { PortalElements, portalTextStyle } from "../../../../../portal-elements";

export const dynamic = "force-dynamic";

export default async function ExplorePage({ params }: { params: Promise<{ courseId: string; topicId: string }> }) {
  const { courseId, topicId } = await params;
  const { course, topic } = findTopic(await getPortalDocument(), courseId, topicId);
  if (!course || !topic) notFound();
  if (topic.locked) return <LockedPanel course={course} title={topic.title} message={topic.lockMessage} />;
  return <main className="portal-subpage explore-page" style={{ "--course-accent": course.accent } as React.CSSProperties}><PortalHeader course={course} backHref={`/course/${course.id}/topic/${topic.id}/log-before`} backLabel="탐사 전 기록" /><section className="explore-hero"><p className="portal-styled-text" style={portalTextStyle(topic.explore.styles?.eyebrow)}>{topic.explore.eyebrow}</p><span className="portal-styled-text" style={portalTextStyle(topic.explore.styles?.meta)}>{topic.unit}{topic.group ? ` · ${topic.group}` : ""}</span><h1 className="portal-styled-text" style={portalTextStyle(topic.explore.styles?.title)}>{topic.title}</h1><div className="portal-styled-text" style={portalTextStyle(topic.explore.styles?.intro)}>{topic.explore.intro}</div><PortalElements elements={topic.explore.elements} /></section><section className="mission-card"><p>RESTORATION MISSION</p><h2>오늘의 탐사 임무</h2><blockquote className="portal-styled-text" style={portalTextStyle(topic.explore.styles?.mission)}>{topic.explore.mission}</blockquote><div className="mission-meta"><span>교과서</span><strong>{topic.page}쪽부터</strong></div></section><section className="explore-questions"><p>KEY QUESTIONS</p><h2>시간선에 던질 질문</h2><ol>{topic.explore.questions.map((question, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><div className="portal-styled-text" style={portalTextStyle(topic.explore.styles?.question)}>{question}</div></li>)}</ol></section><footer className="flow-footer">{topic.explore.nextLocked ? <button type="button" disabled>🔒 새 기억 복원 로그가 잠겨 있습니다</button> : <Link href={`/course/${course.id}/topic/${topic.id}/log-after`}>새 기억 복원 로그 진입 →</Link>}</footer></main>;
}
