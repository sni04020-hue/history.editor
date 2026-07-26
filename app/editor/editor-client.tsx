"use client";

import { useState } from "react";
import { cloneDefaultStory, createBlock, defaultStoryDesign, type EditableBlockStyle, type StoryBlock, type StoryChapter, type StoryDesign, type StoryDocument, type StoryImageAsset, type TextItem } from "../../content/story";
import type { StoryRevision } from "../../lib/story-store";
import { uploadEditorImage } from "./image-upload";

const blockLabels: Record<StoryBlock["type"], string> = {
  heading: "큰 제목", subheading: "소제목", pullQuote: "강조 문장", prose: "본문", image: "삽화",
  quote: "인용, 대사 박스", principles: "번호 목록", stages: "단계 카드", divider: "구분선",
  questions: "질문 카드", rank: "정보 카드", grandQuestion: "핵심 질문", areas: "목록 영역",
  finalTransmission: "마지막 통신", returnLink: "맨 위로 링크",
};

const themes: { value: StoryChapter["theme"]; label: string }[] = [
  { value: "default", label: "기본" }, { value: "dark", label: "어두운 장" }, { value: "threat", label: "위협" },
  { value: "restoration", label: "복원" }, { value: "mission", label: "임무" }, { value: "gate", label: "관문" }, { value: "final", label: "마지막" },
];

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function paragraphs(value: string): string[] { return value.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean); }
function normalizeDocument(value: StoryDocument): StoryDocument { const next = clone(value); next.design = { ...defaultStoryDesign, ...(next.design ?? {}) }; return next; }

function Field({ label, value, onChange, area = false, hint, type = "text", min, max, step }: { label: string; value: string | number; onChange: (value: string) => void; area?: boolean; hint?: string; type?: string; min?: number; max?: number; step?: number }) {
  return <label className="editor-field"><span>{label}</span>{area ? <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={Math.max(3, Math.min(10, String(value).split("\n").length + 2))} /> : <input type={type} min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} />}{hint && <small>{hint}</small>}</label>;
}

function ImageEditor({ image, onChange }: { image: StoryImageAsset; onChange: (image: StoryImageAsset) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError("");
    try {
      onChange({ ...image, ...(await uploadEditorImage(file)) });
    } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "업로드하지 못했습니다."); }
    finally { setUploading(false); }
  };
  return <div className="editor-image-field">
    <img src={image.src} alt="현재 삽화 미리보기" style={{ aspectRatio: `${image.width}/${image.height}` }} />
    <label className="editor-upload"><span>{uploading ? "크기 조정, 업로드 중…" : "새 이미지 선택 · 자동 압축"}</span><input type="file" accept="image/*" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} /></label>
    <Field label="대체 설명" value={image.alt} onChange={(alt) => onChange({ ...image, alt })} />
    <div className="editor-checks"><label><input type="checkbox" checked={!!image.portrait} onChange={(event) => onChange({ ...image, portrait: event.target.checked })} /> 세로 삽화</label><label><input type="checkbox" checked={!!image.compact} onChange={(event) => onChange({ ...image, compact: event.target.checked })} /> 좁은 폭</label></div>
    <details className="editor-style-panel"><summary>삽화 크기, 배치</summary><div className="editor-style-grid"><Field label="표시 폭 (%)" type="number" min={20} max={100} value={image.displayWidth ?? 100} onChange={(value) => onChange({ ...image, displayWidth: Math.max(20, Math.min(100, Number(value) || 100)) })} /><Field label="최대 폭 (px)" type="number" min={240} max={2400} value={image.maxWidth ?? ""} onChange={(value) => onChange({ ...image, maxWidth: value ? Number(value) : undefined })} /><Field label="모서리 둥글기" type="number" min={0} max={80} value={image.borderRadius ?? 0} onChange={(value) => onChange({ ...image, borderRadius: Number(value) || 0 })} /><label className="editor-field"><span>정렬</span><select value={image.alignment ?? "center"} onChange={(event) => onChange({ ...image, alignment: event.target.value as StoryImageAsset["alignment"] })}><option value="left">왼쪽</option><option value="center">가운데</option><option value="right">오른쪽</option></select></label><label className="editor-field"><span>이미지 맞춤</span><select value={image.objectFit ?? "contain"} onChange={(event) => onChange({ ...image, objectFit: event.target.value as StoryImageAsset["objectFit"] })}><option value="contain">전체 보이기</option><option value="cover">영역 채우기</option></select></label></div></details>
    {error && <p className="editor-error">{error}</p>}
  </div>;
}

