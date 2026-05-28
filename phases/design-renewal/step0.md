# Step 0: ui-guide-rewrite

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `docs/ARCHITECTURE.md`
- `docs/PRD.md`
- `fix3_design.md` — §2 디자인 토큰 전체, §5 안티패턴 가드레일 전체

## 작업

`docs/UI_GUIDE.md`를 `fix3_design.md` §2 내용으로 **전면 재작성**한다. 기존 amber/terracotta 관련 내용은 모두 제거한다.

재작성 내용:

1. **컬러 토큰** (라이트/다크 모두)
   - `--bg`, `--surface`, `--surface-sub`, `--border`, `--border-strong`, `--text-primary`, `--text-secondary`, `--text-muted`, `--error` — HEX + 보조 OKLCH 병기
   - 금지 사항 명시: `#000`/`#fff` 직접 사용 금지, chromatic accent 추가 금지

2. **타이포그래피 스케일**
   - display / display-mobile / headline / subhead / body / body-sm / label / label-mono
   - 각 role별 size, line-height, weight, letter-spacing 표

3. **Spacing & Radius 시스템**
   - spacing: 4/8/12/16/20/24/32/48 (base 4px)
   - gutter-mobile: 16px, gutter-desktop: 24~32px
   - max-content-width: 800px(단일 칼럼) / 1200px(Folders 그리드)
   - radius: xs(2px chip) / sm(4px button,input) / md(6px card) / lg(8px modal,bottomsheet) / full(9999px avatar,pill)

4. **그림자/모션**
   - shadow-card, shadow-overlay, shadow-modal 값
   - 다크 모드에서 그림자 없음
   - transition: 150–200ms cubic-bezier(0.16, 1, 0.3, 1)
   - bounce/elastic 금지, layout 속성 애니메이션 금지

5. **안티패턴 가드레일** — fix3_design.md §5 체크리스트 전체를 그대로 포함

6. **폰트 조합** 명시
   - 본문 한글: Pretendard, 영문/숫자: Geist, mono 라벨: JetBrains Mono
   - font-family-body / font-family-mono CSS 변수

## Acceptance Criteria

```bash
npm run lint
```

lint 통과 (UI_GUIDE.md는 마크다운 파일이므로 빌드/타입체크는 불필요)

## 검증 절차

1. `npm run lint` 실행하여 통과 확인
2. 재작성된 `docs/UI_GUIDE.md`에 amber/terracotta 키워드가 0개인지 확인:
   ```bash
   grep -i "amber\|terracotta" docs/UI_GUIDE.md
   ```
3. 안티패턴 가드레일 섹션이 fix3_design.md §5와 동일한지 대조 확인
4. 결과에 따라 `phases/design-renewal/index.json`의 step 0 업데이트:
   - 성공 → `"status": "completed"`, `"summary": "docs/UI_GUIDE.md 전면 재작성 완료 — 모노톤 토큰 + 안티패턴 가드레일 포함"`
   - 실패 3회 → `"status": "error"`, `"error_message": "구체적 에러"`

## 금지사항

- amber, terracotta, blue, green, violet 등 chromatic accent 토큰을 남기지 마라. 이유: fix3_design.md 결정에 따라 순수 모노톤만 허용.
- 기존 UI_GUIDE.md의 내용 중 컬러/타이포 외 섹션(컴포넌트 가이드 등)을 임의로 추가하지 마라. 이 step은 토큰 문서만 갱신한다.
- `docs/PRD.md`, `docs/ARCHITECTURE.md`는 건드리지 마라. 이유: 본 리뉴얼은 디자인만 변경한다.
