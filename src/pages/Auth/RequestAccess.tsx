import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function RequestAccess() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Campaign Manager');
  const [password, setPassword] = useState('');
  const signup = useAuthStore((state) => state.signup);
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signup(name, email, role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#FFA45C] rounded-xl flex items-center justify-center text-white font-bold text-xl">✉</div>
          <div>
            <h1 className="font-bold text-gray-900">QRCODE Enterprise</h1>
            <p className="text-sm text-gray-500">Email Automation</p>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request access</h2>
        <p className="text-gray-500 mb-8">A Super Administrator reviews and activates every new account.</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Obi" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-[#FFA45C]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@qrcodeng.com" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-[#FFA45C]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role requested</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-[#FFA45C]">
              <option>Campaign Manager</option>
              <option>Email Operator</option>
              <option>Designer</option>
              <option>Reporting Officer</option>
              <option>Viewer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 10 characters" className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-[#FFA45C]" />
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input required type="checkbox" className="accent-[#FFA45C] w-4 h-4 rounded" />
            <span className="text-xs text-gray-600">I agree to the data protection and acceptable use policy</span>
          </label>

          <button type="submit" className="w-full bg-[#FFA45C] text-[#2b1500] font-bold py-3 rounded-lg mt-4 hover:bg-orange-400 transition-colors">
            Request access
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="font-medium text-gray-900 underline decoration-[#FFA45C]">Sign in</Link>
        </p>
      </div>
    </div>
  );
}