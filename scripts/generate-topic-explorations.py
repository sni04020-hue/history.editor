#!/usr/bin/env python3
"""Build publisher-specific exploration missions and questions from official guides."""

from __future__ import annotations

import json
import re
import sys
from collections import OrderedDict
from pathlib import Path


REPO = Path(__file__).resolve().parents[1]
GUIDE_TEXT_ROOT = Path("/tmp/chrono-topic-enrichment-20260725.dWSTtC/text")
VISANG_TEXTBOOK_ROOT = Path("/tmp/chrono-books-20260725")
OUTPUT = REPO / "content" / "publisher-topic-explorations.json"

BASE_PUBLISHERS = {
    "korean-history-1": "haenaem",
    "korean-history-2": "haenaem",
    "world-history": "miraen",
    "east-asian-history-journey": "miraen",
    "modern-world-history": "miraen",
}

GUIDES = {
    ("korean-history-1", "haenaem"): "[지도서] 한국사1_BOOK1 자료편.txt",
    ("korean-history-2", "haenaem"): "[지도서] 한국사2_BOOK1_자료편.txt",
    ("korean-history-1", "miraen"): "미래엔_22개정 한국사1_지도서.txt",
    ("korean-history-2", "miraen"): "미래엔_22개정 한국사2_지도서.txt",
    ("world-history", "miraen"): "미래엔_세계사_지도서.txt",
    ("world-history", "visang"): "[비상교육] 고등_세계사(이병인)_지도서.txt",
    ("east-asian-history-journey", "miraen"): "미래엔_고등_동아시아 역사 기행_지도서.txt",
    ("east-asian-history-journey", "visang"): "[비상교육] 고등_동아시아 역사 기행(이병인)_지도서.txt",
    ("modern-world-history", "miraen"): "[지도서] 미래엔_22개정_역사로 탐구하는 현대 세계.txt",
    ("modern-world-history", "visang"): "[비상교육] 고등_역사로 탐구하는 현대 세계(김태훈)_지도서.txt",
}

HAENAEM_GUIDE_COUNTS = {
    ("korean-history-1", "haenaem"): 31,
    ("korean-history-2", "haenaem"): 30,
}

VISANG_KOREAN_TEXTBOOKS = {
    ("korean-history-1", "visang"): VISANG_TEXTBOOK_ROOT / "visang-kh1-full.txt",
    ("korean-history-2", "visang"): VISANG_TEXTBOOK_ROOT / "visang-kh2-full.txt",
}

OCR_FIXES = {
    "일제가시행한‘문화정치’의실상을파악하고,민족분열정책을비판할수있다.":
        "일제가 시행한 ‘문화 정치’의 실상을 파악하고, 민족 분열 정책을 비판할 수 있다.",
    "일제의민족말살통치가우리민족의삶에끼친영향을파악할수있다.":
        "일제의 민족 말살 통치가 우리 민족의 삶에 끼친 영향을 파악할 수 있다.",
    "1930년대이후중국관내에서전개된독립운동을설명할수있다.":
        "1930년대 이후 중국 관내에서 전개된 독립운동을 설명할 수 있다.",
    "국내외독립운동세력의건국준비활동을설명할수있다.":
        "국내외 독립운동 세력의 건국 준비 활동을 설명할 수 있다.",
    "6·25전쟁의피해복구노력과전후달라진사회,문화의모습을조사할수있다.":
        "6·25 전쟁의 피해 복구 노력과 전후 달라진 사회, 문화의 모습을 조사할 수 있다.",
}


def read_json(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle, object_pairs_hook=OrderedDict)


def normalize_line(value: str) -> str:
    value = re.sub(r"[\x00-\x1f\x7f]", " ", value).replace("\ufeff", " ")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_middle_dots(value: str) -> str:
    value = re.sub(r"(?<!\d)·|·(?!\d)", ", ", value)
    value = re.sub(r"\s*,\s*", ", ", value)
    value = re.sub(r",\s*,", ",", value)
    value = re.sub(r"[ \t]+", " ", value)
    return value.strip()


