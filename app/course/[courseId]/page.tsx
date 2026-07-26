import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortalDocument, findCourse } from "../../../lib/portal-store";
import { LockedPanel, PortalHeader } from "../../portal-components";
import { PortalElements, portalTextStyle } from "../../portal-elements";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const course = findCourse(await getPortalDocument(), courseId);
  if (!course) notFound();
  if (course.locked) return <LockedPanel title={course.title} message={course.lockMessage} />;
  const labels = course.menu ?? {
    prologue: { title: "프롤로그", description: "시간선과 탐사 임무를 확인합니다." },
    guide: { title: "수업, 평가 안내", description: "기억 복원 로그와 다이스 운영 원칙을 확인합니다." },
    topics: { title: "시간선 탐사 출발", description: `${course.topics.length}개의 주제 중 오늘의 탐사를 선택합니다.` },
    assessment: { title: "수행평가", description: "기억 보존 임무와 시간선 역설계 임무를 확인합니다." },
    epilogue: { title: "에필로그", description: "복원된 시간선의 결말을 확인합니다.", lockedDescription: "모든 핵심 시간선의 복원이 끝난 뒤 공개됩니다." },
  };
  const menus = [
    { key: "prologue", number: "01", title: labels.prologue.title, desc: labels.prologue.description, href: `/course/${course.id}/prologue`, locked: course.prologueLocked },
    { key: "guide", number: "02", title: labels.guide.title, desc: labels.guide.description, href: `/course/${course.id}/guide`, locked: course.guideLocked },
    { key: "topics", number: "03", title: labels.topics.title, desc: labels.topics.description, href: `/course/${course.id}/topics`, locked: course.topicsLocked },
    { key: "assessment", number: "04", title: labels.assessment.title, desc: labels.assessment.description, href: `/course/${course.id}/assessment`, locked: course.assessmentLocked ?? false },
    { key: "epilogue", number: "05", title: labels.epilogue.title, desc: course.epilogueLocked ? labels.epilogue.lockedDescription : labels.epilogue.description, href: `/course/${course.id}/epilogue`, locked: course.epilogueLocked },
  ];
  return <main className="portal-subpage course-hub" style={{ "--course-accent": course.accent } as React.CSSProperties}><PortalHeader course={course} /><section className="course-hub-hero"><p className="portal-styled-text" style={portalTextStyle(course.styles?.eyebrow)}>SELECTED TIMELINE · {course.glyph}</p><h1 className="portal-styled-text" style={portalTextStyle(course.styles?.title)}>{course.title}</h1><div className="portal-styled-text" style={portalTextStyle(course.styles?.subtitle)}>{course.subtitle}</div><span className="portal-styled-text" style={portalTextStyle(course.styles?.audience)}>{course.audience}</span><PortalElements elements={course.elements} className="course-hub-elements" /></section><section className="course-menu">{menus.map((menu) => <Link key={menu.key} className={`course-menu-card${menu.locked ? " is-locked" : ""}`} href={menu.href}><span className="portal-styled-text" style={portalTextStyle(course.styles?.menuNumber)}>{menu.number}</span><div><p>{menu.locked ? "LOCKED" : "OPEN"}</p><h2 className="portal-styled-text" style={portalTextStyle(course.styles?.menuTitle)}>{menu.locked ? "🔒 " : ""}{menu.title}</h2><div className="portal-styled-text" style={portalTextStyle(course.styles?.menuDescription)}>{menu.desc}</div></div><i>{menu.locked ? "⌁" : "→"}</i></Link>)}</section></main>;
}
