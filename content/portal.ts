import topicSource from "./course-topics.json";
import publisherTopicExplorationSource from "./publisher-topic-explorations.json";
import publisherTextbookTopicSource from "./publisher-textbook-topics.json";
import visangEastAsianTopicSource from "./visang-east-asian-topics.json";
import { cloneDefaultStory, type EditableBlockStyle, type StoryDocument, type StoryImageAsset } from "./story";

export type Lockable = { locked: boolean; lockMessage: string };

export type PortalCustomElement =
  | { id: string; type: "text"; text: string; style?: EditableBlockStyle }
  | { id: string; type: "image"; image: StoryImageAsset };

export type PortalEditableRegion = {
  elements?: PortalCustomElement[];
  styles?: Record<string, EditableBlockStyle | undefined>;
};

export type GuideSection = PortalEditableRegion & {
  id: string;
  title: string;
  paragraphs: string[];
  bullets: string[];
};

export type ContentPage = PortalEditableRegion & {
  title: string;
  eyebrow: string;
  intro: string;
  returnLabel?: string;
  sections: GuideSection[];
};

export type PerformanceLink = {
  id: string;
  label: string;
  url: string;
  description: string;
  openInNewTab: boolean;
};

export type PerformanceAudioAsset = {
  src: string;
  name: string;
  mimeType: string;
};

export type PerformanceMission = Lockable & PortalEditableRegion & {
  id: "collector" | "ruler";
  eyebrow: string;
  title: string;
  intro: string;
  voiceText: string;
  voiceAudio?: PerformanceAudioAsset;
  requireVoiceBeforeLinks: boolean;
  bullets: string[];
  links: PerformanceLink[];
};

export type PerformancePage = PortalEditableRegion & {
  eyebrow: string;
  title: string;
  intro: string;
  mode: "sequence" | "separate";
  returnLabel: string;
  missions: PerformanceMission[];
};

export type ResidualThought = Lockable & PortalEditableRegion & {
  id: string;
  number: number;
  title: string;
  content: string;
  image?: { src: string; alt: string; width: number; height: number };
};

export type PortalTopic = Lockable & {
  id: string;
  order: number;
  unit: string;
  group: string;
  title: string;
  page: number;
  explore: PortalEditableRegion & {
    eyebrow: string;
    intro: string;
    mission: string;
    questions: string[];
    nextLocked: boolean;
  };
  beforeLog: PortalEditableRegion & {
    title: string;
    intro: string;
    diceEyebrow: string;
    diceTitle: string;
    diceDescription: string;
    residualEyebrow: string;
    residualTitle: string;
    residualDescription: string;
    diceEnabled: boolean;
    diceRequired: boolean;
    residualRequired: boolean;
    nextLabel: string;
    nextLocked: boolean;
    residuals: ResidualThought[];
  };
  afterLog: PortalEditableRegion & {
    title: string;
    intro: string;
    diceEnabled: boolean;
    diceRequired: boolean;
    prompts: { title: string; content: string }[];
    nextLabel: string;
    nextLocked: boolean;
  };
};

export type PortalCourse = Lockable & PortalEditableRegion & {
  id: string;
  title: string;
  subtitle: string;
  audience: string;
  accent: string;
  glyph: string;
  publisher?: string;
  publisherOptions?: { id: string; label: string }[];
  publisherTopicSets?: Record<string, PortalTopic[]>;
  menu?: {
    prologue: { title: string; description: string };
    guide: { title: string; description: string };
    topics: { title: string; description: string };
    assessment: { title: string; description: string };
    epilogue: { title: string; description: string; lockedDescription: string };
  };
  topicsPage?: PortalEditableRegion & {
    eyebrow: string;
    title: string;
    intro: string;
    searchLabel: string;
    searchPlaceholder: string;
  };
  prologue: StoryDocument;
  prologueLocked: boolean;
  guide: ContentPage;
  guideLocked: boolean;
  topicsLocked: boolean;
  assessment?: PerformancePage;
  assessmentLocked?: boolean;
  epilogue: ContentPage;
  epilogueLocked: boolean;
  topics: PortalTopic[];
};

export type PortalDocument = {
  schemaVersion: 2;
  appliedMigrations?: string[];
  site: PortalEditableRegion & {
    eyebrow: string;
    title: string;
    subtitle: string;
    description: string;
    entryLabel: string;
    footer: string;
  };
  catalog?: PortalEditableRegion & {
    eyebrow: string;
    title: string;
    intro: string;
  };
  courses: PortalCourse[];
};

const ENTRY_AND_GUIDE_ART_MIGRATION = "entry-and-guide-art-20260720-v1";
const ASSESSMENT_AND_EPILOGUE_MIGRATION = "assessment-and-epilogue-20260720-v1";
const PERFORMANCE_PRESENTATION_MIGRATION = "performance-presentation-audio-20260724-v1";
const PERFORMANCE_MEDIA_MIGRATION = "performance-media-20260724-v2";
const BEFORE_LOG_CONTENT_MIGRATION = "before-log-residue-20260724-v2";
const BEFORE_LOG_SIXTH_RESIDUAL_MIGRATION = "before-log-sixth-residual-20260726-v1";
const PUBLISHER_CONFIG_MIGRATION = "publisher-config-20260725-v1";
const PUBLISHER_TEXTBOOKS_MIGRATION = "publisher-textbooks-20260725-v2";
const TOPIC_EXPLORATIONS_MIGRATION = "publisher-topic-explorations-20260725-v1";

const entryArtwork: PortalCustomElement = {
  id: "entry-art-chrono-core-20260720",
  type: "image",
  image: {
    src: "/portal/20260720/entry-chrono-core.png?v=20260720-1",
    alt: "크로노 코어가 떠 있는 중앙기록실",
    width: 1672,
    height: 941,
    displayWidth: 100,
    maxWidth: 1672,
    alignment: "center",
    borderRadius: 0,
    objectFit: "contain",
  },
};

const guideArtwork = {
  overview: {
    id: "guide-art-overview-20260720",
    type: "image",
    image: {
      src: "/portal/20260720/guide-overview.png?v=20260720-1",
      alt: "과거의 시장에서 기억 복원 임무를 수행하는 시간선 탐사자들",
      width: 1672,
      height: 941,
      displayWidth: 100,
      maxWidth: 1672,
      alignment: "center",
      borderRadius: 0,
      objectFit: "contain",
    },
  },
  restoration: {
    id: "guide-art-memory-restoration-20260720",
    type: "image",
    image: {
      src: "/portal/20260720/guide-memory-restoration.png?v=20260720-1",
      alt: "기억의 등불을 건네는 중앙기록실의 수호자",
      width: 1672,
      height: 941,
      displayWidth: 100,
      maxWidth: 1672,
      alignment: "center",
      borderRadius: 0,
      objectFit: "contain",
    },
  },
  collector: {
    id: "guide-art-forgetting-collector-20260720",
    type: "image",
    image: {
      src: "/portal/20260720/guide-forgetting-collector.png?v=20260720-1",
      alt: "수집한 기억을 조종하는 망각의 수집가",
      width: 1672,
      height: 941,
      displayWidth: 100,
      maxWidth: 1672,
      alignment: "center",
      borderRadius: 0,
      objectFit: "contain",
    },
  },
  ruler: {
    id: "guide-art-disconnection-ruler-20260720",
    type: "image",
    image: {
      src: "/portal/20260720/guide-disconnection-ruler.png?v=20260720-1",
      alt: "갈라진 시간선을 지배하는 단절의 지배자",
      width: 1672,
      height: 941,
      displayWidth: 100,
      maxWidth: 1672,
      alignment: "center",
      borderRadius: 0,
      objectFit: "contain",
    },
  },
  future: {
    id: "guide-art-future-design-20260720",
    type: "image",
    image: {
      src: "/portal/20260720/guide-future-design.png?v=20260720-1",
      alt: "역사를 바탕으로 여러 미래의 길을 역설계하는 시간선 탐사자들",
      width: 1672,
      height: 941,
      displayWidth: 100,
      maxWidth: 1672,
      alignment: "center",
      borderRadius: 0,
      objectFit: "contain",
    },
  },
} satisfies Record<string, PortalCustomElement>;