def clean_source_text(value: str) -> str:
    value = normalize_line(value)
    value = re.sub(r"^[•≐■➊➋➌➍➎➏❶❷❸❹❺❻]+\s*", "", value)
    value = normalize_middle_dots(value)
    value = value.replace("국제 규점", "국제 규범")
    value = value.replace("해야할까", "해야 할까")
    value = re.split(r"\s+(?:핵심 용어|학습 내용|내가 만드는 정리 노트)\b", value)[0]
    value = re.sub(r"\s+\d+\s*~\s*\d+\s*쪽.*$", "", value)
    value = re.sub(r"\s+([.!?])", r"\1", value)
    return OCR_FIXES.get(value.replace(" ", ""), OCR_FIXES.get(value, value))


def clean_topic_title(value: str) -> str:
    value = re.sub(r"^주제\s*\d+\s*", "", value)
    value = re.sub(r"^\d+\s+", "", value)
    return normalize_line(value)


def search_key(value: str) -> str:
    return re.sub(r"[^0-9A-Za-z가-힣]", "", clean_topic_title(value))


def load_topic_sets():
    base = read_json(REPO / "content" / "course-topics.json")
    publisher = read_json(REPO / "content" / "publisher-textbook-topics.json")
    visang_east = read_json(REPO / "content" / "visang-east-asian-topics.json")
    result = OrderedDict()

    for course_id, source in base.items():
        result[(course_id, BASE_PUBLISHERS[course_id])] = source["topics"]
    for course_id, publishers in publisher.items():
        for publisher_id, source in publishers.items():
            result[(course_id, publisher_id)] = source["topics"]
    result[("east-asian-history-journey", "visang")] = visang_east["topics"]
    return result


def guide_lines(filename: str) -> list[str]:
    path = GUIDE_TEXT_ROOT / filename
    if not path.exists():
        raise FileNotFoundError(path)
    return [normalize_line(line) for line in path.read_text(errors="ignore").splitlines()]


def extract_goal_block(lines: list[str], marker_index: int) -> str:
    line = lines[marker_index]
    after = re.sub(r"^.*?(?:│?학습\s*목표│?)\s*", "", line).strip(" •≐■")
    parts = [after] if after else []

    for cursor in range(marker_index + 1, min(len(lines), marker_index + 8)):
        candidate = lines[cursor]
        if not candidate:
            continue
        if any(
            boundary in candidate
            for boundary in (
                "수업 지도 계획",
                "교수·학습",
                "교수•학습",
                "수업의 주안점",
                "평가 계획",
                "수업 흐름도",
            )
        ):
            break
        if candidate.startswith(("•", "≐", "■", "➊", "➋", "➌", "➍")):
            parts.append(re.sub(r"^[•≐■➊➋➌➍]\s*", "", candidate))
        elif parts and len(parts[-1]) < 55:
            parts[-1] = f"{parts[-1]} {candidate}"
        else:
            break

    return "\n".join(clean_source_text(part) for part in parts if clean_source_text(part))


def title_hit_with_goal(lines: list[str], title: str) -> tuple[int, int] | None:
    key = search_key(title)
    if not key:
        return None

    candidates = []
    for index in range(len(lines)):
        window_key = search_key(" ".join(lines[index:index + 4]))
        if key not in window_key:
            continue
        markers = [
            marker
            for marker in range(index, min(len(lines), index + 9))
            if ("학습 목표" in lines[marker] or "학습목표" in lines[marker])
            and "제시" not in lines[marker]
        ]
        if not markers:
            markers = [
                marker
                for marker in range(max(0, index - 3), index)
                if ("학습 목표" in lines[marker] or "학습목표" in lines[marker])
                and "제시" not in lines[marker]
            ]
        if markers:
            candidates.append((index, min(markers, key=lambda marker: abs(marker - index))))

    if not candidates:
        return None

    def candidate_score(candidate: tuple[int, int]):
        index, marker = candidate
        goal = extract_goal_block(lines, marker)
        score = 0
        if "수 있다" in goal or "말할 수" in goal:
            score += 8
        if 10 <= len(goal) <= 280:
            score += 4
        if any(noise in goal for noise in ("작성해 보자", "평가", "교수", "모둠별로")):
            score -= 8
        return score, index

    return max(candidates, key=candidate_score)


