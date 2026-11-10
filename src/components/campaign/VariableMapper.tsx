import { useCampaignStore } from '../../store/useCampaignStore';
import { QrCode, Type } from 'lucide-react';

export default function VariableMapper() {
  const { excelColumns, variableMappings, setMapping, selectedTemplate, emailBody } = useCampaignStore();

  if (excelColumns.length === 0) {
    return <div className="p-8 text-center bg-orange-50 text-orange-800 rounded-xl border border-orange-100">Please go back to Step 1 and upload an Excel file.</div>;
  }

  // 1. Get variables from the template (if one is attached)
  const templateVars = selectedTemplate ? selectedTemplate.variables : [];

  // 2. Scan the typed email body for any {{Variable}} or [Variable]
  const textMatches = emailBody.match(/(\{\{.*?\}\}|\[.*?\])/g) || [];
  
  // 3. Combine them and remove duplicates
  const allVars = Array.from(new Set([...templateVars, ...textMatches]));
  
  const qrVar = allVars.find(v => v.includes('QR'));
  const textVars = allVars.filter(v => !v.includes('QR'));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Map Variables to Excel Data</h2>
          <p className="text-sm text-gray-500">
            {selectedTemplate 
              ? `Template: ${selectedTemplate.name}` 
              : 'No template attached. Mapping text variables only.'}
          </p>
        </div>

        {allVars.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-500 text-sm">No dynamic variables found in your email body or template. You can proceed to the next step.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2"><Type className="w-4 h-4" /> Text Overlays</h3>
              
              {textVars.length === 0 && (
                 <p className="text-sm text-gray-500">No text variables found.</p>
              )}

              {textVars.map((variable) => (
                <div key={variable} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-3">
                  <span className="font-mono text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded w-fit">{variable}</span>
                  <select className="border border-gray-300 rounded p-2 text-sm flex-1 max-w-xs focus:ring-[#FFA45C]" value={variableMappings[variable] || ''} onChange={(e) => setMapping(variable, e.target.value)}>
                    <option value="">-- Choose Excel Column --</option>
                    {excelColumns.map(col => (<option key={col} value={col}>{col}</option>))}
                  </select>
                </div>
              ))}
            </div>

            {qrVar && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2"><QrCode className="w-4 h-4" /> QR Code Payload</h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg gap-3">
                  <div>
                    <span className="font-semibold text-sm text-gray-900 block">QR Destination Data</span>
                    <span className="text-xs text-gray-500">What data should be encoded inside the QR code?</span>
                  </div>
                  <select className="border border-gray-300 rounded p-2 text-sm flex-1 max-w-xs focus:ring-[#FFA45C]" value={variableMappings[qrVar] || ''} onChange={(e) => setMapping(qrVar, e.target.value)}>
                    <option value="">-- Choose Excel Column --</option>
                    {excelColumns.map(col => (<option key={col} value={col}>{col}</option>))}
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