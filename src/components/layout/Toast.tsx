import { createContext, useContext, useState, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: Toast['type'], title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: Toast['type'], title: string, message?: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-white border border-gray-200 shadow-xl rounded-lg p-4 w-80 flex items-start gap-3 animate-slide-up">
            {t.type === 'success' && <CheckCircle className="text-green-500 w-5 h-5 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />}
            {t.type === 'warning' && <AlertCircle className="text-yellow-500 w-5 h-5 mt-0.5" />}
            {t.type === 'info' && <Info className="text-blue-500 w-5 h-5 mt-0.5" />}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900">{t.title}</h4>
              {t.message && <p className="text-xs text-gray-500 mt-1">{t.message}</p>}
            </div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context.showToast;
}