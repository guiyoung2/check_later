# 0-mvp 진행 현황

## 마지막 업데이트
2026-05-27T10:57:00+0900 — Step 6/11 완료

## 완료된 작업
- Step 0: foundation — react-router-dom·@supabase/supabase-js 설치, 타입 정의, 라우팅 스켈레톤, 페이지 스텁 생성
- Step 1: supabase-schema — items 테이블 + RLS 4개 정책 + item-images Storage 버킷 + Storage RLS 3개 정책 수동 설정 완료
- Step 2: auth — AuthProvider(src/lib/auth.tsx) + LoginPage(Google OAuth) + ProtectedRoute 구현, main.tsx에 AuthProvider 래핑 추가
- Step 3: services-and-utils — CreateItemInput에 id?: string 추가, itemsService/storageService/og-parser/form-type-detect 생성
- Step 4: query-hooks-and-store — 5개 TanStack Query 훅(useItems/useItem/useCreateItem/usePatchItem/useDeleteItem) + Zustand filterStore 생성
- Step 5: home-page — FilterBar(type/status 칩) + ItemCard(텍스트 우선 리스트 행) + HomePage(로딩/빈상태/목록) 구현

## 현재 진행 중
- Step 6: new-item-form

## 다음 할 일
- Step 6: new-item-form
  - `/new` 페이지 완전 구현
  - Web Share Target 파라미터(`?title=&text=&url=`) 파싱 → 필드 자동 채움
  - type 자동 판정(detectType) + 사용자 변경 가능 UI
  - og-parser로 URL → og:title 추출 시도 (CORS 실패 시 URL을 title fallback)
  - useCreateItem 훅으로 저장 후 `/`로 이동

## 주의사항
- Supabase Auth Google OAuth는 Supabase Dashboard에서 Google provider 활성화 + OAuth 클라이언트 ID/Secret 설정이 필요하다 (수동 설정, 코드로 불가).
- `verbatimModuleSyntax` 활성화로 인해 타입 import 시 반드시 `import type` 사용해야 한다.
- itemsService.create()에서 user_id는 파라미터로 받지 않고 supabase.auth.getUser()로 가져온다.
- storageService 버킷명은 'item-images'로 고정. 경로 규칙: {userId}/{itemId}.{ext}
- og-parser는 CORS 실패 시 null 반환(throw 금지). 호출 측에서 URL을 fallback title로 사용한다.
- useItems의 queryKey는 `['items', { type, status }]`로 filterStore 상태를 포함해야 필터 변경 시 자동 refetch된다.
- usePatchItem 낙관적 업데이트: cancelQueries → setQueryData → 실패 시 롤백 패턴. onSettled에서 ['items'] + ['items', id] 모두 invalidate한다.
- CSS 변수는 `bg-[--color-accent]` 형식(LoginPage 패턴)으로 사용한다. Tailwind v4 @theme 등록 후에도 일관성을 위해 이 패턴 유지.
- `JSX.Element` 반환 타입 명시 시 `import type { JSX } from 'react'` 필요. 전역 JSX 네임스페이스가 없기 때문.
- ItemCard의 image_path 썸네일은 step 7(이미지 업로드 플로우)에서 signed URL로 교체 예정. 현재는 회색 placeholder만 표시.
