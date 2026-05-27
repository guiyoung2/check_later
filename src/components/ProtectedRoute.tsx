import { Outlet } from 'react-router-dom';

// 인증 체크 placeholder — Step 2에서 실제 인증 로직 추가
export default function ProtectedRoute() {
  return <Outlet />;
}