def heading_questions(lines: list[str], start: int, stop: int) -> list[str]:
    headings = []
    for line in lines[start:stop]:
        for match in re.finditer(r"(?:^|\s)([1-9])\.\s+(.+)", line):
            heading = match.group(2)
            heading = re.split(
                r"\s+(?:[⑴⑵⑶⑷①②③④⑤⑥]|형성 평가|정리|교과서|지도 TIP|Q\d|•|≐)",
                heading,
            )[0]
            heading = re.sub(r"\s+\d{1,3}(?:~\d{1,3})?쪽.*$", "", heading)
            heading = re.split(r"\s+[가나다라마바사아자차카타파하],", heading)[0]
            heading = clean_source_text(heading)
            if (
                3 <= len(heading) <= 65
                and "차시" not in heading
                and "indd" not in heading
                and "오후" not in heading
                and not re.search(r"\d+\.\s", heading)
                and not re.match(r"^\d", heading)
            ):
                headings.append(heading)

    result = []
    for heading in headings:
        question = make_question(heading)
        if question not in result:
            result.append(question)
    return result[:4]


def haenaem_korean_data(lines: list[str], count: int):
    markers = [index for index, line in enumerate(lines) if "이 주제를 배우면" in line][-count:]
    result = []
    for position, marker in enumerate(markers):
        stop = markers[position + 1] if position + 1 < len(markers) else min(len(lines), marker + 450)
        mission_parts = [lines[marker].split("이 주제를 배우면", 1)[1].strip()]
        for cursor in range(marker + 1, min(stop, marker + 6)):
            candidate = lines[cursor]
            if not candidate:
                continue
            if "수업 흐름도" in candidate:
                break
            if len(mission_parts[-1]) < 95 and not candidate.startswith(("도 ", "입 ", "Q")):
                mission_parts[-1] = f"{mission_parts[-1]} {candidate}"
            else:
                break
        mission = clean_source_text(" ".join(mission_parts))

        subheadings = []
        for line in lines[marker:stop]:
            matched = re.match(r"^[➊➋➌➍➎➏]\s*(.+)", line)
            if not matched:
                continue
            heading = re.split(r"\s*(?:교과서\s*\d|Q\d|지도 TIP|\[예시 답안\])", matched.group(1))[0]
            heading = clean_source_text(heading)
            if 3 <= len(heading) <= 80:
                subheadings.append(heading)
        result.append((mission, subheadings))
    return result


def visang_korean_missions(path: Path, count: int) -> list[str]:
    lines = [normalize_line(line) for line in path.read_text(errors="ignore").splitlines()]
    goals = []
    for line in lines:
        if "이 주제를 배우면" not in line:
            continue
        goal = clean_source_text(line.split("이 주제를 배우면", 1)[1])
        goals.append(goal)

    if count == 40:
        # Two methodology topics do not carry a printed "이 주제를 배우면" box.
        main = goals[-38:]
        return [
            *main[:24],
            "역사 탐구의 의미와 절차를 이해하고, 다양한 역사 자료를 활용하는 방법을 설명할 수 있다.",
            "역사 자료를 수집하고 분석하여 탐구 질문에 답하며, 그 결과를 표현할 수 있다.",
            *main[24:],
        ]
    return goals[-count:]


def haenaem_modern_goals(lines: list[str]) -> list[str]:
    markers = [
        index
        for index, line in enumerate(lines)
        if line == "학습 목표" or line.startswith("학습 목표 ")
    ]
    if len(markers) != 15:
        raise RuntimeError(f"Expected 15 Haenaem modern manual goal blocks, found {len(markers)}")
    return [extract_goal_block(lines, marker) for marker in markers]