function ItemRows({ items, onChange, titles = false }: { items: TextItem[]; onChange: (items: TextItem[]) => void; titles?: boolean }) {
  const update = (index: number, key: "title" | "text", value: string) => { const next = clone(items); next[index] = { ...next[index], [key]: value }; onChange(next); };
  return <div className="editor-items">{items.map((item, index) => <div className="editor-item" key={index}><span>{String(index + 1).padStart(2, "0")}</span><div>{titles && <input aria-label={`${index + 1}번 제목`} value={item.title ?? ""} onChange={(event) => update(index, "title", event.target.value)} placeholder="제목" />}<textarea aria-label={`${index + 1}번 내용`} value={item.text} onChange={(event) => update(index, "text", event.target.value)} rows={2} placeholder="내용" /></div><button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} aria-label={`${index + 1}번 삭제`}>삭제</button></div>)}<button type="button" className="editor-add-small" onClick={() => onChange([...items, titles ? { title: "새 제목", text: "새 내용" } : { text: "새 항목" }])}>+ 항목 추가</button></div>;
}

const designNumberFields: { key: keyof StoryDesign; label: string; group: "글자" | "배치"; min: number; max: number }[] = [
  { key: "heroTitleSize", label: "첫 화면 제목 · PC", group: "글자", min: 40, max: 180 },
  { key: "heroTitleMobileSize", label: "첫 화면 제목 · 모바일", group: "글자", min: 32, max: 100 },
  { key: "heroKickerSize", label: "첫 화면 부제 · PC", group: "글자", min: 14, max: 60 },
  { key: "heroKickerMobileSize", label: "첫 화면 부제 · 모바일", group: "글자", min: 12, max: 40 },
  { key: "chapterTitleSize", label: "장 제목 · PC", group: "글자", min: 30, max: 120 },
  { key: "chapterTitleMobileSize", label: "장 제목 · 모바일", group: "글자", min: 26, max: 76 },
  { key: "subheadingSize", label: "소제목 · PC", group: "글자", min: 24, max: 100 },
  { key: "subheadingMobileSize", label: "소제목 · 모바일", group: "글자", min: 22, max: 64 },
  { key: "blockTitleSize", label: "목록 제목 · PC", group: "글자", min: 20, max: 80 },
  { key: "blockTitleMobileSize", label: "목록 제목 · 모바일", group: "글자", min: 18, max: 52 },
  { key: "bodySize", label: "본문 · PC", group: "글자", min: 14, max: 36 },
  { key: "bodyMobileSize", label: "본문 · 모바일", group: "글자", min: 14, max: 30 },
  { key: "pullQuoteSize", label: "강조 문장 · PC", group: "글자", min: 20, max: 90 },
  { key: "pullQuoteMobileSize", label: "강조 문장 · 모바일", group: "글자", min: 18, max: 56 },
  { key: "accentLabelSize", label: "파란 번호, 표시 · PC", group: "글자", min: 12, max: 40 },
  { key: "accentLabelMobileSize", label: "파란 번호, 표시 · 모바일", group: "글자", min: 12, max: 30 },
  { key: "cardTitleSize", label: "단계, 카드 제목 · PC", group: "글자", min: 18, max: 54 },
  { key: "cardTitleMobileSize", label: "단계, 카드 제목 · 모바일", group: "글자", min: 17, max: 40 },
  { key: "cardBodySize", label: "단계, 목록 본문 · PC", group: "글자", min: 14, max: 34 },
  { key: "cardBodyMobileSize", label: "단계, 목록 본문 · 모바일", group: "글자", min: 14, max: 28 },
  { key: "quoteSize", label: "대사, 통신 · PC", group: "글자", min: 16, max: 50 },
  { key: "quoteMobileSize", label: "대사, 통신 · 모바일", group: "글자", min: 15, max: 36 },
  { key: "contentWidth", label: "본문 최대 폭", group: "배치", min: 480, max: 1100 },
  { key: "wideContentWidth", label: "목록, 강조 최대 폭", group: "배치", min: 600, max: 1500 },
  { key: "imageMaxWidth", label: "삽화 기본 최대 폭", group: "배치", min: 600, max: 2200 },
  { key: "chapterPadding", label: "장 위아래 여백 · PC", group: "배치", min: 60, max: 320 },
  { key: "chapterPaddingMobile", label: "장 위아래 여백 · 모바일", group: "배치", min: 48, max: 220 },
];

