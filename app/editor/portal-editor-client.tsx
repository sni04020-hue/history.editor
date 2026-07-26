"use client";

import { useMemo, useState } from "react";
import { normalizePortalDocument, type ContentPage, type PerformancePage, type PortalCourse, type PortalCustomElement, type PortalDocument, type PortalEditableRegion, type PortalTopic, type ResidualThought } from "../../content/portal";
import type { EditableBlockStyle, StoryImageAsset } from "../../content/story";
import type { PortalRevision } from "../../lib/portal-store";
import { uploadEditorAudio } from "./audio-upload";
import { uploadEditorImage } from "./image-upload";

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function id(prefix: string) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function Field({ label, value, onChange, area = false, hint, type = "text", min, max, step }: { label: string; value: string | number; onChange: (value: string) => void; area?: boolean; hint?: string; type?: string; min?: number; max?: number; step?: number }) {
  return <label className="editor-field"><span>{label}</span>{area ? <textarea value={value} rows={Math.max(3, Math.min(9, String(value).split("\n").length + 2))} onChange={(event) => onChange(event.target.value)} /> : <input type={type} min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} />}{hint && <small>{hint}</small>}</label>;
}

function LockSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className={`portal-lock-switch${checked ? " is-locked" : ""}`}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{checked ? "🔒" : "✓"}</span><strong>{label}</strong><small>{checked ? "잠김" : "공개"}</small></label>;
}

function ContentPageEditor({ page, onChange }: { page: ContentPage; onChange: (page: ContentPage) => void }) {
  const mutate = (recipe: (next: ContentPage) => void) => { const next = clone(page); recipe(next); onChange(next); };
  const moveSection = (index: number, direction: -1 | 1) => mutate((next) => { const target = index + direction; if (target < 0 || target >= next.sections.length) return; [next.sections[index], next.sections[target]] = [next.sections[target], next.sections[index]]; });
  return <div className="portal-page-editor"><div className="editor-grid"><Field label="영문 표제" value={page.eyebrow} onChange={(value) => mutate((next) => { next.eyebrow = value; })} /><Field label="페이지 제목" value={page.title} onChange={(value) => mutate((next) => { next.title = value; })} /><Field label="돌아가기 버튼" value={page.returnLabel ?? "과목 메인으로 돌아가기"} onChange={(value) => mutate((next) => { next.returnLabel = value; })} /></div><Field label="도입 문장" value={page.intro} area onChange={(value) => mutate((next) => { next.intro = value; })} />
    <RegionStylesEditor styles={page.styles} fields={[{ key: "eyebrow", label: "영문 표제" }, { key: "title", label: "페이지 제목" }, { key: "intro", label: "도입 문장" }, { key: "sectionNumber", label: "내용 구역 번호 · 공통" }, { key: "sectionTitle", label: "내용 구역 제목 · 공통" }, { key: "paragraph", label: "본문 · 공통" }, { key: "bullet", label: "목록 · 공통" }, { key: "returnLabel", label: "돌아가기 버튼" }]} onChange={(styles) => mutate((next) => { next.styles = styles; })} />
    <PortalElementsEditor title="페이지 상단에 텍스트, 이미지 추가" elements={page.elements} onChange={(elements) => mutate((next) => { next.elements = elements; })} />
    <div className="portal-editor-sections">{page.sections.map((section, index) => <article key={section.id}><header><strong>{String(index + 1).padStart(2, "0")} · 내용 구역</strong><div><button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)}>↑</button><button type="button" disabled={index === page.sections.length - 1} onClick={() => moveSection(index, 1)}>↓</button><button type="button" className="danger" onClick={() => mutate((next) => { next.sections.splice(index, 1); })}>삭제</button></div></header><Field label="제목" value={section.title} onChange={(value) => mutate((next) => { next.sections[index].title = value; })} /><Field label="본문" value={section.paragraphs.join("\n\n")} area hint="문단 사이는 빈 줄로 나눕니다." onChange={(value) => mutate((next) => { next.sections[index].paragraphs = value.split(/\n\s*\n/).filter(Boolean); })} /><Field label="목록" value={section.bullets.join("\n")} area hint="한 줄에 항목 하나씩 입력합니다." onChange={(value) => mutate((next) => { next.sections[index].bullets = value.split("\n").filter(Boolean); })} /><RegionStylesEditor styles={section.styles} fields={[{ key: "number", label: "이 구역 번호" }, { key: "title", label: "이 구역 제목" }, { key: "paragraph", label: "이 구역 본문" }, { key: "bullet", label: "이 구역 목록" }]} onChange={(styles) => mutate((next) => { next.sections[index].styles = styles; })} /><PortalElementsEditor title="이 내용 구역에 텍스트, 이미지 추가" elements={section.elements} onChange={(elements) => mutate((next) => { next.sections[index].elements = elements; })} /></article>)}</div>
    <button type="button" onClick={() => mutate((next) => next.sections.push({ id: id("section"), title: "새 내용", paragraphs: ["내용을 입력하세요."], bullets: [], elements: [], styles: {} }))}>+ 내용 구역 추가</button>
  </div>;
}

function optionalNumber(value: string): number | undefined { return value === "" ? undefined : Number(value); }

