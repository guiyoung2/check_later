// 테마 환경설정(system/light/dark) 영속 + 적용 단일 모듈
// 부트스트랩(main.tsx), 설정 페이지, 랜딩 토글이 모두 이 모듈을 공유한다.
export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'check-later-theme';

// 저장된 환경설정 조회 (기본값 system)
export function getStoredTheme(): ThemePreference {
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system';
}

// 시스템이 다크를 선호하는지
export function prefersDarkMode(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// 환경설정을 documentElement class로 반영
export function applyThemePreference(theme: ThemePreference): void {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'dark' || (theme === 'system' && prefersDarkMode())) {
    root.classList.add('dark');
    return;
  }
  if (theme === 'light') {
    root.classList.add('light');
  }
}

// 환경설정 저장 + 즉시 적용
export function setThemePreference(theme: ThemePreference): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyThemePreference(theme);
}

// 현재 화면이 다크로 보이는 상태인지 (토글 버튼용)
export function isDarkActive(): boolean {
  const pref = getStoredTheme();
  return pref === 'dark' || (pref === 'system' && prefersDarkMode());
}
