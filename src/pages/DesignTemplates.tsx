import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDesigns, deleteDesign } from '../services/designService';
import { Plus, Trash2, Edit, LayoutTemplate } from 'lucide-react';

export default function DesignTemplates() {
  const [designs, setDesigns] = useState<any[]>([]);

  const fetchDesigns = async () => {
    const res = await getDesigns();
    setDesigns(res.data.data);
  };

  useEffect(() => { fetchDesigns(); }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (window.confirm("Delete this design?")) {
      await deleteDesign(id);
      fetchDesigns();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Design Templates</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Reusable invitations with placeholder configs</p>
        </div>
        <Link to="/studio" className="bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> New template
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-16 text-center flex flex-col items-center justify-center transition-colors">
          <LayoutTemplate className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No templates yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first design in the Studio to see it here.</p>
          <Link to="/studio" className="bg-[#FFA45C] text-[#2b1500] px-6 py-2 rounded-lg font-bold hover:bg-orange-400 transition-colors">Create Template</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designs.map((tpl) => (
            <Link key={tpl._id} to={`/studio?edit=${tpl._id}`} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col">
              <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center">
                {tpl.imageUrl ? (
                  <img src={tpl.imageUrl} alt={tpl.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">No Image</span>
                )}
                {tpl.qrPosition && (
                  <div className="absolute border-2 border-dashed border-[#FFA45C] bg-[#FFA45C]/20 flex items-center justify-center pointer-events-none" style={{ left: `${(tpl.qrPosition.x / 1200) * 100}%`, top: `${(tpl.qrPosition.y / 1600) * 100}%`, width: `${(tpl.qrPosition.width / 1200) * 100}%`, height: `${(tpl.qrPosition.height / 1600) * 100}%` }}>
                    <span className="text-[#FFA45C] text-xs font-bold font-mono">QR</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit
                  </div>
                  <button onClick={(e) => handleDelete(e, tpl._id)} className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white truncate">{tpl.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PNG · {tpl.textOverlays?.length || 0} text fields</p>
              <div className="mt-4 text-sm font-semibold text-[#FFA45C]">Edit in Studio →</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}