def make_question(value: str) -> str:
    value = clean_source_text(value)
    value = value.rstrip(".")
    if not value:
        return ""
    if value.endswith("?") or value.endswith("까?") or value.endswith("가?"):
        return value
    if value.endswith("하다"):
        return f"{value[:-2]}한 배경과 과정은 무엇인가?"
    if value.endswith("되다"):
        return f"{value[:-2]}된 배경과 과정은 무엇인가?"
    if value.endswith("일어나다"):
        return f"{value[:-4]}일어난 배경과 전개 과정은 무엇인가?"
    if value.endswith("나타나다"):
        return f"{value[:-4]}나타난 배경과 양상은 무엇인가?"
    if value.endswith("변하다"):
        return f"{value[:-2]}변한 배경과 양상은 무엇인가?"
    if value.endswith("바뀌다"):
        return f"{value.removesuffix('바뀌다')}바뀐 배경과 양상은 무엇인가?"
    if value.endswith("맞서다"):
        return f"{value.removesuffix('맞서다')}맞선 방식과 역사적 의미는 무엇인가?"
    if value.endswith("바꾸다"):
        return f"{value.removesuffix('바꾸다')}바꾼 배경과 영향은 무엇인가?"
    if value.endswith("노력하다"):
        return f"{value[:-2]}노력한 배경과 구체적인 방법은 무엇인가?"
    if "의미" in value and len(value) < 45:
        return f"{value}{topic_particle(value)} 무엇인가?"
    return f"{value}의 핵심 내용과 역사적 의미는 무엇인가?"


def topic_particle(value: str) -> str:
    if not value:
        return "는"
    codepoint = ord(value[-1])
    if 0xAC00 <= codepoint <= 0xD7A3:
        return "은" if (codepoint - 0xAC00) % 28 else "는"
    return "는"


def mission_followup_question(mission: str) -> str:
    first = mission.splitlines()[0].rstrip(".")
    replacements = (
        ("비교할 수 있다", "비교할 때 주목해야 할 공통점과 차이점은 무엇인가?"),
        ("설명할 수 있다", "설명하는 데 필요한 사실과 근거는 무엇인가?"),
        ("파악할 수 있다", "파악하는 데 필요한 사실과 근거는 무엇인가?"),
        ("이해할 수 있다", "이해하려면 어떤 사실과 맥락을 살펴봐야 하는가?"),
        ("정리할 수 있다", "정리하려면 어떤 기준과 근거가 필요한가?"),
        ("분석할 수 있다", "분석할 때 주목해야 할 자료와 근거는 무엇인가?"),
        ("탐구할 수 있다", "탐구하려면 어떤 질문과 자료가 필요한가?"),
        ("조사할 수 있다", "조사하려면 어떤 자료와 기준이 필요한가?"),
        ("제시할 수 있다", "제시하려면 어떤 근거가 필요한가?"),
        ("말할 수 있다", "말하려면 어떤 사실과 근거를 확인해야 하는가?"),
        ("살펴본다", "살펴보려면 어떤 사실과 맥락을 확인해야 하는가?"),
        ("알아본다", "알아보기 위해 어떤 자료를 살펴봐야 하는가?"),
        ("찾아본다", "찾기 위해 어떤 자료와 기준을 활용해야 하는가?"),
    )
    for ending, replacement in replacements:
        if first.endswith(ending):
            return f"{first[:-len(ending)]}{replacement}"
    return f"{first}을 이해하기 위해 어떤 사실과 맥락을 살펴봐야 하는가?"


def unique_questions(values: list[str]) -> list[str]:
    result = []
    for value in values:
        value = clean_source_text(value)
        if value and value not in result:
            result.append(value)
    return result[:4]


