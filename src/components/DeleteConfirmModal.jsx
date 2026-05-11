export default function DeleteConfirmModal({ product, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-slate-800 text-center mb-1">Delete Product?</h2>
          <p className="text-sm text-slate-500 text-center mb-1">
            <span className="font-mono font-medium text-slate-700">{product.prodCode}</span> — {product.description}
          </p>
          <p className="text-xs text-slate-400 text-center mb-6">This will archive the product. It can be recovered later.</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium py-2 rounded-lg transition-colors">Cancel</button>
            <button onClick={onConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}