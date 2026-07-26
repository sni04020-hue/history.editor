"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { defaultStoryDesign, type EditableBlockStyle, type StoryBlock, type StoryDocument, type StoryImageAsset } from "../content/story";

type VariableStyle = CSSProperties & Record<`--${string}`, string>;

function Lines({ text }: { text: string }) {
  const lines = text.split("\n");
  return <>{lines.map((line, index) => <span key={`${line}-${index}`}>{line}{index < lines.length - 1 && <br />}</span>)}</>;
}

function StoryImage({ image }: { image: StoryImageAsset }) {
  const alignment = image.alignment ?? "center";
  const style: CSSProperties = {
    aspectRatio: `${image.width} / ${image.height}`,
    width: image.displayWidth ? `${image.displayWidth}%` : undefined,
    maxWidth: image.maxWidth ? `${image.maxWidth}px` : undefined,
    marginLeft: alignment === "left" ? 0 : "auto",
    marginRight: alignment === "right" ? 0 : "auto",
    borderRadius: image.borderRadius ? `${image.borderRadius}px` : undefined,
  };
  return (
    <figure
      className={`story-image reveal${image.portrait ? " story-image-portrait" : ""}${image.compact ? " story-image-compact" : ""}`}
      style={style}
    >
      <img src={image.src} alt={image.alt} width={image.width} height={image.height} style={{ objectFit: image.objectFit ?? "contain" }} />
    </figure>
  );
}

function editableStyle(style?: EditableBlockStyle): VariableStyle | undefined {
  if (!style) return undefined;
  return {
    "--editable-font-size": style.fontSize ? `${style.fontSize}px` : "inherit",
    "--editable-mobile-font-size": style.mobileFontSize ? `${style.mobileFontSize}px` : style.fontSize ? `${style.fontSize}px` : "inherit",
    color: style.color || undefined,
    textAlign: style.textAlign,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    maxWidth: style.maxWidth ? `${style.maxWidth}px` : undefined,
    marginTop: style.marginTop === undefined ? undefined : `${style.marginTop}px`,
    marginBottom: style.marginBottom === undefined ? undefined : `${style.marginBottom}px`,
    padding: style.padding === undefined ? undefined : `${style.padding}px`,
    backgroundColor: style.backgroundColor || undefined,
    borderColor: style.borderColor || undefined,
    borderRadius: style.borderRadius === undefined ? undefined : `${style.borderRadius}px`,
  };
}

function ChapterHeading({ text, style }: { text: string; style?: EditableBlockStyle }) {
  return <header className={`chapter-heading reveal${style ? " story-editable-style" : ""}`} style={editableStyle(style)}><h2><Lines text={text} /></h2></header>;
}