function DesignEditor({ design, onChange }: { design: StoryDesign; onChange: (design: StoryDesign) => void }) {
  const update = (key: keyof StoryDesign, value: string | number) => onChange({ ...design, [key]: value });
  const colors: { key: keyof StoryDesign; label: string }[] = [
    { key: "backgroundColor", label: "전체 배경" }, { key: "textColor", label: "기본 글자" }, { key: "mutedTextColor", label: "보조 글자" },
    { key: "accentColor", label: "파란 강조" }, { key: "secondaryAccentColor", label: "보라 강조" },
  ];
  return <section className="editor-panel editor-design-panel"><header><div><h2>전체 디자인</h2><p>장 제목과 파란 번호를 포함한 모든 글자 비율, 색상, 폭과 여백의 기본값입니다.</p></div><button type="button" onClick={() => onChange({ ...defaultStoryDesign })}>권장 기본값 복원</button></header>
    <div className="editor-design-group"><h3>색상</h3><div className="editor-color-grid">{colors.map((item) => <Field key={item.key} label={item.label} type="color" value={String(design[item.key])} onChange={(value) => update(item.key, value)} />)}</div></div>
    {(["글자", "배치"] as const).map((group) => <div className="editor-design-group" key={group}><h3>{group === "글자" ? "글자 크기" : "폭과 여백"}</h3><div className="editor-style-grid">{designNumberFields.filter((item) => item.group === group).map((item) => <Field key={item.key} label={item.label} type="number" min={item.min} max={item.max} value={Number(design[item.key])} onChange={(value) => update(item.key, Math.max(item.min, Math.min(item.max, Number(value) || item.min)))} />)}</div></div>)}
  </section>;
}

function optionalNumber(value: string): number | undefined { return value === "" ? undefined : Number(value); }

