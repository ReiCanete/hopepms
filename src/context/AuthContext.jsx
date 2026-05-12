import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    let mounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') return;

      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        if (initialized.current && currentUser?.id === session.user.id) return;
        try {
          const { data: userRow, error } = await supabase
            .from('app_user')
            .select('record_status, user_type, username, first_name, last_name')
            .eq('user_id', session.user.id)
            .single();
          if (!mounted) return;
          if (!error && userRow?.record_status === 'ACTIVE') {
            setCurrentUser({ ...session.user, ...userRow });
          } else {
            await supabase.auth.signOut();
            setCurrentUser(null);
          }
        } catch (err) {
          console.log('AuthContext error:', err.message);
          if (mounted) setCurrentUser(null);
        }
        if (mounted) {
          initialized.current = true;
          setLoading(false);
        }
      }
    });

    const safety = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 5000);

    return () => {
      mounted = false;
      clearTimeout(safety);
      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }