import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('SESSION:', session);
    console.log('USER ID:', session?.user?.id);
    if (session) {
      const { data: userRow, error } = await supabase
        .from('app_user')
        .select('record_status, user_type, username, first_name, last_name')
        .eq('user_id', session.user.id)
        .single();
      console.log('USER ROW:', userRow);
      console.log('ERROR:', error);
      if (!userRow || userRow.record_status !== 'ACTIVE') {
        await supabase.auth.signOut();
        setCurrentUser(null);
      } else {
        setCurrentUser({ ...session.user, ...userRow });
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  });
  return () => listener?.subscription?.unsubscribe();
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