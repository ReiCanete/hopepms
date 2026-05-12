import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('EVENT:', event);
      console.log('USER ID:', session?.user?.id);

      if (session?.user) {
        try {
          // Race the query against a 5 second timeout
          const userRowPromise = supabase
            .from('app_user')
            .select('record_status, user_type, username, first_name, last_name')
            .eq('user_id', session.user.id)
            .single();

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 5000)
          );

          const { data: userRow, error } = await Promise.race([userRowPromise, timeoutPromise]);

          console.log('USER ROW:', userRow);
          console.log('ERROR:', error);

          if (error || !userRow || userRow.record_status !== 'ACTIVE') {
            console.log('Signing out — no active row or error');
            await supabase.auth.signOut();
            setCurrentUser(null);
          } else {
            setCurrentUser({ ...session.user, ...userRow });
          }
        } catch (err) {
          console.log('CAUGHT ERROR:', err.message);
          await supabase.auth.signOut();
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    // Safety net — if onAuthStateChange never fires, unblock the UI after 8s
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout fired');
      setLoading(false);
    }, 8000);

    return () => {
      clearTimeout(safetyTimeout);
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