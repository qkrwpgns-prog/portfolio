---
title: 플랫폼 노동자 계약서 검토 AI
summary: 계약서 사진 속 불리한 조항을 쉬운 말로 알려 주는 AI 서비스를 만들고, 결과를 직접 검증했다
period: 2026.10
role: 문제 정의 · 기획 · 제작 · 검증 (1인)
team: 개인 작업 (멀티모달콘텐츠제작 수업)
result: 조항 탐지 정확도 미흡
highlights: [실시간 API 연동, 테스트 계약서 3건]
tags: [서비스 기획, AI]
stack: [Claude API, 결과 검증]
thumbnail: assets/images/contract/result.jpg
status: published
order: 6
links:
  서비스 체험: https://contract-ai-blond-nine.vercel.app/
---

## 한눈에 보기

- **문제**: 플랫폼 노동자가 계약 단계에서부터 불리한 조건을 알아채기 어렵다.
- **내가 한 일**: 계약서 사진을 올리면 불리하거나 이례적인 조항을 쉬운 말로 설명해 주는 서비스를 만들고, 결과를 직접 검증했다.
- **결과**: 조항을 정확히 찾아내지 못했다. 평가에서는 "잘 만들었지만 실제로 쓰기 어려운 환경"이라는 반응을 받았다.

## 배경

플랫폼 노동자가 제대로 된 대우를 받지 못한다는 기사를 읽고 문제의식을 가졌다.
수업 과제로 이 문제를 직접 풀어 보기로 했다.

## 만든 것

- 배달·대리운전·퀵서비스 계약서를 사진이나 글로 올리면, AI가 불리한 조항을 표시하고 쉬운 말로 설명한다.
- 정산·지급, 수수료·요율, 위약금·배상, 계약 해지, 사고·책임 5개 항목으로 나눠 보여 주고, 회사에 무엇을 물어볼지도 알려 준다.
- 시연용으로 미리 짜 둔 답변(프리셋)이 아니라, **Claude API를 실시간으로 연동**해 실제 계약서를 분석하도록 구현했다. → [서비스 체험](https://contract-ai-blond-nine.vercel.app/)
- 계약서 3건으로 테스트했다.
- AI가 찾아낸 조항이 맞는지 **직접 따로 조사해 대조**했다.

<div class="gallery phones">
  <figure><img src="assets/images/contract/home.jpg" alt="첫 화면"><figcaption>첫 화면 — 사진 또는 글로 올리기</figcaption></figure>
  <figure><img src="assets/images/contract/result.jpg" alt="검토 결과"><figcaption>검토 결과 — 샘플 계약서</figcaption></figure>
</div>

## 결과

- 대조해 보니 AI는 조항을 정확히 찾아내지 못했다. 학습 데이터가 부족했던 것으로 판단했다.
- 평가에서 "잘 만들었지만, 노동자가 갑에게 이걸 내밀기 어려운 환경이라 실제로 쓰기는 어렵다"는 반응을 받았다.

## 배운 점

1. **AI 결과를 그대로 믿지 않는다.** 직접 검증했기 때문에 정확도 문제를 발견할 수 있었다.
2. **기술 완성도만으로는 부족하다.** 사용자가 그 결과를 실제로 쓸 수 있는 상황인지까지 설계해야 한다.
