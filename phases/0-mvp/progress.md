# 0-mvp 진행 현황

## 마지막 업데이트
2026-05-27T13:05:30+0900 — Step 9/11 완료

## 완료된 작업
- Step 0: foundation — react-router-dom·@supabase/supabase-js 설치, 타입 정의, 라우팅 스켈레톤, 페이지 스텁 생성
- Step 1: supabase-schema — items 테이블 + RLS 4개 정책 + item-images Storage 버킷 + Storage RLS 3개 정책 수동 설정 완료
- Step 2: auth — AuthProvider(src/lib/auth.tsx) + LoginPage(Google OAuth) + ProtectedRoute 구현, main.tsx에 AuthProvider 래핑 추가
- Step 3: services-and-utils — CreateItemInput에 id?: string 추가, itemsService/storageService/og-parser/form-type-detect 생성
- Step 4: query-hooks-and-store — 5개 TanStack Query 훅(useItems/useItem/useCreateItem/usePatchItem/useDeleteItem) + Zustand filterStore 생성
- Step 5: home-page — FilterBar(type/status 칩) + ItemCard(텍스트 우선 리스트 행) + HomePage(로딩/빈상태/목록) 구현
- Step 6: new-item-form — NewItemPage 구현: URL 파라미터 파싱, type 자동 판정 + 사용자 변경 가능 칩 UI, og:title 추출, 저장(이미지 없음) 후 / 이동
- Step 7: image-upload-flow — NewItemPage에 이미지 업로드 추가: 파일 input, preAssignedId(crypto.randomUUID), storageService.upload, image_path 포함 저장
- Step 8: item-detail-page — ItemDetailPage 구현: 항목 표시, 인라인 편집(title/memo), 상태 변경(인라인 버튼), 이미지 signed URL, 삭제
- Step 9: settings-page — SettingsPage 구현: 계정 정보(이메일) 표시, 로그아웃(signOut), PWA 설치 프롬프트(beforeinstallprompt)

## 다음 할 일
- Step 10: pwa-config
  - vite-plugin-pwa manifest에 Web Share Target 설정 (method:GET, action:/new, params:{title,text,url})
  - Service Worker autoUpdate 설정
  - registerSW.js 등록 확인

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
- ItemDetailPage의 삭제 확인은 window.confirm 대신 바텀시트(fixed inset-0 오버레이) 방식으로 구현. UI_GUIDE 안티패턴(상태 변경 전용 모달 금지) 준수.
- storageService.getSignedUrl() 실패 시 페이지 전체 에러가 아닌 이미지만 조용히 숨기는 방식 채택.
- feat-20b(이미지 업로드 feature)는 step 7에서 구현됐으나 feature_list.json 업데이트가 누락된 상태로 남아있음. step 9에서 확인 필요.
