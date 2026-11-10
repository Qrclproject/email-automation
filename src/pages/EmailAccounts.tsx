import { useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { Trash2, RefreshCw, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';

export default function EmailAccounts() {
  const { accounts, addAccount, removeAccount, reconnectAccount, togglePermission } = useAccountStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    setTimeout(() => {
      addAccount(newEmail, newName);
      setIsModalOpen(false);
      setNewEmail(''); setNewName('');
    }, 500);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Accounts</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gmail via OAuth 2.0 — no passwords stored</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4" /> Connect Gmail account
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Account</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Display Name</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Quota</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Permissions</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {accounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{account.email}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{account.displayName}</td>
                  <td className="px-6 py-4">
                    {account.status === 'connected' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </span>
                    ) : (
                      <button onClick={() => reconnectAccount(account.id)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                        <AlertCircle className="w-3.5 h-3.5" /> Reconnect Needed
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{account.sentToday} / {account.dailyLimit}</span>
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${account.sentToday >= account.dailyLimit ? 'bg-red-500' : 'bg-[#FFA45C]'}`} style={{ width: `${Math.min((account.sentToday / account.dailyLimit) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={account.permissions.send} onChange={() => togglePermission(account.id, 'send')} className="accent-[#FFA45C] w-4 h-4 rounded" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Send</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={account.permissions.readInbox} onChange={() => togglePermission(account.id, 'readInbox')} className="accent-[#FFA45C] w-4 h-4 rounded" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Read Inbox</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {account.status === 'reconnect-needed' && (
                        <button onClick={() => reconnectAccount(account.id)} className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"><RefreshCw className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => { if(window.confirm(`Disconnect ${account.email}?`)) removeAccount(account.id); }} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Connect Gmail Account</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleConnect} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input required type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="e.g., marketing@qrcodeng.com" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm focus:ring-[#FFA45C]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input required type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., QRCODENG Marketing" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm focus:ring-[#FFA45C]" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] text-sm font-bold rounded-lg transition">Authorize with Google</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}