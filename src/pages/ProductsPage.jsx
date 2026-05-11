import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../context/UserRightsContext';
import { getProducts, softDeleteProduct } from '../services/productService';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import PriceHistoryPanel from '../components/PriceHistoryPanel';

export default function ProductsPage() {
  const { currentUser } = useAuth();
  const { rights } = useRights();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [error, setError] = useState('');
  const showStamp = ['ADMIN','SUPERADMIN'].includes(currentUser?.user_type);

  async function loadProducts() {
    setLoading(true);
    const { data, error } = await getProducts(currentUser?.user_type);
    if (error) setError(error.message);
    else setProducts(data || []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  async function handleDelete(prodCode) {
    const { error } = await softDeleteProduct(prodCode, currentUser.id);
    if (error) setError(error.message);
    else { setDeleteProduct(null); loadProducts(); }
  }

  const filtered = products.filter(p =>
    p.prodCode?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.unit?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Products</h1>
          <p className="text-sm text-slate-400">{filtered.length} of {products.length} item{products.length !== 1 ? 's' : ''}</p>
        </div>
        {rights?.PRD_ADD === 1 && (
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

      <div className="mb-4">
        <div className="relative max-w-sm">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              {showStamp && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stamp</th>}
              <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <>
                <tr key={p.prodCode} className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === p.prodCode ? null : p.prodCode)}>
                  <td className="px-5 py-3 font-mono text-slate-700 font-medium">{p.prodCode}</td>
                  <td className="px-5 py-3 text-slate-700">{p.description}</td>
                  <td className="px-5 py-3 text-slate-500">{p.unit}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.record_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{p.record_status}</span>
                  </td>
                  {showStamp && <td className="px-5 py-3 text-xs text-slate-400 max-w-xs truncate">{p.stamp}</td>}
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {rights?.PRD_EDIT === 1 && (
                        <button onClick={() => setEditProduct(p)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors">Edit</button>
                      )}
                      {rights?.PRD_DEL === 1 && (
                        <button onClick={() => setDeleteProduct(p)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRow === p.prodCode && (
                  <tr key={`${p.prodCode}-price`}>
                    <td colSpan={showStamp ? 6 : 5} className="px-5 pb-4 bg-slate-50">
                      <PriceHistoryPanel prodCode={p.prodCode} />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">{search ? 'No products match your search.' : 'No products found.'}</p>
          </div>
        )}
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onSuccess={loadProducts} />}
      {editProduct && <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} onSuccess={loadProducts} />}
      {deleteProduct && <DeleteConfirmModal product={deleteProduct} onClose={() => setDeleteProduct(null)} onConfirm={() => handleDelete(deleteProduct.prodCode)} />}
    </div>
  );
}