function ElementStyleEditor({ value, onChange, title }: { value?: EditableBlockStyle; onChange: (value?: EditableBlockStyle) => void; title: string }) {
  const style = value ?? {};
  const update = <K extends keyof EditableBlockStyle>(key: K, nextValue: EditableBlockStyle[K]) => {
    const next = { ...style, [key]: nextValue };
    Object.keys(next).forEach((item) => {
      const keyName = item as keyof EditableBlockStyle;
      if (next[keyName] === undefined || next[keyName] === "") delete next[keyName];
    });
    onChange(Object.keys(next).length ? next : undefined);
  };
  return <details className="editor-style-panel portal-element-style"><summary>{title}</summary><div className="editor-style-grid">
    <Field label="글자 크기 · PC" type="number" min={10} max={180} value={style.fontSize ?? ""} onChange={(next) => update("fontSize", optionalNumber(next))} />
    <Field label="글자 크기 · 모바일" type="number" min={10} max={120} value={style.mobileFontSize ?? ""} onChange={(next) => update("mobileFontSize", optionalNumber(next))} />
    <Field label="글자 색상" value={style.color ?? ""} onChange={(next) => update("color", next || undefined)} hint="예: #ffffff" />
    <label className="editor-field"><span>정렬</span><select value={style.textAlign ?? ""} onChange={(event) => update("textAlign", (event.target.value || undefined) as EditableBlockStyle["textAlign"])}><option value="">기본값</option><option value="left">왼쪽</option><option value="center">가운데</option><option value="right">오른쪽</option><option value="justify">양쪽</option></select></label>
    <label className="editor-field"><span>굵기</span><select value={style.fontWeight ?? ""} onChange={(event) => update("fontWeight", event.target.value ? Number(event.target.value) : undefined)}><option value="">기본값</option><option value="400">보통</option><option value="600">약간 굵게</option><option value="700">굵게</option><option value="800">매우 굵게</option><option value="900">가장 굵게</option></select></label>
    <Field label="줄 간격" type="number" min={1} max={3} step={0.05} value={style.lineHeight ?? ""} onChange={(next) => update("lineHeight", optionalNumber(next))} />
    <Field label="최대 폭 (px)" type="number" min={160} max={2200} value={style.maxWidth ?? ""} onChange={(next) => update("maxWidth", optionalNumber(next))} />
    <Field label="위 여백 (px)" type="number" min={0} max={500} value={style.marginTop ?? ""} onChange={(next) => update("marginTop", optionalNumber(next))} />
    <Field label="아래 여백 (px)" type="number" min={0} max={500} value={style.marginBottom ?? ""} onChange={(next) => update("marginBottom", optionalNumber(next))} />
    <Field label="안쪽 여백 (px)" type="number" min={0} max={240} value={style.padding ?? ""} onChange={(next) => update("padding", optionalNumber(next))} />
    <Field label="배경 색상" value={style.backgroundColor ?? ""} onChange={(next) => update("backgroundColor", next || undefined)} hint="예: #111827" />
    <Field label="테두리 색상" value={style.borderColor ?? ""} onChange={(next) => update("borderColor", next || undefined)} hint="예: #6ad8ff" />
    <Field label="모서리 둥글기" type="number" min={0} max={100} value={style.borderRadius ?? ""} onChange={(next) => update("borderRadius", optionalNumber(next))} />
  </div>{value && <button type="button" className="editor-reset-style" onClick={() => onChange(undefined)}>이 디자인 초기화</button>}</details>;
}

function RegionStylesEditor({ styles, fields, onChange }: { styles?: PortalEditableRegion["styles"]; fields: { key: string; label: string }[]; onChange: (styles: NonNullable<PortalEditableRegion["styles"]>) => void }) {
  const update = (key: string, style?: EditableBlockStyle) => {
    const next = { ...(styles ?? {}) };
    if (style) next[key] = style;
    else delete next[key];
    onChange(next);
  };
  return <details className="portal-region-design"><summary>기존 텍스트 크기, 색상, 정렬 편집</summary><div className="portal-region-design-list">{fields.map((field) => <ElementStyleEditor key={field.key} title={field.label} value={styles?.[field.key]} onChange={(style) => update(field.key, style)} />)}</div></details>;
}

function PortalImageEditor({ image, onChange }: { image: StoryImageAsset; onChange: (image: StoryImageAsset) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const replace = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError("");
    try { onChange({ ...image, ...(await uploadEditorImage(file)) }); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "업로드하지 못했습니다."); }
    finally { setUploading(false); }
  };
  return <div className="editor-image-field portal-image-editor"><img src={image.src} alt="현재 이미지 미리보기" style={{ aspectRatio: `${image.width}/${image.height}` }} /><label className="editor-upload"><span>{uploading ? "크기 조정, 업로드 중…" : "이미지 교체 · 자동 압축"}</span><input type="file" accept="image/*" disabled={uploading} onChange={(event) => replace(event.target.files?.[0])} /></label><Field label="대체 설명" value={image.alt} onChange={(alt) => onChange({ ...image, alt })} /><div className="editor-style-grid"><Field label="표시 폭 (%)" type="number" min={10} max={100} value={image.displayWidth ?? 100} onChange={(value) => onChange({ ...image, displayWidth: Math.max(10, Math.min(100, Number(value) || 100)) })} /><Field label="최대 폭 (px)" type="number" min={160} max={2400} value={image.maxWidth ?? ""} onChange={(value) => onChange({ ...image, maxWidth: optionalNumber(value) })} /><Field label="모서리 둥글기" type="number" min={0} max={100} value={image.borderRadius ?? 0} onChange={(value) => onChange({ ...image, borderRadius: Number(value) || 0 })} /><label className="editor-field"><span>정렬</span><select value={image.alignment ?? "center"} onChange={(event) => onChange({ ...image, alignment: event.target.value as StoryImageAsset["alignment"] })}><option value="left">왼쪽</option><option value="center">가운데</option><option value="right">오른쪽</option></select></label><label className="editor-field"><span>맞춤</span><select value={image.objectFit ?? "contain"} onChange={(event) => onChange({ ...image, objectFit: event.target.value as StoryImageAsset["objectFit"] })}><option value="contain">전체 보이기</option><option value="cover">영역 채우기</option></select></label></div>{error && <p className="editor-error">{error}</p>}</div>;
}

function PortalElementsEditor({ elements = [], onChange, title = "추가 텍스트, 이미지" }: { elements?: PortalCustomElement[]; onChange: (elements: PortalCustomElement[]) => void; title?: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const move = (index: number, direction: -1 | 1) => { const target = index + direction; if (target < 0 || target >= elements.length) return; const next = clone(elements); [next[index], next[target]] = [next[target], next[index]]; onChange(next); };
  const addImage = async (file?: File) => {
    if (!file) return;
    setUploading(true); setError("");
    try { onChange([...elements, { id: id("portal-image"), type: "image", image: await uploadEditorImage(file) }]); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "업로드하지 못했습니다."); }
    finally { setUploading(false); }
  };
  return <section className="portal-elements-editor"><header><div><h3>{title}</h3><p>원하는 만큼 추가하고 위아래 순서를 바꿀 수 있습니다. 큰 이미지는 비율을 유지해 자동 압축합니다.</p></div><div><button type="button" onClick={() => onChange([...elements, { id: id("portal-text"), type: "text", text: "새 텍스트를 입력하세요." }])}>+ 텍스트</button><label className="editor-upload portal-add-image"><span>{uploading ? "크기 조정, 업로드 중…" : "+ 이미지"}</span><input type="file" accept="image/*" disabled={uploading} onChange={(event) => addImage(event.target.files?.[0])} /></label></div></header>{error && <p className="editor-error">{error}</p>}<div className="portal-element-list">{elements.map((element, index) => <article key={element.id}><header><strong>{element.type === "text" ? "텍스트" : "이미지"}</strong><div><button type="button" disabled={index === 0} onClick={() => move(index, -1)}>↑</button><button type="button" disabled={index === elements.length - 1} onClick={() => move(index, 1)}>↓</button><button type="button" className="danger" onClick={() => onChange(elements.filter((item) => item.id !== element.id))}>삭제</button></div></header>{element.type === "text" ? <><Field label="내용" value={element.text} area onChange={(text) => onChange(elements.map((item) => item.id === element.id ? { ...element, text } : item))} /><ElementStyleEditor title="이 텍스트 꾸미기" value={element.style} onChange={(style) => onChange(elements.map((item) => item.id === element.id ? { ...element, style } : item))} /></> : <PortalImageEditor image={element.image} onChange={(image) => onChange(elements.map((item) => item.id === element.id ? { ...element, image } : item))} />}</article>)}</div></section>;
}

