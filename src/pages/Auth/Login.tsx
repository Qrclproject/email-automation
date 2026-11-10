import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, ArrowRight, BarChart2, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen flex p-4 md:p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
      
      {/* Left Form Side */}
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-[#FFA45C]"></div>
        
        <div className="w-full max-w-md p-8 md:p-12 relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-[#FFA45C] rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-200">
              ✉
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">QRCODE Enterprise</h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Automation</p>
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in to manage your campaigns.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Work email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@qrcodeng.com" 
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFA45C] focus:border-[#FFA45C] outline-none transition-all" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFA45C] focus:border-[#FFA45C] outline-none transition-all" 
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="accent-[#FFA45C] w-4 h-4 rounded border-gray-300" defaultChecked />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-[#FFA45C] hover:text-orange-600 transition-colors">Forgot password?</a>
            </div>

            <button type="submit" className="w-full bg-[#FFA45C] text-[#2b1500] font-bold py-3.5 rounded-xl mt-4 hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-200 transition-all flex items-center justify-center gap-2 group">
              Sign in
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              New staff member? <Link to="/signup" className="font-bold text-gray-900 dark:text-white underline decoration-[#FFA45C] decoration-2 underline-offset-4 hover:text-[#FFA45C] transition-colors">Request access</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Hero Side */}
      <div className="hidden lg:flex flex-1 bg-[#0f172a] rounded-3xl ml-6 items-center justify-center relative overflow-hidden shadow-2xl">
        {/* Abstract background elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FFA45C] rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
        
        <div className="relative z-10 p-16 w-full max-w-2xl flex flex-col items-center">
          
          {/* 3D Email Campaign Mockup */}
          <div className="relative w-80 md:w-96 h-[420px] mb-12 group perspective-1000">
            {/* Glow behind the card */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
            
            {/* The Floating Email Card */}
            <div className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10 transform transition-transform duration-500 group-hover:rotate-0 group-hover:-translate-y-2 rotate-[4deg]">
              
              {/* Card Header (Gmail style) */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Your Q3 Product Update 🚀</h3>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#FFA45C] flex items-center justify-center text-white font-bold text-sm">Q</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">QRCODENG Marketing</p>
                    <p className="text-xs text-gray-500">to you</p>
                  </div>
                </div>
              </div>

              {/* Card Body (Email content) */}
              <div className="p-6 flex-1 bg-white dark:bg-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Hi <span className="font-bold text-[#FFA45C]">{"{{First Name}}"}</span>,
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  We've been working on some exciting new features. Click below to see what's new in your dashboard.
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                   <div className="bg-white p-1 rounded-md shadow-sm">
                     <img 
                       src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=QRCODENG&color=000000&bgcolor=ffffff" 
                       alt="QR Code" 
                       className="w-12 h-12" 
                     />
                   </div>
                   <div>
                     <p className="text-xs font-bold text-gray-900 dark:text-white">Your Access Pass</p>
                     <p className="text-[10px] text-gray-500">Scan to login instantly</p>
                   </div>
                </div>

                <div className="bg-[#FFA45C] text-[#2b1500] text-center py-2.5 rounded-lg text-sm font-bold w-full hover:bg-orange-400 transition-colors cursor-pointer">
                  View Dashboard
                </div>
              </div>

              {/* Card Footer (Stats) */}
              <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Delivered
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                  <BarChart2 className="w-4 h-4" /> 1,204 Sent
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6 text-white text-center">
            Powerful email automation,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA45C] to-orange-300">from your own accounts.</span>
          </h2>
          <p className="text-gray-400 text-lg text-center font-medium max-w-md mx-auto">
            Send personalised campaigns, track delivery, and manage replies directly from your connected inboxes.
          </p>
        </div>
      </div>
    </div>
  );
}