function portalArtwork(id: string, src: string, alt: string, width = 1672, height = 941): PortalCustomElement {
  return {
    id,
    type: "image",
    image: {
      src,
      alt,
      width,
      height,
      displayWidth: 100,
      maxWidth: width,
      alignment: "center",
      borderRadius: 0,
      objectFit: "contain",
    },
  };
}

const assessmentArtwork = {
  overview: portalArtwork(
    "assessment-art-overview-20260724",
    "/portal/20260724/assessment-overview-20260724.jpg?v=20260724-2",
    "망각의 수집가와 단절의 지배자 사이에서 두 수행평가 임무를 마주한 시간선 탐사자들",
    1536,
    864,
  ),
  collector: portalArtwork(
    "assessment-art-collector-20260724",
    "/portal/20260724/assessment-collector-20260724.jpg?v=20260724-2",
    "흩어진 기억 조각을 모으는 망각의 수집가",
    1536,
    864,
  ),
  ruler: portalArtwork(
    "assessment-art-ruler-20260724",
    "/portal/20260724/assessment-ruler-20260724.jpg?v=20260724-2",
    "갈라진 시간선을 내미는 단절의 지배자",
    1536,
    864,
  ),
};

const epilogueArtwork = {
  recognition: portalArtwork(
    "epilogue-art-recognition-20260720",
    "/portal/20260720/epilogue-recognition.png?v=20260720-2",
    "시간선 복원을 마친 탐사자들이 새로운 자격을 인정받는 순간",
  ),
  nextTimeline: portalArtwork(
    "epilogue-art-next-timeline-20260720",
    "/portal/20260720/epilogue-next-timeline.png?v=20260720-2",
    "다음 시간선 탐사를 향해 나아가는 기억 복원자들",
  ),
};

function insertElement(elements: PortalCustomElement[], element: PortalCustomElement, position: "start" | "end") {
  if (elements.some((item) => item.id === element.id)) return;
  elements[position === "start" ? "unshift" : "push"](element);
}

function applyEntryAndGuideArtwork(document: PortalDocument) {
  if (document.appliedMigrations?.includes(ENTRY_AND_GUIDE_ART_MIGRATION)) return;

  insertElement(document.site.elements ??= [], entryArtwork, "start");
  document.courses.forEach((course) => {
    insertElement(course.guide.elements ??= [], guideArtwork.overview, "start");

    const restorationSection = course.guide.sections.find((section) => section.id === "learning-first") ?? course.guide.sections[0];
    const collectorSection = course.guide.sections.find((section) => section.id === "fixed-devices") ?? course.guide.sections[1];
    const rulerSection = course.guide.sections.find((section) => section.id === "dice-rule") ?? course.guide.sections[2];

    if (restorationSection) insertElement(restorationSection.elements ??= [], guideArtwork.restoration, "end");
    if (collectorSection) insertElement(collectorSection.elements ??= [], guideArtwork.collector, "start");
    if (rulerSection) {
      insertElement(rulerSection.elements ??= [], guideArtwork.ruler, "start");
      insertElement(rulerSection.elements, guideArtwork.future, "end");
    }
  });

  document.appliedMigrations = [...(document.appliedMigrations ?? []), ENTRY_AND_GUIDE_ART_MIGRATION];
}

type TopicSource = Record<string, { title: string; topics: { id: string; order: number; unit: string; group: string; title: string; page: number }[] }>;
type PublisherTopicSource = Record<string, Record<string, TopicSource[string]>>;

const publisherConfig: Record<string, { active: string; options: { id: string; label: string }[] }> = {
  "korean-history-1": {
    active: "haenaem",
    options: [
      { id: "haenaem", label: "해냄에듀" },
      { id: "miraen", label: "미래엔" },
      { id: "visang", label: "비상" },
    ],
  },
  "korean-history-2": {
    active: "haenaem",
    options: [
      { id: "haenaem", label: "해냄에듀" },
      { id: "miraen", label: "미래엔" },
      { id: "visang", label: "비상" },
    ],
  },
  "world-history": {
    active: "miraen",
    options: [
      { id: "miraen", label: "미래엔" },
      { id: "visang", label: "비상" },
    ],
  },
  "east-asian-history-journey": {
    active: "visang",
    options: [
      { id: "miraen", label: "미래엔" },
      { id: "visang", label: "비상" },
    ],
  },
  "modern-world-history": {
    active: "miraen",
    options: [
      { id: "miraen", label: "미래엔" },
      { id: "haenaem", label: "해냄에듀" },
      { id: "visang", label: "비상" },
    ],
  },
};

const courseMeta: Record<string, { title: string; subtitle: string; audience: string; accent: string; glyph: string }> = {
  "korean-history-1": { title: "한국사1", subtitle: "한반도 시간선의 사실과 연결을 복원하는 학기", audience: "8개 반 약 190명 · 동일 교과서 진도와 공통 수업 자료", accent: "#77d7ff", glyph: "韓" },
  "korean-history-2": { title: "한국사2", subtitle: "빼앗긴 시간과 대한민국의 변화를 근거로 복원하는 학기", audience: "8개 반 약 190명 · 동일 교과서 진도와 공통 수업 자료", accent: "#a892ff", glyph: "史" },
  "world-history": { title: "세계사", subtitle: "지역 세계가 교역망과 변화 속에서 연결되는 과정을 복원하는 학기", audience: "15~20명 · 1개 학급", accent: "#f2c879", glyph: "世" },
  "east-asian-history-journey": { title: "동아시아 역사 기행", subtitle: "장소·이동 경로·문화유산에서 교류와 갈등의 기록을 추적하는 학기", audience: "15~20명 · 1개 학급", accent: "#74e0c1", glyph: "旅" },
  "modern-world-history": { title: "역사로 탐구하는 현대 세계", subtitle: "현대 문제의 역사적 배경과 현재의 연결을 근거로 복원하는 학기", audience: "15~20명 · 1개 학급", accent: "#ff9baa", glyph: "現" },
};

const lockMessage = "기억의 수호자가 아직 이 시간선을 개방하지 않았습니다.";

type CoursePrologueConfig = {
  season: string;
  kicker: string;
  guardianEntry: string;
  gateTitle: string;
  gateQuote: string;
  currentRank: string;
  nextRank: string;
  prose: string[];
  grandQuestion: string;
  areas: string[];
  imageAlt: { hero: string; gate: string; areas: string };
};