def main() -> int:
    topic_sets = load_topic_sets()
    output = OrderedDict()

    for key, topics in topic_sets.items():
        course_id, publisher_id = key
        entries = []

        if key in HAENAEM_GUIDE_COUNTS:
            lines = guide_lines(GUIDES[key])
            source_rows = haenaem_korean_data(lines, HAENAEM_GUIDE_COUNTS[key])
            for topic, (mission, headings) in zip(topics, source_rows, strict=True):
                questions = unique_questions(
                    [make_question(clean_topic_title(topic["title"]))]
                    + [make_question(heading) for heading in headings]
                    + [mission_followup_question(mission)]
                )
                entries.append({"order": topic["order"], "mission": mission, "questions": questions})

        elif key in VISANG_KOREAN_TEXTBOOKS:
            missions = visang_korean_missions(VISANG_KOREAN_TEXTBOOKS[key], len(topics))
            for topic, mission in zip(topics, missions, strict=True):
                questions = unique_questions(
                    [
                        make_question(clean_topic_title(topic["title"])),
                        mission_followup_question(mission),
                    ]
                )
                entries.append({"order": topic["order"], "mission": mission, "questions": questions})

        elif key == ("modern-world-history", "haenaem"):
            lines = guide_lines("[수업 매뉴얼] 역사로 탐구하는 현대 세계(전체).txt")
            group_goals = haenaem_modern_goals(lines)
            groups = []
            for topic in topics:
                group_key = (topic["unit"], topic["group"])
                if group_key not in groups:
                    groups.append(group_key)
            if len(groups) != len(group_goals):
                raise RuntimeError(f"Haenaem modern group mismatch: {len(groups)} vs {len(group_goals)}")
            goals_by_group = dict(zip(groups, group_goals, strict=True))
            for topic in topics:
                mission = goals_by_group[(topic["unit"], topic["group"])]
                questions = unique_questions(
                    [
                        make_question(clean_topic_title(topic["title"])),
                        mission_followup_question(mission),
                    ]
                )
                entries.append({"order": topic["order"], "mission": mission, "questions": questions})

        elif key in GUIDES:
            lines = guide_lines(GUIDES[key])
            located = []
            for topic in topics:
                hit = title_hit_with_goal(lines, topic["title"])
                if hit:
                    located.append((hit[0], hit[1]))
                else:
                    located.append(None)

            missions: list[str | None] = []
            questions_by_topic: list[list[str]] = []
            for index, (topic, location) in enumerate(zip(topics, located, strict=True)):
                if location is None:
                    missions.append(None)
                    questions_by_topic.append([])
                    continue
                title_index, marker_index = location
                mission = extract_goal_block(lines, marker_index)
                next_start = min(
                    (
                        other[0]
                        for other in located[index + 1:]
                        if other is not None and other[0] > title_index
                    ),
                    default=min(len(lines), title_index + 260),
                )
                questions = (
                    heading_questions(lines, marker_index, next_start)
                    if publisher_id == "miraen"
                    and course_id in {"korean-history-1", "korean-history-2", "modern-world-history"}
                    else []
                )
                missions.append(mission or None)
                questions_by_topic.append(questions)

            # Some guides combine several site topics under one printed learning-objective block.
            for index, topic in enumerate(topics):
                if missions[index]:
                    continue
                group_key = (topic["unit"], topic["group"])
                sibling_indexes = [
                    sibling_index
                    for sibling_index, sibling in enumerate(topics)
                    if (sibling["unit"], sibling["group"]) == group_key and missions[sibling_index]
                ]
                if sibling_indexes:
                    nearest = min(sibling_indexes, key=lambda sibling_index: abs(index - sibling_index))
                    missions[index] = missions[nearest]
                else:
                    missions[index] = (
                        f"{clean_topic_title(topic['title'])}의 배경과 전개 과정, 역사적 의미를 설명할 수 있다."
                    )

            for topic, mission, source_questions in zip(
                topics, missions, questions_by_topic, strict=True
            ):
                assert mission is not None
                questions = unique_questions(
                    [make_question(clean_topic_title(topic["title"]))]
                    + source_questions
                    + [mission_followup_question(mission)]
                )
                entries.append({"order": topic["order"], "mission": mission, "questions": questions})

        else:
            raise RuntimeError(f"No source mapping for {key}")

        if len(entries) != len(topics):
            raise RuntimeError(f"Entry count mismatch for {key}: {len(entries)} vs {len(topics)}")
        if any(not entry["mission"] or not entry["questions"] for entry in entries):
            raise RuntimeError(f"Incomplete entries for {key}")

        output.setdefault(course_id, OrderedDict())[publisher_id] = entries

    # The requested model case: source-faithful objective and three guide overview questions.
    model = output["korean-history-2"]["haenaem"][16]
    model["mission"] = "1950년대 남북한 정부의 권력 집중 과정을 비교할 수 있다."
    model["questions"] = [
        "장기 집권을 위한 이승만 정부의 헌법 개정은 어떻게 이루어졌는가?",
        "이승만 정부는 반공주의를 어떻게 민주주의 억압에 이용하였는가?",
        "북한은 사회주의 독재 체제를 어떻게 강화하였는가?",
    ]

    OUTPUT.write_text(
        json.dumps(output, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    total = sum(len(entries) for publishers in output.values() for entries in publishers.values())
    print(f"Wrote {total} topic exploration records to {OUTPUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
