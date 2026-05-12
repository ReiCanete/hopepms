import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallbackPage() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        navigate('/products', { replace: true });
      } else {
        navigate('/login?error=not_activated', { replace: true });
      }
    }
  }, [currentUser, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}