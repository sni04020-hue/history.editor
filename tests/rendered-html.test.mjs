import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("contains source-based exploration content for every publisher topic", async () => {
  const source = JSON.parse(
    await readFile(
      new URL("../content/publisher-topic-explorations.json", import.meta.url),
      "utf8",
    ),
  );
  const combinations = Object.values(source).flatMap((publishers) =>
    Object.values(publishers),
  );
  const rows = combinations.flat();

  assert.equal(combinations.length, 13);
  assert.equal(rows.length, 485);
  assert.equal(
    rows.some(
      (row) =>
        row.mission ===
        "교과서·사료·지도·질문을 통해 사실과 맥락을 확인합니다.",
    ),
    false,
  );
  assert.equal(
    rows.every(
      (row) =>
        row.mission.trim().length > 0 &&
        row.questions.length > 0 &&
        row.questions.every((question) => question.trim().endsWith("?")),
    ),
    true,
  );

  const model = source["korean-history-2"].haenaem[16];
  assert.equal(
    model.mission,
    "1950년대 남북한 정부의 권력 집중 과정을 비교할 수 있다.",
  );
  assert.deepEqual(model.questions, [
    "장기 집권을 위한 이승만 정부의 헌법 개정은 어떻게 이루어졌는가?",
    "이승만 정부는 반공주의를 어떻게 민주주의 억압에 이용하였는가?",
    "북한은 사회주의 독재 체제를 어떻게 강화하였는가?",
  ]);
});

test("renders development preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /entry-chrono-core\.png\?v=20260720-1/);
});

test("renders every guide illustration on a subject guide page", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("guide-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/course/korean-history-1/guide", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  for (const filename of [
    "guide-overview.png",
    "guide-memory-restoration.png",
    "guide-forgetting-collector.png",
    "guide-disconnection-ruler.png",
    "guide-future-design.png",
  ]) {
    assert.match(html, new RegExp(`${filename.replace(".", "\\.")}\\?v=20260720-1`));
  }
});

test("renders the performance menu and both editable assessment missions", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("assessment-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = {
    ASSETS: {
      fetch: async () => new Response("Not found", { status: 404 }),
    },
  };
  const context = { waitUntil() {}, passThroughOnException() {} };

  const courseResponse = await worker.fetch(new Request("http://localhost/course/korean-history-1", { headers: { accept: "text/html" } }), env, context);
  assert.equal(courseResponse.status, 200);
  assert.match(await courseResponse.text(), /수행평가/);

  const assessmentResponse = await worker.fetch(new Request("http://localhost/course/korean-history-1/assessment", { headers: { accept: "text/html" } }), env, context);
  assert.equal(assessmentResponse.status, 200);
  const html = await assessmentResponse.text();
  assert.match(html, /망각의 수집가/);
  assert.match(html, /기억 보존 임무/);
  assert.match(html, /단절의 지배자/);
  assert.match(html, /시간선 역설계/);
  assert.match(html, /진행할 수행평가를 선택하면 임무 안내와 작성 링크가 열립니다/);
  assert.match(html, /assessment-overview-20260724\.jpg\?v=20260724-2/);
  assert.match(html, /assessment-collector-20260724\.jpg\?v=20260724-2/);
  assert.match(html, /assessment-ruler-20260724\.jpg\?v=20260724-2/);
  assert.match(html, /forgetting-collector-20260724\.mp3\?v=20260724-2/);
  assert.match(html, /disconnection-ruler-20260724\.mp3\?v=20260724-2/);
  assert.doesNotMatch(html, /재생 속도|playback-rate/);
});

test("renders elective assessments as a choice before opening either mission", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("elective-assessment-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/course/world-history/assessment", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /망각의 수집가/);
  assert.match(html, /단절의 지배자/);
  assert.match(html, /진행할 수행평가를 선택하면 임무 안내와 작성 링크가 열립니다/);
  assert.match(html, /assessment-overview-20260724\.jpg\?v=20260724-2/);
  assert.match(html, /assessment-collector-20260724\.jpg\?v=20260724-2/);
  assert.match(html, /assessment-ruler-20260724\.jpg\?v=20260724-2/);
});

