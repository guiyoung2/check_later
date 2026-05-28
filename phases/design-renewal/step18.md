# Step 18: pwa-regression

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/PRD.md` — Web Share Target 동작 명세 (method: GET, 파라미터 3개)
- `docs/ARCHITECTURE.md` — 라우트 구조
- `fix3_design.md` — §4.2 Web Share Target 진입 처리
- `public/manifest.json` (또는 `vite.config.ts`의 PWA 설정) — manifest 현황
- `src/pages/NewItemPage.tsx` — step 7에서 수정됨

## 작업

PWA와 Web Share Target 관련 기능이 design-renewal 변경 후에도 정상 동작하는지 전수 점검하고 회귀를 수정한다.

### 점검 항목

**manifest 무결성:**
- [ ] `manifest.json`의 `share_target` 설정이 그대로인지 확인:
  ```json
  "share_target": {
    "action": "/new",
    "method": "GET",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
  ```
- [ ] `name`, `short_name`, `icons`, `theme_color`, `background_color` 변경 없음 확인
- [ ] `start_url`, `display: standalone` 변경 없음 확인

**Web Share Target 진입 회귀:**
- [ ] `/new?title=테스트&text=메모내용&url=https://example.com` 진입 시 필드 자동 채움 확인
- [ ] `/new?url=https://youtube.com/watch?v=abc` 진입 시 type chip "영상" 자동 감지 확인
- [ ] 자동 저장 아님 — 확인 화면 유지 확인
- [ ] 저장 버튼이 즉시 클릭 가능한 위치에 있음 확인

**PWA 설치 상태 시뮬레이션:**
- [ ] DevTools → Application → Manifest: 오류 없음
- [ ] Lighthouse PWA 점수 확인 (이전 점수 대비 하락 없음)

**Service Worker:**
- [ ] `vite.config.ts`의 `vite-plugin-pwa` 설정 변경 없음
- [ ] 빌드 후 `dist/sw.js` 생성 확인

### 자동 테스트

```tsx
// 기존 Web Share Target 테스트가 있는지 확인
// 없으면 추가:
// NewItemPage URL 파라미터 → 폼 필드 자동 채움 테스트
test('Web Share Target: url 파라미터로 진입 시 type 자동 판정', async () => {
  // render <NewItemPage /> with ?url=https://youtube.com/...
  // expect: type chip "영상" 표시
});
```

## Acceptance Criteria

```bash
npm run build
npm run test -- --run
```

빌드 통과, 테스트 회귀 없음. manifest 변경 없음 확인. Web Share Target 회귀 테스트 통과.

## 검증 절차

1. `npm run build && npm run test -- --run`
2. manifest 확인:
   ```bash
   grep -c "share_target" public/manifest.json  # 1 이상이어야 함
   grep "display" public/manifest.json           # "standalone" 이어야 함
   ```
3. 빌드 결과 확인:
   ```bash
   ls dist/sw.js  # Service Worker 파일 존재
   ```
4. 결과에 따라 `phases/design-renewal/index.json`의 step 18 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "PWA + Web Share Target 회귀 점검 완료 — manifest 무결, SW 생성 확인, URL 파라미터 자동 채움 테스트 통과"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- `manifest.json`의 `share_target` 설정을 수정하지 마라. 이유: Web Share Target 핵심 설정. 변경 시 Android에서 공유 메뉴 등록이 해제됨.
- `vite-plugin-pwa` 설정(`vite.config.ts`)을 임의로 수정하지 마라. 이유: Service Worker 재생성 범위가 달라질 수 있다. 변경이 필요하면 사용자에게 확인.
- `display: standalone` 이외의 값으로 변경하지 마라. 이유: PWA 설치 판단 기준.