function CourseMenuEditor({ course, onChange }: { course: PortalCourse; onChange: (course: PortalCourse) => void }) {
  const menu = course.menu ?? {
    prologue: { title: "프롤로그", description: "시간선과 탐사 임무를 확인합니다." },
    guide: { title: "수업, 평가 안내", description: "기억 복원 로그와 다이스 운영 원칙을 확인합니다." },
    topics: { title: "시간선 탐사 출발", description: `${course.topics.length}개의 주제 중 오늘의 탐사를 선택합니다.` },
    assessment: { title: "수행평가", description: "기억 보존 임무와 시간선 역설계 임무를 확인합니다." },
    epilogue: { title: "에필로그", description: "복원된 시간선의 결말을 확인합니다.", lockedDescription: "모든 핵심 시간선의 복원이 끝난 뒤 공개됩니다." },
  };
  const update = (key: keyof typeof menu, field: string, value: string) => {
    const next = clone(course);
    next.menu = clone(menu);
    const editableMenu = next.menu as unknown as Record<string, Record<string, string>>;
    editableMenu[key][field] = value;
    onChange(next);
  };
  const selectPublisher = (publisher: string) => {
    if (!publisher || publisher === course.publisher) return;
    const next = clone(course);
    const currentPublisher = next.publisher ?? next.publisherOptions?.[0]?.id;
    next.publisherTopicSets ??= {};
    if (currentPublisher) next.publisherTopicSets[currentPublisher] = clone(next.topics);
    const selectedTopics = next.publisherTopicSets[publisher];
    if (!selectedTopics?.length) return;
    next.publisher = publisher;
    next.topics = clone(selectedTopics);
    if (next.menu && /^\d+개의 주제 중 오늘의 탐사를 선택합니다\.$/.test(next.menu.topics.description)) {
      next.menu.topics.description = `${next.topics.length}개의 주제 중 오늘의 탐사를 선택합니다.`;
    }
    onChange(next);
  };
  const publisherLabel = course.publisherOptions?.find((option) => option.id === course.publisher)?.label ?? course.publisher ?? "";
  return <><section className="publisher-config-editor"><div><h3>교과서 출판사</h3><p>선택한 출판사의 교과서 순서와 쪽수에 맞춰 탐사 주제가 전환됩니다.</p></div><label className="editor-field"><span>현재 출판사</span><select value={course.publisher ?? ""} onChange={(event) => selectPublisher(event.target.value)}>{course.publisherOptions?.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select><small>{publisherLabel} 교과서 · 탐사 주제 {course.topics.length}개</small></label></section><details className="portal-region-design course-menu-editor"><summary>과목 메인 메뉴 문구 편집</summary><div className="portal-region-design-list">{(["prologue", "guide", "topics", "assessment", "epilogue"] as const).map((key, index) => <article key={key}><strong>{String(index + 1).padStart(2, "0")} · {menu[key].title}</strong><div className="editor-grid"><Field label="메뉴 제목" value={menu[key].title} onChange={(value) => update(key, "title", value)} /><Field label="메뉴 설명" value={menu[key].description} area onChange={(value) => update(key, "description", value)} />{key === "epilogue" && <Field label="잠겼을 때 설명" value={menu.epilogue.lockedDescription} area onChange={(value) => update("epilogue", "lockedDescription", value)} />}</div></article>)}</div></details></>;
}

function ResidualEditor({ residual, onChange }: { residual: ResidualThought; onChange: (residual: ResidualThought) => void }) {
  const [uploading, setUploading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try { onChange({ ...residual, image: await uploadEditorImage(file) }); }
    catch (error) { alert(error instanceof Error ? error.message : "업로드하지 못했습니다."); }
    finally { setUploading(false); }
  };
  return <article className="residual-editor"><header><span>{String(residual.number).padStart(2, "0")}</span><LockSwitch label={`잔존 사념 ${residual.number}`} checked={residual.locked} onChange={(locked) => onChange({ ...residual, locked })} /></header><Field label="제목" value={residual.title} onChange={(title) => onChange({ ...residual, title })} /><Field label="내용" value={residual.content} area onChange={(content) => onChange({ ...residual, content })} />{residual.image && <img src={residual.image.src} alt={residual.image.alt} />}<label className="editor-upload"><span>{uploading ? "크기 조정, 업로드 중…" : residual.image ? "이미지 교체 · 자동 압축" : "이미지 추가 · 자동 압축"}</span><input type="file" accept="image/*" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} /></label>{residual.image && <button type="button" className="danger" onClick={() => { const next = { ...residual }; delete next.image; onChange(next); }}>이미지 제거</button>}<RegionStylesEditor styles={residual.styles} fields={[{ key: "number", label: "번호" }, { key: "title", label: "제목" }, { key: "content", label: "내용" }]} onChange={(styles) => onChange({ ...residual, styles })} /><PortalElementsEditor title="이 잔존 사념에 텍스트, 이미지 추가" elements={residual.elements} onChange={(elements) => onChange({ ...residual, elements })} /></article>;
}

