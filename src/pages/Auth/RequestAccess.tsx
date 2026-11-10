import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, User, Shield, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 md:p-6 transition-colors">
      
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 w-full max-w-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-[#FFA45C]"></div>
        
        <div className="p-8 md:p-12">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to sign in
          </Link>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#FFA45C] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-200">
              ✉
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">QRCODE Enterprise</h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Automation</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Request access</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">A Super Administrator reviews and activates every new account.</p>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Obi" className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFA45C] outline-none transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Work email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@qrcodeng.com" className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFA45C] outline-none transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role requested</label>
              <div className="relative">
                <Shield className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFA45C] outline-none transition-all appearance-none">
                  <option>Campaign Manager</option>
                  <option>Email Operator</option>
                  <option>Designer</option>
                  <option>Reporting Officer</option>
                  <option>Viewer</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 10 characters" className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFA45C] outline-none transition-all" />
              </div>
            </div>
            
            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input required type="checkbox" className="accent-[#FFA45C] w-4 h-4 rounded border-gray-300 mt-0.5" />
              <span className="text-xs text-gray-600 dark:text-gray-400">I agree to the data protection and acceptable use policy</span>
            </label>

            <button type="submit" className="w-full bg-[#FFA45C] text-[#2b1500] font-bold py-3.5 rounded-xl mt-4 hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-200 transition-all">
              Request access
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account? <Link to="/login" className="font-bold text-gray-900 dark:text-white underline decoration-[#FFA45C] decoration-2 underline-offset-4 hover:text-[#FFA45C] transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}