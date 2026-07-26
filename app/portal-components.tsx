import Link from "next/link";
import type { ContentPage, PortalCourse } from "../content/portal";
import { PortalElements, portalTextStyle } from "./portal-elements";

export function PortalHeader({ course, backHref = "/courses", backLabel = "과목 선택" }: { course?: PortalCourse; backHref?: string; backLabel?: string }) {
  return <header className="portal-header"><Link href={backHref}>← {backLabel}</Link><Link className="portal-header-brand" href="/">CHRONO NEXUS</Link>{course ? <Link href={`/course/${course.id}`}>{course.title}</Link> : <span>중앙기록실</span>}</header>;
}

export function LockedPanel({ title, message, course }: { title: string; message: string; course?: PortalCourse }) {
  return <main className="portal-subpage"><PortalHeader course={course} /><section className="locked-panel"><span aria-hidden="true">⌾</span><p>LOCKED TIMELINE</p><h1>{title}</h1><blockquote>🔒 {message}</blockquote>{course && <Link href={`/course/${course.id}`}>과목 메인으로 돌아가기</Link>}</section></main>;
}

export function ContentPageView({ page, course, type }: { page: ContentPage; course: PortalCourse; type: "guide" | "epilogue" }) {
  return <main className={`portal-subpage content-page ${type === "epilogue" ? "epilogue-page" : ""}`}><PortalHeader course={course} /><section className="content-hero"><p className="portal-styled-text" style={portalTextStyle(page.styles?.eyebrow)}>{page.eyebrow}</p><h1 className="portal-styled-text" style={portalTextStyle(page.styles?.title)}>{page.title}</h1><div className="portal-styled-text" style={portalTextStyle(page.styles?.intro)}>{page.intro}</div><PortalElements elements={page.elements} className="content-hero-elements" /></section><div className="content-sections">{page.sections.map((section, index) => { const titled = Boolean(section.title.trim()); return <section key={section.id} className={`content-section${titled ? "" : " content-section-untitled"}`}>{titled && <span className="portal-styled-text" style={portalTextStyle(section.styles?.number ?? page.styles?.sectionNumber)}>{String(index + 1).padStart(2, "0")}</span>}<div>{titled && <h2 className="portal-styled-text" style={portalTextStyle(section.styles?.title ?? page.styles?.sectionTitle)}>{section.title}</h2>}{section.paragraphs.map((paragraph, paragraphIndex) => <p className="portal-styled-text" style={portalTextStyle(section.styles?.paragraph ?? page.styles?.paragraph)} key={paragraphIndex}>{paragraph}</p>)}{section.bullets.length > 0 && <ul>{section.bullets.map((bullet, bulletIndex) => <li className="portal-styled-text" style={portalTextStyle(section.styles?.bullet ?? page.styles?.bullet)} key={bulletIndex}>{bullet}</li>)}</ul>}<PortalElements elements={section.elements} className="content-section-elements" /></div></section>; })}</div><footer className="content-return"><Link className="portal-styled-text" style={portalTextStyle(page.styles?.returnLabel)} href={`/course/${course.id}`}>{page.returnLabel ?? "과목 메인으로 돌아가기"}</Link></footer></main>;
}
