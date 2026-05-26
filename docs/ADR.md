# Architecture Decision Records — Check Later

## 철학

MVP 완성 속도 우선. 백엔드를 Supabase에 위임해 1인 개발 부담 최소화.
불필요한 추상화 없이 작동하는 최소 구현을 선택한다.

---

### ADR-001: Vite + React (Next.js 아님)

**결정**: Vite 8 + React 19 SPA

**이유**: 백엔드를 Supabase에 위임하므로 SSR/서버 컴포넌트 불필요. PWA는 본질적으로 SPA에 가까워 CSR이 자연스럽다. `vite-plugin-pwa`가 잘 정착돼 Service Worker/manifest/Web Share Target 설정이 간단하다.

**트레이드오프**: Next.js App Router의 서버 컴포넌트, 파일 기반 라우팅, 자동 코드 스플리팅 이점 포기.

---

### ADR-002: Supabase (Firebase / 자체 서버 아님)

**결정**: Supabase (Postgres + Storage + Auth + Realtime)

**이유**: 인증·DB 마이그레이션·이미지 업로드·권한 검사를 다 직접 구현하면 1인 사이드 프로젝트가 끝나지 않는다. Postgres라 "형태 + 상태 + 날짜" 복합 쿼리가 SQL로 직관적이다. RLS로 다중 사용자 안전이 DB 차원에서 강제된다. 무료 티어(월 5만 MAU, 500MB DB, 1GB Storage)가 충분하다.

**트레이드오프**: Firebase의 Firestore Realtime 반응성, 풍부한 모바일 SDK 에코시스템 포기. Firestore 복합 쿼리 문제를 직접 회피함으로써 Supabase 특화 학습 필요.

---

### ADR-003: PWA 단독 (디스코드 봇 V2 보류)

**결정**: Web Share Target API를 갖춘 PWA만으로 V1 구현

**이유**: 조회는 봇으로 안 된다 — 분류·필터·상태 변경은 어차피 별도 UI가 필요하므로 PWA는 어떤 선택을 해도 만들어야 한다. PWA는 홈화면 설치 시 네이티브 앱과 동일한 진입 UX + Web Share Target으로 디스코드보다 한 탭 적다. 봇 서버를 추가하면 Supabase + 봇 호스팅 두 곳을 관리해야 한다.

**트레이드오프**: 디스코드를 이미 열어둔 상태에서는 채팅 입력이 더 빠를 수 있음. 실사용 후 "여전히 봇이 더 빠르다"고 느끼면 V2에서 추가 (데이터 모델 재사용 가능).

---

### ADR-004: TanStack Query + Zustand (Redux 아님)

**결정**: TanStack Query v5 (서버 상태) + Zustand v5 (UI 상태)

**이유**: Redux는 보일러플레이트가 많고 1인 사이드 프로젝트에 과하다. TanStack Query가 Supabase 데이터의 캐싱·리페치·낙관적 업데이트를 자동 처리한다. Zustand는 작고 단순하며 Provider 래핑 없이 어디서나 접근 가능하다. 서버/UI 상태 분리로 각 계층이 명확해진다.

**트레이드오프**: 두 라이브러리의 학습 비용. Redux DevTools의 타임라인 디버깅 포기.

---

### ADR-005: Vitest (Jest 아님)

**결정**: Vitest v4 + @testing-library/react + jsdom

**이유**: Vite와 동일 진영이라 설정이 `mergeConfig` 한 줄로 끝난다. ESM 네이티브 지원으로 별도 transform 설정 불필요. 셋업 시간 5분 이내.

**트레이드오프**: Jest 특화 플러그인 일부 미지원 (현재 프로젝트에서 해당 없음).
