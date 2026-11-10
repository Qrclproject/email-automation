import { useState } from 'react';
import { useCampaignStore } from '../../store/useCampaignStore';
import { PlusCircle, PlusSquare, Download, Trash2, ArrowRight, Save } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function SpreadsheetEditor() {
  const { 
    excelColumns, excelData, fileName, 
    updateCell, addRow, deleteRow, addColumn, fillColumn, clearSpreadsheet, setStep, renameColumn 
  } = useCampaignStore();
  
  const [newColumnName, setNewColumnName] = useState('');
  const [showAddCol, setShowAddCol] = useState(false);
  const [fillValues, setFillValues] = useState<Record<string, string>>({});

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(excelData, { header: excelColumns });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Recipients");
    XLSX.writeFile(wb, `updated_${fileName || 'data.xlsx'}`);
  };

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnName.trim()) {
      addColumn(newColumnName.trim());
      setNewColumnName('');
      setShowAddCol(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col max-h-[75vh]">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Edit Spreadsheet</h2>
          <p className="text-sm text-gray-500">{fileName} · {excelData.length} rows · {excelColumns.length} columns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition">
            <PlusCircle className="w-4 h-4" /> Add Row
          </button>
          <button onClick={() => setShowAddCol(!showAddCol)} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition">
            <PlusSquare className="w-4 h-4" /> Add Column
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition">
            <Download className="w-4 h-4" /> Download
          </button>
          <div className="w-px h-8 bg-gray-300 mx-1"></div>
          <button onClick={clearSpreadsheet} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition">
            Cancel
          </button>
          <button onClick={() => setStep(2)} className="flex items-center gap-2 px-4 py-2 bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] text-sm font-bold rounded-lg transition">
            Save & Continue <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showAddCol && (
        <div className="px-6 py-3 bg-green-50 border-b border-green-100 flex items-center gap-3">
          <span className="text-sm font-medium text-green-800">New Column Name:</span>
          <form onSubmit={handleAddColumnSubmit} className="flex gap-2">
            <input autoFocus type="text" value={newColumnName} onChange={e => setNewColumnName(e.target.value)} className="border border-green-300 rounded px-2 py-1 text-sm outline-none" placeholder="e.g., Ticket Type" />
            <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">Add</button>
            <button type="button" onClick={() => setShowAddCol(false)} className="text-gray-500 text-sm hover:underline">Cancel</button>
          </form>
        </div>
      )}

      <div className="overflow-auto flex-1 p-4">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="px-4 py-3 w-12 font-medium">#</th>
              {excelColumns.map(col => (
                <th key={col} className="px-4 py-3 font-semibold min-w-[200px] relative group">
                  <input 
                    type="text" defaultValue={col}
                    onBlur={(e) => { if (e.target.value !== col) renameColumn(col, e.target.value); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white outline-none px-1 py-0.5 rounded-sm transition-colors cursor-text font-semibold text-gray-900"
                    title="Click to rename column"
                  />
                  <button 
                    onClick={() => { if(window.confirm(`Delete column "${col}"?`)) useCampaignStore.getState().deleteColumn(col); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 px-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 w-16 font-medium text-center">Actions</th>
            </tr>
            <tr className="bg-white border-b border-gray-100">
              <td className="px-4 py-2 text-center text-gray-400"><ArrowRight className="w-4 h-4 mx-auto transform rotate-90" /></td>
              {excelColumns.map(col => (
                <td key={`fill-${col}`} className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" placeholder="Fill all rows"
                      value={fillValues[col] || ''}
                      onChange={e => setFillValues({...fillValues, [col]: e.target.value})}
                      onKeyDown={e => { if (e.key === 'Enter') { fillColumn(col, fillValues[col] || ''); setFillValues({...fillValues, [col]: ''}); } }}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs bg-gray-50 focus:bg-white outline-none" 
                    />
                    <button onClick={() => { fillColumn(col, fillValues[col] || ''); setFillValues({...fillValues, [col]: ''}); }} className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              ))}
              <td></td>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {excelData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-4 py-2 text-center text-gray-400 font-medium">{rowIndex + 1}</td>
                {excelColumns.map(col => (
                  <td key={`${rowIndex}-${col}`} className="px-4 py-1">
                    <input type="text" value={row[col] || ''} onChange={(e) => updateCell(rowIndex, col, e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
                  </td>
                ))}
                <td className="px-4 py-1 text-center">
                  <button onClick={() => deleteRow(rowIndex)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}