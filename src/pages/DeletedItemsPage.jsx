import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProducts, recoverProduct } from '../services/productService';

export default function DeletedItemsPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await getProducts('ADMIN');
    setProducts((data || []).filter(p => p.record_status === 'INACTIVE'));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleRecover(prodCode) {
    await recoverProduct(prodCode, currentUser.id);
    load();
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Deleted Items</h1>
        <p className="text-sm text-slate-400">{products.length} archived product{products.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stamp</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.prodCode} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3 font-mono text-slate-700 font-medium">{p.prodCode}</td>
                <td className="px-5 py-3 text-slate-700">{p.description}</td>
                <td className="px-5 py-3 text-slate-500">{p.unit}</td>
                <td className="px-5 py-3 text-xs text-slate-400 max-w-xs truncate">{p.stamp}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => handleRecover(p.prodCode)}
                    className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-green-50 transition-colors">Recover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-slate-400"><p className="text-sm">No deleted items.</p></div>
        )}
      </div>
    </div>
  );
}