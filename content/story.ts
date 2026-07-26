export type StoryImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
  portrait?: boolean;
  compact?: boolean;
  displayWidth?: number;
  maxWidth?: number;
  alignment?: "left" | "center" | "right";
  borderRadius?: number;
  objectFit?: "contain" | "cover";
};

export type TextItem = { title?: string; text: string };

export type EditableBlockStyle = {
  fontSize?: number;
  mobileFontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  fontWeight?: number;
  lineHeight?: number;
  maxWidth?: number;
  marginTop?: number;
  marginBottom?: number;
  padding?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
};

export type StoryDesign = {
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  secondaryAccentColor: string;
  heroTitleSize: number;
  heroTitleMobileSize: number;
  heroKickerSize: number;
  heroKickerMobileSize: number;
  chapterTitleSize: number;
  chapterTitleMobileSize: number;
  subheadingSize: number;
  subheadingMobileSize: number;
  blockTitleSize: number;
  blockTitleMobileSize: number;
  bodySize: number;
  bodyMobileSize: number;
  pullQuoteSize: number;
  pullQuoteMobileSize: number;
  accentLabelSize: number;
  accentLabelMobileSize: number;
  cardTitleSize: number;
  cardTitleMobileSize: number;
  cardBodySize: number;
  cardBodyMobileSize: number;
  quoteSize: number;
  quoteMobileSize: number;
  contentWidth: number;
  wideContentWidth: number;
  imageMaxWidth: number;
  chapterPadding: number;
  chapterPaddingMobile: number;
};

export const defaultStoryDesign: StoryDesign = {
  backgroundColor: "#07080b",
  textColor: "#e8e6df",
  mutedTextColor: "#aaaeb6",
  accentColor: "#6ad8ff",
  secondaryAccentColor: "#8d6bff",
  heroTitleSize: 124,
  heroTitleMobileSize: 58,
  heroKickerSize: 29,
  heroKickerMobileSize: 18,
  chapterTitleSize: 82,
  chapterTitleMobileSize: 46,
  subheadingSize: 68,
  subheadingMobileSize: 38,
  blockTitleSize: 48,
  blockTitleMobileSize: 30,
  bodySize: 21,
  bodyMobileSize: 18,
  pullQuoteSize: 52,
  pullQuoteMobileSize: 28,
  accentLabelSize: 20,
  accentLabelMobileSize: 16,
  cardTitleSize: 31,
  cardTitleMobileSize: 23,
  cardBodySize: 18,
  cardBodyMobileSize: 17,
  quoteSize: 27,
  quoteMobileSize: 19,
  contentWidth: 680,
  wideContentWidth: 920,
  imageMaxWidth: 1180,
  chapterPadding: 190,
  chapterPaddingMobile: 112,
};

export type StoryBlock = (
  | { id: string; type: "heading"; text: string }
  | { id: string; type: "subheading"; text: string }
  | { id: string; type: "pullQuote"; text: string; small?: boolean }
  | { id: string; type: "prose"; paragraphs: string[]; emphasis?: boolean }
  | { id: string; type: "image"; image: StoryImageAsset }
  | { id: string; type: "quote"; variant: "transmission" | "guardian" | "enemy"; paragraphs: string[] }
  | { id: string; type: "principles"; title: string; items: TextItem[] }
  | { id: string; type: "stages"; items: Required<TextItem>[] }
  | { id: string; type: "divider" }
  | { id: string; type: "questions"; items: Required<TextItem>[] }
  | { id: string; type: "rank"; items: Required<TextItem>[] }
  | { id: string; type: "grandQuestion"; text: string }
  | { id: string; type: "areas"; title: string; intro: string[]; image?: StoryImageAsset; guide: string; items: string[] }
  | { id: string; type: "finalTransmission"; paragraphs: string[]; finalParagraph: string }
  | { id: string; type: "returnLink"; text: string }
) & { style?: EditableBlockStyle };

export type StoryChapter = {
  id: string;
  title: string;
  theme: "default" | "dark" | "threat" | "restoration" | "mission" | "gate" | "final";
  style?: {
    title?: EditableBlockStyle;
    backgroundColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
  };
  blocks: StoryBlock[];
};

