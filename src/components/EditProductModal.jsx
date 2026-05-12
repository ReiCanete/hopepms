import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProduct } from '../services/productService';

export default function EditProductModal({ product, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const [form, setForm] = useState({ description: product.description, unit: product.unit });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { error } = await updateProduct({ prod_code: product.prod_code, ...form, userId: currentUser.id });
    if (error) { setError(error.message); setLoading(false); return; }
    onSuccess(); onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Edit Product</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{product.prod_code}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={30} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
              <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['pc','ea','mtr','pkg','ltr'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium py-2 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}