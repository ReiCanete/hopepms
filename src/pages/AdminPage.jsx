import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { makeStamp } from '../utils/stampHelper';

export default function AdminPage() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('users');

  async function loadUsers() {
    const { data } = await supabase
      .from('user').select('userId,username,firstName,lastName,user_type,record_status,stamp').order('username');
    setUsers(data || []);
  }

  async function loadAudit() {
    const [{ data: ud }, { data: pd }] = await Promise.all([
      supabase.from('user').select('username,user_type,record_status,stamp').not('stamp','is',null).order('stamp', { ascending:false }).limit(40),
      supabase.from('product').select('prodCode,description,stamp').not('stamp','is',null).order('stamp', { ascending:false }).limit(40)
    ]);
    const logs = [
      ...(ud || []).map(u => ({ type:'User', ref:u.username, detail:`${u.user_type} — ${u.record_status}`, stamp:u.stamp })),
      ...(pd || []).map(p => ({ type:'Product', ref:p.prodCode, detail:p.description, stamp:p.stamp }))
    ].sort((a,b) => (b.stamp||'').localeCompare(a.stamp||'')).slice(0,60);
    setAuditLogs(logs);
  }

  useEffect(() => {
    Promise.all([loadUsers(), loadAudit()]).then(() => setLoading(false));
  }, []);

  async function handleToggle(user) {
    if (user.user_type === 'SUPERADMIN') return;
    const newStatus = user.record_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const stamp = makeStamp(newStatus === 'ACTIVE' ? 'ACTIVATED' : 'DEACTIVATED', currentUser.id);
    await supabase.from('user').update({ record_status:newStatus, stamp }).eq('userId', user.userId);
    await Promise.all([loadUsers(), loadAudit()]);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Admin</h1>
        <p className="text-sm text-slate-400">User management and audit trail</p>
      </div>
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
        {['users','audit'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t === 'users' ? `Users (${users.length})` : 'Audit Trail'}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isSA = u.user_type === 'SUPERADMIN';
                return (
                  <tr key={u.userId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-slate-600 text-xs font-medium">{(u.username||u.firstName||'?')[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{u.username}</p>
                          <p className="text-xs text-slate-400">{u.firstName} {u.lastName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isSA ? 'bg-purple-100 text-purple-700' :
                        u.user_type==='ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>{u.user_type}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.record_status==='ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{u.record_status}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {isSA ? (
                        <span className="text-xs text-slate-400 flex items-center justify-end gap-1" title="SUPERADMIN cannot be modified">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Protected
                        </span>
                      ) : (
                        <button onClick={() => handleToggle(u)}
                          className={`text-xs font-medium px-3 py-1 rounded-lg transition-colors ${
                            u.record_status==='ACTIVE'
                              ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                              : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          }`}>
                          {u.record_status==='ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500">Last 60 stamped actions across users and products</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Detail</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      log.type==='User' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>{log.type}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-700 text-xs">{log.ref}</td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{log.detail}</td>
                  <td className="px-5 py-3 text-xs text-slate-400 max-w-xs truncate">{log.stamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditLogs.length === 0 && (
            <div className="text-center py-12 text-slate-400"><p className="text-sm">No audit records yet.</p></div>
          )}
        </div>
      )}
    </div>
  );
}
