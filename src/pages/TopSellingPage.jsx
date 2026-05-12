import { useEffect, useState } from 'react';
import { getTopSellingReport } from '../services/reportsService';

export default function TopSellingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopSellingReport().then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Top Selling Products</h1>
        <p className="text-sm text-slate-400">REP_002 — Ranked by total quantity sold</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty Sold</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p, i) => (
              <tr key={p.prod_Code} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    i===0 ? 'bg-yellow-100 text-yellow-700' :
                    i===1 ? 'bg-slate-100 text-slate-600' :
                    i===2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
                  }`}>{i+1}</span>
                </td>
                <td className="px-5 py-3 font-mono text-slate-700 font-medium">{p.prod_Code}</td>
                <td className="px-5 py-3 text-slate-700">{p.description}</td>
                <td className="px-5 py-3 text-slate-500">{p.unit}</td>
                <td className="px-5 py-3 font-semibold text-slate-800">{p.total_qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-slate-400"><p className="text-sm">No sales data yet.</p></div>
        )}
      </div>
    </div>
  );
}