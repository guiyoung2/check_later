# Step 0: routing-deploy

## 읽어야 할 파일

먼저 아래 파일들을 읽고 현재 SPA 라우팅과 배포 설정을 파악하라:

- `docs/ARCHITECTURE.md` — 라우트 목록과 SPA 구조
- `docs/ADR.md` — Vite + React SPA 선택 이유
- `src/App.tsx` — BrowserRouter 기반 라우팅
- `vite.config.ts` — VitePWA 설정과 share_target action
- `package.json` — build/test 스크립트

## 현재 문제

배포된 `/login` 경로에서 새로고침하면 `404: NOT_FOUND`가 발생한다. 현재 앱은 `BrowserRouter`를 쓰는 Vite SPA이므로, 배포 서버가 모든 앱 라우트를 `index.html`로 fallback하지 않으면 `/login`, `/new`, `/items/:id` 같은 클라이언트 라우트 직접 진입이 404가 된다.

## 작업

### 1. SPA fallback 설정 추가

Vercel 배포 환경을 우선 가정한다. 프로젝트 루트에 `vercel.json`이 없다면 아래 의도의 설정을 추가하라:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

이미 동등한 배포 설정 파일이 있다면 중복 생성하지 말고 기존 설정을 최소 수정하라.

### 2. PWA 경로와 충돌 여부 확인

`vite.config.ts`의 `manifest.share_target.action`이 `/new`인 상태를 유지하라. fallback 설정은 `/new` 직접 진입과 Web Share Target 진입 모두 `index.html`로 들어오게 하는 목적이다.

### 3. 라우터 교체는 하지 않음

`HashRouter`로 바꾸지 마라. 이유: URL이 `/#/login` 형태로 바뀌고 Web Share Target/PWA 진입 경로 의도가 흐려진다. 서버 fallback 설정으로 해결한다.

## Acceptance Criteria

```bash
npm run build
npm test
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `vercel.json` 또는 기존 배포 설정이 모든 클라이언트 라우트를 `/`로 fallback하는지 확인한다.
3. `vite.config.ts`의 `share_target.action`이 `/new`로 유지되는지 확인한다.
4. `phases/1-ux-stabilization/index.json`의 step 0을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "SPA fallback 배포 설정 추가로 /login 등 직접 진입 404 대응"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`
5. `phases/1-ux-stabilization/feature_list.json`에서 `feat-1`을 통과 처리한다.
6. `phases/1-ux-stabilization/progress.md`의 다음 할 일과 주의사항을 갱신한다.

## 금지사항

- `BrowserRouter`를 `HashRouter`로 교체하지 마라. 이유: PWA/Web Share Target 경로와 사용자-facing URL 품질을 해친다.
- `/login`만 개별 rewrite하지 마라. 이유: `/new`, `/items/:id` 직접 진입도 같은 문제가 발생한다.
- PWA `share_target` 설정을 제거하거나 POST/files 방식으로 바꾸지 마라. 이유: MVP 범위와 기존 PRD를 벗어난다.
- 기존 테스트를 깨뜨리지 마라.
