import { Upload, Type, QrCode } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';
import { useRef } from 'react';

export default function Toolbar() {
  const { addElement, setBackgroundImage } = useStudioStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setBackgroundImage(URL.createObjectURL(file));
  };

  return (
    // Added dark mode classes to the wrapper
    <div className="w-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-4 shadow-sm z-10 shrink-0 transition-colors">
      <button onClick={() => addElement('text')} className="p-3 text-gray-600 dark:text-gray-300 hover:text-[#FFA45C] dark:hover:text-[#FFA45C] hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Add Text">
        <Type className="w-6 h-6" />
      </button>
      <button onClick={() => addElement('qr')} className="p-3 text-gray-600 dark:text-gray-300 hover:text-[#FFA45C] dark:hover:text-[#FFA45C] hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Add QR Code">
        <QrCode className="w-6 h-6" />
      </button>
      <div className="w-8 border-b border-gray-200 dark:border-gray-600 my-2"></div>
      <button onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-600 dark:text-gray-300 hover:text-[#FFA45C] dark:hover:text-[#FFA45C] hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Upload Background">
        <Upload className="w-6 h-6" />
      </button>
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg" className="hidden" />
    </div>
  );
}