# fix4 — Check Later UI 완성도 개선안 (critique → shape)

> 작성: 2026-05-29 / 브랜치: feat-design-renewal
> 방법론: `/impeccable` critique → shape. polish(구현)는 **사용자 승인 후** 별도 진행.
>
> **이 문서의 목적**: 새 세션에서도 이 파일만 읽고 진단·계획을 그대로 이어서 실행할 수 있도록 자기완결적으로 작성한다.

---

## 0. 목표와 원칙 (불변)

- **목표**: 마케팅 사이트처럼 화려하게가 아니라, check_later가 **실제 제품형 앱처럼 더 단단하고 완성도 있게** 보이도록 한다.
- **기능 유지**: 모든 기존 기능/플로우/데이터 동작을 그대로 유지한다. 동작 변경 금지.
- **불필요한 리팩토링 금지**: 시각/상태/일관성 결함만 외과적으로 손본다. 구조 재설계 금지.
- **디자인 레인 유지**: Warm-Minimal Personal Tool. 모노톤 문서형, chromatic accent 추가 금지. 강조는 색이 아니라 **weight / size / fill / position**으로. (`docs/UI_GUIDE.md` 준수)
- **register**: product (앱 UI). 친숙함이 미덕, 도구가 작업 뒤로 사라지게.

---

## 1. 진단 요약 (Design Health)

### Nielsen 10 휴리스틱 (정직 채점, 0–4)

| # | Heuristic | 점수 | 핵심 문제 |
|---|-----------|:---:|---|
| 1 | Visibility of System Status | 2 | 필터 active 상태가 거의 안 보임, 피드에 결과 수/현재 필터 표시 없음, 다크모드 hover 무반응 |
| 2 | Match System / Real World | 3 | 한글 카피 자연스러움. 단 EN/KO 혼용 |
| 3 | User Control & Freedom | 3 | 뒤로/취소/필터초기화/상태토글 존재 |
| 4 | Consistency & Standards | 2 | 모바일 네비=영문 / 데스크탑 네비=한글, 상세페이지가 TopAppBar 미사용, 제목 중복, 강조 모델 적용 불일치 |
| 5 | Error Prevention | 3 | 삭제 확인 모달, 저장 disabled 처리 |
| 6 | Recognition vs Recall | 2 | active 필터 식별 어려움, 동작 안 하는 햄버거 아이콘 |
| 7 | Flexibility & Efficiency | 3 | 공유 타겟·quick option 우수 (단축키 없음은 이 앱에선 허용) |
| 8 | Aesthetic & Minimalist | 2 | 깔끔하나 surface 위계가 너무 약해 전체가 평평·헐거움, Folders 통계 그리드가 다소 generic |
| 9 | Error Recovery | 3 | 에러 alert + 재시도 안내 카피 존재 |
| 10 | Help & Documentation | 3 | 개인 도구 수준 적정, 빈 상태가 약간 안내 |
| **Total** | | **26 / 40** | 실사용 평균대. 뼈대는 좋고, "단단함"을 만드는 마감이 부족 |

### AI-slop verdict

전반적으로 **슬롭 아님** — 토큰·타이포·접근성이 의도적으로 설계됨. 단, 아래 국소 지점이 "AI가 만든 듯/미완성" 인상을 준다:

- Folders의 **상태 카드 3개가 동일 아이콘** 사용 (의미 전달 0, 손 덜 간 느낌)
- ArticleCard에서 OG 이미지 없을 때 **빈 회색 64×64 사각형**이 그대로 노출
- Home 좌상단 **동작하지 않는 햄버거 아이콘** (invented/dead affordance)
- bg와 surface 색차가 1~2%로 거의 동일 → 카드가 배경에 녹아 **구조가 안 읽힘**

---

## 2. 화면별 진단

