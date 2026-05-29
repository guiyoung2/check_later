# design-renewal-fix 진행 현황

## 마지막 업데이트
2026-05-29T16:01:12+0900 — Step 8/9 완료

## 완료된 작업
- Step 0: landing-redesign — LandingPage: 헤더 우상단 Login 버튼 추가, 히어로 2칼럼(텍스트+MiniPreview 목업), 카피 교체, 테스트 갱신. 빌드·68 테스트 통과.
- Step 1: login-copy — LoginPage: '로그인 / 회원가입' 문단 제거(Google OAuth 단일 반영). 동작 무변경. 빌드·68 테스트 통과.
- Step 2: home-header-theme — HomePage TopAppBar rightAction에 ThemeToggleButton 추가(계정 아이콘 왼쪽). 빌드·68 테스트 통과.
- Step 3: settings-remove-theme — SettingsPage에서 THEME 섹션·theme state·effect·themeOptions·joinClasses·lib/theme import 제거, 테마 테스트 1건 제거. 빌드·67 테스트 통과.
- Step 4: filter-chips — Chip.tsx type 변형: rounded-xs→rounded-full, font-mono text-[12px]→font-body text-[13px]로 type/status 일관화. AtomicComponents.test.tsx 단언 동반 갱신. 빌드·67 테스트 통과.
- Step 5: feed-card-redesign — 4종 카드(Article/Video/Memo/Image)를 컴팩트 리스트 행으로 재설계. 좌측 64x64 소형 썸네일+우측 메타·제목·메모. ImageCard object-contain, VideoCard play배지 유지. 빌드·67 테스트 통과.
- Step 6: item-form-extract — ItemForm 공용 컴포넌트 신설(제목/다중URL/다중이미지/메모/og:title/type칩). 최소 렌더 테스트 6건 추가. 빌드·73 테스트 통과.
- Step 7: new-item-rich — NewItemPage를 ItemForm(mode=create) 기반으로 교체. Web Share Target(?title/?url/?text) initialValues 매핑 보존. 다중 URL/이미지 첨부 저장. 테스트 갱신+다중 URL 테스트 추가. 빌드·74 테스트 통과.

## 현재 진행 중
- Step 8: edit-item-migrate

## 다음 할 일
- `src/pages/ItemDetailPage.tsx`에서 기존 수정 폼을 ItemForm(mode="edit")으로 교체
- 기존 attachments(URL/이미지) 조회 → existingImagePaths, initialValues.urls 매핑
- onSubmit에서 updateItem + itemAttachmentsService.replaceForItem 호출
- 기존 ItemDetailPage.test.tsx 테스트 회귀 확인

## 주의사항
- ItemForm의 `onSubmit`은 값 수집만 담당. 저장 오케스트레이션은 반드시 페이지 컴포넌트에서.
- '메모' 텍스트는 form 라벨과 type 칩 두 곳에 존재 → `getByText('메모')` 대신 `getAllByText` 사용.
- detectType 로직: ItemForm 내부 판정과 페이지 handleSubmit의 판정이 동일 로직을 사용해야 표시·저장 일치.
