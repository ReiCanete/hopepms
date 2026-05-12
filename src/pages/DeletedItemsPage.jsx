import { useState, useEffect } from 'react';
import { fetchDeletedProducts, recoverProduct } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { parseStamp } from '../utils/stampHelper';

export default function DeletedItemsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recovering, setRecovering] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDeletedProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRecover(prod_code) {
    setRecovering(prod_code);
    try {
      await recoverProduct({ prod_code, userId: user.id });
      await load();
    } catch (err) {
      setError(err.message || 'Failed to recover product.');
    } finally {
      setRecovering(null);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Deleted Items</h1>
        <p className="text-sm text-gray-500">{products.length} inactive product{products.length !== 1 ? 's' : ''}</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Unit</th>
              <th className="text-right px-4 py-3 font-medium">Last Price</th>
              <th className="text-center px-4 py-3 font-medium">Op Type</th>
              <th className="text-left px-4 py-3 font-medium">Op By</th>
              <th className="text-left px-4 py-3 font-medium">Op Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading…</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No deleted items.</td></tr>
            ) : products.map(p => {
              const stamp = parseStamp(p.stamp);
              return (
                <tr key={p.prod_code} className="border-b last:border-0 hover:bg-gray-50 opacity-75">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-700">{p.description}</div>
                    <div className="text-xs text-gray-400">{p.prod_code}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {p.unit_price != null ? `₱${Number(p.unit_price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {stamp ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                        {stamp.opType}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{stamp?.opBy ? stamp.opBy.slice(0, 8) + '…' : '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{stamp?.opDate ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRecover(p.prod_code)}
                      disabled={recovering === p.prod_code}
                      className="px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {recovering === p.prod_code ? 'Recovering…' : '↩ Recover'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}