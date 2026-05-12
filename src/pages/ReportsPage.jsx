import { useState, useEffect } from 'react';
import { fetchReportData, exportToCSV, exportToPDF } from '../services/reportsService';

export default function ReportsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchReportData();
      setData(rows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleExportPDF() {
    setExporting('pdf');
    try {
      await exportToPDF(data);
    } catch (err) {
      setError('PDF export failed: ' + err.message);
    } finally {
      setExporting(null);
    }
  }

  function handleExportCSV() {
    exportToCSV(data);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">Product price list</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={loading || data.length === 0}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={loading || data.length === 0 || exporting === 'pdf'}
            className="px-4 py-2 text-sm rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-40"
          >
            {exporting === 'pdf' ? 'Generating PDF…' : 'Export PDF'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium">Product Code</th>
              <th className="text-left px-4 py-3 font-medium">Description</th>
              <th className="text-left px-4 py-3 font-medium">Unit</th>
              <th className="text-right px-4 py-3 font-medium">Current Price</th>
              <th className="text-left px-4 py-3 font-medium">Effective Date</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Loading…</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No data.</td></tr>
            ) : data.map(r => (
              <tr key={r.prod_code} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.prod_code}</td>
                <td className="px-4 py-3 text-gray-800">{r.description}</td>
                <td className="px-4 py-3 text-gray-600">{r.unit}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">
                  {r.unit_price != null ? `₱${Number(r.unit_price).toFixed(2)}` : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{r.eff_date ?? '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    r.record_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {r.record_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}