function Block({ block }: { block: StoryBlock }) {
  const style = editableStyle(block.style);
  const editableClass = block.style ? " story-editable-style" : "";
  switch (block.type) {
    case "heading":
      return <ChapterHeading text={block.text} style={block.style} />;
    case "subheading":
      return <div className={`subchapter reveal${editableClass}`} style={style}><h3 className="subheading"><Lines text={block.text} /></h3></div>;
    case "pullQuote":
      return <p className={`pull-quote reveal${block.small ? " pull-quote-small" : ""}${editableClass}`} style={style}><Lines text={block.text} /></p>;
    case "prose":
      return <div className={`prose reveal${editableClass}`} style={style}>{block.paragraphs.map((paragraph, index) => <p key={index} className={block.emphasis ? "closing-line" : undefined}><Lines text={paragraph} /></p>)}</div>;
    case "image":
      return <StoryImage image={block.image} />;
    case "quote": {
      const className = block.variant === "guardian" ? "guardian-callout" : block.variant === "enemy" ? "enemy-voice" : "transmission";
      return <blockquote className={`${className} reveal${editableClass}`} style={style}>{block.paragraphs.map((paragraph, index) => <p key={index}><Lines text={paragraph} /></p>)}</blockquote>;
    }
    case "principles":
      return <div className={`principles reveal${editableClass}`} style={style}><h3>{block.title}</h3><ol>{block.items.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p><Lines text={item.text} /></p></li>)}</ol></div>;
    case "stages":
      return <div className={`stage-grid reveal${editableClass}`} style={style}>{block.items.map((item, index) => <article key={index}><span>{String(index + 1).padStart(2, "0")}</span><h3><Lines text={item.title} /></h3><p><Lines text={item.text} /></p></article>)}</div>;
    case "divider":
      return <div className="mission-divider" aria-hidden="true"><span>×</span></div>;
    case "questions":
      return <ol className={`question-path reveal${editableClass}`} style={style}>{block.items.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><div><strong><Lines text={item.title} /></strong><p><Lines text={item.text} /></p></div></li>)}</ol>;
    case "rank":
      return <div className={`rank-card reveal${editableClass}`} style={style}>{block.items.map((item, index) => <p key={index}><span>{item.title}</span><strong>{item.text}</strong></p>)}</div>;
    case "grandQuestion":
      return <p className={`grand-question reveal${editableClass}`} style={style}><Lines text={block.text} /></p>;
    case "areas":
      return <div className={`areas reveal${editableClass}`} style={style}><h3>{block.title}</h3>{block.intro.map((line, index) => <p key={index}><Lines text={line} /></p>)}{block.image && <StoryImage image={block.image} />}<p className="areas-guide"><Lines text={block.guide} /></p><ul>{block.items.map((item, index) => <li key={index}><Lines text={item} /></li>)}</ul></div>;
    case "finalTransmission":
      return <div className={`final-transmission reveal${editableClass}`} style={style}>{block.paragraphs.map((paragraph, index) => <p key={index}><Lines text={paragraph} /></p>)}<p className="signal-end"><Lines text={block.finalParagraph} /></p></div>;
    case "returnLink":
      return <a className={`return-link reveal${editableClass}`} style={style} href="#top">{block.text}</a>;
  }
}

const chapterThemeClass: Record<StoryDocument["chapters"][number]["theme"], string> = {
  default: "",
  dark: " chapter-dark",
  threat: " threat-zone",
  restoration: " restoration-zone",
  mission: " mission-zone",
  gate: " gate-zone",
  final: " final-zone",
};

