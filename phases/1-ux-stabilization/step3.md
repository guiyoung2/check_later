# Step 3: home-actions

## 읽어야 할 파일

먼저 아래 파일들을 읽고 홈 화면 구조와 이전 step 산출물을 파악하라:

- `docs/UI_GUIDE.md` — 목록형 도구, 터치 타깃, 버튼 원칙
- `src/pages/HomePage.tsx` — 헤더, FilterBar, 빈 상태, 목록 렌더링
- `src/components/FilterBar.tsx` — 필터 영역 구조
- `src/components/ThemeToggleButton.tsx` — step 1 산출물
- `src/pages/SettingsPage.tsx` — step 2 로그아웃 이동 반영 상태
- `src/pages/HomePage.test.tsx` — 홈 화면 기대값

## 작업

### 1. 헤더 액션 중복 정리

`HomePage` 헤더에서 직접 로그아웃 버튼을 제거하라. 설정 페이지에는 계정 정보, 로그아웃, PWA 설치라는 고유 목적이 있으므로 설정 진입 버튼은 유지한다.

헤더 액션은 다음 정도로 제한한다:

- 테마 토글 아이콘 버튼
- 설정 진입 아이콘 버튼

### 2. 새 항목 생성 액션 위치 이동

헤더의 `+` 링크를 제거하고, `FilterBar` 아래 또는 목록 `main`의 최상단에 새 항목 생성 링크를 배치하라. 배치 의도는 "목록에 새 항목을 추가한다"는 맥락이 보이는 위치다.

구현 규칙:

- 링크 목적지는 기존처럼 `/new`를 유지한다.
- 접근 가능한 이름은 `새 항목 추가`를 유지한다.
- 모바일 터치 타깃은 최소 44px 높이를 만족해야 한다.
- 빈 상태의 `첫 항목 저장하기` CTA는 유지한다. 빈 상태 CTA는 사용자가 처음 저장할 때 필요한 별도 유도다.

### 3. 테스트 갱신

`HomePage.test.tsx`를 현재 UX에 맞게 갱신하라:

- 테마 토글 버튼이 여전히 동작한다.
- 설정 링크가 `/settings`를 가리킨다.
- 헤더 직접 로그아웃 버튼은 기대하지 않는다.
- `새 항목 추가` 링크가 `/new`를 가리킨다.
- 빈 상태 CTA `첫 항목 저장하기`도 `/new`를 가리킨다.

## Acceptance Criteria

```bash
npm run build
npm test
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. 헤더에 로그아웃과 설정이 중복으로 나란히 보이지 않는지 확인한다.
3. 새 항목 추가 액션이 필터/목록 영역 맥락에 배치되었는지 확인한다.
4. `phases/1-ux-stabilization/index.json`의 step 3을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "홈 헤더 중복 로그아웃 제거, 새 항목 추가 액션을 목록 영역으로 이동"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
5. `phases/1-ux-stabilization/feature_list.json`에서 `feat-6`, `feat-7`을 통과 처리한다.
6. `phases/1-ux-stabilization/progress.md`의 다음 할 일과 주의사항을 갱신한다.

## 금지사항

- 설정 페이지를 삭제하지 마라. 이유: PWA 설치 안내와 계정 정보라는 고유 기능이 남아 있다.
- 새 항목 액션을 FAB로 만들지 마라. 이유: UI_GUIDE에서 FAB 그라디언트/앱 클리셰를 피하고 목록형 도구로 유지한다.
- 필터 스토어 또는 items 조회 로직을 리팩토링하지 마라. 이유: 이 step은 홈 액션 배치만 다룬다.
- 기존 테스트를 깨뜨리지 마라.
