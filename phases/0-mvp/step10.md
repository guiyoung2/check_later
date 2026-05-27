# Step 10: pwa-config

## 읽어야 할 파일

먼저 아래 파일들을 읽고 현재 설정을 파악하라:

- `docs/PRD.md` — Web Share Target 동작, 파라미터(title/text/url), method:GET, action:/new
- `docs/ARCHITECTURE.md` — 라우트 목록
- `docs/UI_GUIDE.md` — 테마 색상 (`--color-accent`: oklch(62% 0.14 55) ≈ #c2733a)
- `vite.config.ts` — 현재 VitePWA 기본 설정 (`registerType: 'autoUpdate'`)
- `package.json` — vite-plugin-pwa 버전 확인

## 현재 상태

`vite.config.ts`에 `VitePWA({ registerType: 'autoUpdate' })`만 있는 기본 설정. manifest와 Workbox 전략을 추가해야 한다.

## 작업

### 1. `vite.config.ts` VitePWA 설정 확장

기존 `VitePWA({ registerType: 'autoUpdate' })` 옵션을 아래로 교체하라.

```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'Check Later',
    short_name: 'Check Later',
    description: '나중에 볼 콘텐츠를 빠르게 저장하고 분류하는 개인 도구',
    theme_color: '#c2733a',
    background_color: '#f7f4f0',
    display: 'standalone',
    start_url: '/',
    scope: '/',
    lang: 'ko',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    share_target: {
      action: '/new',
      method: 'GET',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        // Supabase API 요청: networkFirst (항상 최신 데이터 우선)
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60, // 1시간
          },
        },
      },
    ],
  },
})
```

### 2. PWA 아이콘 placeholder 생성

`public/pwa-192x192.png`와 `public/pwa-512x512.png`가 없으면 빌드 경고가 발생한다.

아이콘 파일 생성 방법 (2가지 중 선택):

**방법 A**: `public/` 에 간단한 SVG 파일(`pwa-icon.svg`)을 만들고, 이를 바탕으로 PNG를 생성하는 방법을 `README` 또는 주석으로 안내한다. 빌드 오류를 방지하기 위해 1×1 pixel placeholder PNG를 임시로 넣는다.

**방법 B**: vite-plugin-pwa의 `@vite-pwa/assets-generator` 도구를 사용한다. 이 방법은 별도 패키지 설치가 필요하므로 사용자에게 선택을 요청한다.

**권장**: 이 step에서는 **방법 A**로 진행하라. 실제 아이콘은 나중에 교체할 수 있다. `public/pwa-192x192.png`와 `public/pwa-512x512.png`를 1×1 흰 픽셀 PNG로 임시 생성하거나, 간단한 Node.js 스크립트로 solid color PNG를 만들어 넣어라.

### 3. 빌드 검증

빌드 후 `dist/` 디렉토리에서 확인:

```bash
npm run build
# dist/manifest.webmanifest 또는 dist/pwa-manifest.json에 share_target 항목이 있어야 함
```

## Acceptance Criteria

```bash
npm run build   # 빌드 성공, 아이콘 관련 경고 없음 (placeholder로 해결)
```

빌드 결과 확인:
```bash
# manifest 파일에 share_target이 포함되어 있는지 확인
# Windows PowerShell:
Get-Content dist\manifest.webmanifest | Select-String "share_target"
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. manifest에 `share_target` 항목이 있는지 확인한다.
3. `phases/0-mvp/index.json`의 step 10을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "VitePWA 설정 확장: manifest(Web Share Target GET /new), Workbox networkFirst(Supabase), PWA 아이콘 placeholder 추가"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- `share_target`의 `method`를 POST로 설정하지 마라. 이유: PRD 명시 — "method: GET". POST 방식은 Service Worker에서 별도 처리가 필요해 복잡도가 크게 늘어난다.
- `share_target` 파라미터에 `files`를 추가하지 마라. 이유: PRD MVP 제외 — "파일 공유 수신은 V2 후보".
- `display`를 `browser`로 설정하지 마라. PWA 홈 화면 설치를 위해 `standalone`이어야 한다.
- 기존 테스트를 깨뜨리지 마라.