const coursePrologueConfig: Record<string, CoursePrologueConfig> = {
  "korean-history-2": {
    season: "SEASON 1 · 후편",
    kicker: "【한국사2】빼앗긴 시간과 대한민국의 복원",
    guardianEntry: "너희가 처음 진입할 시간선은, 지금 살아가는 현재의 출발점인 한반도의 역사다.",
    gateTitle: "한국사2 시간선 개방",
    gateQuote: "진입할 시간선은 지금 살아가는 현재의 출발점인 한반도의 역사다.",
    currentRank: "초급 기억 복원자",
    nextRank: "정식 기억 복원자",
    prose: [
      "근대 국가를 세우려는 여러 노력에도 불구하고 한반도의 시간선은 제국주의 침략과 국권 상실로 크게 손상되었다. 견습 기억 복원자인 당신은 오늘날 대한민국에 이르는 시간선을 복원한다.",
      "전편에서 국가와 사회가 형성된 과정을 복원했다면, 후편에서는 빼앗기고 갈라진 시간 속에서도 사람들이 어떤 선택을 통해 나라와 사회를 다시 세웠는지 살펴본다. 독립과 민주주의, 경제 성장, 평화와 인권의 기억 가운데 무엇을 오늘날까지 보존해야 하는지도 판단해야 한다.",
    ],
    grandQuestion: "식민 지배와 분단을 겪은 사람들은 어떤 선택을 통해 오늘날의 대한민국을 만들어 왔는가?",
    areas: [
      "제국주의 질서와 일제의 식민 통치 정책", "3.1 운동과 대한민국 임시 정부", "민족 운동의 전개와 분화", "사회⋅문화의 변화와 대중 운동",
      "독립 국가 건설 노력", "냉전 체제와 대한민국 정부 수립", "6.25 전쟁과 남북 분단의 고착화", "민주화를 위한 노력",
      "산업화의 성과와 사회⋅문화의 변화", "6월 민주 항쟁 이후 민주화 과정", "외환 위기 극복과 사회⋅문화 변화", "한반도 분단 극복과 동아시아 평화를 위한 노력",
    ],
    imageAlt: {
      hero: "근현대 한반도의 시간선으로 향하는 시간선 탐사자",
      gate: "근현대사의 굴곡과 오늘날의 대한민국으로 이어지는 시간선",
      areas: "한국사2의 주요 탐사 영역을 안내하는 기억의 수호자",
    },
  },
  "world-history": {
    season: "SEASON 2",
    kicker: "【세계사】갈라진 세계의 시간선",
    guardianEntry: "너희가 처음 진입할 시간선은, 각 지역 세계가 모인 전 지구촌의 역사다.",
    gateTitle: "세계사 시간선 개방",
    gateQuote: "진입할 시간선은 지금 살아가는 지역 세계의 집합체인 지구촌의 역사다.",
    currentRank: "정식 기억 복원자",
    nextRank: "시간선 연결자",
    prose: [
      "당신이 되살린 한국사의 여러 사건은 한반도 안에서만 형성된 것이 아니었다. 전쟁과 교역, 종교와 사상, 기술과 사람의 이동을 따라가자 한반도의 시간선은 세계 각 지역의 역사와 이어져 있었다. 시즌 1에서 복원한 한반도의 역사는 거대한 세계 시간선의 일부였다. 그러나 크로노 넥서스의 세계 시간선은 지역과 문명별로 조각나 있었다. 정식 기억 복원자인 당신은 활동 범위를 여러 문명과 지역으로 넓힌다. 이제 한 지역의 사건을 다른 지역의 변화와 비교하고, 교류와 충돌 속에서 갈라진 세계의 기억을 다시 연결해야 한다.",
    ],
    grandQuestion: "서로 다른 지역과 문명의 역사는 어떻게 연결되어 오늘날의 세계를 만들었는가?",
    areas: [
      "현생 인류와 문명의 형성", "동아시아, 인도 세계의 문화와 종교⋅사상", "서아시아, 지중해, 유럽 세계의 문화와 종교", "이슬람 세계와 몽골 제국",
      "유럽의 신항로 개척과 재정⋅군사 국가", "세계적 상품 교역", "청, 무굴 제국, 오스만 제국", "미국 혁명과 프랑스 혁명",
      "산업 혁명과 제국주의", "국민 국가 건설 운동", "제1⋅2차 세계대전", "냉전", "지구적 과제와 인류의 노력",
    ],
    imageAlt: {
      hero: "세계의 갈라진 시간선을 바라보는 시간선 탐사자들",
      gate: "각 지역과 문명의 역사가 교차하는 세계 시간선",
      areas: "세계사의 주요 탐사 영역을 분석하는 시간선 탐사자들",
    },
  },
  "east-asian-history-journey": {
    season: "SEASON 2",
    kicker: "【동아시아 역사 기행】기억의 길",
    guardianEntry: "너희가 처음 진입할 시간선은, 너희가 살아가는 지역 세계, 동아시아의 역사다.",
    gateTitle: "동아시아 역사 기행 시간선 개방",
    gateQuote: "진입할 시간선은 지금 살아가는 우리가 사는 지역 세계, 동아시아의 역사다.",
    currentRank: "정식 기억 복원자",
    nextRank: "시간선 추적자",
    prose: [
      "세계 시간선을 복구하는 과정에서 새로운 문제가 발견되었다. 한반도와 중국, 일본, 북방 유목 세계, 해양 세계를 연결하던 길과 장소의 기억이 크게 훼손되어 있었다. 도시와 항구, 초원길과 해상 교역로, 사원과 성곽, 전쟁터와 기념 공간에서는 이동과 만남의 흔적이 사라지고 있다. 정식 기억 복원자인 당신은 한반도 시간선에서 확인한 교류와 갈등의 흔적을 실제 공간에서 다시 추적하고, 교류와 충돌, 침략과 저항, 전쟁과 평화의 기억이 오늘날의 도시와 유적, 경관에 어떻게 남아 있는지를 탐사한다.",
    ],
    grandQuestion: "한반도와 중국, 일본, 북방 유목 세계와 해양 세계를 연결한 사람과 문화의 이동은 어떤 길과 장소에 남아 있는가?",
    areas: [
      "역사 기행과 동아시아 역사 탐구", "동아시아의 생태환경과 사람들의 생활", "동아시아 지역 간 교류의 시작", "종교와 사상을 중심으로 한 지역 간 교류",
      "몽골의 팽창과 17세기 전후 동아시아 전쟁", "동아시아 지역 내외 교류 양상의 다양화", "동아시아 지역에서 전개된 제국주의 열강의 침략 전쟁", "아시아⋅태평양 전쟁과 이에 맞선 저항과 연대",
      "제국주의 열강의 침략과 생태환경의 변화", "냉전 시기 동아시아의 전쟁과 정치⋅사회적 변화", "동아시아 각국의 경제⋅문화 발달과 교류", "상호 공존의 지역 질서 형성을 위한 연대와 참여",
    ],
    imageAlt: {
      hero: "동아시아의 길과 장소를 따라 걷는 시간선 탐사자들",
      gate: "한반도와 중국, 일본, 북방과 해양을 잇는 동아시아의 길",
      areas: "동아시아 역사 기행의 주요 탐사 영역을 확인하는 탐사자들",
    },
  },
  "modern-world-history": {
    season: "외전",
    kicker: "【역사로 탐구하는 현대 세계】현재의 균열",
    guardianEntry: "너희가 처음 진입할 시간선은, 역사를 넘어 그 뒤로 이어진 현재의 시간이다.",
    gateTitle: "역사로 탐구하는 현대 세계 시간선 개방",
    gateQuote: "진입할 시간선은 과거의 역사가 아닌 바로 지금, 현재의 시간이다.",
    currentRank: "정식 기억 복원자",
    nextRank: "시간선 설계자",
    prose: [
      "크로노 넥서스의 균열은 오래된 기록 속에만 머물지 않는다. 전쟁과 국제 분쟁, 경제 성장과 불평등, 과학기술의 발전과 생태 위기, 권위주의와 민주주의, 세계화와 다문화 갈등처럼 오늘날의 문제 속에서도 모습을 드러낸다. 정식 기억 복원자인 당신은 현재의 문제를 갑자기 나타난 현상으로 보지 않고, 그 배경에 놓인 과거의 선택과 구조를 역으로 추적하며 오늘의 세계가 만들어진 경로를 밝힌다. 과거와 현재가 비슷하다는 점만 찾는 것으로는 균열을 닫을 수 없다. 무엇이 이어지고 무엇이 달라졌는지를 구분하고, 과거의 선택이 가져온 결과를 바탕으로 현재를 새롭게 진단한 뒤 앞으로 필요한 가치와 실천 방향을 설계해야 한다.",
    ],
    grandQuestion: "서로 다른 지역과 문명의 역사는 어떻게 연결되어 오늘날의 세계를 만들었는가?",
    areas: [
      "세계 대전 이후의 현대 세계", "청소년이 바라본 현대 세계의 과제", "전후 평화를 위한 국제적 노력과 좌절", "냉전 시기 열전의 전개",
      "기념 시설로 만나는 역사", "세계 경제의 성장과 기술 발전", "대중 소비 사회와 생태환경의 문제", "기후변화 협약으로 만나는 역사",
      "탈냉전 이후의 국제 분쟁과 무력 갈등", "권위주의 체제의 변동", "역사 정책으로 만나는 역사", "경제의 세계화와 불평등의 심화",
      "다문화 사회로의 진전과 갈등", "국제 규범으로 만나는 역사",
    ],
    imageAlt: {
      hero: "현대 세계의 균열과 연결을 바라보는 시간선 탐사자들",
      gate: "전쟁과 산업화, 이주와 환경 문제로 갈라진 현대 세계의 시간선",
      areas: "현대 세계의 주요 탐사 영역을 분석하는 시간선 탐사자들",
    },
  },
};