export default function StoryPageClient({ document, portalBackHref, portalBackLabel }: { document: StoryDocument; portalBackHref?: string; portalBackLabel?: string }) {
  const [progress, setProgress] = useState(0);
  const design = { ...defaultStoryDesign, ...(document.design ?? {}) };
  const designStyle: VariableStyle = {
    "--ink": design.backgroundColor,
    "--paper": design.textColor,
    "--muted": design.mutedTextColor,
    "--cyan": design.accentColor,
    "--violet": design.secondaryAccentColor,
    "--story-hero-title": `${design.heroTitleSize}px`,
    "--story-hero-title-mobile": `${design.heroTitleMobileSize}px`,
    "--story-hero-kicker": `${design.heroKickerSize}px`,
    "--story-hero-kicker-mobile": `${design.heroKickerMobileSize}px`,
    "--story-chapter-title": `${design.chapterTitleSize}px`,
    "--story-chapter-title-mobile": `${design.chapterTitleMobileSize}px`,
    "--story-subheading": `${design.subheadingSize}px`,
    "--story-subheading-mobile": `${design.subheadingMobileSize}px`,
    "--story-block-title": `${design.blockTitleSize}px`,
    "--story-block-title-mobile": `${design.blockTitleMobileSize}px`,
    "--story-body": `${design.bodySize}px`,
    "--story-body-mobile": `${design.bodyMobileSize}px`,
    "--story-pull-quote": `${design.pullQuoteSize}px`,
    "--story-pull-quote-mobile": `${design.pullQuoteMobileSize}px`,
    "--story-accent-label": `${design.accentLabelSize}px`,
    "--story-accent-label-mobile": `${design.accentLabelMobileSize}px`,
    "--story-card-title": `${design.cardTitleSize}px`,
    "--story-card-title-mobile": `${design.cardTitleMobileSize}px`,
    "--story-card-body": `${design.cardBodySize}px`,
    "--story-card-body-mobile": `${design.cardBodyMobileSize}px`,
    "--story-quote": `${design.quoteSize}px`,
    "--story-quote-mobile": `${design.quoteMobileSize}px`,
    "--story-content-width": `${design.contentWidth}px`,
    "--story-wide-width": `${design.wideContentWidth}px`,
    "--story-image-width": `${design.imageMaxWidth}px`,
    "--story-chapter-padding": `${design.chapterPadding}px`,
    "--story-chapter-padding-mobile": `${design.chapterPaddingMobile}px`,
  };

  useEffect(() => {
    const updateProgress = () => {
      const available = window.document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available > 0 ? (window.scrollY / available) * 100 : 0);
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")), { threshold: 0.08 });
    window.document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

    const preventGesture = (event: Event) => event.preventDefault();
    const preventPinch = (event: TouchEvent) => { if (event.touches.length > 1) event.preventDefault(); };
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 320) event.preventDefault();
      lastTouchEnd = now;
    };
    window.document.addEventListener("gesturestart", preventGesture, { passive: false });
    window.document.addEventListener("gesturechange", preventGesture, { passive: false });
    window.document.addEventListener("gestureend", preventGesture, { passive: false });
    window.document.addEventListener("touchmove", preventPinch, { passive: false });
    window.document.addEventListener("touchend", preventDoubleTapZoom, { passive: false });

    return () => {
      window.removeEventListener("scroll", updateProgress);
      observer.disconnect();
      window.document.removeEventListener("gesturestart", preventGesture);
      window.document.removeEventListener("gesturechange", preventGesture);
      window.document.removeEventListener("gestureend", preventGesture);
      window.document.removeEventListener("touchmove", preventPinch);
      window.document.removeEventListener("touchend", preventDoubleTapZoom);
    };
  }, [document]);

  return (
    <main className="story-reader" style={designStyle}>
      {portalBackHref && <a className="story-portal-back" href={portalBackHref}>← {portalBackLabel ?? "과목 메인"}</a>}
      <div className="progress-track" aria-hidden="true"><div className="progress-value" style={{ height: `${progress}%` }} /></div>
      <section className="hero" id="top">
        <div className="hero-noise" />
        <div className="hero-content">
          <p className="season">{document.hero.season}</p>
          <p className="hero-agency">{document.hero.agency}</p>
          <p className="series">{document.hero.series}</p>
          <h1>{document.hero.title}</h1>
          <p className="hero-kicker"><Lines text={document.hero.kicker} /></p>
          <StoryImage image={document.hero.image} />
          <p className="hero-copy"><Lines text={document.hero.copy} /></p>
          <a className="enter-link" href={`#${document.chapters[0]?.id ?? "top"}`}><span>{document.hero.cta}</span><i aria-hidden="true">↓</i></a>
        </div>
      </section>
      <article className="story">
        {document.chapters.map((chapter) => (
          <section key={chapter.id} className={`chapter${chapterThemeClass[chapter.theme]}`} id={chapter.id} style={{ backgroundColor: chapter.style?.backgroundColor || undefined, paddingTop: chapter.style?.paddingTop === undefined ? undefined : `${chapter.style.paddingTop}px`, paddingBottom: chapter.style?.paddingBottom === undefined ? undefined : `${chapter.style.paddingBottom}px` }}>
            <ChapterHeading text={chapter.title} style={chapter.style?.title} />
            {chapter.blocks.map((block) => <Block key={block.id} block={block} />)}
          </section>
        ))}
      </article>
    </main>
  );
}
