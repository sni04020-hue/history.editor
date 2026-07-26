"use client";

import Link from "next/link";
import { useState } from "react";
import type { PortalCourse, PortalTopic } from "../../../../../../content/portal";
import { animateDice, die } from "../../../../../dice-effects";
import { PortalElements, portalTextStyle } from "../../../../../portal-elements";

export default function AfterLogClient({ course, topic }: { course: PortalCourse; topic: PortalTopic }) {
  const [rolls, setRolls] = useState<Array<[number, number] | null>>([null, null, null]);
  const [rollingIndex, setRollingIndex] = useState<number | null>(null);
  const labels = ["사실 복원 발표자", "기록 해독 발표자", "현재 공명 발표자"];
  const setRoll = (index: number) => setRolls((current) => current.map((value, valueIndex) => valueIndex === index ? [die(), die()] : value));
  const roll = (index: number) => { setRollingIndex(index); animateDice(() => setRoll(index), () => { setRoll(index); setRollingIndex(null); }); };
  const ready = (!topic.afterLog.diceRequired || rolls.every(Boolean)) && !topic.afterLog.nextLocked;
  return <main className="portal-subpage log-page after-log-page" style={{ "--course-accent": course.accent } as React.CSSProperties}>
    <header className="portal-header"><Link href={`/course/${course.id}/topic/${topic.id}/explore`}>← 주제 소개 및 탐사</Link><Link className="portal-header-brand" href="/">CHRONO NEXUS</Link><span>STEP 03 · 탐사 후</span></header>
    <section className="log-hero"><p className="portal-styled-text" style={portalTextStyle(topic.afterLog.styles?.eyebrow)}>{course.title} · 주제 {String(topic.order).padStart(2, "0")}</p><h1 className="portal-styled-text" style={portalTextStyle(topic.afterLog.styles?.title)}>{topic.afterLog.title}</h1><div className="portal-styled-text" style={portalTextStyle(topic.afterLog.styles?.topic)}>{topic.title}</div><blockquote className="portal-styled-text" style={portalTextStyle(topic.afterLog.styles?.intro)}>{topic.afterLog.intro}</blockquote><PortalElements elements={topic.afterLog.elements} /></section>
    <section className="log-prompts">{topic.afterLog.prompts.map((prompt, index) => <article key={index}><span>{String(index + 1).padStart(2, "0")}</span><div><h2 className="portal-styled-text" style={portalTextStyle(topic.afterLog.styles?.promptTitle)}>{prompt.title}</h2><p className="portal-styled-text" style={portalTextStyle(topic.afterLog.styles?.promptContent)}>{prompt.content}</p></div></article>)}</section>
    {topic.afterLog.diceEnabled && <section className="dice-console relay-console"><div className="dice-console-head"><span>RELAY DICE</span><h2>기억 복원 로그 발표 릴레이</h2><p>각 발표는 20~40초를 권장하며, 다이스 결과는 평가에 반영되지 않습니다.</p></div><div className="relay-list">{labels.map((label, index) => <article key={label}><div><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><small>{rolls[index] ? `${rolls[index]?.[0]}번째 줄 · ${rolls[index]?.[1]}번째 학생` : "좌석 다이스를 두 번 굴립니다."}</small></div><div className={`dice-faces${rollingIndex === index ? " is-rolling" : ""}`}><b>{rolls[index]?.[0] ?? "?"}</b><b>{rolls[index]?.[1] ?? "?"}</b></div><button type="button" disabled={rollingIndex !== null} onClick={() => roll(index)}>{rollingIndex === index ? "굴리는 중…" : "굴리기"}</button></article>)}</div></section>}
    <footer className="flow-footer">{ready ? <Link href={`/course/${course.id}/topics`}>{topic.afterLog.nextLabel} →</Link> : <button type="button" disabled>{topic.afterLog.nextLocked ? "🔒 다음 주제 선택이 잠겨 있습니다" : "발표 릴레이 주사위를 모두 굴려 주세요"}</button>}</footer>
  </main>;
}
