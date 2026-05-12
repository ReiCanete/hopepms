import { useState } from 'react';
import { editProduct } from '../services/productService';
import { useAuth } from '../context/AuthContext';

export default function EditProductModal({ product, onClose, onSuccess }) {
  const { user } = useAuth();
  const [description, setDescription] = useState(product.description);
  const [unit, setUnit] = useState(product.unit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim() || !unit.trim()) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await editProduct({ prod_code: product.prod_code, description: description.trim(), unit: unit.trim(), userId: user.id });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Product</h2>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Product Code</label>
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500">
              {product.prod_code}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Unit <span className="text-red-500">*</span></label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={unit}
              onChange={e => setUnit(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50">
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}