function courseImage(courseId: string, name: "hero" | "gate" | "areas", alt: string): StoryImageAsset {
  const portrait = name === "hero";
  return {
    src: `/illustrations/courses/${courseId}/${name}.png?v=20260719-1`,
    alt,
    width: portrait ? 1024 : 1672,
    height: portrait ? 1536 : 941,
    ...(portrait ? { portrait: true } : {}),
    ...(name === "areas" ? { compact: true } : {}),
  };
}

function fullPrologue(courseId: string, meta: (typeof courseMeta)[string]): StoryDocument {
  const config = coursePrologueConfig[courseId];
  const story = cloneDefaultStory();
  story.hero.series = `CHRONO NEXUS · ${meta.title}`;
  story.hero.season = config.season;
  story.hero.kicker = config.kicker;
  story.hero.image = courseImage(courseId, "hero", config.imageAlt.hero);

  const prologue = story.chapters.find((chapter) => chapter.id === "prologue");
  const guardianCallout = prologue?.blocks.find((block) => block.id === "guardian-callout");
  if (guardianCallout?.type === "quote") {
    guardianCallout.paragraphs = [
      config.guardianEntry,
      "선택은 너희의 몫이다. 나는 길을 보여 줄 뿐, 그 길을 걷는 이는 너희다.",
    ];
  }

  const gateIndex = story.chapters.findIndex((chapter) => chapter.id === "korean-history-one");
  story.chapters[gateIndex] = {
    id: `${courseId}-gate`,
    title: config.gateTitle,
    theme: "gate",
    blocks: [
      { id: `${courseId}-quote`, type: "pullQuote", text: config.gateQuote },
      { id: `${courseId}-gate-image`, type: "image", image: courseImage(courseId, "gate", config.imageAlt.gate) },
      { id: `${courseId}-rank`, type: "rank", items: [
        { title: "▶ 현재 등급:", text: config.currentRank },
        { title: "▷ 관문 완료 시 획득 칭호:", text: config.nextRank },
      ] },
      { id: `${courseId}-prose`, type: "prose", paragraphs: config.prose },
      { id: `${courseId}-grand-question`, type: "grandQuestion", text: config.grandQuestion },
      { id: `${courseId}-question-guide`, type: "prose", paragraphs: ["이 질문은 정해진 답을 요구하지 않는다. 서로 다른 기록과 관점을 확인하고, 근거를 들어 자신의 판단을 설명할 때 시간선은 다시 연결되기 시작한다."] },
      { id: `${courseId}-areas`, type: "areas", title: "주요 탐사 영역", intro: [
        "시간선은 아래의 영역들에서 서로 이어진다.",
        "하나를 고립된 섬처럼 다루지 말라.",
      ], image: courseImage(courseId, "areas", config.imageAlt.areas), guide: "이름을 지나 원인으로, 원인을 지나 선택으로, 선택을 지나 결과와 의미로 나아가라.", items: config.areas },
    ],
  };
  return story;
}

function guideFor(meta: (typeof courseMeta)[string]): ContentPage {
  return {
    eyebrow: "CLASS & ASSESSMENT GUIDE",
    title: `${meta.title} 수업·평가 안내`,
    intro: "일반적인 역사 수업을 중심에 두고, 시작과 마무리에만 짧은 서사 장치와 다이스를 사용합니다.",
    returnLabel: "과목 메인으로 돌아가기",
    sections: [
      { id: "learning-first", title: "학습 우선", paragraphs: ["교과 학습 85~90% · 서사적 게임 장치 10~15% 이하"], bullets: ["교사 설명·교과서·사료·지도·질문·탐구가 수업의 중심입니다.", "세계관 용어는 수업의 시작과 마무리에만 짧게 사용합니다.", "학생은 역사를 바꾸지 않고 교과서와 근거를 확인하여 훼손된 기록을 바로잡습니다."] },
      { id: "fixed-devices", title: "두 가지 고정 장치", paragraphs: ["수업 시작의 ‘기록 이상 확인’과 수업 마무리의 ‘기록 복원 로그’를 매 차시 반복합니다."], bullets: ["기존 기억 복원 로그 확인: 지난 차시 복습, 좌석 다이스, 이벤트 다이스, 무기억자의 잔존 사념", "새 기억 복원 로그 진입: 사실 복원·기록 해독·현재 공명 작성과 발표 릴레이 다이스"] },
      { id: "dice-rule", title: "다이스 운영 원칙", paragraphs: ["다이스는 발표자와 복습 형식만 정합니다."], bullets: ["성적, 문제 난이도, 정답, 학습 기회, 학생 간 우열을 정하지 않습니다.", "발표는 평가나 벌칙이 아니며 부족한 답은 교사가 짧게 보완합니다.", "다이스와 발표 결과는 수행평가·지필평가에서 완전히 제외합니다."] },
      { id: "log-rule", title: "기억 복원 로그", paragraphs: ["모든 학생이 매 차시 세 영역을 개인 작성합니다."], bullets: ["사실 복원: 사실·원인·과정·결과와 근거", "기록 해독: 낯선 말의 뜻과 역사적 맥락에 맞는 예문", "현재 공명: 시사점, 과거와 현재의 유사점·차이점, 판단 근거"] },
    ],
  };
}

const performanceCourseIntro: Record<string, { collector: string; ruler: string }> = {
  "korean-history-1": {
    collector: "시대별 핵심 기억 가운데 오늘날에도 보존할 가치가 있는 역사적 요소를 선택합니다.",
    ruler: "고대부터 근세까지의 변화와 연속성을 분석하고, 현재와 미래를 잇는 역사 해설을 설계합니다.",
  },
  "korean-history-2": {
    collector: "근현대사의 각 단원에서 오늘날까지 보존해야 할 핵심 기억을 선택합니다.",
    ruler: "근현대사의 전환과 선택을 현재의 문제와 연결하고, 앞으로 필요한 방향을 역설계합니다.",
  },
  "world-history": {
    collector: "지역 세계와 문명의 연결 속에서 오늘날에도 기억할 가치가 있는 역사적 요소를 선택합니다.",
    ruler: "교류와 충돌로 형성된 세계의 구조를 현재와 연결하고, 앞으로의 세계를 역설계합니다.",
  },
  "east-asian-history-journey": {
    collector: "동아시아의 장소·이동 경로·문화유산에 남은 기억 가운데 보존할 가치를 선택합니다.",
    ruler: "동아시아의 교류와 갈등이 남긴 현재를 분석하고, 공존을 위한 미래의 길을 역설계합니다.",
  },
  "modern-world-history": {
    collector: "현대 세계의 문제를 이해하는 데 필요한 역사적 기억 가운데 보존할 가치를 선택합니다.",
    ruler: "현재의 문제를 만든 역사적 구조를 분석하고, 바라는 미래에 도달하기 위한 실천을 역설계합니다.",
  },
};

const performanceVoiceAudio: Record<PerformanceMission["id"], PerformanceAudioAsset> = {
  collector: {
    src: "/portal/20260724/forgetting-collector-20260724.mp3?v=20260724-2",
    name: "망각의 수집가.mp3",
    mimeType: "audio/mpeg",
  },
  ruler: {
    src: "/portal/20260724/disconnection-ruler-20260724.mp3?v=20260724-2",
    name: "단절의 지배자.mp3",
    mimeType: "audio/mpeg",
  },
};