function BlockStyleEditor({ value, onChange, title = "이 요소만 따로 꾸미기" }: { value?: EditableBlockStyle; onChange: (value?: EditableBlockStyle) => void; title?: string }) {
  const style = value ?? {};
  const update = <K extends keyof EditableBlockStyle>(key: K, nextValue: EditableBlockStyle[K]) => {
    const next = { ...style, [key]: nextValue };
    Object.keys(next).forEach((item) => { const keyName = item as keyof EditableBlockStyle; if (next[keyName] === undefined || next[keyName] === "") delete next[keyName]; });
    onChange(Object.keys(next).length ? next : undefined);
  };
  return <details className="editor-style-panel"><summary>{title}</summary><div className="editor-style-grid">
    <Field label="글자 크기 · PC" type="number" min={10} max={160} value={style.fontSize ?? ""} onChange={(next) => update("fontSize", optionalNumber(next))} />
    <Field label="글자 크기 · 모바일" type="number" min={10} max={100} value={style.mobileFontSize ?? ""} onChange={(next) => update("mobileFontSize", optionalNumber(next))} />
    <Field label="글자 색상" value={style.color ?? ""} onChange={(next) => update("color", next || undefined)} hint="예: #ffffff · 비우면 기본값" />
    <label className="editor-field"><span>정렬</span><select value={style.textAlign ?? ""} onChange={(event) => update("textAlign", (event.target.value || undefined) as EditableBlockStyle["textAlign"])}><option value="">기본값</option><option value="left">왼쪽</option><option value="center">가운데</option><option value="right">오른쪽</option><option value="justify">양쪽</option></select></label>
    <label className="editor-field"><span>굵기</span><select value={style.fontWeight ?? ""} onChange={(event) => update("fontWeight", event.target.value ? Number(event.target.value) : undefined)}><option value="">기본값</option><option value="400">보통</option><option value="600">약간 굵게</option><option value="700">굵게</option><option value="800">매우 굵게</option><option value="900">가장 굵게</option></select></label>
    <Field label="줄 간격" type="number" min={1} max={3} step={0.05} value={style.lineHeight ?? ""} onChange={(next) => update("lineHeight", optionalNumber(next))} />
    <Field label="최대 폭 (px)" type="number" min={240} max={1800} value={style.maxWidth ?? ""} onChange={(next) => update("maxWidth", optionalNumber(next))} />
    <Field label="위 여백 (px)" type="number" min={0} max={400} value={style.marginTop ?? ""} onChange={(next) => update("marginTop", optionalNumber(next))} />
    <Field label="아래 여백 (px)" type="number" min={0} max={400} value={style.marginBottom ?? ""} onChange={(next) => update("marginBottom", optionalNumber(next))} />
    <Field label="안쪽 여백 (px)" type="number" min={0} max={160} value={style.padding ?? ""} onChange={(next) => update("padding", optionalNumber(next))} />
    <Field label="배경 색상" value={style.backgroundColor ?? ""} onChange={(next) => update("backgroundColor", next || undefined)} hint="예: #111827 · 비우면 기본값" />
    <Field label="테두리 색상" value={style.borderColor ?? ""} onChange={(next) => update("borderColor", next || undefined)} hint="예: #6ad8ff · 비우면 기본값" />
    <Field label="모서리 둥글기" type="number" min={0} max={80} value={style.borderRadius ?? ""} onChange={(next) => update("borderRadius", optionalNumber(next))} />
  </div>{value && <button type="button" className="editor-reset-style" onClick={() => onChange(undefined)}>이 요소 디자인 초기화</button>}</details>;
}

