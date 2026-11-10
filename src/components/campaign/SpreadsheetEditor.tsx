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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col w-full transition-colors">
      
      {/* Header Area - Stacks on mobile */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col xl:flex-row justify-between items-start xl:items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-xl gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Spreadsheet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{fileName} · {excelData.length} rows · {excelColumns.length} columns</p>
        </div>
        
        {/* Action Buttons - Flex wrap on mobile */}
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          <button onClick={addRow} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors">
            <PlusCircle className="w-4 h-4" /> Add Row
          </button>
          <button onClick={() => setShowAddCol(!showAddCol)} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors">
            <PlusSquare className="w-4 h-4" /> Add Column
          </button>
          <button onClick={handleDownload} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs md:text-sm font-medium rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Download
          </button>
          
          <div className="hidden md:block w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>
          
          <button onClick={clearSpreadsheet} className="flex-1 md:flex-none justify-center px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 text-xs md:text-sm font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={() => setStep(2)} className="w-full md:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] text-xs md:text-sm font-bold rounded-lg transition-colors">
            Save & Continue <Save className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showAddCol && (
        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border-b border-green-100 dark:border-green-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-sm font-medium text-green-800 dark:text-green-400">New Column Name:</span>
          <form onSubmit={handleAddColumnSubmit} className="flex gap-2 w-full sm:w-auto">
            <input autoFocus type="text" value={newColumnName} onChange={e => setNewColumnName(e.target.value)} className="border border-green-300 rounded px-2 py-1 text-sm outline-none flex-1 sm:flex-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g., Ticket Type" />
            <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">Add</button>
            <button type="button" onClick={() => setShowAddCol(false)} className="text-gray-500 dark:text-gray-400 text-sm hover:underline">Cancel</button>
          </form>
        </div>
      )}

      {/* Scrollable Table Area */}
      <div className="overflow-x-auto w-full p-4">
        <table className="text-left text-sm border-collapse min-w-[800px] w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 w-12 font-medium">#</th>
              {excelColumns.map(col => (
                <th key={col} className="px-4 py-3 font-semibold min-w-[200px] relative group">
                  <input 
                    type="text" defaultValue={col}
                    onBlur={(e) => { if (e.target.value !== col) renameColumn(col, e.target.value); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 outline-none px-1 py-0.5 rounded-sm transition-colors cursor-text font-semibold text-gray-900 dark:text-white"
                    title="Click to rename column"
                  />
                  <button 
                    onClick={() => { if(window.confirm(`Delete column "${col}"?`)) useCampaignStore.getState().deleteColumn(col); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 dark:bg-gray-800 px-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 w-16 font-medium text-center">Actions</th>
            </tr>
            <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <td className="px-4 py-2 text-center text-gray-400"><ArrowRight className="w-4 h-4 mx-auto transform rotate-90" /></td>
              {excelColumns.map(col => (
                <td key={`fill-${col}`} className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" placeholder="Fill all rows"
                      value={fillValues[col] || ''}
                      onChange={e => setFillValues({...fillValues, [col]: e.target.value})}
                      onKeyDown={e => { if (e.key === 'Enter') { fillColumn(col, fillValues[col] || ''); setFillValues({...fillValues, [col]: ''}); } }}
                      className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 outline-none" 
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
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {excelData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-2 text-center text-gray-400 font-medium">{rowIndex + 1}</td>
                {excelColumns.map(col => (
                  <td key={`${rowIndex}-${col}`} className="px-4 py-1">
                    <input type="text" value={row[col] || ''} onChange={(e) => updateCell(rowIndex, col, e.target.value)} className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" />
                  </td>
                ))}
                <td className="px-4 py-1 text-center">
                  <button onClick={() => deleteRow(rowIndex)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}