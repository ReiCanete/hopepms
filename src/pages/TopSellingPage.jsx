import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TopSellingPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: rows, error: err } = await supabase
          .from('top_selling_products')
          .select('*')
          .order('total_qty', { ascending: false });
        if (err) throw err;
        setData(rows);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Top Selling Products</h1>
        <p className="text-sm text-gray-500">Ranked by total quantity sold</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium">Rank</th>
              <th className="text-left px-4 py-3 font-medium">Product</th>
              <th className="text-left px-4 py-3 font-medium">Unit</th>
              <th className="text-right px-4 py-3 font-medium">Total Qty Sold</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">No sales data yet.</td></tr>
            ) : data.map((r, i) => (
              <tr key={r.prod_code} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-500">#{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{r.description}</div>
                  <div className="text-xs text-gray-400">{r.prod_code}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.unit}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">{r.total_qty ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notice until sales_detail exists */}
      <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-xs text-yellow-700">
        ⚠️ Sales data not yet connected. All quantities show 0 until the <code>sales_detail</code> table is created and the <code>top_selling_products</code> view is updated.
      </div>
    </div>
  );
}