function BlockEditor({ block, onChange, onDelete, onMove, first, last }: { block: StoryBlock; onChange: (block: StoryBlock) => void; onDelete: () => void; onMove: (direction: -1 | 1) => void; first: boolean; last: boolean }) {
  const update = <T extends StoryBlock>(next: T) => onChange(next);
  let fields;
  switch (block.type) {
    case "heading": case "subheading": case "grandQuestion": case "returnLink":
      fields = <Field label="텍스트" value={block.text} area onChange={(text) => update({ ...block, text })} hint="줄바꿈은 Enter로 입력합니다." />; break;
    case "pullQuote":
      fields = <><Field label="강조 문장" value={block.text} area onChange={(text) => update({ ...block, text })} hint="줄바꿈은 Enter로 입력합니다." /><label className="editor-inline"><input type="checkbox" checked={!!block.small} onChange={(event) => update({ ...block, small: event.target.checked })} /> 작은 강조문</label></>; break;
    case "prose":
      fields = <><Field label="본문" value={block.paragraphs.join("\n\n")} area onChange={(text) => update({ ...block, paragraphs: paragraphs(text) })} hint="문단 사이는 빈 줄 하나로 나눕니다." /><label className="editor-inline"><input type="checkbox" checked={!!block.emphasis} onChange={(event) => update({ ...block, emphasis: event.target.checked })} /> 굵게 강조</label></>; break;
    case "image": fields = <ImageEditor image={block.image} onChange={(image) => update({ ...block, image })} />; break;
    case "quote":
      fields = <><label className="editor-field"><span>박스 모양</span><select value={block.variant} onChange={(event) => update({ ...block, variant: event.target.value as typeof block.variant })}><option value="transmission">통신</option><option value="guardian">수호자</option><option value="enemy">적의 대사</option></select></label><Field label="문장" value={block.paragraphs.join("\n\n")} area onChange={(text) => update({ ...block, paragraphs: paragraphs(text) })} hint="박스 안 문단 사이는 빈 줄 하나로 나눕니다." /></>; break;
    case "principles":
      fields = <><Field label="목록 제목" value={block.title} onChange={(title) => update({ ...block, title })} /><ItemRows items={block.items} onChange={(items) => update({ ...block, items })} /></>; break;
    case "stages": case "questions": case "rank":
      fields = <ItemRows items={block.items} titles onChange={(items) => update({ ...block, items: items as Required<TextItem>[] })} />; break;
    case "divider": fields = <p className="editor-muted">장면 사이를 나누는 장식 구분선입니다.</p>; break;
    case "areas":
      fields = <><Field label="목록 제목" value={block.title} onChange={(title) => update({ ...block, title })} /><Field label="안내 문장" value={block.intro.join("\n")} area onChange={(text) => update({ ...block, intro: text.split("\n") })} />{block.image && <ImageEditor image={block.image} onChange={(image) => update({ ...block, image })} />}<Field label="마무리 안내" value={block.guide} area onChange={(guide) => update({ ...block, guide })} /><Field label="목록 항목" value={block.items.join("\n")} area onChange={(text) => update({ ...block, items: text.split("\n").filter(Boolean) })} hint="한 줄에 항목 하나씩 입력합니다." /></>; break;
    case "finalTransmission":
      fields = <><Field label="통신 본문" value={block.paragraphs.join("\n\n")} area onChange={(text) => update({ ...block, paragraphs: paragraphs(text) })} /><Field label="마지막 문장" value={block.finalParagraph} area onChange={(finalParagraph) => update({ ...block, finalParagraph })} /></>; break;
  }
  return <article className="editor-block"><header><strong>{blockLabels[block.type]}</strong><div><button type="button" disabled={first} onClick={() => onMove(-1)}>↑</button><button type="button" disabled={last} onClick={() => onMove(1)}>↓</button><button type="button" className="danger" onClick={onDelete}>삭제</button></div></header>{fields}<BlockStyleEditor value={block.style} onChange={(nextStyle) => onChange({ ...block, style: nextStyle } as StoryBlock)} /></article>;
}

function ChapterStyleEditor({ chapter, onChange }: { chapter: StoryChapter; onChange: (chapter: StoryChapter) => void }) {
  const style = chapter.style ?? {};
  return <details className="editor-chapter-style editor-style-panel"><summary>이 장의 제목, 배경, 여백 편집</summary><div className="editor-style-grid">
    <Field label="장 배경 색상" value={style.backgroundColor ?? ""} onChange={(value) => onChange({ ...chapter, style: { ...style, backgroundColor: value || undefined } })} hint="비우면 선택한 분위기의 기본 배경" />
    <Field label="위 여백 (px)" type="number" min={0} max={500} value={style.paddingTop ?? ""} onChange={(value) => onChange({ ...chapter, style: { ...style, paddingTop: optionalNumber(value) } })} />
    <Field label="아래 여백 (px)" type="number" min={0} max={500} value={style.paddingBottom ?? ""} onChange={(value) => onChange({ ...chapter, style: { ...style, paddingBottom: optionalNumber(value) } })} />
  </div><BlockStyleEditor title="이 장 제목만 따로 꾸미기" value={style.title} onChange={(title) => onChange({ ...chapter, style: { ...style, title } })} /></details>;
}

