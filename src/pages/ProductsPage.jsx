import { useState, useEffect, useRef } from 'react';
import { fetchProducts } from '../services/productService';
import { useRights } from '../context/UserRightsContext';
import { parseStamp } from '../utils/stampHelper';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import PriceHistoryPanel from '../components/PriceHistoryPanel';

export default function ProductsPage() {
  const { rights } = useRights();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [priceTarget, setPriceTarget] = useState(null);

  // 3-dot menu
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Close menu on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const canAdd = rights?.PRD_ADD === 1;
  const canEdit = rights?.PRD_EDIT === 1;
  const canDel = rights?.PRD_DEL === 1;

  const filtered = products.filter(p =>
    p.description?.toLowerCase().includes(search.toLowerCase()) ||
    p.prod_code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Products</h1>
          <p className="text-sm text-gray-500">{products.length} active products</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search products…"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {canAdd && (
            <button
              onClick={() => setShowAdd(true)}
              className="px-4 py-2 bg-blue-700 text-white text-sm rounded-lg hover:bg-blue-800"
            >
              + Add Product
            </button>
          )}
        </div>
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
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-center px-4 py-3 font-medium">Op Type</th>
              <th className="text-left px-4 py-3 font-medium">Op By</th>
              <th className="text-left px-4 py-3 font-medium">Op Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">No products found.</td></tr>
            ) : filtered.map(p => {
              const stamp = parseStamp(p.stamp);
              return (
                <tr key={p.prod_code} className="border-b last:border-0 hover:bg-gray-50">
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{p.description}</div>
                    <div className="text-xs text-gray-400">{p.prod_code}</div>
                  </td>

                  {/* Unit */}
                  <td className="px-4 py-3 text-gray-600">{p.unit}</td>

                  {/* Price */}
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {p.unit_price != null ? `₱${Number(p.unit_price).toFixed(2)}` : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.record_status}
                    </span>
                  </td>

                  {/* Op Type */}
                  <td className="px-4 py-3 text-center">
                    {stamp ? (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        stamp.opType === 'ADD' ? 'bg-blue-100 text-blue-700' :
                        stamp.opType === 'EDIT' ? 'bg-yellow-100 text-yellow-700' :
                        stamp.opType === 'DEACTIVATE' ? 'bg-red-100 text-red-600' :
                        stamp.opType === 'RECOVER' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {stamp.opType}
                      </span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Op By */}
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {stamp?.opBy ? stamp.opBy.slice(0, 8) + '…' : '—'}
                  </td>

                  {/* Op Date */}
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {stamp?.opDate ?? '—'}
                  </td>

                  {/* 3-dot menu */}
                  <td className="px-4 py-3 text-right relative" ref={openMenu === p.prod_code ? menuRef : null}>
                    <button
                      onClick={() => setOpenMenu(openMenu === p.prod_code ? null : p.prod_code)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      ⋮
                    </button>
                    {openMenu === p.prod_code && (
                      <div className="absolute right-4 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
                        {canEdit && (
                          <button
                            onClick={() => { setEditTarget(p); setOpenMenu(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            ✏️ Edit Details
                          </button>
                        )}
                        <button
                          onClick={() => { setPriceTarget(p); setOpenMenu(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          💰 Price History
                        </button>
                        {canDel && (
                          <button
                            onClick={() => { setDeleteTarget(p); setOpenMenu(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            🗑 Deactivate
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onSuccess={load} />}
      {editTarget && <EditProductModal product={editTarget} onClose={() => setEditTarget(null)} onSuccess={load} />}
      {deleteTarget && <DeleteConfirmModal product={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={load} />}
      {priceTarget && <PriceHistoryPanel product={priceTarget} onClose={() => setPriceTarget(null)} />}
    </div>
  );
}