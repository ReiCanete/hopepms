import { useNavigate } from 'react-router-dom';
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-7xl font-bold text-slate-200 mb-4">404</h1>
        <p className="text-slate-500 mb-6 text-sm">Page not found.</p>
        <button onClick={() => navigate('/products')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          Back to Products
        </button>
      </div>
    </div>
  );
}