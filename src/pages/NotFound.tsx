import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-9xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">Page not found</h2>
      <p className="text-gray-500 mb-8 max-w-md">The page you are looking for doesn't exist or has been moved to another location.</p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}