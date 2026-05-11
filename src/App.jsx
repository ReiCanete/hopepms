import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

function PlaceholderPage({ name }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">{name}</h1>
      <p className="text-slate-400 mt-2 text-sm">Coming in next sprint...</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/products" element={<PlaceholderPage name="Products" />} />
        <Route path="/reports" element={<PlaceholderPage name="Reports" />} />
        <Route path="/deleted-items" element={<PlaceholderPage name="Deleted Items" />} />
        <Route path="/admin" element={<PlaceholderPage name="Admin" />} />
      </Route>
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}