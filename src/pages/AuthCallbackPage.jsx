import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Clear the fallback timeout immediately
        clearTimeout(timeoutRef.current);

        const { data: userRow } = await supabase
          .from('app_user')
          .select('record_status')
          .eq('user_id', session.user.id)
          .single();

        if (userRow?.record_status === 'ACTIVE') {
          navigate('/products');
        } else {
          await supabase.auth.signOut();
          navigate('/login?error=not_activated');
        }
        listener?.subscription?.unsubscribe();
      } else if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    // Give it 10 seconds instead of 5, and use the ref so it can be cancelled
    timeoutRef.current = setTimeout(() => navigate('/login'), 10000);

    return () => {
      clearTimeout(timeoutRef.current);
      listener?.subscription?.unsubscribe();
    };
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