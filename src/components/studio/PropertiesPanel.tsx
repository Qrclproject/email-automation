import { Save } from 'lucide-react';
import { useStudioStore } from '../../store/useStudioStore';

export default function PropertiesPanel() {
  const { elements, selectedId, updateElement } = useStudioStore();
  const el = elements.find(e => e.id === selectedId);

  return (
    <div className="w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto shadow-sm z-10 shrink-0 hidden md:block transition-colors">
      <h2 className="font-bold text-gray-900 dark:text-white mb-6 flex justify-between items-center">
        Properties
        <button className="bg-[#FFA45C] p-2 rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-orange-400 transition text-[#2b1500]">
          <Save className="w-4 h-4"/> Save
        </button>
      </h2>
      
      {!el ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Select an element on the canvas to edit its properties.</p>
      ) : (
        <div className="space-y-5">
          {el.type === 'text' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Content</label>
                <input 
                  type="text" 
                  value={el.text} 
                  onChange={(e) => updateElement(el.id, { text: e.target.value })} 
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFA45C]" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Font Size ({el.fontSize}px)</label>
                <input 
                  type="range" 
                  min="10" max="60" 
                  value={el.fontSize} 
                  onChange={(e) => updateElement(el.id, { fontSize: parseInt(e.target.value) })} 
                  className="w-full accent-[#FFA45C]" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Color</label>
                <input 
                  type="color" 
                  value={el.color} 
                  onChange={(e) => updateElement(el.id, { color: e.target.value })} 
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Alignment</label>
                <div className="flex gap-2">
                  {['left', 'center', 'right'].map(align => (
                    <button 
                      key={align} 
                      onClick={() => updateElement(el.id, { textAlign: align as any })} 
                      className={`flex-1 py-1 border rounded text-xs capitalize transition-colors ${
                        el.textAlign === align 
                          ? 'bg-[#FFA45C] border-[#FFA45C] text-[#2b1500]' 
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {align}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {el.type === 'qr' && (
            <>
              {/* NEW: Dropdown to select which dynamic data is embedded in the QR code */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Dynamic Data to Encode</label>
                <select 
                  value={el.qrDataField || ''} 
                  onChange={(e) => updateElement(el.id, { qrDataField: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFA45C]"
                >
                  <option value="{{Unique Ticket Link}}">Unique Ticket Link</option>
                  <option value="{{Full Name}}">Full Name</option>
                  <option value="{{Email Address}}">Email Address</option>
                  <option value="{{Ticket Type}}">Ticket Type</option>
                  <option value="https://qrcodeng.com">Static Link (Same for everyone)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Size ({el.width}px)</label>
                <input 
                  type="range" 
                  min="60" max="200" 
                  value={el.width} 
                  onChange={(e) => updateElement(el.id, { width: parseInt(e.target.value) })} 
                  className="w-full accent-[#FFA45C]" 
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}