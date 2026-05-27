import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ItemDetailPage from './pages/ItemDetailPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NewItemPage from './pages/NewItemPage';
import SettingsPage from './pages/SettingsPage';

// 루트 경로: 인증 여부에 따라 메인화면 또는 랜딩페이지
function RootPage() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return session ? <HomePage /> : <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/new" element={<NewItemPage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
