import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const safetyRef = useRef(null);

  useEffect(() => {
  let mounted = true;

  async function init() {
    // Fast path: get existing session immediately, no waiting
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: userRow, error } = await supabase
        .from('app_user')
        .select('record_status, user_type, username, first_name, last_name')
        .eq('user_id', session.user.id)
        .single();

      if (!error && userRow?.record_status === 'ACTIVE') {
        if (mounted) setCurrentUser({ ...session.user, ...userRow });
      } else {
        await supabase.auth.signOut();
        if (mounted) setCurrentUser(null);
      }
    }

    if (mounted) setLoading(false);
  }

  init();

  // Still listen for sign-in/sign-out events after initial load
  const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      if (mounted) setCurrentUser(null);
      return;
    }
    if (event === 'SIGNED_IN' && session?.user) {
      const { data: userRow, error } = await supabase
        .from('app_user')
        .select('record_status, user_type, username, first_name, last_name')
        .eq('user_id', session.user.id)
        .single();

      if (!error && userRow?.record_status === 'ACTIVE') {
        if (mounted) setCurrentUser({ ...session.user, ...userRow });
      } else {
        await supabase.auth.signOut();
        if (mounted) setCurrentUser(null);
      }
    }
  });

  return () => {
    mounted = false;
    clearTimeout(safetyRef.current);
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