### 2-1. 글로벌 셸 / 네비게이션
- **[P1] 동작하지 않는 햄버거**: `HomePage`의 `HeaderIcon`(MenuIcon)은 `<span>`일 뿐 onClick/Link 없음. 탭/클릭해도 아무 일 없음. 데스크탑은 SideNav가 항상 보이므로 더더욱 불필요. (HomePage.tsx:30-36, 73-77)
- **[P2] 데스크탑 브랜드 중복**: 데스크탑에서 SideNav가 "Check Later"를 표시하는데 TopAppBar도 중앙에 "Check Later"를 또 표시 → 같은 브랜드 2번.
- **[P2] 네비 언어 불일치**: `BottomNav`(모바일)=영문 `Home/New/Folders/Settings`, `SideNav`(데스크탑)=한글 `홈/새 항목/폴더/설정`. 동일 앱에서 디바이스에 따라 언어가 바뀜. (BottomNav.tsx:43-48 vs SideNav.tsx:43-48)
- **[P2] 타이틀 언어**: TopAppBar 타이틀은 영문(Check Later / Folders / Settings)인데 본문은 한글. 언어 전략이 일관되지 않음.
- **[P2] 테마 시스템 이중화**: `useTheme` 훅(`localStorage['theme']`, `.dark`만 토글, 이진)과 SettingsPage 내부 로직(`localStorage['check-later-theme']`, `.light`/`.dark`, 3옵션 system/light/dark)이 **키도 동작도 다름**. 둘이 동기화 안 됨. (useTheme.ts, SettingsPage.tsx:24-54)
- **[P3] 고아 컴포넌트**: `ThemeToggleButton`은 어디서도 import 안 됨(미사용) + 존재하지 않는 토큰 `text-text-sub` 참조(색 깨짐) + 하드코딩 `rounded-[8px]`. (ThemeToggleButton.tsx)

### 2-2. HomePage (메인 피드)
- **[P1] 다크모드 hover 데드존**: 카드 hover는 `hover:shadow-card`뿐인데 다크모드에서 `--shadow-card: none` → **다크에서 hover 피드백 전혀 없음**. 클릭 가능한 카드가 죽어 보임. (Card.tsx:18, index.css:135-138)
- **[P2] 컨텍스트 부재**: 본문에 결과 수/현재 필터 요약이 없음. "전체 32개" 같은 상태 표시가 없어 무엇을 보고 있는지 약함.
- **[P3] 리듬**: 카드 제목 24px + gap-6 + p-4/5로 다소 덩어리짐. 의도적 리듬보다는 균일.

### 2-3. 아이템 카드 (핵심 반복 단위)
- **[P1] surface 위계 약함(근본원인, 전 화면 영향)**: `--bg #F7F7F4` vs `--surface #FBFBF8` 차이가 1~2%, border `#E3E3DE`도 매우 옅음, shadow는 `0 1px 3px /0.04`로 거의 안 보임 → 카드가 배경에 녹아 **전체가 평평하고 헐거운 인상**. 이것이 "부실해 보이는" 가장 큰 원인. (※ `docs/UI_GUIDE.md`는 surface를 `#FFFFFF`로 규정하나 실제 `index.css :root`는 `#FBFBF8` → 가이드 대비 drift로 위계가 더 약해짐.)
- **[P2] 피드 카드에 상태(status) 표시 없음**: 안봤음/봤음/보관이 카드에 안 드러남. "1주일 뒤 30초 안에 찾기"라는 핵심 목표에서 상태는 중요 단서인데 누락.
- **[P2] ArticleCard 빈 썸네일**: OG 이미지 없으면 빈 회색 64×64 사각형이 hostname 옆에 남음 → 미완성/깨진 인상. (ArticleCard.tsx:46-50)
- **[P3] 타입 구분 약함**: Article/Memo 카드가 거의 동일 골격(칩+날짜+24px 제목). 4종 구분이 thumbnail 유무에 거의 전적으로 의존.
- VideoCard 오버레이가 하드코딩 `bg-[rgba(8,6,3,0.2)]` (토큰 아님, 다크 미대응). (VideoCard.tsx:43) — minor.

### 2-4. FilterBar
- **[P1] active 상태가 거의 안 보임**: active = `text-text-primary` + `ring-1 ring-border-strong`. inactive 대비 텍스트색 살짝 + 옅은 1px ring뿐 → 어떤 필터가 켜졌는지 한눈에 안 들어옴. 모노톤 시스템에서 **상태 가시성이 핵심인데 가장 약한 지점**. (Chip.tsx:25)
- **[P3] 비대칭**: 유형 그룹엔 "전체" 리셋 칩이 있으나 상태 그룹엔 없음.

### 2-5. FoldersPage
- **[P1] 상태 카드 3개 동일 아이콘**: 안봤음/봤음/보관이 전부 같은 `StatusIcon`. 의미 전달 0, 손 덜 간 인상. (FoldersPage.tsx:185-189)
- **[P2] 제목 중복**: TopAppBar `title="Folders"` + 본문 `<h2>Folders</h2>` → "Folders" 두 번. (FoldersPage.tsx:194, 199)
- **[P3] generic stat 그리드**: CountCard(아이콘+숫자+라벨)가 전형적 통계 카드. product에선 허용 범위지만 다소 평범.

### 2-6. NewItemPage
- **강점 화면**. 모바일 바텀시트 / 데스크탑 중앙카드, 드래그핸들, quick option, type 자동판정 — 제품급. 큰 결함 없음. 토큰/상태 일관성만 미세 점검.

### 2-7. ItemDetailPage
- **[P2] 상단바 패턴 일탈(IA drift)**: 다른 페이지는 `TopAppBar`를 쓰는데 상세는 자체 sticky 헤더(뒤로+공유/수정/삭제 3 IconButton)를 재구현. 일관성 저하. (ItemDetailPage.tsx:408-445)
- 삭제 확인 모달은 적절(파괴적 액션 → 모달, 가이드 부합). 상태 3-세그먼트 토글 양호. 기능은 충실.

### 2-8. LandingPage (첫 화면 / 비인증 `/`) — ★사용자 추가 요청, 우선순위 상향
> 사용자 피드백: "지금은 그냥 부실한 화면 하나뿐. 첫 화면인 랜딩 개선이 많이 필요. 다크모드 토글 아이콘과 로그인 버튼이 있었으면."
- **[P1] 첫인상이 빈약**: 현재 h1 + 3카드 + "시작하기" 버튼이 화면 한가운데 떠 있는 정도. 상단바/브랜드/진입 컨트롤이 없어 "제품의 첫 화면"이 아니라 미완성 데모처럼 보임.
- **[P1] 다크모드 토글 없음**: 비인증 사용자는 테마를 바꿀 수단이 전혀 없음(설정은 로그인 후에만 접근). 첫 화면에 토글 필요.
- **[P1] 로그인 진입 약함**: 진입 컨트롤이 "시작하기" 하나뿐. 명시적 "로그인" 버튼 요구됨.
- **[P3] 빈 카드 인상**: 저장/분류/조회 3카드가 `min-h-136px`에 단어 1개 + 2줄 설명만 → 공간 대비 비어 보임. (화려함은 지양하되 마감 보완 필요.)

### 2-9. LoginPage
- 양호. "로그인 / 회원가입" 슬래시 제목이 약간 어색하나 큰 문제 아님.

---

## 3. 근본 원인 (3가지로 수렴)

1. **Surface 위계 부족** → 전 화면이 평평·헐거움. (bg/surface/border/shadow 대비가 너무 약함)
2. **상태/강조 모델 적용 불일치** → 어떤 게 선택/활성인지 안 보임. fill 강조(`bg-text-primary text-bg`)가 버튼·New아이콘·테마토글·상태세그먼트엔 쓰이나 **필터 칩엔 안 쓰임**. 다크모드 hover는 shadow 의존이라 무반응.
3. **언어/패턴 일관성 결함** → 모바일/데스크탑 네비 언어 상이, 제목 중복, 상세페이지 상단바 일탈, 동작 안 하는 아이콘, 테마 시스템 이중화.
4. **첫 화면(랜딩) 미완성** → 비인증 사용자가 처음 보는 화면이 빈약하고 진입/테마 컨트롤이 부족. (사용자 추가 요청)

---

## 4. SHAPE — 개선 방향과 범위 (Tier 구조)

> 원칙: 토큰·컴포넌트 레벨에서 고치면 화면 전체에 전파. 페이지 개별 땜질 최소화.
> 각 Tier는 독립 커밋 가능. 위험도 낮은 순서.

### Tier 1 — Foundation (최고 임팩트 / 최저 위험) ★권장 시작점
**근본원인 1·2 해결. 토큰과 공용 컴포넌트만 손대므로 전 화면 동시 개선.**

1. **Surface 위계 강화** — `src/index.css`
   - light: surface를 bg와 또렷이 분리(가이드대로 `#FFFFFF`/oklch 100% 방향 복원), border를 한 단계 또렷하게, `shadow-card`를 살짝 강화(여전히 은은하게).
   - dark: shadow 대신 border 대비로 surface 분리(다크는 shadow none 유지).
   - 변경 범위: CSS 변수 값만. 클래스/구조 무변경.
2. **상태/강조 모델 통일** — `src/components/ui/Chip.tsx` (+ 필요시 FilterBar)
   - 필터 칩 active를 **명확한 fill 또는 강한 border**로(예: active = `bg-text-primary text-bg` 또는 surface-sub→강한 테두리+medium). 비활성과 한눈에 구분되게.
   - 앱 전역 "선택됨" 표현을 한 가지로 정의해 문서화(이 파일 §6).
3. **다크모드 hover 살리기** — `src/components/ui/Card.tsx`, FoldersPage CountCard
   - shadow 외에 `hover:border-border-strong` 또는 `hover:bg-surface-sub`(다크 대응) 추가. 모션은 150–200ms ease-out 유지.

- **AC**: `npm run build && npm run test` 통과. 라이트/다크 양쪽에서 카드 경계와 hover, 필터 active가 육안으로 또렷.

### Tier 2 — Navigation & Consistency (중간 임팩트 / 낮은 위험)
**근본원인 3 해결. 카피·노출만, 동작 무변경.**

4. **네비 언어 통일** — `BottomNav.tsx`(영문→한글로, SideNav와 일치). 본문이 한글이므로 한글 기준.
5. **타이틀 언어/중복 정리** — TopAppBar 타이틀 언어를 본문과 정렬. Folders의 본문 `<h2>` 또는 앱바 타이틀 중 하나 제거(중복 해소).
6. **동작 안 하는 햄버거 처리** — Home의 MenuIcon 제거 또는 모바일에서만 의미있는 동작 부여. 데스크탑에선 숨김. (가장 단순: 데드 아이콘 제거 + 데스크탑 브랜드 중복 제거)

- **AC**: `npm run build && npm run test` 통과. 모바일/데스크탑 네비 라벨 동일 언어, 제목 1회만 노출, 클릭 시 아무 일 없는 컨트롤 0개.

### Tier L — Landing 첫 화면 개선 (★사용자 추가 요청 / 우선)
**근본원인 4 해결. `LandingPage.tsx` 중심, 테마 통일 선행.**

L0. **테마 로직 단일화(선행 필수)** — 랜딩 토글과 설정이 같은 상태를 공유하도록, SettingsPage 인라인 테마 로직(`check-later-theme` 키, system/light/dark, `.light`/`.dark` 적용)을 작은 공용 모듈/훅으로 추출.
   - 고아 컴포넌트 `ThemeToggleButton`(깨진 토큰 `text-text-sub`, 하드코딩 radius)은 **이 공용 로직 기준으로 수정해 재사용**하거나 새 토글로 대체. 미사용 `useTheme`(키 `theme`)와의 충돌 제거.
   - *주의: 이건 "불필요한 리팩토링"이 아니라 랜딩↔설정 일관성을 위한 필수 정리. 동작(저장 키/3옵션)은 SettingsPage 쪽을 정답으로 유지.*
L1. **랜딩 상단바** — 브랜드(좌) + 테마 토글 아이콘(우)을 가진 가벼운 헤더 추가(TopAppBar 재사용 또는 동일 토큰의 경량 바). 첫 화면에 제품 골격 부여.
L2. **로그인 진입 강화** — 진입 컨트롤 2개: 1차 `시작하기`(primary, →`/login`) + 명시적 `로그인`(secondary). (기본안: 둘 다 `/login`으로 라우팅. 대안: 랜딩에 Google 로그인 버튼 직접 노출 — 결정 §6-5 참조.)
L3. **히어로/카드 마감** — h1 위계 보강, 3카드(저장/분류/조회)를 surface 위계 강화(Tier 1) 위에서 덜 비어 보이게 정돈. 화려함 금지, 절제 유지.

- **AC**: `npm run build && npm run test` 통과. 비인증 `/`에서 ① 테마 토글 작동(설정과 동일 키로 영속) ② 로그인 진입 버튼 노출 ③ 첫 화면이 "제품"처럼 골격을 갖춤. 라이트/다크 양쪽 확인.

### Tier 3 — Component Detail (마감 디테일)
**근본원인 잔여 + 미완성 인상 제거.**

7. **피드 카드 상태 표시** — 카드에 status를 모노톤으로 미세 표기(작은 라벨/점, fill 강조 모델 사용). 4종 카드 공통 위치.
8. **ArticleCard 빈 썸네일 처리** — 이미지 없으면 64×64 박스 숨김(hostname만) 또는 플레이스홀더 글리프.
9. **Folders 상태 아이콘 구분** — 안봤음/봤음/보관에 서로 다른 글리프.
10. (선택) **ItemDetail 상단바를 TopAppBar 패턴에 정렬** — *리팩토링 성격이 있어 사용자 확인 필요. 미승인 시 보류.*
11. (선택) Landing 3카드 마감 보완(절제 유지).

- **AC**: `npm run build && npm run test` 통과. 빈 회색 사각형 0개, 상태 아이콘 3종 구분, 피드에서 항목 상태 식별 가능.

---

## 5. 검증 게이트 (모든 Tier 공통)

```bash
npm run build      # tsc --noEmit 포함
npm run test
npm run lint
```

