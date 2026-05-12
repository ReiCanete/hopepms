import { useState, useEffect } from 'react';
import { fetchPriceHistory, addPriceEntry } from '../services/priceHistService';
import { useAuth } from '../context/AuthContext';

export default function PriceHistoryPanel({ product, onClose }) {
  const { currentUser: user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add form state
  const [newEffDate, setNewEffDate] = useState(new Date().toISOString().slice(0, 10));
  const [newUnitPrice, setNewUnitPrice] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const data = await fetchPriceHistory(product.prod_code);
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [product.prod_code]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!newEffDate || !newUnitPrice) { setAddError('Both fields required.'); return; }
    setAdding(true);
    setAddError('');
    try {
      await addPriceEntry({
        prod_code: product.prod_code,
        eff_date: newEffDate,
        unit_price: parseFloat(newUnitPrice),
        userId: user.id,
      });
      setNewEffDate('');
      setNewUnitPrice('');
      await load();
    } catch (err) {
      setAddError(err.message || 'Failed to add price entry.');
    } finally {
      setAdding(false);
    }
  }

  // Simple bar chart — heights relative to max price
  const maxPrice = history.length ? Math.max(...history.map(h => Number(h.unit_price) || 0)) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Price History</h2>
            <p className="text-xs text-gray-500">{product.prod_code} — {product.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        {/* Bar chart */}
        {history.length > 0 && (
          <div className="mb-5 bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-2 font-medium">Price Trend</p>
            <div className="flex items-end gap-2 h-24">
              {[...history].reverse().map((h, i) => {
                const heightPct = maxPrice > 0 ? (Number(h.unit_price) / maxPrice) * 100 : 0;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <span className="text-[10px] text-gray-500 truncate">₱{Number(h.unit_price).toFixed(0)}</span>
                    <div
                      className="w-full rounded-t bg-blue-500"
                      style={{ height: `${heightPct}%`, minHeight: '4px' }}
                    />
                    <span className="text-[9px] text-gray-400 truncate">{h.eff_date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add new price entry */}
        <form onSubmit={handleAdd} className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-700 mb-3">Add New Price Entry</p>
          {addError && (
            <div className="mb-2 rounded bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-600">{addError}</div>
          )}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Effectivity Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newEffDate}
                onChange={e => setNewEffDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Unit Price <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newUnitPrice}
                onChange={e => setNewUnitPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="px-4 py-2 text-sm rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 whitespace-nowrap"
            >
              {adding ? 'Adding…' : '+ Add Entry'}
            </button>
          </div>
        </form>

        {/* History table */}
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-6">Loading…</p>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-6">{error}</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No price history yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b">
                <th className="text-left pb-2 font-medium">Effectivity Date</th>
                <th className="text-right pb-2 font-medium">Unit Price</th>
                <th className="text-left pb-2 font-medium pl-4">Modified By</th>
                <th className="text-left pb-2 font-medium">Op Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                  {/* Effectivity date — IMMUTABLE, shown as plain text */}
                  <td className="py-2 text-gray-700">{h.eff_date}</td>
                  <td className="py-2 text-right font-medium text-gray-800">
                    ₱{Number(h.unit_price).toFixed(2)}
                  </td>
                  <td className="py-2 pl-4 text-gray-500 text-xs">
                    {h.modified_by ? h.modified_by.slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="py-2 text-gray-500 text-xs">
                    {h.created_at ? new Date(h.created_at).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}