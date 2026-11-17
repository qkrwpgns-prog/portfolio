#!/usr/bin/env python3
"""content/projects/*.md 의 frontmatter를 모아 content/projects.json 을 만든다.

사용법:
  python3 scripts/build.py           # 목록만 다시 생성
  python3 scripts/build.py --serve   # 생성 후 http://localhost:8000 로컬 미리보기
  python3 scripts/build.py --check   # 첨삭 전 점검: 빈 필드, [확인 필요] 표시 등을 출력

외부 패키지 없이 파이썬 표준 라이브러리만 사용한다.
"""
import datetime
import http.server
import json
import os
import re
import socketserver
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "content" / "projects"
OUT = ROOT / "content" / "projects.json"
REQUIRED = ["title", "summary", "period", "role"]


def parse_value(raw: str):
    raw = raw.strip()
    if raw.startswith("[") and raw.endswith("]"):
        return [v.strip().strip("\"'") for v in raw[1:-1].split(",") if v.strip()]
    if raw.lower() in ("true", "false"):
        return raw.lower() == "true"
    if re.fullmatch(r"-?\d+", raw):
        return int(raw)
    return raw.strip("\"'")


def parse_frontmatter(text: str) -> dict:
    """아주 단순한 YAML 부분집합: `key: value`, `key: [a, b]`, 그리고 한 단계 들여쓴 하위 키(links 등)."""
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    if not m:
        return {}
    data, parent = {}, None
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        indented = line.startswith((" ", "\t"))
        key, _, val = line.strip().partition(":")
        key = key.strip()
        if indented and parent:
            data[parent][key] = parse_value(val)
        elif val.strip() == "":
            data[key], parent = {}, key
        else:
            data[key], parent = parse_value(val), None
    return data


def build() -> list:
    items = []
    for f in sorted(PROJECTS.glob("*.md")):
        if f.name.startswith("_"):
            continue
        meta = parse_frontmatter(f.read_text(encoding="utf-8"))
        meta.setdefault("slug", f.stem)
        meta["file"] = f.name
        items.append(meta)
    items.sort(key=lambda m: (m.get("order", 999), str(m.get("period", ""))[::-1]))
    OUT.write_text(json.dumps({
        "generated": datetime.date.today().isoformat(),
        "projects": items,
    }, ensure_ascii=False, indent=2), encoding="utf-8")
    pub = sum(1 for i in items if i.get("status", "published") != "draft")
    print(f"✓ content/projects.json — 총 {len(items)}개 (공개 {pub}, 초안 {len(items) - pub})")
    return items


def check(items: list):
    problems = 0
    for m in items:
        text = (PROJECTS / m["file"]).read_text(encoding="utf-8")
        missing = [k for k in REQUIRED if not m.get(k)]
        todos = re.findall(r"\[확인 필요[^\]]*\]", text)
        if missing or todos:
            problems += 1
            print(f"\n• {m['file']} ({m.get('status', 'published')})")
            if missing:
                print(f"  - 비어 있는 필드: {', '.join(missing)}")
            for t in todos:
                print(f"  - {t}")
    print("\n점검 완료: 문제 없음" if not problems else f"\n점검 완료: {problems}개 파일에 보완 필요")


def serve(port=8000):
    os.chdir(ROOT)
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"→ http://localhost:{port}  (초안 포함: http://localhost:{port}/?draft)  Ctrl+C로 종료")
        httpd.serve_forever()


if __name__ == "__main__":
    items = build()
    if "--check" in sys.argv:
        check(items)
    if "--serve" in sys.argv:
        serve()
