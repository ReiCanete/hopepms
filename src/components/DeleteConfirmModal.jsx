import { useState } from 'react';
import { deactivateProduct } from '../services/productService';
import { useAuth } from '../context/AuthContext';

export default function DeleteConfirmModal({ product, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      await deactivateProduct({ prod_code: product.prod_code, userId: user.id });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to deactivate product.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Deactivate Product</h2>
        <p className="text-sm text-gray-600 mb-1">
          Are you sure you want to deactivate <span className="font-medium">{product.description}</span>?
        </p>
        <p className="text-xs text-gray-400 mb-4">Product Code: {product.prod_code}</p>

        {error && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Deactivating…' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}