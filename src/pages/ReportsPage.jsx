import { useEffect, useState } from 'react';
import { getProductReport } from '../services/reportsService';

export default function ReportsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductReport().then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

    const filtered = products.filter(p =>
    p.prod_code?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  function exportCSV() {
    const headers = ['Product Code','Description','Unit','Current Price','Effective Date'];
    const rows = filtered.map(p => [p.prod_code, p.description, p.unit, p.unit_price ?? '', p.eff_date ?? '']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'product-report.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Product Report</h1>
          <p className="text-sm text-slate-400">REP_001 — Active products with current price</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>
      <div className="mb-4">
        <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Price</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">As of</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.prod_Code} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-mono text-slate-700 font-medium">{p.prod_Code}</td>
                <td className="px-5 py-3 text-slate-700">{p.description}</td>
                <td className="px-5 py-3 text-slate-500">{p.unit}</td>
                <td className="px-5 py-3 text-slate-800 font-medium">
                  {p.unit_Price != null ? '₱${parseFloat(p.unit_Price).toFixed(2)}' : '—'}
                </td>
                <td className="px-5 py-3 text-slate-400">{p.eff_Date ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400"><p className="text-sm">No results.</p></div>
        )}
      </div>
    </div>
  );
}
