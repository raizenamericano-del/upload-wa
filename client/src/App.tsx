import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Layout from './components/layout/Layout';
import HomePage from './pages/Home';
import ConnectionPage from './pages/Connection';
import UploadPage from './pages/Upload';
import HistoryPage from './pages/History';
import SettingsPage from './pages/Settings';
import NotFoundPage from './pages/NotFound';

function App() {
  // Initialize theme
  const { isDark } = useTheme();

  return (
    <div className={isDark ? 'dark' : ''}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="connect" element={<ConnectionPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
