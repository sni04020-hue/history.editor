"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PerformanceLink, PerformanceMission, PerformancePage, PortalCourse } from "../../../../content/portal";
import { PortalElements, portalTextStyle } from "../../../portal-elements";

function safeHref(url: string) {
  const value = url.trim();
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.href : "#";
  } catch {
    return "#";
  }
}

function MissionLink({ link }: { link: PerformanceLink }) {
  const href = safeHref(link.url);
  return <a className="assessment-link" href={href} target={link.openInNewTab ? "_blank" : undefined} rel={link.openInNewTab ? "noreferrer" : undefined} aria-disabled={href === "#"}>
    <span>{link.description}</span>
    <strong>{link.label}</strong>
    <i aria-hidden="true">→</i>
  </a>;
}

function MissionCard({ mission, number }: { mission: PerformanceMission; number: number }) {
  const [playing, setPlaying] = useState(false);
  const [linksRevealed, setLinksRevealed] = useState(!mission.requireVoiceBeforeLinks);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => () => {
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
  }, []);

  const playBriefing = async () => {
    if (mission.voiceAudio) {
      const audio = audioRef.current;
      if (!audio) return;
      audio.currentTime = 0;
      setPlaying(true);
      try { await audio.play(); }
      catch { setPlaying(false); setLinksRevealed(true); }
      return;
    }
    if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
      setLinksRevealed(true);
      return;
    }
    window.speechSynthesis.cancel();
    const briefing = new SpeechSynthesisUtterance(mission.voiceText);
    briefing.lang = "ko-KR";
    briefing.pitch = 0.82;
    briefing.onstart = () => setPlaying(true);
    briefing.onend = () => { setPlaying(false); setLinksRevealed(true); };
    briefing.onerror = () => { setPlaying(false); setLinksRevealed(true); };
    window.speechSynthesis.speak(briefing);
  };

  return <article id={`mission-${mission.id}`} className={`assessment-mission assessment-mission-${mission.id}`}>
    <div className="assessment-mission-number">{String(number).padStart(2, "0")}</div>
    <div className="assessment-mission-body">
      <p className="portal-styled-text" style={portalTextStyle(mission.styles?.eyebrow)}>{mission.eyebrow}</p>
      <h2 className="portal-styled-text" style={portalTextStyle(mission.styles?.title)}>{mission.title}</h2>
      <div className="portal-styled-text assessment-mission-intro" style={portalTextStyle(mission.styles?.intro)}>{mission.intro}</div>
      <ul>{mission.bullets.map((bullet, index) => <li className="portal-styled-text" style={portalTextStyle(mission.styles?.bullet)} key={index}>{bullet}</li>)}</ul>
      <PortalElements elements={mission.elements} className="assessment-mission-elements" />
      <section className="assessment-briefing">
        <span>VOICE BRIEFING</span>
        <blockquote>{mission.voiceText}</blockquote>
        {mission.voiceAudio && <audio ref={audioRef} src={mission.voiceAudio.src} preload="metadata" onPlay={() => setPlaying(true)} onEnded={() => { setPlaying(false); setLinksRevealed(true); }} onError={() => { setPlaying(false); setLinksRevealed(true); }} />}
        <div className="assessment-briefing-controls">
          <button type="button" onClick={playBriefing} disabled={playing}>{playing ? "임무 안내 재생 중…" : linksRevealed ? "임무 안내 다시 듣기" : "임무 안내 듣기"}</button>
        </div>
      </section>
      <section className={`assessment-links${linksRevealed ? " is-revealed" : ""}`} aria-live="polite">
        {!linksRevealed ? <p>임무 안내가 끝나면 작성 링크가 열립니다.</p> : mission.links.length > 0 ? mission.links.map((link) => <MissionLink link={link} key={link.id} />) : <p>편집실에서 이 임무의 작성, 자료, 제출 링크를 추가할 수 있습니다.</p>}
      </section>
    </div>
  </article>;
}

export default function PerformanceAssessmentClient({ course, page }: { course: PortalCourse; page: PerformancePage }) {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const visibleMissions = page.missions.filter((mission) => mission.id === selectedMissionId && !mission.locked);

  return <main className="portal-subpage assessment-page assessment-mode-selection" style={{ "--course-accent": course.accent } as React.CSSProperties}>
    <header className="portal-header"><Link href={`/course/${course.id}`}>← 과목 메인</Link><Link className="portal-header-brand" href="/">CHRONO NEXUS</Link><span>{course.title}</span></header>
    <section className="content-hero assessment-hero">
      <p className="portal-styled-text" style={portalTextStyle(page.styles?.eyebrow)}>{page.eyebrow}</p>
      <h1 className="portal-styled-text" style={portalTextStyle(page.styles?.title)}>{page.title}</h1>
      <div className="portal-styled-text" style={portalTextStyle(page.styles?.intro)}>{page.intro}</div>
      <PortalElements elements={page.elements} className="content-hero-elements" />
    </section>
    <nav className="assessment-selector" aria-label="수행평가 선택">{page.missions.map((mission, index) => <button type="button" className={`${selectedMissionId === mission.id ? "is-active" : ""}${mission.locked ? " is-locked" : ""}`} aria-pressed={selectedMissionId === mission.id} aria-label={mission.locked ? `${mission.title} 잠김` : undefined} disabled={mission.locked} onClick={() => setSelectedMissionId(mission.id)} key={mission.id}><span>{String(index + 1).padStart(2, "0")}</span><span><strong>{mission.title}</strong><small>{mission.locked ? `🔒 ${mission.lockMessage}` : mission.intro}</small></span><i aria-hidden="true">{mission.locked ? "⌾" : "→"}</i></button>)}</nav>
    {!selectedMissionId && <section className="assessment-choice-note"><span>SELECT ASSESSMENT</span><p>진행할 수행평가를 선택하면 임무 안내와 작성 링크가 열립니다.</p></section>}
    {visibleMissions.length > 0 && <section className="assessment-missions">{visibleMissions.map((mission) => <MissionCard mission={mission} number={page.missions.findIndex((item) => item.id === mission.id) + 1} key={mission.id} />)}</section>}
    <footer className="content-return"><Link className="portal-styled-text" style={portalTextStyle(page.styles?.returnLabel)} href={`/course/${course.id}`}>{page.returnLabel}</Link></footer>
  </main>;
}