function performanceFor(courseId: string, meta: (typeof courseMeta)[string]): PerformancePage {
  const intro = performanceCourseIntro[courseId] ?? performanceCourseIntro["world-history"];
  const isKoreanHistory = courseId === "korean-history-1" || courseId === "korean-history-2";
  return {
    eyebrow: "PERFORMANCE ASSESSMENT",
    title: `${meta.title} 수행평가`,
    intro: isKoreanHistory
      ? "두 임무는 하나의 시간선에서 순서대로 이어집니다. 망각의 수집가를 지나 단절의 지배자와 대면합니다."
      : "두 임무는 각각 독립된 수행평가로 진행합니다. 필요한 임무를 선택해 안내와 작성 링크를 확인하세요.",
    mode: "separate",
    returnLabel: "과목 메인으로 돌아가기",
    elements: [assessmentArtwork.overview],
    missions: [
      {
        id: "collector",
        locked: false,
        lockMessage: "이 수행평가는 아직 공개되지 않았습니다.",
        eyebrow: "PERFORMANCE ASSESSMENT 01",
        title: "망각의 수집가\n: 기억 보존 임무",
        intro: intro.collector,
        voiceText: "무엇을 기억해야 하며, 그것을 왜 기억해야 하는가. 기억의 가치를 설명하고 보존할 방법을 제안하라.",
        voiceAudio: { ...performanceVoiceAudio.collector },
        requireVoiceBeforeLinks: true,
        bullets: [
          "기억할 역사적 사건·인물·장소·제도·사상 가운데 하나를 선택합니다.",
          "역사적 배경과 과정, 결과와 당시의 의미를 근거로 설명합니다.",
          "오늘날에도 기억해야 하는 이유와 기념일 또는 기념물의 형태를 제안합니다.",
        ],
        elements: [assessmentArtwork.collector],
        links: [],
      },
      {
        id: "ruler",
        locked: false,
        lockMessage: "이 수행평가는 아직 공개되지 않았습니다.",
        eyebrow: "PERFORMANCE ASSESSMENT 02",
        title: "단절의 지배자\n: 시간선 역설계",
        intro: intro.ruler,
        voiceText: "과거는 현재와 단절되지 않았다. 과거의 구조를 해체하고 현재와 연결한 뒤, 바라는 미래에 도달할 길을 역설계하라.",
        voiceAudio: { ...performanceVoiceAudio.ruler },
        requireVoiceBeforeLinks: true,
        bullets: [
          "과거 시스템 해체\n역사적 배경·구조·선택·작동 방식과 결과를 분석합니다.",
          "현재 시스템 연결\n과거와 현재의 유사점·차이점·연속성·변화를 구분합니다.",
          "미래 시스템 역설계\n필요한 제도와 가치, 공동체의 선택과 지금의 실천을 제안합니다.",
        ],
        elements: [assessmentArtwork.ruler],
        links: [],
      },
    ],
  };
}

const residualTemplates = [
  ["사실 왜곡", "기억 복원 가운데 왜곡된 사실이 발견되었습니다. 왜곡된 사실을 정정하십시오."],
  ["인과 단절", "기억 복원 가운데 인과의 단절이 발견되었습니다. 단절된 원인과 결과를 연결하십시오."],
  ["기록 훼손", "기억 복원 가운데 핵심어의 훼손이 발견되었습니다. 훼손된 핵심어를 복구하십시오."],
  ["과정 혼돈", "기억 복원 가운데 시간선 순서의 혼동이 발견되었습니다. 기록을 올바른 순서로 배열하십시오."],
  ["대응 혼선", "기억 복원 가운데 서로 대응하는 기록이 뒤섞였습니다. 관련 있는 항목끼리 바르게 연결하십시오."],
  ["사념 전이", "무기억자의 잔존 사념이 다른 탐사자에게로 전이되었습니다."],
] as const;

function makeTopic(source: (TopicSource[string]["topics"])[number], index: number): PortalTopic {
  return {
    ...source,
    locked: index > 0,
    lockMessage,
    explore: {
      eyebrow: "TIMELINE EXPLORATION",
      intro: `교과서 ${source.page}쪽부터 이어지는 기록입니다.`,
      mission: "교과서·사료·지도·질문을 통해 사실과 맥락을 확인합니다.",
      questions: ["무엇이 사실인가?", "왜 이런 변화가 일어났는가?", "이 기록은 다음 시간선과 어떻게 이어지는가?"],
      nextLocked: false,
    },
    beforeLog: {
      title: "[경고] 무기억자의 잔존 사념 감지",
      intro: "잔존 사념은 역사적 사실을 왜곡하고, 사건의 의미와 시간선의 연결을 훼손합니다.\n새로운 탐사를 시작하기 전, 기록에 남은 이상을 찾아 바로잡으십시오.",
      diceEyebrow: "DICE CONSOLE",
      diceTitle: "점검자 호출 절차 개시",
      diceDescription: "무기억자의 잔존 사념을 추적할 점검자가 필요합니다. 다이스를 굴려 오늘의 점검자를 호출합니다.",
      residualEyebrow: "OBLIVION RESIDUE",
      residualTitle: "무기억자의 잔존 사념",
      residualDescription: "다이스로 이상 유형을 확인하고 기록 복원을 시작하십시오.",
      diceEnabled: true,
      diceRequired: true,
      residualRequired: true,
      nextLabel: "주제 소개 및 탐사로 이동",
      nextLocked: false,
      residuals: residualTemplates.map(([title, content], residualIndex) => ({ id: `residual-${residualIndex + 1}`, number: residualIndex + 1, title, content, locked: false, lockMessage })),
    },
    afterLog: {
      title: "새 기억 복원 로그 진입",
      intro: "오늘 학습한 기록을 세 영역으로 남기고 발표 릴레이 다이스를 진행합니다.",
      diceEnabled: true,
      diceRequired: true,
      prompts: [
        { title: "사실 복원", content: "오늘 학습한 사실·원인·과정·결과와 근거를 기록합니다." },
        { title: "기록 해독", content: "오늘의 낯선 말과 뜻, 역사적 맥락에 맞는 예문을 기록합니다." },
        { title: "현재 공명", content: "현재에 주는 시사점과 과거·현재의 유사점·차이점, 판단 근거를 기록합니다." },
      ],
      nextLabel: "다음 주제 선택",
      nextLocked: false,
    },
  };
}

function createVisangEastAsianTopics(): PortalTopic[] {
  const source = visangEastAsianTopicSource as TopicSource[string];
  return source.topics.map(makeTopic);
}

