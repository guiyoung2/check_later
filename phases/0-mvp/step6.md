# Step 6: new-item-form

## 읽어야 할 파일

먼저 아래 파일들을 읽고 설계 의도와 현재 코드를 파악하라:

- `docs/ARCHITECTURE.md` — type 자동 판정 우선순위, `/new` 라우트 설명
- `docs/PRD.md` — Web Share Target 동작, 파라미터 설명 (title/text/url), 확인 화면 동작
- `docs/UI_GUIDE.md` — 컬러 토큰, 버튼/입력 규칙, "저장은 반사적으로" 원칙
- `src/lib/form-type-detect.ts` — detectType 함수 (step 3 산출물)
- `src/lib/og-parser.ts` — fetchOgTitle 함수 (step 3 산출물)
- `src/hooks/useCreateItem.ts` — useCreateItem 훅 (step 4 산출물)
- `src/lib/auth.tsx` — useAuth 훅 (step 2 산출물)
- `src/types/index.ts` — CreateItemInput (id?: string 포함, step 0+3 산출물)

## 작업

### 1. `src/pages/NewItemPage.tsx` 구현 — 이미지 없는 기본 폼

이 step에서는 이미지 업로드를 **포함하지 않는다**. 이미지 업로드는 step 7에서 추가한다.

```typescript
export default function NewItemPage(): JSX.Element
```

#### URL 파라미터 파싱

`useSearchParams`로 `title`, `text`, `url` 파라미터를 읽어 폼 필드에 자동 채운다:

```
/new?title=기사제목&text=짧은메모&url=https://example.com
```

- `title` 파라미터 → title 필드 초기값
- `text` 파라미터 → memo 필드 초기값
- `url` 파라미터 → url 필드 초기값

#### 폼 필드 구성 (이미지 없음)

| 필드 | 타입 | 동작 |
|------|------|------|
| title | text input | 필수. URL이 있을 때 og:title 추출 후 자동 채움 |
| type | 칩 형태 선택 UI | detectType으로 자동 판정, **사용자가 직접 변경 가능** |
| url | text input | 선택. 변경 시 type 재판정 + og:title 재시도 |
| memo | textarea | 선택. 짧은 메모 |

type 선택 UI 규칙:
- 4개 type 칩(영상/글/캡처/메모)을 가로로 나열
- 현재 선택된 type이 강조됨 (accent 배경)
- 클릭하면 해당 type으로 변경됨

#### og:title 자동 채움 로직

1. url 필드에 값이 있을 때 `fetchOgTitle(url)`을 호출한다 (url 변경 후 debounce 없이 즉시 호출 OK).
2. 성공하면 title 필드가 비어 있을 경우에만 채운다 (사용자가 이미 입력한 값은 덮어쓰지 않는다).
3. 실패(null 반환)하면 title 필드가 비어 있을 경우 url 자체를 title로 채운다.

#### 저장 동작

1. `useCreateItem()` mutation 호출 (image_path 없이)
2. 저장 성공 시 `/`로 이동 (`useNavigate`)
3. 저장 중에는 버튼을 비활성화하고 로딩 표시

#### 디자인 규칙 (UI_GUIDE.md 기준)

- 배경: `bg-[--color-bg]`
- "저장은 반사적으로" 원칙: 폼이 가볍고 빠르게 느껴져야 한다
- 저장 버튼: accent 배경 (`bg-[--color-accent]`), border-radius 8px, primary 스타일
- 입력 필드: border-radius 6px, `border-[--color-border]` 테두리
- 상단에 뒤로가기 버튼 (`useNavigate(-1)`)

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 기존 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `phases/0-mvp/index.json`의 step 6을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "NewItemPage 구현: URL 파라미터 파싱, type 자동 판정 + 사용자 변경 가능 칩 UI, og:title 추출, 저장(이미지 없음) 후 / 이동"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 이미지 파일 input을 추가하지 마라. 이유: 이미지 업로드는 step 7에서 담당한다.
- 자동 저장 기능을 구현하지 마라. 이유: PRD 명시 — "자동 저장이 아닌 확인 화면. 사용자가 저장 버튼을 누른다."
- og:title 추출 실패를 에러로 표시하지 마라. 이유: CORS 실패는 정상 상황. 조용히 URL을 fallback으로 사용한다.
- 사용자가 title을 직접 입력한 경우 og:title 추출 결과로 덮어쓰지 마라.
- `files` 파라미터를 Web Share Target에서 수신하려 하지 마라. 이유: PRD MVP 제외.
- 기존 테스트를 깨뜨리지 마라.
