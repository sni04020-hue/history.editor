"use client";

import Link from "next/link";
import { useState } from "react";
import type { PortalCourse, PortalTopic, ResidualThought } from "../../../../../../content/portal";
import { animateDice, die } from "../../../../../dice-effects";
import { PortalElements, portalTextStyle } from "../../../../../portal-elements";

export default function BeforeLogClient({ course, topic }: { course: PortalCourse; topic: PortalTopic }) {
  const [seat, setSeat] = useState<[number, number] | null>(null);
  const [eventDie, setEventDie] = useState<number | null>(null);
  const [selected, setSelected] = useState<ResidualThought | null>(null);
  const [rolling, setRolling] = useState<"seat" | "event" | null>(null);
  const rollSeat = () => { setRolling("seat"); animateDice(() => setSeat([die(), die()]), () => { setSeat([die(), die()]); setRolling(null); }); };
  const eventSides = Math.max(1, topic.beforeLog.residuals.length);
  const rollEvent = () => { setRolling("event"); setSelected(null); animateDice(() => setEventDie(die(eventSides)), () => { setEventDie(die(eventSides)); setRolling(null); }); };
  const diceReady = !topic.beforeLog.diceRequired || (seat !== null && eventDie !== null);
  const residualReady = !topic.beforeLog.residualRequired || selected !== null;
  const ready = diceReady && residualReady && !topic.beforeLog.nextLocked;
  const canSelect = (item: ResidualThought) => !item.locked && eventDie !== null && eventDie === item.number;
  return <main className="portal-subpage log-page" style={{ "--course-accent": course.accent } as React.CSSProperties}>
    <header className="portal-header"><Link href={`/course/${course.id}/topics`}>← 주제 선택</Link><Link className="portal-header-brand" href="/">CHRONO NEXUS</Link><span>STEP 01 · 탐사 전</span></header>
    <section className="log-hero"><p className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.eyebrow)}>{course.title} · 주제 {String(topic.order).padStart(2, "0")}</p><h1 className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.title)}>{topic.beforeLog.title}</h1><div className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.topic)}>{topic.title}</div><blockquote className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.intro)}>{topic.beforeLog.intro}</blockquote><PortalElements elements={topic.beforeLog.elements} /></section>
    {topic.beforeLog.diceEnabled && <section className="dice-console"><div className="dice-console-head"><span className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.diceEyebrow)}>{topic.beforeLog.diceEyebrow}</span><h2 className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.diceTitle)}>{topic.beforeLog.diceTitle}</h2><p className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.diceDescription)}>{topic.beforeLog.diceDescription}</p></div><div className="dice-grid"><article><p>좌석 다이스</p><div className={`dice-faces${rolling === "seat" ? " is-rolling" : ""}`}><b>{seat?.[0] ?? "?"}</b><b>{seat?.[1] ?? "?"}</b></div><button type="button" disabled={rolling !== null} onClick={rollSeat}>{rolling === "seat" ? "굴리는 중…" : "좌석 다이스 굴리기"}</button><small>{seat ? `${seat[0]}번째 줄 · ${seat[1]}번째 학생` : "두 번의 값으로 발표자를 정합니다."}</small></article><article><p>이벤트 다이스</p><div className={`dice-faces single${rolling === "event" ? " is-rolling" : ""}`}><b>{eventDie ?? "?"}</b></div><button type="button" disabled={rolling !== null} onClick={rollEvent}>{rolling === "event" ? "굴리는 중…" : "이벤트 다이스 굴리기"}</button><small>{eventDie ? `${eventDie}번 ${topic.beforeLog.residuals.find((item) => item.number === eventDie)?.title ?? "이상 유형"}을 확인하세요.` : `1~${eventSides}는 감지된 이상 유형을 나타냅니다.`}</small></article></div></section>}
    <section className="residual-section"><header><p className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.residualEyebrow)}>{topic.beforeLog.residualEyebrow}</p><h2 className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.residualTitle)}>{topic.beforeLog.residualTitle}</h2><div className="portal-styled-text" style={portalTextStyle(topic.beforeLog.styles?.residualDescription)}>{topic.beforeLog.residualDescription}</div></header><div className="residual-buttons">{topic.beforeLog.residuals.map((item) => <button type="button" key={item.id} disabled={!canSelect(item)} className={selected?.id === item.id ? "is-selected" : ""} onClick={() => setSelected(item)}><span>{String(item.number).padStart(2, "0")}</span><strong>{item.locked ? "🔒 잠김" : item.title}</strong></button>)}</div>{selected && <article className="residual-reveal"><p className="portal-styled-text" style={portalTextStyle(selected.styles?.number)}>잔존 사념 {String(selected.number).padStart(2, "0")}</p><h3 className="portal-styled-text" style={portalTextStyle(selected.styles?.title)}>{selected.title}</h3>{selected.image && <img src={selected.image.src} alt={selected.image.alt} width={selected.image.width} height={selected.image.height} />}<div className="portal-styled-text" style={portalTextStyle(selected.styles?.content)}>{selected.content}</div><PortalElements elements={selected.elements} /></article>}</section>
    <footer className="flow-footer">{ready ? <Link href={`/course/${course.id}/topic/${topic.id}/explore`}>{topic.beforeLog.nextLabel} →</Link> : <button type="button" disabled>{topic.beforeLog.nextLocked ? "🔒 다음 탐사가 잠겨 있습니다" : !diceReady ? "주사위를 먼저 굴려 주세요" : "잔존 사념 내용을 확인해 주세요"}</button>}</footer>
  </main>;
}
