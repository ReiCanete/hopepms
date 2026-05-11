import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const { data: userRow } = await supabase
          .from('user')
          .select('record_status')
          .eq('userId', session.user.id)
          .single();
        if (!userRow || userRow?.record_status !== 'ACTIVE') {
          await supabase.auth.signOut();
          navigate('/login?error=not_activated');
        } else {
          navigate('/products');
        }
      } else {
        navigate('/login');
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Signing you in...</p>
      </div>
    </div>
  );
}