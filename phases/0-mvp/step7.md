# Step 7: image-upload-flow

## 읽어야 할 파일

먼저 아래 파일들을 읽고 현재 구현을 파악하라:

- `src/pages/NewItemPage.tsx` — step 6에서 구현한 기본 폼. 이 파일에 이미지 업로드를 추가한다.
- `src/services/storageService.ts` — storageService.upload 시그니처 (step 3 산출물)
- `src/types/index.ts` — CreateItemInput.id?: string, CreateItemInput.image_path?: string (step 3 산출물)
- `src/lib/form-type-detect.ts` — detectType의 hasImage 파라미터 (step 3 산출물)
- `src/lib/auth.tsx` — useAuth().user (step 2 산출물)
- `docs/ARCHITECTURE.md` — Storage 경로 규칙 `{user_id}/{item_id}.{ext}`

## 작업

### 1. `src/pages/NewItemPage.tsx` 수정 — 이미지 업로드 추가

step 6에서 구현한 NewItemPage.tsx에 이미지 업로드 기능을 추가한다.

#### 이미지 파일 input 추가

```typescript
// 폼에 추가할 필드
const [imageFile, setImageFile] = useState<File | null>(null);
```

- `<input type="file" accept="image/*">` 추가
- 파일 선택 시 `setImageFile(file)` + `detectType` 재실행 (`hasImage: true`)
- 파일 선택 시 type이 `'screenshot'`으로 자동 변경됨

#### itemId 선할당 패턴

이미지 업로드 경로(`{userId}/{itemId}.{ext}`)에 itemId가 필요하지만 저장 전에는 id가 없다.

**구현 방식**: 컴포넌트 마운트 시 `crypto.randomUUID()`로 itemId를 미리 생성한다.

```typescript
const [preAssignedId] = useState(() => crypto.randomUUID());
```

- 이미지가 있을 때: `storageService.upload(imageFile, user.id, preAssignedId)` 호출 후 `image_path` 확보
- `itemsService.create()`에 `{ id: preAssignedId, ..., image_path }` 전달
- 이미지가 없을 때: `preAssignedId`를 create에 전달하지 않아도 됨 (Supabase가 uuid 자동 생성)

#### 저장 흐름 수정

```
1. imageFile이 있으면:
   a. storageService.upload(imageFile, user.id, preAssignedId) → imagePath
   b. useCreateItem mutation ({ id: preAssignedId, ..., image_path: imagePath })
2. imageFile이 없으면:
   a. useCreateItem mutation ({ title, type, url, memo }) — id 없이
3. 성공 시 / 로 이동
```

업로드 중에는 저장 버튼 비활성화 + 로딩 표시.

#### type 자동 판정 연동

이미지 파일이 선택되면 `detectType({ hasImage: true, url: urlField })` 결과로 type 상태를 업데이트한다. 이미지 선택 해제(파일 인풋 초기화)하면 `detectType({ hasImage: false, url: urlField })`로 재판정.

## Acceptance Criteria

```bash
npm run build   # 컴파일 에러 없음
npm test        # 기존 테스트 통과
```

## 검증 절차

1. 위 AC 커맨드를 실행한다.
2. `phases/0-mvp/index.json`의 step 7을 업데이트한다:
   - 성공 → `"status": "completed"`, `"summary": "NewItemPage에 이미지 업로드 추가: 파일 input, preAssignedId(crypto.randomUUID), storageService.upload, image_path 포함 저장"`
   - 실패 → `"status": "error"`, `"error_message": "구체적 에러 내용"`

## 금지사항

- 이미지를 임시 경로에 업로드 후 나중에 복사하는 방식을 사용하지 마라. 이유: preAssignedId 패턴이 더 단순하다.
- `useAuth().user`가 null인 상태에서 업로드를 시도하지 마라. ProtectedRoute가 보장하지만 null 체크를 방어 코드로 추가한다.
- 업로드 실패 시 저장을 계속 진행하지 마라. 이유: image_path가 없으면 나중에 항목에서 이미지를 볼 수 없다. 에러를 사용자에게 표시하고 중단한다.
- 기존 테스트를 깨뜨리지 마라.
