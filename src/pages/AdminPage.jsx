import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { makeStamp, parseStamp } from '../utils/stampHelper';

// ── Helpers ───────────────────────────────────────────────────────────────────
async function fetchUsers() {
  const { data, error } = await supabase
    .from('app_user')
    .select('*')
    .order('last_name', { ascending: true });
  if (error) throw error;
  return data;
}

async function fetchRights() {
  const { data, error } = await supabase
    .from('rights')
    .select('*, module(description)')
    .order('right_id');
  if (error) throw error;
  return data;
}

async function fetchUserRights(user_id) {
  const { data, error } = await supabase
    .from('user_module_rights')
    .select('*')
    .eq('user_id', user_id);
  if (error) throw error;
  return data;
}

async function fetchAuditTrail() {
  const { data, error } = await supabase
    .from('audit_trail')    // view created in sprint SQL
    .select('*')
    .order('stamp', { ascending: false });
  if (error) throw error;
  return data;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user: authUser } = useAuth();

  const [tab, setTab] = useState('users');   // 'users' | 'audit'

  // Users
  const [users, setUsers] = useState([]);
  const [rights, setRights] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userRightsMap, setUserRightsMap] = useState({});   // { user_id: [right_rows] }
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [savingRight, setSavingRight] = useState(null);
  const [savingType, setSavingType] = useState(null);

  // Audit
  const [audit, setAudit] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // ── Load users + rights ────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoadingUsers(true);
      setUsersError('');
      try {
        const [u, r] = await Promise.all([fetchUsers(), fetchRights()]);
        setUsers(u);
        setRights(r);
      } catch (err) {
        setUsersError(err.message);
      } finally {
        setLoadingUsers(false);
      }
    }
    load();
  }, []);

  // ── Expand user row → load their rights ───────────────────────────────────
  async function toggleExpand(user_id) {
    if (expandedUser === user_id) { setExpandedUser(null); return; }
    setExpandedUser(user_id);
    if (!userRightsMap[user_id]) {
      const rows = await fetchUserRights(user_id);
      setUserRightsMap(prev => ({ ...prev, [user_id]: rows }));
    }
  }

  // ── Toggle right_value ────────────────────────────────────────────────────
  async function toggleRight(target_user_id, right_id, currentRows) {
    const key = `${target_user_id}-${right_id}`;
    setSavingRight(key);
    const existing = currentRows.find(r => r.right_id === right_id);
    const newValue = existing?.right_value === 1 ? 0 : 1;
    const stamp = makeStamp('EDIT', authUser.id);

    if (existing) {
      await supabase
        .from('user_module_rights')
        .update({ right_value: newValue, stamp })
        .eq('user_id', target_user_id)
        .eq('right_id', right_id);
    } else {
      await supabase
        .from('user_module_rights')
        .insert([{ user_id: target_user_id, right_id, right_value: 1, record_status: 'ACTIVE', stamp }]);
    }

    // Refresh
    const updated = await fetchUserRights(target_user_id);
    setUserRightsMap(prev => ({ ...prev, [target_user_id]: updated }));
    setSavingRight(null);
  }

  // ── Toggle ACTIVE/INACTIVE ─────────────────────────────────────────────────
  async function toggleStatus(u) {
    if (u.user_type === 'SUPERADMIN') return;
    const newStatus = u.record_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const stamp = makeStamp(newStatus === 'ACTIVE' ? 'RECOVER' : 'DEACTIVATE', authUser.id);
    await supabase.from('app_user').update({ record_status: newStatus, stamp }).eq('user_id', u.user_id);
    setUsers(prev => prev.map(x => x.user_id === u.user_id ? { ...x, record_status: newStatus, stamp } : x));
  }

  // ── Change user_type ──────────────────────────────────────────────────────
  async function changeUserType(u, newType) {
    if (u.user_type === 'SUPERADMIN') return;
    const key = u.user_id;
    setSavingType(key);
    const stamp = makeStamp('EDIT', authUser.id);
    await supabase.from('app_user').update({ user_type: newType, stamp }).eq('user_id', u.user_id);
    setUsers(prev => prev.map(x => x.user_id === u.user_id ? { ...x, user_type: newType, stamp } : x));
    setSavingType(null);
  }

  // ── Load audit ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== 'audit') return;
    async function load() {
      setLoadingAudit(true);
      setAuditError('');
      try {
        const rows = await fetchAuditTrail();
        setAudit(rows);
      } catch (err) {
        setAuditError(err.message);
      } finally {
        setLoadingAudit(false);
      }
    }
    load();
  }, [tab]);

  // ── Filtered audit ─────────────────────────────────────────────────────────
  const filteredAudit = audit.filter(a => {
    const stamp = parseStamp(a.stamp);
    if (!stamp) return true;
    if (filterType !== 'All' && a.record_type !== filterType) return false;
    if (filterDateFrom && stamp.opDate < filterDateFrom) return false;
    if (filterDateTo && stamp.opDate > filterDateTo + ' 23:59') return false;
    return true;
  });

  // ── Group rights by module ─────────────────────────────────────────────────
  const rightsByModule = rights.reduce((acc, r) => {
    const mod = r.module?.description ?? 'General';
    if (!acc[mod]) acc[mod] = [];
    acc[mod].push(r);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Administration</h1>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {['users', 'audit'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm capitalize ${tab === t ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {t === 'users' ? 'User Management' : 'Audit Trail'}
            </button>
          ))}
        </div>
      </div>

      {/* ── USERS TAB ──────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div>
          {usersError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{usersError}</div>}
          <div className="bg-white rounded-xl border border-gray-200">
            {loadingUsers ? (
              <p className="text-center py-12 text-gray-400 text-sm">Loading…</p>
            ) : users.map(u => {
              const isExpanded = expandedUser === u.user_id;
              const userRights = userRightsMap[u.user_id] ?? [];
              const isSuperAdmin = u.user_type === 'SUPERADMIN';
              return (
                <div key={u.user_id} className="border-b last:border-0">
                  {/* User row */}
                  <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm">{u.first_name} {u.last_name}</div>
                      <div className="text-xs text-gray-400">{u.username}</div>
                    </div>

                    {/* User type */}
                    <div>
                      {isSuperAdmin ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">SUPERADMIN</span>
                      ) : (
                        <select
                          value={u.user_type}
                          disabled={savingType === u.user_id}
                          onChange={e => changeUserType(u, e.target.value)}
                          className="text-xs rounded-lg border border-gray-200 px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      )}
                    </div>

                    {/* Status toggle */}
                    <button
                      onClick={() => toggleStatus(u)}
                      disabled={isSuperAdmin}
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        isSuperAdmin ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                        u.record_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {u.record_status}
                    </button>

                    {/* Expand toggle */}
                    <button
                      onClick={() => toggleExpand(u.user_id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {isExpanded ? 'Hide rights ▲' : 'Manage rights ▼'}
                    </button>
                  </div>

                  {/* Expanded rights */}
                  {isExpanded && (
                    <div className="bg-gray-50 border-t px-6 py-4">
                      {Object.entries(rightsByModule).map(([mod, rList]) => (
                        <div key={mod} className="mb-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{mod}</p>
                          <div className="flex flex-wrap gap-3">
                            {rList.map(r => {
                              const existing = userRights.find(ur => ur.right_id === r.right_id);
                              const enabled = existing?.right_value === 1;
                              const key = `${u.user_id}-${r.right_id}`;
                              return (
                                <button
                                  key={r.right_id}
                                  onClick={() => toggleRight(u.user_id, r.right_id, userRights)}
                                  disabled={savingRight === key || isSuperAdmin}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                                    enabled
                                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                                  } disabled:opacity-50`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${enabled ? 'bg-white' : 'bg-gray-300'}`} />
                                  {r.description} <span className="font-mono opacity-60">({r.right_id})</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AUDIT TAB ──────────────────────────────────────────────────── */}
      {tab === 'audit' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              <option value="User">User</option>
              <option value="Product">Product</option>
            </select>
            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="self-center text-gray-400 text-sm">to</span>
            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {(filterType !== 'All' || filterDateFrom || filterDateTo) && (
              <button onClick={() => { setFilterType('All'); setFilterDateFrom(''); setFilterDateTo(''); }}
                className="text-sm text-blue-600 hover:underline">Clear filters</button>
            )}
          </div>

          {auditError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{auditError}</div>}

          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Reference</th>
                  <th className="text-center px-4 py-3 font-medium">Operation</th>
                  <th className="text-left px-4 py-3 font-medium">Performed By</th>
                  <th className="text-left px-4 py-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loadingAudit ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">Loading…</td></tr>
                ) : filteredAudit.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-400">No records.</td></tr>
                ) : filteredAudit.map((a, i) => {
                  const stamp = parseStamp(a.stamp);
                  return (
                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          a.record_type === 'User' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>{a.record_type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800">{a.reference_label}</div>
                        <div className="text-xs text-gray-400">{a.reference_id}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {stamp ? (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            stamp.opType === 'ADD' ? 'bg-green-100 text-green-700' :
                            stamp.opType === 'EDIT' ? 'bg-yellow-100 text-yellow-700' :
                            stamp.opType === 'DEACTIVATE' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>{stamp.opType}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{stamp?.opBy ? stamp.opBy.slice(0, 8) + '…' : '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{stamp?.opDate ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">{filteredAudit.length} records</p>
        </div>
      )}
    </div>
  );
}