# 0-mvp 진행 현황

## 마지막 업데이트
2026-05-27T10:49:00+0900 — Step 2 (auth) 완료

## 완료된 작업
- Step 0: foundation — react-router-dom·@supabase/supabase-js 설치, 타입 정의, 라우팅 스켈레톤
- Step 1: supabase-schema — items 테이블 + RLS 4개 + item-images Storage 버킷 + RLS 3개
- Step 2: auth — AuthProvider + useAuth(src/lib/auth.tsx), LoginPage(Google OAuth), ProtectedRoute, main.tsx AuthProvider 래핑

## 현재 진행 중
- 없음

## 다음 할 일
- Step 3: services-and-utils
  - `src/services/items.ts` — itemsService (list/getById/create/update/remove)
  - `src/services/storage.ts` — storageService (upload, getSignedUrl)
  - `src/lib/form-type-detect.ts` — detectType 유틸 (이미지→screenshot, YouTube→video, URL→article, 메모→memo)
  - `src/lib/og-parser.ts` — og:title 추출 시도 + CORS fallback

## 주의사항
- Supabase Auth Google OAuth는 Supabase Dashboard에서 Google provider 활성화 + OAuth 클라이언트 ID/Secret 설정이 필요하다 (수동 설정, 코드로 불가).
- `verbatimModuleSyntax` 활성화로 인해 타입 import 시 반드시 `import type` 사용해야 한다.
- LoginPage에서 이미 인증된 사용자 리다이렉트는 `useEffect`로 처리한다 (`loading` 완료 후 확인).
- AuthProvider는 반드시 QueryClientProvider 안쪽, App 바깥쪽에 위치해야 한다.