export default function EditorClient({ initialDocument, initialRevisions, userEmail, saveEndpoint = "/api/story", courseId, backHref = "/editor", publicHref = "/" }: { initialDocument: StoryDocument; initialRevisions: StoryRevision[]; userEmail: string; saveEndpoint?: string; courseId?: string; backHref?: string; publicHref?: string }) {
  const [document, setDocument] = useState(() => normalizeDocument(initialDocument));
  const [revisions, setRevisions] = useState(initialRevisions);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedRevision, setSelectedRevision] = useState("");

  const mutate = (recipe: (next: StoryDocument) => void) => setDocument((current) => { const next = clone(current); recipe(next); return next; });
  const save = async () => {
    setSaving(true); setNotice("");
    try {
      const response = await fetch(saveEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ document, courseId }) });
      const data = await response.json() as { version?: number; revisions?: StoryRevision[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "저장하지 못했습니다.");
      setRevisions(data.revisions ?? revisions); setNotice(`저장 완료 · 공개 사이트에 즉시 반영되었습니다. (저장본 ${data.version})`);
    } catch (error) { setNotice(error instanceof Error ? error.message : "저장하지 못했습니다."); }
    finally { setSaving(false); }
  };
  const restore = async () => {
    if (!selectedRevision || !confirm("선택한 저장본으로 되돌릴까요? 현재 편집 내용은 새 저장본으로 교체됩니다.")) return;
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/story", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restore", revisionId: Number(selectedRevision) }) });
      const data = await response.json() as { document?: StoryDocument; revisions?: StoryRevision[]; error?: string };
      if (!response.ok || !data.document) throw new Error(data.error ?? "복원하지 못했습니다.");
      setDocument(normalizeDocument(data.document)); setRevisions(data.revisions ?? revisions); setSelectedRevision(""); setNotice("선택한 저장본으로 복원했습니다.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "복원하지 못했습니다."); }
    finally { setSaving(false); }
  };

  const moveChapter = (index: number, direction: -1 | 1) => mutate((next) => { const target = index + direction; if (target < 0 || target >= next.chapters.length) return; [next.chapters[index], next.chapters[target]] = [next.chapters[target], next.chapters[index]]; });
  const addChapter = () => mutate((next) => next.chapters.push({ id: `chapter-${Date.now()}`, title: "새 장", theme: "default", blocks: [createBlock("prose")] }));

  return <main className="editor-shell">
    <header className="editor-topbar"><div><p>CHRONO NEXUS</p><h1>스토리 편집실</h1><span>{userEmail}</span></div><nav><a href={backHref}>← 편집실</a><a href={publicHref} target="_blank" rel="noreferrer">공개 화면 보기 ↗</a><button type="button" onClick={save} disabled={saving}>{saving ? "저장 중…" : "변경사항 공개"}</button></nav></header>
    {notice && <p className="editor-notice" role="status">{notice}</p>}
    <section className="editor-help"><h2>사이트 틀은 그대로, 내용과 디자인을 직접 바꿀 수 있습니다.</h2><p>텍스트, 삽화, 순서뿐 아니라 글자 크기, 색상, 정렬, 폭, 여백과 박스 모양도 조절할 수 있습니다. ‘변경사항 공개’를 누르면 메인 주소에 바로 반영됩니다.</p></section>

    <section className="editor-panel"><header><h2>첫 화면</h2></header><div className="editor-grid">
      {(["season", "agency", "series", "title", "kicker", "copy", "cta"] as const).map((key) => <Field key={key} label={{ season: "시즌", agency: "기관명", series: "시리즈", title: "작품명", kicker: "부제", copy: "소개 문장", cta: "시작 버튼" }[key]} value={document.hero[key]} area={key === "copy" || key === "kicker"} onChange={(value) => mutate((next) => { next.hero[key] = value; })} />)}
    </div><ImageEditor image={document.hero.image} onChange={(image) => mutate((next) => { next.hero.image = image; })} /></section>

    <DesignEditor design={{ ...defaultStoryDesign, ...(document.design ?? {}) }} onChange={(design) => mutate((next) => { next.design = design; })} />

    <section className="editor-chapters"><div className="editor-section-title"><div><h2>스토리 장과 블록</h2><p>에필로그나 교수, 학습, 평가 안내도 ‘새 장 추가’로 만들 수 있습니다.</p></div><button type="button" onClick={addChapter}>+ 새 장 추가</button></div>
      {document.chapters.map((chapter, chapterIndex) => <section className="editor-chapter" key={chapter.id}><header className="editor-chapter-head"><span>{String(chapterIndex + 1).padStart(2, "0")}</span><div><Field label="장 제목" value={chapter.title} area onChange={(title) => mutate((next) => { next.chapters[chapterIndex].title = title; })} /><label className="editor-field"><span>배경 분위기</span><select value={chapter.theme} onChange={(event) => mutate((next) => { next.chapters[chapterIndex].theme = event.target.value as StoryChapter["theme"]; })}>{themes.map((theme) => <option key={theme.value} value={theme.value}>{theme.label}</option>)}</select></label></div><div className="editor-chapter-actions"><button type="button" disabled={chapterIndex === 0} onClick={() => moveChapter(chapterIndex, -1)}>위로</button><button type="button" disabled={chapterIndex === document.chapters.length - 1} onClick={() => moveChapter(chapterIndex, 1)}>아래로</button><button type="button" className="danger" onClick={() => confirm("이 장 전체를 삭제할까요?") && mutate((next) => { next.chapters.splice(chapterIndex, 1); })}>장 삭제</button></div></header><ChapterStyleEditor chapter={chapter} onChange={(updated) => mutate((next) => { next.chapters[chapterIndex] = updated; })} />
        <div className="editor-blocks">{chapter.blocks.map((block, blockIndex) => <BlockEditor key={block.id} block={block} first={blockIndex === 0} last={blockIndex === chapter.blocks.length - 1} onChange={(updated) => mutate((next) => { next.chapters[chapterIndex].blocks[blockIndex] = updated; })} onDelete={() => confirm("이 블록을 삭제할까요?") && mutate((next) => { next.chapters[chapterIndex].blocks.splice(blockIndex, 1); })} onMove={(direction) => mutate((next) => { const blocks = next.chapters[chapterIndex].blocks; const target = blockIndex + direction; if (target < 0 || target >= blocks.length) return; [blocks[blockIndex], blocks[target]] = [blocks[target], blocks[blockIndex]]; })} />)}</div>
        <label className="editor-add-block"><span>이 장에 블록 추가</span><select defaultValue="" onChange={(event) => { if (!event.target.value) return; const type = event.target.value as StoryBlock["type"]; mutate((next) => next.chapters[chapterIndex].blocks.push(createBlock(type))); event.target.value = ""; }}><option value="" disabled>종류를 선택하세요</option>{Object.entries(blockLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      </section>)}
    </section>

    <section className="editor-panel editor-history"><header><div><h2>이전 저장본</h2><p>잘못 수정했을 때 이전 상태로 되돌릴 수 있습니다.</p></div></header><div><select value={selectedRevision} onChange={(event) => setSelectedRevision(event.target.value)}><option value="">저장본 선택</option>{revisions.map((revision) => <option key={revision.id} value={revision.id}>저장본 {revision.version} · {new Date(revision.createdAt).toLocaleString("ko-KR")}</option>)}</select><button type="button" disabled={!selectedRevision || saving} onClick={restore}>선택한 저장본 복원</button><button type="button" onClick={() => confirm("화면을 최초 기본 내용으로 되돌릴까요? 아직 공개되지는 않습니다.") && setDocument(cloneDefaultStory())}>최초 기본 내용 불러오기</button></div></section>
    <footer className="editor-footer"><button type="button" onClick={save} disabled={saving}>{saving ? "저장 중…" : "변경사항 공개"}</button><a href={publicHref} target="_blank" rel="noreferrer">공개 화면 보기 ↗</a></footer>
  </main>;
}
