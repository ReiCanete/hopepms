import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const safetyRef = useRef(null);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('EVENT:', event);
      console.log('USER ID:', session?.user?.id);

      if (session?.user) {
        try {
          const userRowPromise = supabase
            .from('app_user')
            .select('record_status, user_type, username, first_name, last_name')
            .eq('user_id', session.user.id)
            .single();

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 15000)
          );

          const { data: userRow, error } = await Promise.race([userRowPromise, timeoutPromise]);

          console.log('USER ROW:', userRow);
          console.log('ERROR:', error);

          if (error || !userRow || userRow.record_status !== 'ACTIVE') {
            await supabase.auth.signOut();
            setCurrentUser(null);
          } else {
            // Cancel safety timeout — auth resolved successfully
            clearTimeout(safetyRef.current);
            setCurrentUser({ ...session.user, ...userRow });
          }
        } catch (err) {
          console.log('CAUGHT ERROR:', err.message);
          // Don't sign out on timeout — another event may succeed
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    safetyRef.current = setTimeout(() => {
      console.log('Safety timeout fired');
      setLoading(false);
    }, 20000);

    return () => {
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