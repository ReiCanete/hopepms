export default function DeleteConfirmModal({ product, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-1">Deactivate Product</h2>
          <p className="text-sm text-slate-500 mb-1">
            Are you sure you want to deactivate <span className="font-mono font-medium text-slate-700">{product.prod_code}</span>?
          </p>
          <p className="text-xs text-slate-400 mb-6">This will set the product to INACTIVE. It can be recovered later.</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium py-2 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
              Deactivate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
