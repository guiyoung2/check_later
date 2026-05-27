import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

// 시스템 다크모드 감지 → <html class="dark"> 토글
const _mql = window.matchMedia('(prefers-color-scheme: dark)');
const _applyDark = (e: MediaQueryList | MediaQueryListEvent) => {
  document.documentElement.classList.toggle('dark', e.matches);
};
_applyDark(_mql);
_mql.addEventListener('change', _applyDark);

import App from './App.tsx'
import { AuthProvider } from './lib/auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