test("renders the editable six-type oblivion residue briefing", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("before-log-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/course/world-history/topic/topic-01/log-before", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /\[경고\] 무기억자의 잔존 사념 감지/);
  assert.match(html, /점검자 호출 절차 개시/);
  assert.match(html, /다이스로 이상 유형을 확인하고 기록 복원을 시작하십시오/);
  for (const label of ["사실 왜곡", "인과 단절", "기록 훼손", "과정 혼돈", "대응 혼선", "사념 전이"]) assert.match(html, new RegExp(label));
  assert.match(html, /왜곡된 사실을 정정하십시오/);
  assert.match(html, /단절된 원인과 결과를 연결하십시오/);
  assert.match(html, /관련 있는 항목끼리 바르게 연결하십시오/);
  assert.match(html, /무기억자의 잔존 사념이 다른 탐사자에게로 전이되었습니다/);
});

test("renders the selected textbook publisher and Visang East Asian History Journey topics", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("publisher-test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  const env = { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
  const context = { waitUntil() {}, passThroughOnException() {} };

  const eastAsianResponse = await worker.fetch(
    new Request("http://localhost/course/east-asian-history-journey/topics", { headers: { accept: "text/html" } }),
    env,
    context,
  );
  assert.equal(eastAsianResponse.status, 200);
  const eastAsianHtml = await eastAsianResponse.text();
  assert.match(eastAsianHtml, /교과서 출판사:\s*(?:<!-- -->)?비상/);
  assert.match(eastAsianHtml, /28(?:<!-- -->)? TIMELINES/);
  assert.match(eastAsianHtml, /주제 01 역사 기행과 역사 탐구/);
  assert.match(eastAsianHtml, /교과서 (?:<!-- -->)?8(?:<!-- -->)?쪽부터/);
  assert.match(eastAsianHtml, /주제 28 동아시아의 기후, 환경 문제/);

  const visangSource = JSON.parse(await readFile(new URL("../content/visang-east-asian-topics.json", import.meta.url), "utf8"));
  assert.equal(visangSource.topics.length, 28);
  assert.equal(visangSource.topics.at(-1).page, 170);

  const koreanHistoryResponse = await worker.fetch(
    new Request("http://localhost/course/korean-history-1/topics", { headers: { accept: "text/html" } }),
    env,
    context,
  );
  assert.equal(koreanHistoryResponse.status, 200);
  assert.match(await koreanHistoryResponse.text(), /교과서 출판사:\s*(?:<!-- -->)?해냄에듀/);

  const worldHistoryResponse = await worker.fetch(
    new Request("http://localhost/course/world-history/topics", { headers: { accept: "text/html" } }),
    env,
    context,
  );
  assert.equal(worldHistoryResponse.status, 200);
  assert.match(await worldHistoryResponse.text(), /교과서 출판사:\s*(?:<!-- -->)?미래엔/);
});

test("preserves repeated spaces in an oblivion residue answer blank", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /\.portal-styled-text\s*\{[^}]*white-space:\s*break-spaces;/s);
  assert.match(css, /\.portal-custom-text\s*\{[^}]*white-space:\s*break-spaces;/s);
  assert.match(css, /\.residual-reveal\s*>\s*div\s*\{[^}]*white-space:\s*break-spaces;/s);
});

test("includes every supplied publisher textbook topic set", async () => {
  const sources = JSON.parse(await readFile(new URL("../content/publisher-textbook-topics.json", import.meta.url), "utf8"));

  assert.equal(sources["korean-history-1"].miraen.topics.length, 46);
  assert.equal(sources["korean-history-1"].visang.topics.length, 40);
  assert.equal(sources["korean-history-2"].miraen.topics.length, 40);
  assert.equal(sources["korean-history-2"].visang.topics.length, 42);
  assert.equal(sources["world-history"].visang.topics.length, 41);
  assert.equal(sources["modern-world-history"].visang.topics.length, 28);
  assert.equal(sources["modern-world-history"].haenaem.topics.length, 42);

  assert.equal(sources["korean-history-2"].visang.topics[7].title, "3·1 운동을 전개하다");
  assert.equal(sources["modern-world-history"].haenaem.topics.at(-1).page, 194);
});