function TopicsPageEditor({ course, onChange }: { course: PortalCourse; onChange: (course: PortalCourse) => void }) {
  const page = course.topicsPage ?? { eyebrow: "SELECT MISSION", title: "주제 선택", intro: course.subtitle, searchLabel: "시간선 검색", searchPlaceholder: "주제명 검색", elements: [], styles: {} };
  const mutate = (recipe: (next: NonNullable<PortalCourse["topicsPage"]>) => void) => {
    const next = clone(course);
    next.topicsPage = clone(page);
    recipe(next.topicsPage);
    onChange(next);
  };
  return <section className="topic-editor-panel topics-page-editor"><h3>주제 선택 화면</h3><div className="editor-grid"><Field label="영문 표제" value={page.eyebrow} onChange={(value) => mutate((next) => { next.eyebrow = value; })} /><Field label="화면 제목" value={page.title} onChange={(value) => mutate((next) => { next.title = value; })} /><Field label="검색 이름" value={page.searchLabel} onChange={(value) => mutate((next) => { next.searchLabel = value; })} /><Field label="검색창 안내" value={page.searchPlaceholder} onChange={(value) => mutate((next) => { next.searchPlaceholder = value; })} /></div><Field label="소개 문장" value={page.intro} area onChange={(value) => mutate((next) => { next.intro = value; })} /><RegionStylesEditor styles={page.styles} fields={[{ key: "eyebrow", label: "영문 표제" }, { key: "title", label: "화면 제목" }, { key: "intro", label: "소개 문장" }, { key: "searchLabel", label: "검색 이름" }]} onChange={(styles) => mutate((next) => { next.styles = styles; })} /><PortalElementsEditor title="주제 선택 화면에 텍스트, 이미지 추가" elements={page.elements} onChange={(elements) => mutate((next) => { next.elements = elements; })} /></section>;
}

function TopicEditor({ topic, onChange, onDelete, onMove, first, last }: { topic: PortalTopic; onChange: (topic: PortalTopic) => void; onDelete: () => void; onMove: (direction: -1 | 1) => void; first: boolean; last: boolean }) {
  const mutate = (recipe: (next: PortalTopic) => void) => { const next = clone(topic); recipe(next); onChange(next); };
  return <div className="portal-topic-editor">
    <div className="portal-topic-toolbar"><LockSwitch label="이 주제" checked={topic.locked} onChange={(locked) => mutate((next) => { next.locked = locked; })} /><div><button type="button" disabled={first} onClick={() => onMove(-1)}>위로</button><button type="button" disabled={last} onClick={() => onMove(1)}>아래로</button><button type="button" className="danger" onClick={onDelete}>주제 삭제</button></div></div>
    <div className="editor-grid"><Field label="주제 제목" value={topic.title} onChange={(value) => mutate((next) => { next.title = value; })} /><Field label="교과서 쪽" type="number" value={topic.page} onChange={(value) => mutate((next) => { next.page = Number(value); })} /><Field label="대단원" value={topic.unit} onChange={(value) => mutate((next) => { next.unit = value; })} /><Field label="중단원, 주제 묶음" value={topic.group} onChange={(value) => mutate((next) => { next.group = value; })} /></div><Field label="주제 잠금 문구" value={topic.lockMessage} area onChange={(value) => mutate((next) => { next.lockMessage = value; })} />
    <section className="topic-editor-panel"><h3>주제 소개 및 탐사 화면</h3><div className="editor-grid"><Field label="영문 표제" value={topic.explore.eyebrow} onChange={(value) => mutate((next) => { next.explore.eyebrow = value; })} /><LockSwitch label="다음 로그 버튼" checked={topic.explore.nextLocked} onChange={(checked) => mutate((next) => { next.explore.nextLocked = checked; })} /></div><Field label="소개" value={topic.explore.intro} area onChange={(value) => mutate((next) => { next.explore.intro = value; })} /><Field label="오늘의 탐사 임무" value={topic.explore.mission} area onChange={(value) => mutate((next) => { next.explore.mission = value; })} /><Field label="핵심 질문" value={topic.explore.questions.join("\n")} area hint="한 줄에 질문 하나씩 입력합니다." onChange={(value) => mutate((next) => { next.explore.questions = value.split("\n").filter(Boolean); })} /><RegionStylesEditor styles={topic.explore.styles} fields={[{ key: "eyebrow", label: "영문 표제" }, { key: "title", label: "주제 제목" }, { key: "meta", label: "대단원, 주제 묶음" }, { key: "intro", label: "소개" }, { key: "mission", label: "탐사 임무" }, { key: "question", label: "핵심 질문" }]} onChange={(styles) => mutate((next) => { next.explore.styles = styles; })} /><PortalElementsEditor title="주제 소개 화면에 텍스트, 이미지 추가" elements={topic.explore.elements} onChange={(elements) => mutate((next) => { next.explore.elements = elements; })} /></section>
    <section className="topic-editor-panel"><h3>기존 기억 복원 로그 확인</h3><div className="portal-lock-row"><LockSwitch label="주사위 필수" checked={topic.beforeLog.diceRequired} onChange={(checked) => mutate((next) => { next.beforeLog.diceRequired = checked; })} /><LockSwitch label="잔존 사념 필수" checked={topic.beforeLog.residualRequired} onChange={(checked) => mutate((next) => { next.beforeLog.residualRequired = checked; })} /><LockSwitch label="다음 탐사 버튼" checked={topic.beforeLog.nextLocked} onChange={(checked) => mutate((next) => { next.beforeLog.nextLocked = checked; })} /></div><Field label="화면 제목" value={topic.beforeLog.title} onChange={(value) => mutate((next) => { next.beforeLog.title = value; })} /><Field label="안내" value={topic.beforeLog.intro} area onChange={(value) => mutate((next) => { next.beforeLog.intro = value; })} /><div className="editor-grid"><Field label="점검자 영역 영문 표제" value={topic.beforeLog.diceEyebrow} onChange={(value) => mutate((next) => { next.beforeLog.diceEyebrow = value; })} /><Field label="점검자 영역 제목" value={topic.beforeLog.diceTitle} onChange={(value) => mutate((next) => { next.beforeLog.diceTitle = value; })} /></div><Field label="점검자 영역 설명" value={topic.beforeLog.diceDescription} area onChange={(value) => mutate((next) => { next.beforeLog.diceDescription = value; })} /><div className="editor-grid"><Field label="잔존 사념 영역 영문 표제" value={topic.beforeLog.residualEyebrow} onChange={(value) => mutate((next) => { next.beforeLog.residualEyebrow = value; })} /><Field label="잔존 사념 영역 제목" value={topic.beforeLog.residualTitle} onChange={(value) => mutate((next) => { next.beforeLog.residualTitle = value; })} /></div><Field label="잔존 사념 영역 설명" value={topic.beforeLog.residualDescription} area onChange={(value) => mutate((next) => { next.beforeLog.residualDescription = value; })} /><Field label="다음 버튼 문구" value={topic.beforeLog.nextLabel} onChange={(value) => mutate((next) => { next.beforeLog.nextLabel = value; })} /><RegionStylesEditor styles={topic.beforeLog.styles} fields={[{ key: "eyebrow", label: "과목, 주제 번호" }, { key: "title", label: "화면 제목" }, { key: "topic", label: "주제명" }, { key: "intro", label: "안내" }, { key: "diceEyebrow", label: "점검자 영역 영문 표제" }, { key: "diceTitle", label: "점검자 영역 제목" }, { key: "diceDescription", label: "점검자 영역 설명" }, { key: "residualEyebrow", label: "잔존 사념 영역 영문 표제" }, { key: "residualTitle", label: "잔존 사념 영역 제목" }, { key: "residualDescription", label: "잔존 사념 영역 설명" }]} onChange={(styles) => mutate((next) => { next.beforeLog.styles = styles; })} /><PortalElementsEditor title="탐사 전 화면에 텍스트, 이미지 추가" elements={topic.beforeLog.elements} onChange={(elements) => mutate((next) => { next.beforeLog.elements = elements; })} /><div className="residual-editor-grid">{topic.beforeLog.residuals.map((residual, index) => <ResidualEditor key={residual.id} residual={residual} onChange={(value) => mutate((next) => { next.beforeLog.residuals[index] = value; })} />)}</div></section>
    <section className="topic-editor-panel"><h3>새 기억 복원 로그 진입</h3><div className="portal-lock-row"><LockSwitch label="주사위 필수" checked={topic.afterLog.diceRequired} onChange={(checked) => mutate((next) => { next.afterLog.diceRequired = checked; })} /><LockSwitch label="다음 주제 버튼" checked={topic.afterLog.nextLocked} onChange={(checked) => mutate((next) => { next.afterLog.nextLocked = checked; })} /></div><Field label="화면 제목" value={topic.afterLog.title} onChange={(value) => mutate((next) => { next.afterLog.title = value; })} /><Field label="안내" value={topic.afterLog.intro} area onChange={(value) => mutate((next) => { next.afterLog.intro = value; })} /><Field label="다음 버튼 문구" value={topic.afterLog.nextLabel} onChange={(value) => mutate((next) => { next.afterLog.nextLabel = value; })} />{topic.afterLog.prompts.map((prompt, index) => <div className="editor-grid" key={index}><Field label={`${index + 1}번 영역`} value={prompt.title} onChange={(value) => mutate((next) => { next.afterLog.prompts[index].title = value; })} /><Field label="내용" value={prompt.content} area onChange={(value) => mutate((next) => { next.afterLog.prompts[index].content = value; })} /></div>)}<RegionStylesEditor styles={topic.afterLog.styles} fields={[{ key: "eyebrow", label: "과목, 주제 번호" }, { key: "title", label: "화면 제목" }, { key: "topic", label: "주제명" }, { key: "intro", label: "안내" }, { key: "promptTitle", label: "로그 영역 제목" }, { key: "promptContent", label: "로그 영역 설명" }]} onChange={(styles) => mutate((next) => { next.afterLog.styles = styles; })} /><PortalElementsEditor title="탐사 후 화면에 텍스트, 이미지 추가" elements={topic.afterLog.elements} onChange={(elements) => mutate((next) => { next.afterLog.elements = elements; })} /></section>
  </div>;
}

