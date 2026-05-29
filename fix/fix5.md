# fix5 — Check Later 2차 개선 계획 (랜딩 꾸밈 · 작성 폼 복원 · 피드/필터 정돈)

> 작성: 2026-05-29 / 브랜치: feat-design-renewal
> 상태: **계획 문서. 코드 수정 없음.** (fix4 구현 완료 이후의 추가 피드백 반영)
> 이 문서만 읽고 새 세션에서 바로 착수할 수 있도록 자기완결적으로 작성한다.

---

## 0. 목적

fix4(surface 위계·상태강조·네비 일관성·랜딩 기초·테마 단일화)는 완료. 이후 사용자가 추가로 요청한 항목을 계획화한다. 참조 스크린샷:

- `222.png` — 홈: 필터 칩 + 피드 카드 (딱딱한 박스 느낌)
- `333.png` — 항목 상세의 **수정 폼** (제목 + 다중 URL + 다중 이미지 + 메모): 리치 폼
- `444.png` — **새 항목 작성 폼** (제목 없음, textarea 하나): 단순 폼

방향 레퍼런스: [steep.app](https://steep.app/) 첫 랜딩처럼 **랜딩만** 더 꾸밈 있게(브랜드 표면). 단 제품 UI는 fix4의 warm-minimal 기조 유지.

---

## 1. ★핵심 발견 — 작성 폼 "기능 축소"는 사실 (회귀)

`git show main:src/pages/NewItemPage.tsx` 대조 결과:

- **main의 작성 폼**: `title`(필수 *), `urls`(다중, `addUrl`), 이미지 `multiple`, og:title 자동완성 → **현재 수정 폼(333)과 사실상 동일한 리치 폼.**
- **현재 작성 폼(444)**: design-renewal **step 7 "new-item-page-renewal"** + step 13/14에서 단순 bottom-sheet(제목 없음 / URL 1개 / 이미지 1장 / textarea 1개)로 축소됨.
- 결과: **작성(444)과 수정(333)의 패러다임이 완전히 다름.** 사용자가 "에러"로 느끼는 지점이 맞다.
- 서비스 계층은 다중 지원이 살아있음(`itemAttachmentsService.createMany`, 현재 작성 폼도 내부적으로 attachments 배열 사용). → **복원은 주로 UI 작업, 백엔드 변경 거의 없음.**

추가: main 카드는 `src/components/ItemCard.tsx` 단일 컴포넌트의 "텍스트 우선 한 행 + 보조 썸네일" 구조. 리뉴얼이 4종 대형 카드(`object-cover` 크롭, `h-64`/`aspect-video`)로 교체 → 사용자가 말한 "썸네일이 안 짤렸다"는 main의 작은 보조 썸네일 기억과, 현재 큰 크롭 카드의 차이.

---

## 2. 요청별 개선안

### A. 랜딩 페이지 — steep.app처럼 꾸밈 강화 (브랜드 표면)
- **현재**: 상단바(브랜드+토글) + h1 + 보조문구 + 3카드 + CTA. 절제됨 → 사용자는 "꾸밈"을 원함.
- **개선 방향** (warm-minimal 안에서 elevation):
  - 히어로 강화: 더 큰 타이포 스케일, 여백 리듬, 시선 흐름. (gradient text·glass 금지는 유지)
  - **제품 프리뷰**: 실제 앱 화면을 흉내 낸 정적 목업(카드 스택/홈 미니 프리뷰)을 히어로 옆/아래 배치 → "완성된 제품" 인상. 이미지 asset 없이 기존 토큰·컴포넌트로 조립.
  - 섹션 구성: 히어로 → 핵심 가치 3블록(현 3카드 대체/개선) → CTA. 1뷰포트 고집 완화 가능.
- **로그인 진입 위치 변경(요청)**: 우상단 헤더에 **[테마 토글] 다음 오른쪽에 `Login` 버튼**. 히어로의 보조 "로그인" 버튼은 제거하고 `시작하기`만 1차 CTA로.
- 파일: `LandingPage.tsx` (+ 필요 시 소형 프리뷰 컴포넌트 신설).
- **결정 필요**: 꾸밈 강도(§5-1), 제품 프리뷰 포함 여부.

### B. 랜딩 카피 개선 (현 문구가 "AI스럽고 완성도 없음")
- 현재:
  - h1: "공유 한 번이면 끝, 30초 안에 찾는다"
  - 보조: "나중에 볼 링크·메모·캡처를 던지듯 저장하고, 필요할 때 바로 꺼내 보세요."
  - 3카드: 저장/분류/조회 + 2줄 설명
- 개선: 더 구체적이고 담백한 카피로 교체(옵션은 §5-2에서 택1). em dash 금지, 군더더기 제거 원칙 유지.

### C. 로그인 페이지 — "회원가입" 문구 제거
- 현재 `LoginPage.tsx`: "로그인 / 회원가입" 표기. 우리는 **Google OAuth 단일**, 별도 회원가입 없음 → 오해 소지.
- 개선: "회원가입" 제거. 예: 제목 "Check Later" + 부제 "Google로 계속하기" 중심, "로그인/회원가입" 줄 삭제 또는 "로그인"만.
- 파일: `LoginPage.tsx` (카피만, 동작 무변경).

### D. 홈 헤더에 테마 토글 추가 (계정 아이콘 왼쪽)
- 현재 `HomePage` TopAppBar `rightAction`=계정 링크만.
- 개선: `rightAction`을 `[ThemeToggleButton][AccountLink]` 순으로. (랜딩과 동일 토글 컴포넌트 재사용)
- 파일: `HomePage.tsx`.

### E. 설정에서 THEME 섹션 제거
- 테마 토글이 랜딩+홈 헤더에 상시 노출되므로 설정의 3-옵션(system/light/dark) 섹션은 중복 → 제거.
- 영향: `SettingsPage.tsx`에서 THEME 섹션 + 관련 state/effect 제거. `SettingsPage.test.tsx`의 "테마 세그먼트" 테스트 제거/수정.
- **주의**: 토글은 light/dark 이진만 지원 → 'system' 자동추종 선택지는 사라짐(부트스트랩 기본값으로만 존재). 수용 가능(§5-3 확인).
- 파일: `SettingsPage.tsx`, `SettingsPage.test.tsx`.

### F. FilterBar 칩 — 가독성/부드러움 (222 "딱딱한 네모박스")
- 현재: type 칩 `rounded-xs`(2px, 각짐) + mono 12px, status 칩 `rounded-full`. 혼재 + 글자 얇고 작음.
- 개선:
  - 칩 코너 통일(부드럽게): 전부 `rounded-full` 또는 `rounded-sm`로 일관.
  - 글자: 13px, weight 보강, mono→가독성 위해 type도 본문 폰트 고려.
  - active(채움)/inactive 대비는 fix4에서 개선됨 → 패딩·터치감만 정돈.
- 파일: `Chip.tsx`, `FilterBar.tsx`.
- **결정 필요**: 코너 스타일(§5-4).

### G. 피드 카드 재설계 (222 "그냥 네모 박스, 신경 안 쓴 느낌")
- 사용자 의향: "작은 크기로 여러 칼럼/조밀한 형식". main의 "텍스트 우선 한 행 + 보조 썸네일"과 유사.
- 개선 방향 후보(§5-5에서 택1):
  - (가) **컴팩트 리스트 행**: 한 줄형(좌측 작은 썸네일 + 제목/메타), 밀도↑. main 회귀에 가깝고 "30초 탐색"에 유리.
  - (나) **2칼럼 카드 그리드**: 카드 크기 축소 + 2열. 시각적 변화 큼.
  - (다) 현 단일 칼럼 유지하되 카드 높이·여백 축소 + 썸네일 비율 조정.
- 썸네일 크롭: 이미지 잘림 불만 → `object-cover` 대신 비율 보존(`object-contain`) 또는 작은 보조 썸네일로 전환.
- 파일: `ItemCard.tsx`(디스패처) + `items/{Article,Video,Memo,Image}Card.tsx`, 관련 카드 테스트.
- **리스크**: 카드 구조 변경은 스와이프/롱프레스/메뉴(ItemCard.tsx 제스처)와 얽힘 → 회귀 주의.

### H. ★새 항목 작성 폼을 수정 폼과 통일 (제목/다중URL/다중이미지 복원) — 최대 작업
- 목표: 작성(444)을 수정(333)과 동일 패러다임으로. 제목 입력, 다중 URL(추가), 다중 이미지(추가/삭제), og:title 자동완성 복원.
- 권장 구현: **공용 폼 컴포넌트 추출** (`ItemForm`, mode: `create`|`edit`)로 작성·수정이 같은 폼을 공유 → 영구 일관성.
  - create: 빈 폼에서 시작 → `createItem` + `itemAttachmentsService.createMany`.
  - edit: 기존 값 로드 + 기존 이미지 삭제/추가, 기존 URL 편집 (ItemDetailPage 현 로직 이전).
- 대안(저위험): 공용화 없이 NewItemPage만 main 폼 구조로 복원(중복 코드 발생).
- 파일: 신설 `components/items/ItemForm.tsx`(권장), `NewItemPage.tsx`, `ItemDetailPage.tsx`, 서비스는 재사용. 관련 테스트 대폭 갱신.
- **리스크: 높음.** 저장/첨부/스토리지 업로드/낙관적 갱신 경로가 얽힘 → 기능 회귀 위험. 반드시 테스트 우선.
- **결정 필요**: 공용 컴포넌트 추출(권장) vs 폼만 복원(§5-6). 단순 bottom-sheet 빠른저장 경험을 포기할지(§5-6).

---

## 3. 하네스(harness) 사용 판단 → **사용 권장 (Yes)**

근거(AGENTS.md 기준: 기능 단위·리스크 큰 작업은 phase/step로):
- 항목 **H(작성 폼 통일/복원)** 는 명백한 기능 작업 + 데이터/스토리지 경로 + 회귀 위험 → 단독으로도 하네스 대상.
- 항목 **G(카드 재설계)** 는 제스처 로직과 얽혀 중간 리스크.
- 나머지(A~F)는 시각/카피 위주 저위험.
- 총 범위가 여러 레이어(랜딩/셸/필터/카드/폼) + 테스트 광범위 → step 분할·feature_list 게이트·세션 인계 이점이 큼.

### phase / step 구조 (스캐폴딩 완료 — 단일 task `design-renewal-fix`)

> 사용자 지시로 3분리 대신 **단일 task `phases/design-renewal-fix/`** (9 step)로 통합.

```
phases/design-renewal-fix/
  step0  landing-redesign       A,B  랜딩 절제된 elevation + 카피 + 로그인 우상단
  step1  login-copy             C    로그인 페이지 회원가입 문구 제거
  step2  home-header-theme      D    홈 헤더 테마 토글(계정 아이콘 왼쪽)
  step3  settings-remove-theme  E    설정 THEME 섹션 제거 + 테스트 정리
  step4  filter-chips           F    칩 가독성/부드러움
  step5  feed-card-redesign     G    컴팩트 리스트 행 + 썸네일(제스처 회귀 금지)
  step6  item-form-extract      H    공용 ItemForm 추출(미연결, 컴포넌트만)
  step7  new-item-rich          H    작성 경로를 ItemForm로 전환(제목/다중URL/다중이미지)
  step8  edit-item-migrate      H    수정 경로를 ItemForm로 전환 + 작성↔수정 왕복 회귀
```

- 각 step의 AC는 `npm run build && npm run test` 포함. step5(제스처)·step6~8(폼)은 회귀 테스트로 게이트.
- step6~8(폼 통일)은 고위험 → step 순서로 격리 진행(추출 → 작성 연결 → 수정 이전).

> 실행: `python3 scripts/execute.py design-renewal-fix` (또는 `py -3.11 ...`). 실행 전 `feature_list.json`(feat-1~11) 완료 기준 확인.

---

## 4. 검증 게이트 (모든 단계 공통)

```bash
npm run build      # tsc --noEmit 포함
npm run test
npm run lint
```

육안: warm-minimal 안티패턴 가드(`docs/UI_GUIDE.md`) 재확인 — gradient text·glass·side-stripe·#000/#fff 직접사용 금지, 터치타깃 ≥44, 상태 정의. 랜딩은 브랜드 표면이라 표현 자유도가 크지만 위 절대 금지는 동일 적용.

---

## 5. 결정 사항 (확정 2026-05-29)

- **H 작성 폼**: **공용 `ItemForm` 추출** (작성·수정 공유, 단순 bottom-sheet 빠른저장은 폐기).
- **G 피드 카드**: **컴팩트 리스트 행** (좌측 소형 썸네일 + 제목/메타, 밀도↑).
- **A 랜딩**: **절제된 elevation** (타이포·여백·소형 프리뷰, warm-minimal 유지).
- **하네스**: §3 구조로 스캐폴딩 진행.
- 나머지(B 카피안, E system 추종 포기, F 칩 코너)는 각 step 착수 시 확정.

### (참고) 착수 전 잔여 미세 결정

1. **랜딩 꾸밈 강도(A)**: (a) 절제된 elevation(타이포·여백·소형 프리뷰) / (b) steep.app 수준의 적극적 비주얼(큰 목업·섹션 다수). 권장: (a)에서 시작.
2. **랜딩/박스 카피(B)**: 새 문구 방향을 택1 또는 직접 제시. (예시는 착수 step에서 2~3안 제안 예정.)
3. **설정 THEME 제거 시 'system' 자동추종 포기(E)**: 토글은 light/dark만 → system 선택지 사라짐. 동의?
4. **필터 칩 코너(F)**: 전부 pill(`rounded-full`) / 전부 `rounded-sm` 중?
5. **피드 카드 레이아웃(G)**: (가) 컴팩트 리스트 행 / (나) 2칼럼 그리드 / (다) 현행 축소. 권장: (가).
6. **작성 폼 복원 방식(H)**: (1) 공용 ItemForm 추출(권장, 영구 일관) / (2) NewItemPage만 복원. 그리고 **단순 빠른저장(bottom-sheet) 경험을 폐기**하고 리치 폼으로 통일할지 확정.
7. **하네스 스캐폴딩 진행 여부**: 위 §3 구조로 `phases/` 생성할지.
