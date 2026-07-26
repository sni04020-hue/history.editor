import Link from "next/link";
import { getPortalDocument } from "../../lib/portal-store";
import { PortalHeader } from "../portal-components";
import { PortalElements, portalTextStyle } from "../portal-elements";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const portal = await getPortalDocument();
  const catalog = portal.catalog ?? { eyebrow: "SELECT TIMELINE", title: "과목 선택", intro: "수강하는 과목의 시간선을 선택하세요." };
  return <main className="portal-subpage courses-page"><PortalHeader backHref="/" backLabel="크로노 코어" /><section className="courses-hero"><p className="portal-styled-text" style={portalTextStyle(catalog.styles?.eyebrow)}>{catalog.eyebrow}</p><h1 className="portal-styled-text" style={portalTextStyle(catalog.styles?.title)}>{catalog.title}</h1><div className="portal-styled-text" style={portalTextStyle(catalog.styles?.intro)}>{catalog.intro}</div><PortalElements elements={catalog.elements} /></section><section className="course-grid">{portal.courses.map((course, index) => {
    const body = <><div className="course-index">{String(index + 1).padStart(2, "0")}</div><div className="course-glyph portal-styled-text" style={{ color: course.accent, borderColor: `${course.accent}66`, ...portalTextStyle(course.styles?.glyph) }}>{course.glyph}</div><p>CHRONO NEXUS</p><h2 className="portal-styled-text" style={portalTextStyle(course.styles?.title)}>{course.title}</h2><div className="course-subtitle portal-styled-text" style={portalTextStyle(course.styles?.subtitle)}>{course.subtitle}</div><span className="course-status">{course.locked ? `🔒 ${course.lockMessage}` : `${course.topics.length}개의 탐사 주제 →`}</span></>;
    return course.locked ? <article key={course.id} className="course-card is-locked" style={{ "--course-accent": course.accent } as React.CSSProperties}>{body}</article> : <Link key={course.id} className="course-card" href={`/course/${course.id}`} style={{ "--course-accent": course.accent } as React.CSSProperties}>{body}</Link>;
  })}</section></main>;
}