function PerformancePageEditor({ page, onChange }: { page: PerformancePage; onChange: (page: PerformancePage) => void }) {
  const mutate = (recipe: (next: PerformancePage) => void) => { const next = clone(page); recipe(next); onChange(next); };
  const [uploadingMission, setUploadingMission] = useState<string | null>(null);
  const [audioError, setAudioError] = useState("");
  const moveLink = (missionIndex: number, linkIndex: number, direction: -1 | 1) => mutate((next) => {
    const links = next.missions[missionIndex].links;
    const target = linkIndex + direction;
    if (target < 0 || target >= links.length) return;
    [links[linkIndex], links[target]] = [links[target], links[linkIndex]];
  });
  const uploadAudio = async (missionIndex: number, file?: File) => {
    if (!file) return;
    setUploadingMission(page.missions[missionIndex].id);
    setAudioError("");
    try {
      const voiceAudio = await uploadEditorAudio(file);
      mutate((next) => { next.missions[missionIndex].voiceAudio = voiceAudio; });
    } catch (error) {
      setAudioError(error instanceof Error ? error.message : "음성 파일을 올리지 못했습니다.");
    } finally {
      setUploadingMission(null);
    }
  };

  return <div className="portal-page-editor performance-page-editor">
    <div className="editor-grid"><Field label="영문 표제" value={page.eyebrow} onChange={(value) => mutate((next) => { next.eyebrow = value; })} /><Field label="페이지 제목" value={page.title} onChange={(value) => mutate((next) => { next.title = value; })} /><Field label="돌아가기 버튼" value={page.returnLabel} onChange={(value) => mutate((next) => { next.returnLabel = value; })} /></div>
    <Field label="도입 문장" value={page.intro} area onChange={(value) => mutate((next) => { next.intro = value; })} />
    <RegionStylesEditor styles={page.styles} fields={[{ key: "eyebrow", label: "영문 표제" }, { key: "title", label: "페이지 제목" }, { key: "intro", label: "도입 문장" }, { key: "returnLabel", label: "돌아가기 버튼" }]} onChange={(styles) => mutate((next) => { next.styles = styles; })} />
    <PortalElementsEditor title="수행평가 페이지 상단에 텍스트, 이미지 추가" elements={page.elements} onChange={(elements) => mutate((next) => { next.elements = elements; })} />
    {audioError && <p className="editor-error">{audioError}</p>}
    <div className="performance-mission-editors">{page.missions.map((mission, missionIndex) => <article className="performance-mission-editor" key={mission.id}>
      <header><strong>{String(missionIndex + 1).padStart(2, "0")} · {mission.title.replace("\n", " ")}</strong><div className="performance-mission-locks"><LockSwitch label="이 수행평가" checked={mission.locked} onChange={(checked) => mutate((next) => { next.missions[missionIndex].locked = checked; })} /><LockSwitch label="안내 후 링크 공개" checked={mission.requireVoiceBeforeLinks} onChange={(checked) => mutate((next) => { next.missions[missionIndex].requireVoiceBeforeLinks = checked; })} /></div></header>
      <div className="editor-grid"><Field label="영문 표제" value={mission.eyebrow} onChange={(value) => mutate((next) => { next.missions[missionIndex].eyebrow = value; })} /><Field label="임무 제목" value={mission.title} area hint="줄바꿈이 공개 화면에도 그대로 반영됩니다." onChange={(value) => mutate((next) => { next.missions[missionIndex].title = value; })} /></div>
      <Field label="잠금 안내 문구" value={mission.lockMessage} area onChange={(value) => mutate((next) => { next.missions[missionIndex].lockMessage = value; })} />
      <Field label="임무 소개" value={mission.intro} area onChange={(value) => mutate((next) => { next.missions[missionIndex].intro = value; })} />
      <Field label="음성 브리핑" value={mission.voiceText} area hint="업로드한 음성이 없을 때 이 문장을 기기 음성으로 읽어 줍니다." onChange={(value) => mutate((next) => { next.missions[missionIndex].voiceText = value; })} />
      <div className="editor-audio-upload">{mission.voiceAudio && <><audio controls src={mission.voiceAudio.src} /><span>{mission.voiceAudio.name}</span></>}<label className="editor-upload"><span>{uploadingMission === mission.id ? "음성 업로드 중…" : mission.voiceAudio ? "음성 파일 교체" : "+ 음성 파일 업로드"}</span><input type="file" accept="audio/*" disabled={uploadingMission === mission.id} onChange={(event) => uploadAudio(missionIndex, event.target.files?.[0])} /></label>{mission.voiceAudio && <button type="button" className="danger" onClick={() => mutate((next) => { delete next.missions[missionIndex].voiceAudio; })}>음성 파일 제거</button>}<small>MP3, M4A, WAV, OGG 등 4MB 이하 파일을 사용할 수 있습니다.</small></div>
      <Field label="임무 단계" value={mission.bullets.join("\n\n")} area hint="단계와 단계 사이는 빈 줄로 나눕니다. 단계 제목과 설명은 같은 항목 안에서 줄만 바꿉니다." onChange={(value) => mutate((next) => { next.missions[missionIndex].bullets = value.split(/\n\s*\n/).filter(Boolean); })} />
      <RegionStylesEditor styles={mission.styles} fields={[{ key: "eyebrow", label: "영문 표제" }, { key: "title", label: "임무 제목" }, { key: "intro", label: "임무 소개" }, { key: "bullet", label: "임무 단계" }, { key: "link", label: "링크 버튼" }]} onChange={(styles) => mutate((next) => { next.missions[missionIndex].styles = styles; })} />
      <PortalElementsEditor title="이 임무에 텍스트, 이미지 추가" elements={mission.elements} onChange={(elements) => mutate((next) => { next.missions[missionIndex].elements = elements; })} />
      <section className="performance-links-editor"><header><div><h4>임무 링크</h4><p>작성, 자료, 제출 등 필요한 링크를 제한 없이 추가할 수 있습니다.</p></div><button type="button" onClick={() => mutate((next) => { next.missions[missionIndex].links.push({ id: id("assessment-link"), label: "작성하기", url: "https://", description: "링크 설명을 입력하세요.", openInNewTab: true }); })}>+ 링크 추가</button></header>
        {mission.links.length === 0 && <p className="editor-empty-state">아직 등록한 링크가 없습니다.</p>}
        {mission.links.map((link, linkIndex) => <article key={link.id}><header><strong>링크 {linkIndex + 1}</strong><div><button type="button" disabled={linkIndex === 0} onClick={() => moveLink(missionIndex, linkIndex, -1)}>↑</button><button type="button" disabled={linkIndex === mission.links.length - 1} onClick={() => moveLink(missionIndex, linkIndex, 1)}>↓</button><button type="button" className="danger" onClick={() => mutate((next) => { next.missions[missionIndex].links.splice(linkIndex, 1); })}>삭제</button></div></header><div className="editor-grid"><Field label="버튼 이름" value={link.label} onChange={(value) => mutate((next) => { next.missions[missionIndex].links[linkIndex].label = value; })} /><Field label="주소" value={link.url} hint="https:// 주소 또는 사이트 내부 /경로를 입력합니다." onChange={(value) => mutate((next) => { next.missions[missionIndex].links[linkIndex].url = value; })} /></div><Field label="설명" value={link.description} area onChange={(value) => mutate((next) => { next.missions[missionIndex].links[linkIndex].description = value; })} /><label className="editor-checkbox"><input type="checkbox" checked={link.openInNewTab} onChange={(event) => mutate((next) => { next.missions[missionIndex].links[linkIndex].openInNewTab = event.target.checked; })} /><span>새 창에서 열기</span></label></article>)}
      </section>
    </article>)}</div>
  </div>;
}

