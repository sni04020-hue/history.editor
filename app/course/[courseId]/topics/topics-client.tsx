"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PortalCourse } from "../../../../content/portal";
import { PortalElements, portalTextStyle } from "../../../portal-elements";

export default function TopicsClient({ course }: { course: PortalCourse }) {
  const [query, setQuery] = useState("");
  const [unit, setUnit] = useState("전체");
  const page = course.topicsPage ?? { eyebrow: "SELECT MISSION", title: "주제 선택", intro: course.subtitle, searchLabel: "시간선 검색", searchPlaceholder: "주제명 검색" };
  const publisherLabel = course.publisherOptions?.find((option) => option.id === course.publisher)?.label ?? course.publisher;
  const units = useMemo(() => ["전체", ...Array.from(new Set(course.topics.map((topic) => topic.unit)))], [course.topics]);
  const topics = course.topics.filter((topic) => (unit === "전체" || topic.unit === unit) && (!query || `${topic.title} ${topic.unit} ${topic.group}`.toLowerCase().includes(query.toLowerCase())));
  return <main className="portal-subpage topics-page" style={{ "--course-accent": course.accent } as React.CSSProperties}>
    <header className="portal-header"><Link href={`/course/${course.id}`}>← {course.title} 메인</Link><Link className="portal-header-brand" href="/">CHRONO NEXUS</Link><span>{course.topics.length} TIMELINES</span></header>
    <section className="topics-hero"><p className="portal-styled-text" style={portalTextStyle(page.styles?.eyebrow)}>{page.eyebrow}</p><h1 className="portal-styled-text" style={portalTextStyle(page.styles?.title)}>{page.title}</h1><div className="portal-styled-text" style={portalTextStyle(page.styles?.intro)}>{page.intro}</div>{publisherLabel && <span className="topic-publisher">교과서 출판사: {publisherLabel}</span>}<PortalElements elements={page.elements} /></section>
    <section className="topic-tools"><label><span className="portal-styled-text" style={portalTextStyle(page.styles?.searchLabel)}>{page.searchLabel}</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={page.searchPlaceholder} /></label><div className="unit-tabs">{units.map((item) => <button key={item} type="button" className={unit === item ? "is-active" : ""} onClick={() => setUnit(item)}>{item}</button>)}</div></section>
    <section className="topic-list">{topics.map((topic) => topic.locked ? <article key={topic.id} className="topic-card is-locked"><span>{String(topic.order).padStart(2, "0")}</span><div><p>{topic.unit}</p><h2>🔒 {topic.title}</h2><small>{topic.lockMessage}</small></div><i>⌁</i></article> : <Link key={topic.id} className="topic-card" href={`/course/${course.id}/topic/${topic.id}/log-before`}><span>{String(topic.order).padStart(2, "0")}</span><div><p>{topic.unit}{topic.group ? ` · ${topic.group}` : ""}</p><h2>{topic.title}</h2><small>교과서 {topic.page}쪽부터</small></div><i>→</i></Link>)}</section>
  </main>;
}
