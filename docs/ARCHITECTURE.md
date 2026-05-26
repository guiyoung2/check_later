# 아키텍처 — Check Later

## 디렉토리 구조

```
src/
 ├ pages/         (라우트 컴포넌트)
 ├ components/    (UI 컴포넌트)
 ├ lib/           (supabase client, utils, og-parser, form-type-detect)
 ├ services/      (items, storage repository)
 ├ stores/        (Zustand UI 상태)
 ├ hooks/         (TanStack Query 훅)
 ├ types/         (DB 생성 타입 + 도메인 타입)
 └ test/          (Vitest setup, sanity test)
```

## 패턴

- **서버 상태**: TanStack Query — Supabase 데이터(목록, 상세) 캐싱·리페치·낙관적 업데이트
- **UI 상태**: Zustand — 필터 선택값, 모달 열림/닫힘 등 순수 클라이언트 상태
- **인증**: Supabase Auth (Google OAuth)
- **권한**: Row Level Security — `user_id = auth.uid()` 조건으로 DB 차원 강제

## 데이터 흐름

```
사용자 액션
  → TanStack Query mutation (낙관적 업데이트)
  → Supabase PostgREST API (RLS 적용)
  → Postgres items 테이블
  → Query invalidation → UI 갱신

이미지 업로드:
  → Supabase Storage (item-images 버킷, private)
  → 경로: {user_id}/{item_id}.{ext}
  → signed URL로 접근
```

## items 테이블 스키마

| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK → `auth.users`, RLS 키 |
| `type` | enum | `'video' \| 'article' \| 'screenshot' \| 'memo'` |
| `status` | enum | `'pending' \| 'reviewed' \| 'archived'` |
| `title` | text | URL이면 og:title 클라이언트 추출 시도 → CORS 실패 시 URL 자체를 title로 fallback → 없으면 사용자 입력 |
| `memo` | text | 사용자 짧은 메모 (nullable) |
| `url` | text | nullable |
| `image_path` | text | Supabase Storage 경로 (nullable) |
| `created_at` | timestamptz | 기본값 now() |
| `updated_at` | timestamptz | 기본값 now() |

## type 자동 판정 우선순위

입력값으로 `type`을 자동 결정한다. 우선순위는 높은 것부터:

1. 앱 내부 업로드 이미지 있음 → `screenshot`
2. `url`이 youtube.com / youtu.be 도메인 → `video`
3. `url` 있음 (일반) → `article`
4. 텍스트 메모만 → `memo`

자동 판정 결과는 `/new` 확인 화면에서 사용자가 변경 가능.

## RLS 정책

- SELECT/INSERT/UPDATE/DELETE: `user_id = auth.uid()` 만 허용

## Storage 버킷

- 버킷: `item-images` (private)
- 경로 규칙: `{user_id}/{item_id}.{ext}`
- 접근: signed URL 발급

### Storage RLS 정책

```sql
-- INSERT: 본인 폴더에만 업로드 허용
(storage.foldername(name))[1] = auth.uid()::text

-- SELECT/DELETE: 본인 파일만 접근 허용
(storage.foldername(name))[1] = auth.uid()::text
```

## 라우트

| 경로 | 화면 |
|---|---|
| `/login` | 로그인 / 회원가입 |
| `/` | 메인 목록 (필터 + 카드 리스트) |
| `/new` | 새 항목 추가. Web Share Target 진입 시 `?title=&text=&url=` 파라미터를 읽어 필드 자동 채움. 파일 공유 수신은 MVP 제외. 이미지는 앱 내부 업로드만 지원. 자동 저장 아닌 확인 화면. |
| `/items/:id` | 상세 보기 / 수정 |
| `/settings` | 로그아웃, PWA 설치 안내 |