추가 육안 점검(가이드 §안티패턴 가드레일 재확인):
- `border-left: Npx(N≥2) color` / `background-clip:text` / `backdrop-filter:blur` 신규 0
- `#000`/`#fff` 직접 사용 신규 0 (warm tint 토큰만)
- 카드 `border-radius ≥ 10px` 금지
- 터치타깃 ≥ 44×44 유지
- 모든 인터랙티브 요소 hover/active/focus/disabled 정의
- em dash(—) 카피 직접 입력 금지

---

## 6. 결정 필요 사항 (polish 착수 전)

1. **범위**: Tier 1만 / Tier 1+2 / Tier 1+2+3 중 어디까지?
2. **언어 통일 방향**: 한글 통일(권장, 본문이 한글) / 영문 통일 / 현행 유지?
3. **surface 위계 강도**: 은은하게(문서형 유지) / 뚜렷하게(제품형 강조)?
4. **ItemDetail 상단바 정렬(항목 10)**: 리팩토링 성격 → 진행 여부 명시 필요. (기본값: 보류)
5. **랜딩 로그인 버튼 형태(L2)**: `로그인` 버튼이 `/login`으로 라우팅(권장, 단순·중복 없음) / 랜딩에 Google OAuth 직접 노출(LoginPage 핸들러 재사용, 한 화면에서 즉시 로그인) 중 무엇?
6. **테마 통일(L0)**: SettingsPage 기준(`check-later-theme`, 3옵션)으로 단일화 진행에 동의? (권장. 미동의 시 랜딩 토글은 설정과 별개로 동작하게 됨 → 비권장)

> 위 4개가 확정되면 이 문서 §4의 Tier 순서대로 polish(구현)에 착수하고 §5로 검증한다.

---

## 7. 구현 완료 기록 (2026-05-29)

**확정된 결정**: 범위 = **Tier 1 + 2 + 3 + L 전부** (항목 10 ItemDetail 상단바 교체만 보류) / surface = **뚜렷하게** / 언어 = **한글 통일** / 랜딩 로그인 = **/login 라우팅** / 테마 = **SettingsPage 기준 단일화**.

**부가 발견 & 수정**: `main.tsx` 부트스트랩이 키 `theme`를 읽는데 SettingsPage는 `check-later-theme`에 저장 → 설정 테마가 새로고침에 사라지던 **기존 버그**를 테마 단일화(L0)로 함께 수정.

### 변경 요약
- **Tier 1**: `index.css` surface 위계 강화(light surface near-white, border/shadow 강화, dark border 대비 강화) · `Chip.tsx` active를 fill 강조로 · `Card.tsx`/Folders CountCard에 다크 대응 `hover:border-border-strong`.
- **Tier 2**: `BottomNav` 한글화(홈/새 항목/폴더/설정) · Folders/Settings 타이틀 한글화(폴더/설정) · Folders 본문 제목 중복 제거 · Home 데드 햄버거(+고아 `MenuIcon`/`HeaderIcon`) 제거.
- **Tier L**: `lib/theme.ts` 신설(테마 단일 모듈) · `main.tsx`·`SettingsPage` 이 모듈로 통일 · `ThemeToggleButton` 재작성(깨진 토큰 수정, 공용 영속 공유) · 고아 `useTheme` 훅 삭제 · `LandingPage` 상단바(브랜드+테마토글)+히어로 보조카피+3카드 마감+시작하기/로그인 진입.
- **Tier 3**: `CardStatusBadge` 신설 후 4개 카드에 상태 표시 · ArticleCard 빈 썸네일 사각형 제거 · Folders 상태 아이콘 3종 구분(PendingIcon/ReviewedIcon/ArchivedIcon).
- **테스트**: BottomNav 한글화로 영문 네비 단언 갱신 + SideNav/BottomNav 이름 중복은 `within(Primary nav)`로 스코프 · `src/test/setup.ts`에 matchMedia 폴리필 추가.

### 검증 결과
- `npm run test` → **68 passed (15 files)**
- `npm run build` (tsc + vite) → **성공** (청크 크기 경고는 기존 사항, 무관)
- `npm run lint` → 5 problems 전부 **기존 파일(NewItemPage/ItemDetailPage/Toast/auth)** 이슈, 본 작업 변경 파일은 0 problem.

### 보류 / 후속 후보
- 항목 10: ItemDetail 자체 헤더를 TopAppBar 패턴으로 정렬 (구조 리팩토링 → 별도 승인 시).
- 데스크탑에서 TopAppBar "Check Later" 와 SideNav 브랜드 중복 (셸 레이아웃 변경 필요 → 보류).
- 기존 린트 이슈(NewItemPage setState-in-effect, jsx-a11y/no-autofocus 룰 미정의 등) 정리 — 본 작업 범위 밖.
