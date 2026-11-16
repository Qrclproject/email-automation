import { useCampaignStore } from '../../store/useCampaignStore';
import { QrCode, Type } from 'lucide-react';

export default function VariableMapper() {
  const { excelColumns, variableMappings, setMapping, selectedTemplate, emailBody } = useCampaignStore();

  if (excelColumns.length === 0) {
    return <div className="p-8 text-center bg-orange-50 text-orange-800 rounded-xl border border-orange-100">Please go back to Step 1 and upload an Excel file.</div>;
  }

  // Safe fallback for templateVars
  const templateVars = selectedTemplate?.variables || [];
  const textMatches = emailBody.match(/(\{\{.*?\}\}|\[.*?\])/g) || [];
  const allVars = Array.from(new Set([...templateVars, ...textMatches]));
  
  const qrVar = allVars.find(v => v.includes('QR'));
  const textVars = allVars.filter(v => !v.includes('QR'));

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Map Variables to Excel Data</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedTemplate ? `Template attached: ${selectedTemplate.name}` : 'No template attached. Mapping text variables only.'}
          </p>
        </div>

        {allVars.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No dynamic variables found in your email body or template. You can proceed to the next step.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <Type className="w-4 h-4" /> Text Overlays
              </h3>
              
              {textVars.length === 0 && (
                 <p className="text-sm text-gray-500 dark:text-gray-400">No text variables found. Add placeholders like <code>[Recipient Name]</code> to your email body to map them.</p>
              )}

              {textVars.map((variable) => (
                <div key={variable} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-3 border border-gray-100 dark:border-gray-600">
                  <span className="font-mono text-sm text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded w-fit break-all">{variable}</span>
                  
                  {/* FIXED SELECT STYLING HERE */}
                  <select 
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded p-2 text-sm flex-1 max-w-xs focus:ring-2 focus:ring-[#FFA45C] outline-none transition-colors cursor-pointer" 
                    value={variableMappings[variable] || ''} 
                    onChange={(e) => setMapping(variable, e.target.value)}
                  >
                    <option value="">-- Choose Excel Column --</option>
                    {excelColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {qrVar && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <QrCode className="w-4 h-4" /> QR Code Payload
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg gap-3">
                  <div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white block">QR Destination Data</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">What data should be encoded inside the QR code?</span>
                  </div>
                  
                  {/* FIXED SELECT STYLING HERE */}
                  <select 
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded p-2 text-sm flex-1 max-w-xs focus:ring-2 focus:ring-[#FFA45C] outline-none transition-colors cursor-pointer" 
                    value={variableMappings[qrVar] || ''} 
                    onChange={(e) => setMapping(qrVar, e.target.value)}
                  >
                    <option value="">-- Choose Excel Column --</option>
                    {excelColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}