function createPublisherTopics(courseId: string, publisher: string): PortalTopic[] {
  const source = (publisherTextbookTopicSource as PublisherTopicSource)[courseId]?.[publisher];
  return source?.topics.map(makeTopic) ?? [];
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function updateTopicMenuCount(course: PortalCourse) {
  const description = course.menu?.topics.description;
  if (description && /^\d+개의 주제 중 오늘의 탐사를 선택합니다\.$/.test(description)) {
    course.menu!.topics.description = `${course.topics.length}개의 주제 중 오늘의 탐사를 선택합니다.`;
  }
}

function applyPublisherConfig(document: PortalDocument) {
  if (document.appliedMigrations?.includes(PUBLISHER_CONFIG_MIGRATION)) return;

  document.courses.forEach((course) => {
    const config = publisherConfig[course.id];
    if (!config) return;
    course.publisherOptions = config.options.map((option) => ({ ...option }));

    if (course.id === "east-asian-history-journey") {
      const previousPublisher = course.publisher ?? "miraen";
      const topicSets = course.publisherTopicSets ?? {};
      topicSets[previousPublisher] = cloneValue(course.topics);
      topicSets.miraen ??= cloneValue((topicSource as TopicSource)[course.id].topics.map(makeTopic));
      topicSets.visang ??= createVisangEastAsianTopics();
      course.publisherTopicSets = topicSets;
      course.publisher = config.active;
      course.topics = cloneValue(topicSets[config.active]);
      updateTopicMenuCount(course);
      return;
    }

    course.publisher = config.active;
  });

  document.appliedMigrations = [...(document.appliedMigrations ?? []), PUBLISHER_CONFIG_MIGRATION];
}

function applyPublisherTextbooks(document: PortalDocument) {
  if (document.appliedMigrations?.includes(PUBLISHER_TEXTBOOKS_MIGRATION)) return;

  document.courses.forEach((course) => {
    const config = publisherConfig[course.id];
    if (!config) return;

    const currentPublisher = course.publisher ?? config.active;
    const topicSets = course.publisherTopicSets ?? {};
    if (course.topics.length) topicSets[currentPublisher] = cloneValue(course.topics);

    const suppliedPublishers = (publisherTextbookTopicSource as PublisherTopicSource)[course.id] ?? {};
    Object.keys(suppliedPublishers).forEach((publisher) => {
      if (!topicSets[publisher]?.length) topicSets[publisher] = createPublisherTopics(course.id, publisher);
    });

    course.publisherOptions = config.options.map((option) => ({ ...option }));
    course.publisherTopicSets = topicSets;
    course.publisher = topicSets[currentPublisher]?.length ? currentPublisher : config.active;
    course.topics = cloneValue(topicSets[course.publisher] ?? course.topics);
    updateTopicMenuCount(course);
  });

  document.appliedMigrations = [...(document.appliedMigrations ?? []), PUBLISHER_TEXTBOOKS_MIGRATION];
}

type TopicExplorationSource = Record<
  string,
  Record<string, { order: number; mission: string; questions: string[] }[]>
>;

function applyTopicExplorations(document: PortalDocument) {
  if (document.appliedMigrations?.includes(TOPIC_EXPLORATIONS_MIGRATION)) return;

  const source = publisherTopicExplorationSource as TopicExplorationSource;
  document.courses.forEach((course) => {
    const courseSource = source[course.id];
    if (!courseSource) return;

    const applyToTopics = (
      topics: PortalTopic[] | undefined,
      rows: { order: number; mission: string; questions: string[] }[],
    ) => {
      if (!topics?.length) return;
      const rowsByOrder = new Map(rows.map((row) => [row.order, row]));
      topics.forEach((topic) => {
        const row = rowsByOrder.get(topic.order);
        if (!row) return;
        topic.explore.mission = row.mission;
        topic.explore.questions = cloneValue(row.questions);
      });
    };

    Object.entries(courseSource).forEach(([publisher, rows]) => {
      applyToTopics(course.publisherTopicSets?.[publisher], rows);
      if (course.publisher === publisher) applyToTopics(course.topics, rows);
    });
  });

  document.appliedMigrations = [
    ...(document.appliedMigrations ?? []),
    TOPIC_EXPLORATIONS_MIGRATION,
  ];
}

const epilogueCourseText: Record<string, string[]> = {
  "korean-history-1": [
    "한반도의 오래된 기록을 탐사하며 흩어진 사실과 사건의 연결을 복원하였다. 아직 더 많은 시간선이 남아 있지만, 기억을 복원하는 기본 능력을 갖추었으므로 ‘초급 기억 복원자’로 인정한다.",
    "다음 관문은 한국사2 「빼앗긴 시간과 대한민국의 복원」이다. 초급 기억 복원자는 국권을 잃고 갈라진 시간 속에서도 나라와 사회를 다시 세운 선택을 추적한다.",
    "시간선 탐사자는 견습 기억 복원자로 기억 복원 임무에 참여한다.",
    "한국사1을 마치면 초급 기억 복원자가 된다.",
    "한국사2를 마치면 정식 기억 복원자가 된다.",
    "정식 기억 복원자는 세계사에서 시간선 연결자, 동아시아 역사 기행에서 시간선 추적자, 역사로 탐구하는 현대 세계에서 시간선 설계자의 전문 경로를 선택할 수 있다.",
  ],
  "korean-history-2": [
    "빼앗기고 갈라진 한반도의 기억을 복원하고, 그 기억이 오늘날 우리에게 지닌 의미를 밝혀냈다. 이제 스스로 과거를 탐사하고 판단할 능력을 갖추었으므로 ‘정식 기억 복원자’로 인정한다.",
    "한국사1과 2를 모두 통과한 정식 기억 복원자에게 세 개의 전문 관문이 열린다. 세계사에서는 시간선을 연결하고, 동아시아 역사 기행에서는 기억의 길을 추적하며, 역사로 탐구하는 현대 세계에서는 현재의 균열을 통해 미래의 방향을 설계한다.",
    "정식 기억 복원자는 세계사에서 시간선 연결자, 동아시아 역사 기행에서 시간선 추적자, 역사로 탐구하는 현대 세계에서 시간선 설계자의 전문 경로를 선택할 수 있다.",
  ],
  "world-history": [
    "고립되어 있던 여러 문명과 지역의 기억을 비교하고, 교류와 충돌로 이어진 세계의 시간선을 복원하였다. 이제 ‘시간선 연결자’로 인정한다.",
    "정식 기억 복원자는 세계사에서 시간선 연결자, 동아시아 역사 기행에서 시간선 추적자, 역사로 탐구하는 현대 세계에서 시간선 설계자의 전문 경로를 선택할 수 있다.",
    "시간선 연결자는 서로 다른 지역을 하나의 기준으로 재단하지 않는다. 각 지역의 조건과 선택을 살피면서, 그 사이를 오간 사람과 물자, 사상과 기술, 전쟁과 교류의 연결을 드러낸다.",
  ],
  "east-asian-history-journey": [
    "기록 속에만 남아 있던 역사를 실제 장소와 이동의 흔적 속에서 발견하고, 사람과 문화가 지나간 길을 복원하였다. 이제 ‘시간선 추적자’로 인정한다.",
    "정식 기억 복원자는 세계사에서 시간선 연결자, 동아시아 역사 기행에서 시간선 추적자, 역사로 탐구하는 현대 세계에서 시간선 설계자의 전문 경로를 선택할 수 있다.",
    "시간선 추적자는 시간뿐 아니라 장소에 남은 기억을 읽는다. 같은 장소에 겹쳐 있는 교류와 충돌, 침략과 저항, 전쟁과 평화의 기억을 분리하지 않고 함께 살핀다.",
  ],
  "modern-world-history": [
    "과거의 기억을 통해 현재의 균열을 진단하고, 아직 기록되지 않은 미래의 방향을 설계하였다. 이제 ‘시간선 설계자’로 인정한다.",
    "정식 기억 복원자는 세계사에서 시간선 연결자, 동아시아 역사 기행에서 시간선 추적자, 역사로 탐구하는 현대 세계에서 시간선 설계자의 전문 경로를 선택할 수 있다.",
    "시간선 설계자의 임무는 미래를 예언하는 것이 아니다. 과거의 구조와 선택을 근거로 현재를 판단하고, 아직 기록되지 않은 미래의 방향을 고민하는 것이다.",
  ],
};

const epilogueReflection = "과거는 바꿀 수 없다. 그러나 과거를 어떻게 기억할지는 선택할 수 있다. 현재는 이미 주어진 것이 아니다. 과거의 수많은 선택이 쌓여 만들어진 하나의 결과이다. 미래는 아직 기록되지 않았다. 과거를 이해하고 현재를 판단하는 사람만이 새로운 시간선을 설계할 수 있다. 기억을 넘어 통찰로 나아가라. 너희의 선택이 다음 시간선을 만든다.";
const epilogueEnemy = "무기억자는 완전히 사라지지 않는다. 사람들이 과거를 당연한 것으로 여기고 질문을 멈추며 기억을 현재와 분리하는 순간, 어느 시간선에서든 다시 모습을 드러낸다. 그러므로 탐사자의 임무도 끝나지 않는다. 이미 복원한 기억을 다시 살피고, 사라진 목소리를 찾으며, 새로운 시대의 질문으로 과거를 다시 읽어야 한다.";
const epilogueFinal = "기억을 지키고 연결하는 한, 무기억자는 시간선을 완전히 지배할 수 없다. 기억을 넘어 통찰로 나아가라. 너희의 선택이 다음 시간선을 만든다.";

function epilogueFor(courseId: string, meta: (typeof courseMeta)[string]): ContentPage {
  return {
    eyebrow: "EPILOGUE.",
    title: "기억을 넘어 통찰로",
    intro: "그대는 이 관문을 통과해 하나의 시간선 복원을 무사히 마치고 돌아왔다.",
    returnLabel: "과목 메인으로 돌아가기",
    elements: [epilogueArtwork.recognition],
    sections: [
      {
        id: "recognition",
        title: "",
        paragraphs: epilogueCourseText[courseId] ?? [meta.title],
        bullets: [],
      },
      {
        id: "growth",
        title: "성장과 다음 시간선",
        paragraphs: [
          "그러나 하나의 시간선을 복원한 것은 끝이 아니다.",
          "다음 탐사를 시작할 자격을 얻은 것이다.",
        ],
        bullets: [],
        elements: [epilogueArtwork.nextTimeline],
      },
      {
        id: "final-message",
        title: "",
        paragraphs: [epilogueReflection, epilogueEnemy, epilogueFinal],
        bullets: [],
      },
    ],
  };
}

function applyAssessmentAndEpilogueContent(document: PortalDocument) {
  if (document.appliedMigrations?.includes(ASSESSMENT_AND_EPILOGUE_MIGRATION)) return;

  document.courses.forEach((course) => {
    const meta = courseMeta[course.id];
    if (!meta) return;
    course.assessment ??= performanceFor(course.id, meta);

    insertElement(course.assessment.elements ??= [], assessmentArtwork.overview, "start");
    const collector = course.assessment.missions.find((mission) => mission.id === "collector");
    const ruler = course.assessment.missions.find((mission) => mission.id === "ruler");
    if (collector) insertElement(collector.elements ??= [], assessmentArtwork.collector, "start");
    if (ruler) insertElement(ruler.elements ??= [], assessmentArtwork.ruler, "start");

    const defaultRuler = performanceFor(course.id, meta).missions.find((mission) => mission.id === "ruler");
    if (ruler && defaultRuler) ruler.bullets = [...defaultRuler.bullets];

    course.epilogue = epilogueFor(course.id, meta);
  });

  document.appliedMigrations = [...(document.appliedMigrations ?? []), ASSESSMENT_AND_EPILOGUE_MIGRATION];
}

function applyBeforeLogContent(document: PortalDocument) {
  if (document.appliedMigrations?.includes(BEFORE_LOG_CONTENT_MIGRATION)) return;

  document.courses.forEach((course) => course.topics.forEach((topic) => {
    const beforeLog = topic.beforeLog;
    beforeLog.title = "[경고] 무기억자의 잔존 사념 감지";
    beforeLog.intro = "잔존 사념은 역사적 사실을 왜곡하고, 사건의 의미와 시간선의 연결을 훼손합니다.\n새로운 탐사를 시작하기 전, 기록에 남은 이상을 찾아 바로잡으십시오.";
    beforeLog.diceEyebrow = "DICE CONSOLE";
    beforeLog.diceTitle = "점검자 호출 절차 개시";
    beforeLog.diceDescription = "무기억자의 잔존 사념을 추적할 점검자가 필요합니다. 다이스를 굴려 오늘의 점검자를 호출합니다.";
    beforeLog.residualEyebrow = "OBLIVION RESIDUE";
    beforeLog.residualTitle = "무기억자의 잔존 사념";
    beforeLog.residualDescription = "다이스로 이상 유형을 확인하고 기록 복원을 시작하십시오.";
    beforeLog.residuals = residualTemplates.map(([title, content], index) => {
      const existing = beforeLog.residuals.find((item) => item.number === index + 1);
      return {
        ...(existing ?? { id: `residual-${index + 1}`, locked: false, lockMessage }),
        number: index + 1,
        title,
        content,
      };
    });
  }));

  document.appliedMigrations = [...(document.appliedMigrations ?? []), BEFORE_LOG_CONTENT_MIGRATION];
}

function applySixthResidual(document: PortalDocument) {
  if (document.appliedMigrations?.includes(BEFORE_LOG_SIXTH_RESIDUAL_MIGRATION)) return;

  const applyToTopics = (topics: PortalTopic[] | undefined) => {
    topics?.forEach((topic) => {
      const existing = topic.beforeLog.residuals.find((item) => item.number === 6);
      const sixth: ResidualThought = {
        ...(existing ?? {
          id: "residual-6",
          locked: false,
          lockMessage,
        }),
        number: 6,
        title: "사념 전이",
        content: existing?.content?.trim()
          ? existing.content
          : "무기억자의 잔존 사념이 다른 탐사자에게로 전이되었습니다.",
        elements: existing?.elements ?? [],
        styles: existing?.styles ?? {},
      };
      topic.beforeLog.residuals = [
        ...topic.beforeLog.residuals.filter((item) => item.number !== 6),
        sixth,
      ].sort((left, right) => left.number - right.number);
    });
  };

  document.courses.forEach((course) => {
    applyToTopics(course.topics);
    Object.values(course.publisherTopicSets ?? {}).forEach(applyToTopics);
  });
  document.appliedMigrations = [
    ...(document.appliedMigrations ?? []),
    BEFORE_LOG_SIXTH_RESIDUAL_MIGRATION,
  ];
}

function applyPerformancePresentation(document: PortalDocument) {
  if (document.appliedMigrations?.includes(PERFORMANCE_PRESENTATION_MIGRATION)) return;

  document.courses.forEach((course) => {
    const assessment = course.assessment ??= performanceFor(course.id, courseMeta[course.id]);
    assessment.mode = "separate";
    assessment.missions.forEach((mission) => {
      mission.voiceAudio = { ...performanceVoiceAudio[mission.id] };
      mission.locked ??= false;
      mission.lockMessage ??= "이 수행평가는 아직 공개되지 않았습니다.";
    });
  });

  document.appliedMigrations = [...(document.appliedMigrations ?? []), PERFORMANCE_PRESENTATION_MIGRATION];
}

const obsoleteAssessmentArtworkIds = new Set([
  "assessment-art-korean-history-20260720",
  "assessment-art-collector-20260720",
  "assessment-art-ruler-20260720",
  "assessment-art-overview-20260724",
  "assessment-art-collector-20260724",
  "assessment-art-ruler-20260724",
]);

function replaceAssessmentArtwork(elements: PortalCustomElement[], artwork: PortalCustomElement) {
  const retained = elements.filter((element) => !obsoleteAssessmentArtworkIds.has(element.id));
  elements.splice(0, elements.length, artwork, ...retained);
}

function applyPerformanceMedia(document: PortalDocument) {
  if (document.appliedMigrations?.includes(PERFORMANCE_MEDIA_MIGRATION)) return;

  document.courses.forEach((course) => {
    const assessment = course.assessment ??= performanceFor(course.id, courseMeta[course.id]);
    replaceAssessmentArtwork(assessment.elements ??= [], assessmentArtwork.overview);
    assessment.missions.forEach((mission) => {
      replaceAssessmentArtwork(
        mission.elements ??= [],
        mission.id === "collector" ? assessmentArtwork.collector : assessmentArtwork.ruler,
      );
      mission.voiceAudio = { ...performanceVoiceAudio[mission.id] };
      delete (mission as PerformanceMission & { voicePlaybackRate?: number }).voicePlaybackRate;
    });
  });

  document.appliedMigrations = [...(document.appliedMigrations ?? []), PERFORMANCE_MEDIA_MIGRATION];
}

export function createDefaultPortal(koreanHistoryOneStory?: StoryDocument): PortalDocument {
  const data = topicSource as TopicSource;
  return {
    schemaVersion: 2,
    site: {
      eyebrow: "중앙기록실 시간선관리국",
      title: "크로노 코어",
      subtitle: "CHRONO NEXUS",
      description: "기억을 복원하고, 현재를 이해하며, 미래를 설계하라.",
      entryLabel: "크로노 코어 입장",
      footer: "교과 학습 85~90% · 서사적 게임 장치 10~15% 이하",
    },
    catalog: {
      eyebrow: "SELECT TIMELINE",
      title: "과목 선택",
      intro: "수강하는 과목의 시간선을 선택하세요.",
    },
    courses: Object.keys(courseMeta).map((id) => {
      const meta = courseMeta[id];
      return {
        id,
        ...meta,
        locked: false,
        lockMessage,
        menu: {
          prologue: { title: "프롤로그", description: "시간선과 탐사 임무를 확인합니다." },
          guide: { title: "수업·평가 안내", description: "기억 복원 로그와 다이스 운영 원칙을 확인합니다." },
          topics: { title: "시간선 탐사 출발", description: `${data[id]?.topics.length ?? 0}개의 주제 중 오늘의 탐사를 선택합니다.` },
          assessment: { title: "수행평가", description: "기억 보존 임무와 시간선 역설계 임무를 확인합니다." },
          epilogue: { title: "에필로그", description: "복원된 시간선의 결말을 확인합니다.", lockedDescription: "모든 핵심 시간선의 복원이 끝난 뒤 공개됩니다." },
        },
        topicsPage: {
          eyebrow: "SELECT MISSION",
          title: "주제 선택",
          intro: meta.subtitle,
          searchLabel: "시간선 검색",
          searchPlaceholder: "주제명 검색",
        },
        prologue: id === "korean-history-1" ? (koreanHistoryOneStory ?? cloneDefaultStory()) : fullPrologue(id, meta),
        prologueLocked: false,
        guide: guideFor(meta),
        guideLocked: false,
        topicsLocked: false,
        assessment: performanceFor(id, meta),
        assessmentLocked: false,
        epilogue: epilogueFor(id, meta),
        epilogueLocked: true,
        topics: (data[id]?.topics ?? []).map(makeTopic),
      };
    }),
  };
}

function replaceLexicalMiddleDots(text: string): string {
  const preservedEvents = text.replace(/아시아·태평양(?=\s*전쟁)/g, "아시아\uE000태평양");
  return preservedEvents.replace(/[·⋅]/g, (mark, offset, source) => {
    const before = source[offset - 1] ?? "";
    const after = source[offset + 1] ?? "";
    if (/\s/.test(before) || /\s/.test(after)) return mark;
    if (/\d/.test(before) && /\d/.test(after)) return mark;
    return ", ";
  }).replace(/\uE000/g, "·");
}

function normalizeLexicalMiddleDots(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (typeof item === "string") value[index] = replaceLexicalMiddleDots(item);
      else normalizeLexicalMiddleDots(item);
    });
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  Object.keys(record).forEach((key) => {
    const item = record[key];
    if (typeof item === "string") record[key] = replaceLexicalMiddleDots(item);
    else normalizeLexicalMiddleDots(item);
  });
}

