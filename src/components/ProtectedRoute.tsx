import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

// 인증 여부에 따라 보호된 라우트 또는 로그인 페이지로 분기
export default function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}
