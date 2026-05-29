import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

// 구글 OAuth 로그인 페이지
export default function LoginPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && session) {
      navigate('/', { replace: true });
    }
  }, [session, loading, navigate]);

  const handleGoogleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: { prompt: 'select_account' },
      },
    });
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 text-text-primary">
      <div className="flex w-full max-w-[400px] flex-col gap-6 rounded-lg border border-border bg-surface px-6 py-8 shadow-card">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-[24px] leading-[1.4] font-semibold text-text-primary">
            Check Later
          </h1>
          <p className="text-[14px] leading-[1.5] text-text-muted">조용한 메모 도구</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={handleGoogleLogin}
          leftIcon={<GoogleIcon />}
          className="w-full"
        >
          Google로 계속하기
        </Button>

        <p className="text-center text-[14px] leading-[1.5] text-text-muted">
          홈 화면에 추가하면 더 빠르게 쓸 수 있어요
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="currentColor"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.258c-.805.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
        fill="currentColor"
      />
      <path
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
        fill="currentColor"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
        fill="currentColor"
      />
    </svg>
  );
}