export type StoryDocument = {
  schemaVersion: 1;
  design?: StoryDesign;
  hero: {
    season: string;
    agency: string;
    series: string;
    title: string;
    kicker: string;
    copy: string;
    cta: string;
    image: StoryImageAsset;
  };
  chapters: StoryChapter[];
};

const image = (
  scene: number,
  alt: string,
  width: number,
  height: number,
  options: Pick<StoryImageAsset, "portrait" | "compact"> = {},
): StoryImageAsset => ({
  src: `/illustrations/scene-${String(scene).padStart(2, "0")}.png?v=20260716-4`,
  alt,
  width,
  height,
  ...options,
});

export const defaultStoryDocument: StoryDocument = {
  schemaVersion: 1,
  design: { ...defaultStoryDesign },
  hero: {
    season: "SEASON 1 · 전편",
    agency: "중앙기록실 시간선관리국 ·",
    series: "CHRONO NEXUS · 한국사1",
    title: "크로노 넥서스",
    kicker: "【한국사1】한반도 시간선의 형성",
    copy: "기억을 복원하고, 현재를 이해하며, 미래를 설계하라.",
    cta: "시간의 관문을 개방한다",
    image: image(1, "한반도의 시간선 앞에 선 세 명의 시간선 탐사자", 1003, 1568, { portrait: true }),
  },
  chapters: [
    {
      id: "prologue",
      title: "PROLOGUE\n: 시간의 관문이 열린 순간",
      theme: "default",
      blocks: [
        { id: "prologue-quote", type: "pullQuote", text: "역사는 이름과 연도의 목록이 아니라,\n원인과 선택과 결과가 이어진 하나의 시간선이다." },
        { id: "prologue-p1", type: "prose", paragraphs: ["발밑에는 수많은 시간선이 겹쳐 흐르고 있었다. 이름도 연도도 모르는 장면들이 빛의 조각처럼 떠올랐다가 사라졌다. 그 한가운데, 거대한 구체가 금이 간 채 천천히 회전하고 있었다. 크로노 코어였다."] },
        { id: "scene-2", type: "image", image: image(2, "균열이 발생한 크로노 코어", 1672, 941) },
        { id: "prologue-p2", type: "prose", paragraphs: [
          "인류가 남긴 모든 역사는 거대한 기록 장치인 크로노 코어에 보존되어 있다. 코어가 지키는 것은 사건의 이름과 연도만이 아니다. 어떤 일이 왜 일어났는지, 사람들은 어떤 상황에서 무엇을 선택했는지, 그 선택이 이후의 사회에 어떤 변화를 가져왔는지까지 함께 기록된다.",
          "서로 다른 지역과 시대의 역사는 코어 안에서 하나의 거대한 시간선으로 연결된다. 과거의 경험은 현재의 판단을 돕고, 현재의 선택은 아직 만들어지지 않은 미래로 이어진다. 그러나 알 수 없는 균열이 발생한 뒤 사실은 남았지만 사건의 원인과 결과가 끊어졌다. 과거의 기억은 현재와 분리되었고, 여러 시대와 공간의 기억이 뒤섞인 왜곡된 시간지대가 태어났다. 그곳이 크로노 넥서스다.",
        ] },
        { id: "guardian-title", type: "subheading", text: "기억의 수호자" },
        { id: "guardian-quote", type: "pullQuote", small: true, text: "수호자는 정답을 말하는 존재가 아니라,\n당신이 스스로 기록을 해석하도록 돕는 안내자다." },
        { id: "guardian-transmission", type: "quote", variant: "transmission", paragraphs: [
          "시간선 탐사자들에게 알린다. 크로노 코어에서 새로운 균열이 발견되었다.",
          "사건의 이름은 남아 있지만 그 이유와 의미가 사라지고 있다.",
        ] },
        { id: "guardian-p1", type: "prose", paragraphs: [
          "목소리의 주인은 기억의 수호자였다. 기억의 수호자는 크로노 코어의 붕괴를 막기 위해 자신의 존재를 중앙기록실에 결박했다. 수호자가 기록실을 떠나면 코어를 지탱하는 힘이 사라지고 남은 시간선마저 무너질 수 있다. 더군다나 이미 결과를 아는 존재가 답을 고정하면 역사가 하나의 판단에 갇히는 ‘기억의 독재’가 시작되기에, 수호자는 탐사자를 대신해 판단할 수도 없다.",
          "당신에게 주어진 역할은 분명하다. 남아 있는 사실을 확인하고, 끊어진 원인과 선택, 그리고 그 결과를 다시 연결하며, 복원된 과거가 현재에 보내는 신호를 찾는 것.",
        ] },
        { id: "scene-3", type: "image", image: image(3, "시간선 탐사자들과 마주한 기억의 수호자", 1672, 941) },
        { id: "guardian-callout", type: "quote", variant: "guardian", paragraphs: [
          "너희가 처음 진입할 시간선은, 너희가 살아가는 지역 세계, 동아시아의 역사다.",
          "선택은 너희의 몫이다. 나는 길을 보여 줄 뿐, 그 길을 걷는 이는 너희다.",
        ] },
      ],
    },
    {
      id: "oblivion",
      title: "무기억자와 두 현현체",
      theme: "threat",
      blocks: [
        { id: "oblivion-quote", type: "pullQuote", text: "무기억자는 역사를 지우지 않는다.\n사람들이 역사에 관해 생각하지 못하게 만든다." },
        { id: "oblivion-p1", type: "prose", paragraphs: ["크로노 코어의 균열 뒤에는 무기억자[無記憶者]가 있었다. 그것은 특정한 장소에 숨어 있는 하나의 적이 아니다. 과거의 의미를 잊고 질문을 멈추는 곳이라면 어느 시대와 장소에서든 보이지 않는 곳에서 힘을 드러낸다."] },
        { id: "scene-4", type: "image", image: image(4, "무기억자의 현현체", 1672, 941) },
        { id: "oblivion-voice", type: "quote", variant: "enemy", paragraphs: [
          "이름과 연도만 남으면 충분하다.",
          "이유를 묻지 말라. 다른 가능성을 상상하지 말라.",
          "과거는 이미 끝났으며 현재와는 아무런 관계가 없다.",
        ] },
        { id: "oblivion-p2", type: "prose", paragraphs: ["무기억자는 다양한 현현체[顯現體]로 모습을 드러낸다. 그중 하나인 망각의 수집가는 중요한 기억의 의미와 가치를 빼앗고, 또 다른 하나인 단절의 지배자는 과거와 현재와 미래의 연결을 끊는다. 이들은 단 하나뿐인 개체가 아니라 각 시간선의 균열에서 반복하여 나타나는 무기억자 그 자체의 존재이다."] },
      ],
    },
    {
      id: "explorer",
      title: "시간선 탐사자의 규칙",
      theme: "dark",
      blocks: [
        { id: "explorer-quote", type: "pullQuote", text: "당신은 답을 외우기 위해서가 아닌, 끊어진 기억을 연결하기 위해 소집되었다." },
        { id: "explorer-p1", type: "prose", paragraphs: [
          "시간선 탐사자는 아직 하나의 해석이나 관점에 고정되지 않았기 때문에 여러 시대와 인물의 입장을 살펴볼 수 있다. 탐사자는 역사적 사실을 확인하고, 낯선 기록을 해독하며, 과거와 현재 사이의 연결을 발견한다.",
          "사건의 이름만 되찾는 것은 승리가 아니다. 그 사건 속 사람들이 어떤 조건에서 무엇을 선택했고, 그 선택이 어떤 결과를 남겼는지 설명할 수 있어야 한다. 또한 하나의 관점으로 모든 사람의 경험을 대신하지 않아야 한다.",
        ] },
        { id: "scene-5", type: "image", image: image(5, "기록을 해석하는 시간선 탐사자들", 1672, 941) },
        { id: "explorer-closing", type: "prose", emphasis: true, paragraphs: ["사실은 출발점이다. 원인과 선택과 결과가 연결되어야 기억이 복원된다."] },
        { id: "principles", type: "principles", title: "탐사의 다섯 원칙", items: [
          { text: "무엇이 사실인지 확인한다." },
          { text: "왜 그런 일이 일어났는지 이해한다." },
          { text: "서로 다른 사람들의 관점을 살펴본다." },
          { text: "과거가 현재와 어떻게 연결되는지 질문한다." },
          { text: "과거의 경험을 토대로 미래의 선택을 고민한다." },
        ] },
      ],
    },
    {
      id: "restoration",
      title: "기억 복원의 세 단계",
      theme: "restoration",
      blocks: [
        { id: "restoration-quote", type: "pullQuote", text: "복원은 사실을 바로잡는 데서 시작해 기록의 의미를 읽고,\n마침내 현재에 닿는 신호를 찾는 과정이다." },
        { id: "stages", type: "stages", items: [
          { title: "1단계. 사실 복원", text: "시간선에 남은 기록을 서로 확인하여 잘못된 사실과 개념을 바로잡는다. 사실이 부정확하면 사건의 의미와 현재와의 연결도 올바르게 판단하기 어렵다." },
          { title: "2단계. 기록 해독", text: "낯선 단어와 제도, 사상과 관습을 당시의 맥락 안에서 해석한다. 기록의 언어를 자신의 말로 설명할 수 있을 때 사건의 의미가 모습을 드러낸다." },
          { title: "3단계. 현재 공명", text: "복원된 과거가 현재에 보내는 신호를 찾는다. 공명은 정답이 아니라 질문으로 나타난다. 과거와 현재를 억지로 같다고 하지 않고, 이어진 점과 달라진 점을 함께 살핀다." },
        ] },
        { id: "scene-6", type: "image", image: image(6, "과거와 현재의 연결을 추적하는 시간선 탐사자들", 1672, 941) },
        { id: "restoration-p1", type: "prose", paragraphs: ["탐사자가 확인한 사실, 해독한 의미, 현재와 이어지는 질문은 기억 복원 로그에 남는다. 로그는 단순한 요약이 아니라 이후 망각의 수집가와 단절의 지배자에 맞설 때 다시 꺼내 보는 탐사 기록이다."] },
      ],
    },
    {
      id: "missions",
      title: "망각의 수집가\n: 기억 보존 임무",
      theme: "mission",
      blocks: [
        { id: "collector-quote", type: "pullQuote", text: "무기억자는 기억의 가치를 빼앗으려 한다." },
        { id: "collector-p1", type: "prose", paragraphs: ["무기억자는 사람들이 과거의 중요성을 판단하지 못하게 하고자 자신의 힘을 ‘망각의 수집가’라는 형태로 드러낸다. 망각의 수집가는 중요한 역사적 기억만을 골라 그 의미와 가치를 빼앗아 간다. 사건의 이름과 사실은 남아 있지만, 사람들이 그 과거를 왜 기억해야 하는지는 알 수 없게 된다. 망각의 수집가는 사람들에게 말한다."] },
        { id: "scene-7", type: "image", image: image(7, "수많은 기억을 거두어들이는 망각의 수집가", 1916, 821) },
        { id: "collector-voice", type: "quote", variant: "enemy", paragraphs: [
          "수많은 과거 가운데 무엇이 중요한지 어떻게 알 수 있는가?",
          "결국 모든 사건은 시간이 지나면 잊히게 될 것이다.",
        ] },
        { id: "collector-p2", type: "prose", paragraphs: ["시간선 탐사자는 오늘날에도 기억할 가치가 있다고 생각하는 역사적 요소에 대해 그 등장 배경, 발생 원인, 전개 과정, 결과, 당시 사회에서 지닌 역사적 의미, 오늘날에도 기억해야 하는 이유 등을 분석한다. 임무를 완료하면 시간선 탐사자가 선택한 역사적 요소는 기억의 핵으로 보존된다. 기억의 핵은 단순한 지식이 아니라 시간선 탐사자 스스로 중요하다고 판단하고 그 가치를 설명할 수 있는 역사적 기억이다."] },
        { id: "mission-divider", type: "divider" },
        { id: "severance-title", type: "heading", text: "단절의 지배자\n: 시간선 역설계 임무" },
        { id: "severance-quote", type: "pullQuote", text: "무기억자는 되찾은 기억을 과거에 가두려 한다." },
        { id: "severance-p1", type: "prose", paragraphs: ["망각의 수집가가 물러나 중요한 기억이 되살아나자, 무기억자는 이번에는 ‘단절의 지배자’라는 형태로 힘을 드러낸다. 단절의 지배자는 복구된 기억을 다시 없애지는 않는다. 대신 그 기억을 과거 속에 가두고 현재와 미래로 이어지는 통로를 차단한다. 그 결과 사람들은 어떤 과거가 중요했다는 사실은 알면서도, 그 경험이 현재의 문제와 어떤 관련이 있으며 미래의 선택에 어떻게 활용될 수 있는지는 생각하지 못하게 된다. 단절의 지배자는 주장한다."] },
        { id: "scene-8", type: "image", image: image(8, "시간선의 연결을 끊는 단절의 지배자", 1916, 821) },
        { id: "severance-voice", type: "quote", variant: "enemy", paragraphs: [
          "과거는 이미 지나갔다.\n현재의 문제는 과거와 다르다.",
          "미래는 역사와 아무런 관계가 없다.",
        ] },
        { id: "severance-p2", type: "prose", paragraphs: ["과거와 현재는 똑같지 않다. 유사한 점과 다른 점, 이어지는 점과 달라진 점을 구분해야 한다. 그 판단을 바탕으로 미래의 방향을 고민할 때 단절된 통로가 다시 열린다. 시간선 탐사자들은 복구된 기억을 현재와 미래로 잇기 위해 세 질문을 차례로 통과한다."] },
        { id: "questions", type: "questions", items: [
          { title: "과거 시스템 해체", text: "과거의 시스템은 어떤 조건에서 어떻게 작동했는가?" },
          { title: "현재 시스템 연결", text: "과거를 통해 현재의 문제를 어떻게 새롭게 바라볼 수 있는가?" },
          { title: "미래 시스템 역설계", text: "어떤 미래를 만들 것이며, 그 미래에 도달하기 위해 지금 무엇을 해야 하는가?" },
        ] },
        { id: "scene-9", type: "image", image: image(9, "갈라진 시간선을 통과하는 시간선 탐사자들", 1672, 941) },
        { id: "severance-p3", type: "prose", paragraphs: [
          "단절의 지배자를 물리친 시간선 탐사자는 기억의 핵을 현재의 문제와 연결하고, 그 통찰을 바탕으로 미래의 방향을 설계한다. 이를 통해 해당 시간선에 발생한 균열은 일시적으로 안정된다. 그러나 이것은 무기억자의 완전한 소멸을 뜻하지 않는다. 다른 시대와 장소에는 아직 복구되지 않은 시간선이 남아 있으며, 이미 복구한 기억도 돌보지 않으면 다시 흐려질 수 있다. 그러므로 시간선 탐사자의 임무는 한 번의 승리로 끝나지 않는다.",
          "역사는 한 번 복원했다고 영원히 보존되는 것이 아니다. 새로운 기록이 발견되기도 하고, 사회가 변화하면서 과거를 바라보는 질문도 달라진다. 무엇을 기억하고 어떻게 해석할 것인지를 둘러싼 갈등도 끊임없이 발생한다. 따라서 시간선 탐사자의 임무는 완성된 역사를 지키는 것이 아니라, 계속해서 기록을 확인하고 새로운 질문을 던지며 과거와 현재, 미래 사이의 연결을 다시 세우는 것이다.",
        ] },
      ],
    },
    {
      id: "korean-history-one",
      title: "한국사1 시간선 개방",
      theme: "gate",
      blocks: [
        { id: "korean-history-quote", type: "pullQuote", text: "처음 진입할 시간선은 지금 살아가는 현재의 출발점인 한반도의 역사다." },
        { id: "scene-10", type: "image", image: image(10, "고대부터 근대의 문턱까지 이어지는 한반도의 시간선", 1672, 941) },
        { id: "rank", type: "rank", items: [
          { title: "▶ 현재 등급:", text: "견습 기억 복원자" },
          { title: "▷ 관문 완료 시 획득 칭호:", text: "초급 기억 복원자" },
        ] },
        { id: "korean-history-p1", type: "prose", paragraphs: [
          "크로노 코어의 균열로 국가와 사회가 형성된 과정은 여러 왕조와 사건의 이름만 남은 채 조각나 있었다. 정치와 경제, 사회와 문화가 서로 어떤 영향을 주고받았는지도 알 수 없게 되었다.",
          "당신은 고대 국가에서 시작하여 한반도 시간선이 근대의 문턱에 이르는 과정을 복원한다. 이 관문에서는 개별 사건의 이름을 남기는 것만으로는 부족하다. 한 사건이 어떤 배경에서 일어나 어떤 과정을 거쳐 다음 변화로 이어졌는지를 연결해야 한다.",
        ] },
        { id: "grand-question", type: "grandQuestion", text: "한반도의 국가와 사회는 어떻게 형성되고 변화하였는가?" },
        { id: "korean-history-p2", type: "prose", paragraphs: ["이 질문은 정해진 답을 요구하지 않는다. 서로 다른 기록과 관점을 확인하고, 근거를 들어 자신의 판단을 설명할 때 시간선은 다시 연결되기 시작한다."] },
        { id: "areas", type: "areas", title: "주요 탐사 영역", intro: [
          "시간선은 아래의 영역들에서 서로 이어진다.",
          "하나를 고립된 섬처럼 다루지 말라.",
        ], image: image(11, "한반도 시간선의 주요 탐사 영역을 안내하는 기억의 수호자", 1672, 941, { compact: true }), guide: "이름을 지나 원인으로, 원인을 지나 선택으로, 선택을 지나 결과와 의미로 나아가라.", items: [
          "고대 국가의 성장", "고려의 통치 체제", "조선의 성립과 발전", "조선 후기의 변화",
          "국제 관계와 대외 교류", "수취 체제와 경제생활", "신분제와 사회 구조", "다양한 사상과 문화 교류",
          "국제 질서의 변동과 개항", "근대 국가 수립을 위한 노력", "국권 침탈과 국권 수호 운동", "사회⋅경제의 변화와 문화 변동",
        ] },
      ],
    },
    {
      id: "final-transmission",
      title: "기억의 수호자가 전하는 탐사 개시 통신",
      theme: "final",
      blocks: [
        { id: "final-p1", type: "prose", paragraphs: ["시간의 관문이 열리기 직전, 중앙기록실의 마지막 통신이 도착한다."] },
        { id: "scene-12", type: "image", image: image(12, "탐사 개시 통신을 전하는 기억의 수호자", 1672, 941) },
        { id: "final-message", type: "finalTransmission", paragraphs: [
          "시간선 탐사자들에게 알린다.",
          "사실을 복원하고,\n기록의 언어를 해독하며,\n과거가 현재에 보내는 신호를 찾아라.",
          "너희가 복원해야 하는 것은 단순한 정보가 아니다.",
          "사람들의 선택과 고민, 그 선택이 남긴 결과,\n그리고 우리가 지금도 그 역사를 기억해야 하는 이유이다.",
          "역사는 이미 지나간 길이지만,\n그 길을 어떻게 기억하고 앞으로 어떤 길을 선택할지는 아직 결정되지 않았다.",
        ], finalParagraph: "시간의 관문을 개방한다.\n기억 복원 임무를 시작하라." },
        { id: "return", type: "returnLink", text: "시간선의 시작으로 ↑" },
      ],
    },
  ],
};

