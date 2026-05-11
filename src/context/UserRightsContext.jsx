import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const UserRightsContext = createContext(null);

export function UserRightsProvider({ children }) {
  const { currentUser } = useAuth();
  const [rights, setRights] = useState(null);
  const [loadingRights, setLoadingRights] = useState(true);

  useEffect(() => {
    if (!currentUser) { setRights(null); setLoadingRights(false); return; }
    async function loadRights() {
      const { data } = await supabase
        .from('UserModule_Rights')
        .select('Right_ID, Right_value')
        .eq('userid', currentUser.id)
        .eq('Record_status','ACTIVE');
      if (data) {
        const map = {};
        data.forEach(r => { map[r.Right_ID] = r.Right_value; });
        setRights(map);
      }
      setLoadingRights(false);
    }
    loadRights();
  }, [currentUser]);

  return (
    <UserRightsContext.Provider value={{ rights, loadingRights }}>
      {children}
    </UserRightsContext.Provider>
  );
}

export function useRights() { return useContext(UserRightsContext); }