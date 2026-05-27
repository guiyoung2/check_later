import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'

// 시스템 감지 + localStorage override 우선
const _mql = window.matchMedia('(prefers-color-scheme: dark)');
const _stored = localStorage.getItem('theme');
const _isDark = _stored !== null ? _stored === 'dark' : _mql.matches;
document.documentElement.classList.toggle('dark', _isDark);
_mql.addEventListener('change', (e) => {
  // 수동 설정이 없을 때만 시스템 따라감
  if (localStorage.getItem('theme') === null) {
    document.documentElement.classList.toggle('dark', e.matches);
  }
});

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