export function cloneDefaultStory(): StoryDocument {
  return JSON.parse(JSON.stringify(defaultStoryDocument)) as StoryDocument;
}

export function createBlock(type: StoryBlock["type"]): StoryBlock {
  const id = `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  switch (type) {
    case "heading": return { id, type, text: "새 제목" };
    case "subheading": return { id, type, text: "새 소제목" };
    case "pullQuote": return { id, type, text: "강조할 문장을 입력하세요." };
    case "prose": return { id, type, paragraphs: ["새 본문을 입력하세요."] };
    case "image": return { id, type, image: { src: "/illustrations/scene-02.png?v=20260716-4", alt: "삽화 설명", width: 1672, height: 941 } };
    case "quote": return { id, type, variant: "transmission", paragraphs: ["인용문을 입력하세요."] };
    case "principles": return { id, type, title: "목록 제목", items: [{ text: "새 항목" }] };
    case "stages": return { id, type, items: [{ title: "단계 제목", text: "단계 설명" }] };
    case "divider": return { id, type };
    case "questions": return { id, type, items: [{ title: "질문 제목", text: "질문 내용" }] };
    case "rank": return { id, type, items: [{ title: "항목", text: "내용" }] };
    case "grandQuestion": return { id, type, text: "핵심 질문을 입력하세요." };
    case "areas": return { id, type, title: "목록 제목", intro: ["목록 안내"], guide: "마무리 안내", items: ["새 항목"] };
    case "finalTransmission": return { id, type, paragraphs: ["마지막 통신을 입력하세요."], finalParagraph: "임무를 시작하라." };
    case "returnLink": return { id, type, text: "시간선의 시작으로 ↑" };
  }
}
