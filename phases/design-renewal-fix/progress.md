# design-renewal-fix 진행 현황

## 마지막 업데이트
2026-05-29T11:35:30+0900 — Step 6 완료

## 완료된 작업
- Step 0: landing-redesign — LandingPage: 헤더 우상단 Login 버튼 추가, 히어로 2칼럼(텍스트+MiniPreview 목업), 카피 교체, 테스트 갱신. 빌드·68 테스트 통과.
- Step 1: login-copy — LoginPage: '로그인 / 회원가입' 문단 제거(Google OAuth 단일 반영). 동작 무변경. 빌드·68 테스트 통과.
- Step 2: home-header-theme — HomePage TopAppBar rightAction에 ThemeToggleButton 추가(계정 아이콘 왼쪽). 빌드·68 테스트 통과.
- Step 3: settings-remove-theme — SettingsPage에서 THEME 섹션·theme state·effect·themeOptions·joinClasses·lib/theme import 제거, 테마 테스트 1건 제거. 빌드·67 테스트 통과.
- Step 4: filter-chips — Chip.tsx type 변형: rounded-xs→rounded-full, font-mono text-[12px]→font-body text-[13px]로 type/status 일관화. AtomicComponents.test.tsx 단언 동반 갱신. 빌드·67 테스트 통과.
- Step 5: feed-card-redesign — 4종 카드(Article/Video/Memo/Image)를 컴팩트 리스트 행으로 재설계. 좌측 64x64 소형 썸네일+우측 메타·제목·메모. ImageCard object-contain, VideoCard play배지 유지. 빌드·67 테스트 통과.
- Step 6: item-form-extract — ItemForm 공용 컴포넌트 신설(제목/다중URL/다중이미지/메모/og:title/type칩). 최소 렌더 테스트 6건 추가. 빌드·73 테스트 통과.

## 다음 할 일 (Step 7: new-item-rich)
- NewItemPage를 ItemForm으로 교체 (mode: create)
- 기존 bottom-sheet 단순 폼 로직 제거 (content/typeOverride/imageFile 등 단일 상태 대신 ItemForm values 사용)
- `onSubmit` 핸들러: title/urls/memo/newImageFiles → createItem + itemAttachmentsService.createMany + storageService.upload
- Web Share Target 파라미터(?url, ?text, ?title)를 ItemForm initialValues로 변환
- 관련 테스트 갱신

## 주의사항 (step 6 추가)
- step 0에서 `MiniPreview`가 `LandingPage.tsx` 내부 함수로 정의됨 (별도 파일 아님). 외부 재사용 불필요.
- `ThemeToggleButton`은 `useState(isDarkActive)` 초기값에 `isDarkActive`(함수 레퍼런스)를 사용하므로 테스트 환경에서 초기값이 false로 잡힌다. ThemeToggleButton 관련 테스트 시 주의.
- 헤더 Login 버튼은 `variant="ghost" size="sm"` 사용. 접근성 name은 "Login"(children 텍스트).
- HomePage에서 `rightAction`을 `<div className="flex items-center">` 래퍼로 묶어 두 컨트롤을 가로 배치했다.
- 테마 변경 수단은 랜딩/홈 헤더 토글로 일원화됨. 'system' 자동추종 선택지는 UI에서 사라지고 부트스트랩 기본값으로만 존재.
- `lib/theme.ts`·`main.tsx`·`ThemeToggleButton.tsx`는 step 3에서 수정하지 않음. 테마 부트스트랩/토글 동작 그대로 유지.
- Chip `type` 변형이 `font-mono`에서 `font-body`로 바뀜. `count` 변형은 여전히 `font-mono` 유지(숫자 표시용).
- AtomicComponents.test.tsx의 Chip 단언이 `font-body`, `text-[13px]`, `rounded-full`로 갱신됨 — step 4 이전 단언(`font-mono`, `text-[12px]`, `rounded-xs`)은 더 이상 유효하지 않음.
- 카드 레이아웃 변경: 모든 카드가 `flex items-start gap-3 p-3 md:p-4` 행 구조로 통일됨. 기존 `h-64`/`aspect-video` 대형 썸네일 영역 제거. ArticleCard의 `Divider` import도 제거됨.
- ImageCard 썸네일은 `object-contain` (크롭 없이 전체 이미지), VideoCard 썸네일은 `object-cover` + PlayBadge 오버레이 유지.
- 카드 title font-size: 24px → 15px (밀도 향상). 제스처/BottomSheet/삭제 확인 로직은 ItemCard.tsx에 그대로 보존됨.
- ItemForm `existingImagePaths`는 경로 문자열만 관리. 실제 이미지 미리보기는 호출측(step 8)이 `existingImageSignedUrls` prop으로 signed URL 맵을 전달해야 함 (storageService 호출은 폼 외부).
- ItemForm og:title 자동채움: 첫 번째 URL(urls[0])이 http/https이고 title이 비어있을 때만 덮어씀. title ref로 추적하여 promise 완료 시점에 사용자가 이미 입력했으면 스킵.
- NewItemPage 교체(step 7) 시 기존 `content` 단일 state + QuickOptionButton + textarea 구조 전체 제거하고 ItemForm으로 대체. Web Share Target 파라미터는 initialValues.urls/memo/title로 변환.
- ItemForm 테스트에서 "메모" 텍스트가 레이블(메모 textarea)과 type칩 두 곳에 등장 — `getAllByText('메모')` 사용.
