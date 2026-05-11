import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPriceHistory, addPriceEntry } from '../services/priceHistService';

export default function PriceHistoryPanel({ prodCode }) {
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ effDate:'', unitPrice:'' });
  const [loading, setLoading] = useState(false);
  const canAdd = ['ADMIN','SUPERADMIN'].includes(currentUser?.user_type);
  const showStamp = ['ADMIN','SUPERADMIN'].includes(currentUser?.user_type);
  const maxPrice = history.length ? Math.max(...history.map(h => parseFloat(h.unitPrice))) : 1;

  async function load() {
    const { data } = await getPriceHistory(prodCode);
    setHistory(data || []);
  }

  useEffect(() => { load(); }, [prodCode]);

  async function handleAdd(e) {
    e.preventDefault();
    setLoading(true);
    await addPriceEntry({ prodCode, effDate: form.effDate, unitPrice: parseFloat(form.unitPrice), userId: currentUser.id });
    setShowForm(false);
    setForm({ effDate:'', unitPrice:'' });
    await load();
    setLoading(false);
  }

  return (
    <div className="mt-2 bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Price History</span>
        {canAdd && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Add Price</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="flex gap-2 mb-3 flex-wrap">
          <input type="date" value={form.effDate} onChange={e => setForm({...form, effDate: e.target.value})}
            className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <input type="number" step="0.01" min="0.01" placeholder="Price" value={form.unitPrice}
            onChange={e => setForm({...form, unitPrice: e.target.value})}
            className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs w-28 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          <button type="submit" disabled={loading}
            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg disabled:opacity-50">{loading ? '...' : 'Save'}</button>
          <button type="button" onClick={() => setShowForm(false)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2">Cancel</button>
        </form>
      )}

      {history.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-3">No price history yet.</p>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2">Price trend (oldest to newest)</p>
            <div className="flex items-end gap-1 h-16">
              {[...history].reverse().map((h, i) => {
                const pct = (parseFloat(h.unitPrice) / maxPrice) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                    <div style={{ height: '${Math.max(pct, 8)}%' }}
                      className="w-full bg-blue-200 group-hover:bg-blue-500 rounded-t transition-colors" />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      ₱{parseFloat(h.unitPrice).toFixed(2)} · {h.effDate}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100">
                <th className="text-left pb-1.5 font-medium">Effective Date</th>
                <th className="text-left pb-1.5 font-medium">Unit Price</th>
                {showStamp && <th className="text-left pb-1.5 font-medium">Stamp</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map(h => (
                <tr key={h.effDate}>
                  <td className="py-1.5 text-slate-600">{h.effDate}</td>
                  <td className="py-1.5 text-slate-800 font-medium">₱{parseFloat(h.unitPrice).toFixed(2)}</td>
                  {showStamp && <td className="py-1.5 text-slate-400 truncate max-w-xs">{h.stamp}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}