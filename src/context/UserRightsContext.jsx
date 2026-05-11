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
  .from('user_module_rights')
  .select('right_id, right_value')
  .eq('user_id', currentUser.id)
  .eq('record_status', 'ACTIVE');
if (data) {
  const map = {};
  data.forEach(r => { map[r.right_id] = r.right_value; });
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
