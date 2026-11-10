import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex p-4 bg-gray-50">
      {/* Left Form Side */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="w-full max-w-md p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#FFA45C] rounded-xl flex items-center justify-center text-white font-bold text-xl">✉</div>
            <div>
              <h1 className="font-bold text-gray-900">QRCODE Enterprise</h1>
              <p className="text-sm text-gray-500">Email Automation</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to manage your email campaigns.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@qrcodeng.com" 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-[#FFA45C] focus:border-[#FFA45C]" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-[#FFA45C] focus:border-[#FFA45C]" 
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-[#FFA45C] w-4 h-4 rounded" defaultChecked />
                <span className="text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-gray-900 underline decoration-[#FFA45C]">Forgot password?</a>
            </div>

            <button type="submit" className="w-full bg-[#FFA45C] text-[#2b1500] font-bold py-3 rounded-lg mt-4 hover:bg-orange-400 transition-colors">
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New staff member? <Link to="/signup" className="font-medium text-gray-900 underline decoration-[#FFA45C]">Request access</Link>
          </p>
        </div>
      </div>

      {/* Right Hero Side */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-200 to-[#FFA45C] rounded-2xl ml-4 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10 p-12 text-[#2b1500]">
          <div className="w-64 h-80 bg-gradient-to-br from-indigo-900 to-purple-500 rounded-2xl shadow-2xl transform -rotate-6 p-6 flex flex-col items-center justify-center text-white mb-8 border border-white/20">
            <p className="text-xs font-bold tracking-widest opacity-80 mb-4">YOU ARE INVITED</p>
            <h3 className="text-2xl font-serif mb-1">John Doe</h3>
            <p className="text-sm opacity-80 mb-6">VIP Ticket</p>
            <div className="w-16 h-16 bg-white rounded-lg"></div>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">Designed invitations,<br/>delivered to every inbox.</h2>
          <p className="text-[#2b1500]/70 font-medium">Personalised names and QR codes, sent in controlled batches from your own email accounts.</p>
        </div>
      </div>
    </div>
  );
}