export function normalizePortalDocument(document: PortalDocument): PortalDocument {
  const next = clonePortal(document);
  next.site.elements ??= [];
  next.site.styles ??= {};
  next.catalog ??= {
    eyebrow: "SELECT TIMELINE",
    title: "과목 선택",
    intro: "수강하는 과목의 시간선을 선택하세요.",
  };
  next.catalog.elements ??= [];
  next.catalog.styles ??= {};
  applyPublisherConfig(next);
  applyPublisherTextbooks(next);
  applyTopicExplorations(next);
  next.courses.forEach((course) => {
    if (course.id !== "korean-history-1" && coursePrologueConfig[course.id] && (
      !course.prologue?.chapters?.length ||
      (course.prologue.chapters.length === 1 && course.prologue.chapters[0]?.id === "course-prologue")
    )) {
      course.prologue = fullPrologue(course.id, courseMeta[course.id]);
    }
    course.elements ??= [];
    course.styles ??= {};
    course.menu ??= {
      prologue: { title: "프롤로그", description: "시간선과 탐사 임무를 확인합니다." },
      guide: { title: "수업·평가 안내", description: "기억 복원 로그와 다이스 운영 원칙을 확인합니다." },
      topics: { title: "시간선 탐사 출발", description: `${course.topics.length}개의 주제 중 오늘의 탐사를 선택합니다.` },
      assessment: { title: "수행평가", description: "기억 보존 임무와 시간선 역설계 임무를 확인합니다." },
      epilogue: { title: "에필로그", description: "복원된 시간선의 결말을 확인합니다.", lockedDescription: "모든 핵심 시간선의 복원이 끝난 뒤 공개됩니다." },
    };
    course.menu.assessment ??= { title: "수행평가", description: "기억 보존 임무와 시간선 역설계 임무를 확인합니다." };
    course.topicsPage ??= {
      eyebrow: "SELECT MISSION",
      title: "주제 선택",
      intro: course.subtitle,
      searchLabel: "시간선 검색",
      searchPlaceholder: "주제명 검색",
    };
    course.topicsPage.elements ??= [];
    course.topicsPage.styles ??= {};
    course.assessment ??= performanceFor(course.id, courseMeta[course.id]);
    course.assessmentLocked ??= false;
    course.assessment.elements ??= [];
    course.assessment.styles ??= {};
    course.assessment.missions.forEach((mission) => {
      mission.elements ??= [];
      mission.styles ??= {};
      mission.links ??= [];
      mission.locked ??= false;
      mission.lockMessage ??= "이 수행평가는 아직 공개되지 않았습니다.";
      mission.requireVoiceBeforeLinks ??= true;
      delete (mission as PerformanceMission & { voicePlaybackRate?: number }).voicePlaybackRate;
    });
    [course.guide, course.epilogue].forEach((page) => {
      page.elements ??= [];
      page.styles ??= {};
      page.returnLabel ??= "과목 메인으로 돌아가기";
      page.sections.forEach((section) => {
        section.elements ??= [];
        section.styles ??= {};
      });
    });
    course.topics.forEach((topic) => {
      topic.beforeLog.diceEyebrow ??= "DICE CONSOLE";
      topic.beforeLog.diceTitle ??= "점검자 호출 절차 개시";
      topic.beforeLog.diceDescription ??= "무기억자의 잔존 사념을 추적할 점검자가 필요합니다. 다이스를 굴려 오늘의 점검자를 호출합니다.";
      topic.beforeLog.residualEyebrow ??= "OBLIVION RESIDUE";
      topic.beforeLog.residualTitle ??= "무기억자의 잔존 사념";
      topic.beforeLog.residualDescription ??= "다이스로 이상 유형을 확인하고 기록 복원을 시작하십시오.";
      [topic.explore, topic.beforeLog, topic.afterLog].forEach((region) => {
        region.elements ??= [];
        region.styles ??= {};
      });
      topic.beforeLog.residuals.forEach((residual) => {
        residual.elements ??= [];
        residual.styles ??= {};
      });
    });
  });
  applyEntryAndGuideArtwork(next);
  applyAssessmentAndEpilogueContent(next);
  applyPerformancePresentation(next);
  applyPerformanceMedia(next);
  applyBeforeLogContent(next);
  applySixthResidual(next);
  next.courses.forEach((course) => {
    const config = publisherConfig[course.id];
    if (!config) return;
    course.publisherOptions = config.options.map((option) => ({ ...option }));
    course.publisher ??= config.active;
    if (config.options.length > 1) {
      course.publisherTopicSets ??= {};
      course.publisherTopicSets[course.publisher] = cloneValue(course.topics);
    }
  });
  normalizeLexicalMiddleDots(next);
  return next;
}

export function clonePortal(document: PortalDocument): PortalDocument {
  return JSON.parse(JSON.stringify(document)) as PortalDocument;
}
