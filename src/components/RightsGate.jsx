import { useRights } from '../context/UserRightsContext';
import { useAuth } from '../context/AuthContext';

export function RequireRight({ rightId, children }) {
  const { rights } = useRights();
  if (!rights || rights[rightId] !== 1) return null;
  return children;
}

export function RequireAdmin({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return null;
  if (!['ADMIN','SUPERADMIN'].includes(currentUser.user_type)) return null;
  return children;
}