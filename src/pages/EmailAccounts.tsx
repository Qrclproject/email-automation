import { useState, useEffect } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { Trash2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { api } from '../services/api';

export default function EmailAccounts() {
  const { accounts, fetchAccounts, removeAccount, togglePermission } = useAccountStore();
 
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnectGmail = async () => {
    setIsConnecting(true);
    try {
      // Ask the backend for the Google OAuth URL
      const response = await api.get('/accounts/auth-url');
      // Redirect the browser to Google
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to get auth URL', error);
      alert('Failed to initiate Google login. Check the console.');
      setIsConnecting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Accounts</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gmail via OAuth 2.0 — no passwords stored</p>
        </div>
        <button 
          onClick={handleConnectGmail} 
          disabled={isConnecting}
          className="bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> {isConnecting ? 'Connecting...' : 'Connect Gmail account'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Account</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Display Name</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Quota</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Permissions</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No email accounts connected. Click "Connect Gmail account" to get started.
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{account.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">{account.displayName}</td>
                    <td className="px-6 py-4">
                      {account.status === 'connected' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                        </span>
                      ) : (
                        <button onClick={handleConnectGmail} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors whitespace-nowrap">
                          <AlertCircle className="w-3.5 h-3.5" /> Reconnect Needed
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap">{account.sentToday} / {account.dailyLimit}</span>
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${account.sentToday >= account.dailyLimit ? 'bg-red-500' : 'bg-[#FFA45C]'}`} style={{ width: `${Math.min((account.sentToday / account.dailyLimit) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={account.permissions.send} onChange={() => togglePermission(account.id, 'send')} className="accent-[#FFA45C] w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Send</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={account.permissions.readInbox} onChange={() => togglePermission(account.id, 'readInbox')} className="accent-[#FFA45C] w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Read Inbox</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { if(window.confirm(`Disconnect ${account.email}?`)) removeAccount(account.id); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
