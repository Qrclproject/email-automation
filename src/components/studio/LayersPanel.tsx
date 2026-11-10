import { useStudioStore } from '../../store/useStudioStore';

export default function LayersPanel() {
  const { elements, selectedId, selectElement } = useStudioStore();

  return (
    <div className="w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 shadow-sm hidden lg:block shrink-0 transition-colors">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Layers</h3>
      <div className="space-y-1">
        {elements.map(el => (
          <button
            key={el.id}
            onClick={() => selectElement(el.id)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
              selectedId === el.id 
                ? 'bg-orange-100 text-[#FFA45C] dark:bg-orange-900/30 dark:text-[#FFA45C] font-medium' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {el.type === 'text' ? `T: ${el.text?.substring(0, 15)}...` : 'QR Code'}
          </button>
        ))}
      </div>
    </div>
  );
}