export default function PortalEditorClient({ initialDocument, initialRevisions, userEmail }: { initialDocument: PortalDocument; initialRevisions: PortalRevision[]; userEmail: string }) {
  const [document, setDocument] = useState(() => normalizePortalDocument(initialDocument));
  const [revisions, setRevisions] = useState(initialRevisions);
  const [courseId, setCourseId] = useState(initialDocument.courses[0]?.id ?? "");
  const [topicId, setTopicId] = useState(initialDocument.courses[0]?.topics[0]?.id ?? "");
  const [tab, setTab] = useState<"site" | "course" | "guide" | "topics" | "assessment" | "epilogue" | "history">("site");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [revisionId, setRevisionId] = useState("");
  const courseIndex = document.courses.findIndex((course) => course.id === courseId);
  const course = document.courses[courseIndex] ?? document.courses[0];
  const topicIndex = course?.topics.findIndex((topic) => topic.id === topicId) ?? -1;
  const topic = course?.topics[topicIndex] ?? course?.topics[0];
  const mutate = (recipe: (next: PortalDocument) => void) => setDocument((current) => { const next = clone(current); recipe(next); return next; });
  const updateCourse = (recipe: (next: PortalCourse) => void) => mutate((next) => recipe(next.courses[courseIndex]));
  const updateTopic = (updated: PortalTopic) => updateCourse((next) => { const index = next.topics.findIndex((item) => item.id === topic.id); next.topics[index] = updated; });
  const save = async () => { setSaving(true); setNotice(""); try { const response = await fetch("/api/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ document }) }); const data = await response.json() as { version?: number; revisions?: PortalRevision[]; error?: string }; if (!response.ok) throw new Error(data.error ?? "저장하지 못했습니다."); setRevisions(data.revisions ?? revisions); setNotice(`저장 완료 · 공개 사이트에 즉시 반영되었습니다. (저장본 ${data.version})`); } catch (error) { setNotice(error instanceof Error ? error.message : "저장하지 못했습니다."); } finally { setSaving(false); } };
  const restore = async () => { if (!revisionId || !confirm("선택한 저장본으로 복원할까요?")) return; setSaving(true); try { const response = await fetch("/api/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "restore", revisionId: Number(revisionId) }) }); const data = await response.json() as { document?: PortalDocument; revisions?: PortalRevision[]; error?: string }; if (!response.ok || !data.document) throw new Error(data.error ?? "복원하지 못했습니다."); setDocument(normalizePortalDocument(data.document)); setRevisions(data.revisions ?? revisions); setRevisionId(""); setNotice("선택한 저장본으로 복원했습니다."); } catch (error) { setNotice(error instanceof Error ? error.message : "복원하지 못했습니다."); } finally { setSaving(false); } };
  const selectCourse = (nextId: string) => { setCourseId(nextId); const next = document.courses.find((item) => item.id === nextId); setTopicId(next?.topics[0]?.id ?? ""); };
  const tabs = [{ id: "site", label: "입장 화면" }, { id: "course", label: "과목 설정" }, { id: "guide", label: "수업, 평가 안내" }, { id: "topics", label: "탐사 주제" }, { id: "assessment", label: "수행평가" }, { id: "epilogue", label: "에필로그" }, { id: "history", label: "이전 저장본" }] as const;
  const topicOptions = useMemo(() => course?.topics ?? [], [course]);
  if (!course) return <main className="editor-access"><h1>과목 데이터가 없습니다.</h1></main>;
  return <main className="editor-shell portal-editor-shell"><header className="editor-topbar"><div><p>CHRONO NEXUS</p><h1>크로노 코어 편집실</h1><span>{userEmail}</span></div><nav><a href="/" target="_blank" rel="noreferrer">공개 화면 보기 ↗</a><button type="button" onClick={save} disabled={saving}>{saving ? "저장 중…" : "변경사항 공개"}</button></nav></header>{notice && <p className="editor-notice">{notice}</p>}<section className="editor-help portal-editor-help"><h2>모든 화면의 텍스트, 크기, 이미지를 직접 편집할 수 있습니다.</h2><p>기존 문구는 각각 크기, 색상, 정렬, 여백을 바꾸고, 각 영역에는 추가 텍스트와 이미지를 원하는 만큼 넣어 순서를 조정할 수 있습니다.</p></section>
    <section className="portal-editor-layout"><aside className="portal-editor-sidebar"><label><span>편집할 과목</span><select value={course.id} onChange={(event) => selectCourse(event.target.value)}>{document.courses.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><nav>{tabs.map((item) => <button type="button" key={item.id} className={tab === item.id ? "is-active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}</nav><div className="sidebar-public-links"><a href={`/course/${course.id}`} target="_blank" rel="noreferrer">{course.title} 공개 화면 ↗</a><a href={`/course/${course.id}/assessment`} target="_blank" rel="noreferrer">수행평가 공개 화면 ↗</a><a href={`/editor/prologue/${course.id}`}>프롤로그 상세 편집 →</a></div></aside>
      <div className="portal-editor-main">{tab === "site" && <section className="editor-panel"><header><div><h2>크로노 코어 입장 화면</h2><p>학생이 처음 접속하는 공통 메인 화면입니다.</p></div></header><div className="editor-grid">{(["eyebrow", "title", "subtitle", "entryLabel", "footer"] as const).map((key) => <Field key={key} label={{ eyebrow: "기관명", title: "메인 제목", subtitle: "영문 시리즈", entryLabel: "입장 버튼", footer: "하단 안내" }[key]} value={document.site[key]} onChange={(value) => mutate((next) => { next.site[key] = value; })} />)}</div><Field label="소개 문장" value={document.site.description} area onChange={(value) => mutate((next) => { next.site.description = value; })} /><RegionStylesEditor styles={document.site.styles} fields={[{ key: "eyebrow", label: "기관명" }, { key: "subtitle", label: "영문 시리즈" }, { key: "title", label: "메인 제목" }, { key: "description", label: "소개 문장" }, { key: "entryLabel", label: "입장 버튼" }, { key: "footer", label: "하단 안내" }]} onChange={(styles) => mutate((next) => { next.site.styles = styles; })} /><PortalElementsEditor title="입장 화면에 텍스트, 이미지 추가" elements={document.site.elements} onChange={(elements) => mutate((next) => { next.site.elements = elements; })} /><hr className="portal-editor-divider" /><header><div><h2>과목 선택 화면</h2><p>입장 버튼 다음에 나타나는 과목 목록의 상단입니다.</p></div></header>{document.catalog && <><div className="editor-grid"><Field label="영문 표제" value={document.catalog.eyebrow} onChange={(value) => mutate((next) => { if (next.catalog) next.catalog.eyebrow = value; })} /><Field label="화면 제목" value={document.catalog.title} onChange={(value) => mutate((next) => { if (next.catalog) next.catalog.title = value; })} /></div><Field label="소개 문장" value={document.catalog.intro} area onChange={(value) => mutate((next) => { if (next.catalog) next.catalog.intro = value; })} /><RegionStylesEditor styles={document.catalog.styles} fields={[{ key: "eyebrow", label: "영문 표제" }, { key: "title", label: "화면 제목" }, { key: "intro", label: "소개 문장" }]} onChange={(styles) => mutate((next) => { if (next.catalog) next.catalog.styles = styles; })} /><PortalElementsEditor title="과목 선택 화면에 텍스트, 이미지 추가" elements={document.catalog.elements} onChange={(elements) => mutate((next) => { if (next.catalog) next.catalog.elements = elements; })} /></>}</section>}
      {tab === "course" && <section className="editor-panel"><header><div><h2>{course.title} 과목 설정</h2><p>과목 카드와 메인 메뉴의 공개 상태를 관리합니다.</p></div></header><div className="portal-lock-row"><LockSwitch label="과목 전체" checked={course.locked} onChange={(checked) => updateCourse((next) => { next.locked = checked; })} /><LockSwitch label="프롤로그" checked={course.prologueLocked} onChange={(checked) => updateCourse((next) => { next.prologueLocked = checked; })} /><LockSwitch label="수업, 평가 안내" checked={course.guideLocked} onChange={(checked) => updateCourse((next) => { next.guideLocked = checked; })} /><LockSwitch label="시간선 탐사" checked={course.topicsLocked} onChange={(checked) => updateCourse((next) => { next.topicsLocked = checked; })} /><LockSwitch label="수행평가" checked={course.assessmentLocked ?? false} onChange={(checked) => updateCourse((next) => { next.assessmentLocked = checked; })} /><LockSwitch label="에필로그" checked={course.epilogueLocked} onChange={(checked) => updateCourse((next) => { next.epilogueLocked = checked; })} /></div><div className="editor-grid"><Field label="과목명" value={course.title} onChange={(value) => updateCourse((next) => { next.title = value; })} /><Field label="상징 문자" value={course.glyph} onChange={(value) => updateCourse((next) => { next.glyph = value; })} /><Field label="강조 색상" type="color" value={course.accent} onChange={(value) => updateCourse((next) => { next.accent = value; })} /><Field label="운영 대상" value={course.audience} onChange={(value) => updateCourse((next) => { next.audience = value; })} /></div><Field label="과목 소개" value={course.subtitle} area onChange={(value) => updateCourse((next) => { next.subtitle = value; })} /><Field label="공통 잠금 문구" value={course.lockMessage} area onChange={(value) => updateCourse((next) => { next.lockMessage = value; })} /><CourseMenuEditor course={course} onChange={(updated) => updateCourse((next) => Object.assign(next, updated))} /><RegionStylesEditor styles={course.styles} fields={[{ key: "eyebrow", label: "과목 상단 표제" }, { key: "glyph", label: "과목 선택 상징 문자" }, { key: "title", label: "과목명" }, { key: "subtitle", label: "과목 소개" }, { key: "audience", label: "운영 대상" }, { key: "menuNumber", label: "메뉴 번호" }, { key: "menuTitle", label: "메뉴 제목" }, { key: "menuDescription", label: "메뉴 설명" }]} onChange={(styles) => updateCourse((next) => { next.styles = styles; })} /><PortalElementsEditor title="과목 메인에 텍스트, 이미지 추가" elements={course.elements} onChange={(elements) => updateCourse((next) => { next.elements = elements; })} /><a className="editor-deep-link" href={`/editor/prologue/${course.id}`}>프롤로그 텍스트, 삽화, 순서 상세 편집 →</a></section>}
      {tab === "guide" && <section className="editor-panel"><header><div><h2>{course.title} 수업, 평가 안내</h2><p>내용 구역을 추가, 삭제, 이동할 수 있습니다.</p></div></header><ContentPageEditor page={course.guide} onChange={(guide) => updateCourse((next) => { next.guide = guide; })} /></section>}
      {tab === "assessment" && course.assessment && <section className="editor-panel"><header><div><h2>{course.title} 수행평가</h2><p>각 임무의 잠금, 안내, 이미지, 음원, 작성 링크를 관리합니다.</p></div><LockSwitch label="수행평가" checked={course.assessmentLocked ?? false} onChange={(checked) => updateCourse((next) => { next.assessmentLocked = checked; })} /></header><PerformancePageEditor page={course.assessment} onChange={(assessment) => updateCourse((next) => { next.assessment = assessment; })} /></section>}
      {tab === "epilogue" && <section className="editor-panel"><header><div><h2>{course.title} 에필로그</h2><p>학기 말 공개할 결말을 작성한 뒤 과목 설정에서 잠금을 해제합니다.</p></div><LockSwitch label="에필로그" checked={course.epilogueLocked} onChange={(checked) => updateCourse((next) => { next.epilogueLocked = checked; })} /></header><ContentPageEditor page={course.epilogue} onChange={(epilogue) => updateCourse((next) => { next.epilogue = epilogue; })} /></section>}
      {tab === "topics" && <section className="editor-panel"><header><div><h2>{course.title} 탐사 주제</h2><p>룰북의 교과서 순서를 기본값으로 사용합니다.</p></div><button type="button" onClick={() => updateCourse((next) => { const order = next.topics.length + 1; const source = clone(next.topics[next.topics.length - 1] ?? topic); source.id = id("topic"); source.order = order; source.title = "새 탐사 주제"; source.locked = true; next.topics.push(source); setTopicId(source.id); })}>+ 주제 추가</button></header><TopicsPageEditor course={course} onChange={(updated) => updateCourse((next) => Object.assign(next, updated))} /><label className="topic-editor-select"><span>편집할 주제</span><select value={topic?.id ?? ""} onChange={(event) => setTopicId(event.target.value)}>{topicOptions.map((item) => <option value={item.id} key={item.id}>{String(item.order).padStart(2, "0")} · {item.title}{item.locked ? " 🔒" : ""}</option>)}</select></label>{topic && <TopicEditor topic={topic} first={topicIndex === 0} last={topicIndex === course.topics.length - 1} onChange={updateTopic} onMove={(direction) => updateCourse((next) => { const index = next.topics.findIndex((item) => item.id === topic.id); const target = index + direction; if (target < 0 || target >= next.topics.length) return; [next.topics[index], next.topics[target]] = [next.topics[target], next.topics[index]]; next.topics.forEach((item, itemIndex) => { item.order = itemIndex + 1; }); })} onDelete={() => confirm("이 탐사 주제를 삭제할까요?") && updateCourse((next) => { const index = next.topics.findIndex((item) => item.id === topic.id); next.topics.splice(index, 1); setTopicId(next.topics[Math.max(0, index - 1)]?.id ?? ""); })} />}</section>}
      {tab === "history" && <section className="editor-panel editor-history"><header><div><h2>이전 저장본</h2><p>잘못 수정했을 때 이전 공개 상태로 되돌립니다.</p></div></header><div><select value={revisionId} onChange={(event) => setRevisionId(event.target.value)}><option value="">저장본 선택</option>{revisions.map((revision) => <option key={revision.id} value={revision.id}>저장본 {revision.version} · {new Date(revision.createdAt).toLocaleString("ko-KR")}</option>)}</select><button type="button" disabled={!revisionId || saving} onClick={restore}>선택한 저장본 복원</button></div></section>}</div>
    </section><footer className="editor-footer"><button type="button" onClick={save} disabled={saving}>{saving ? "저장 중…" : "변경사항 공개"}</button><a href="/" target="_blank" rel="noreferrer">공개 화면 보기 ↗</a></footer>
  </main>;
}
