import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, CheckCircle2, XCircle, Search, Loader2, ScanLine, CameraOff, History } from 'lucide-react';
import { api } from '../../services/api';

export default function QRScanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    api.get(`/campaigns/${id}`).then(res => {
      setCampaign(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  const processCheckIn = async (scannedText: string) => {
    if (!scannedText || isProcessingRef.current) return; 
    
    isProcessingRef.current = true; 
    setErrorMsg(null);
    
    try {
      const response = await api.post(`/campaigns/${id}/checkin`, { 
        scannedValue: scannedText 
      });

      const name = response.data.attendee['Full Name'] || response.data.attendee['Attendee Name'] || response.data.attendee.Name || 'Unknown';
      const email = response.data.attendee.email || response.data.attendee['Email Address'] || 'N/A';
      const timeStr = new Date(response.data.checkedInAt).toLocaleTimeString();

      setScanResult({ status: 'success', name, email, time: timeStr, text: 'Access Granted' });
      setRecentScans(prev => [{ name, time: timeStr, status: 'success' }, ...prev].slice(0, 5));

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error processing ticket';
      
      if (errorMessage === 'Already checked in') {
        const attendee = err.response.data.attendee;
        const name = attendee['Full Name'] || attendee['Attendee Name'] || attendee.Name || 'Unknown';
        const email = attendee.email || attendee['Email Address'] || 'N/A';
        const time = new Date(err.response.data.checkedInAt).toLocaleTimeString();
        
        setScanResult({ status: 'already_checked_in', name, email, time, text: 'Ticket Already Used!' });
      } else {
        setErrorMsg(errorMessage);
      }
    }
  };

  useEffect(() => {
    if (!loading && campaign && !scanResult && !errorMsg) {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (!isProcessingRef.current) {
            html5QrCode.pause();
            processCheckIn(decodedText);
          }
        },
        () => { }
      ).catch((err) => {
        console.error("Camera start error:", err);
        setCameraError("Could not access the camera. Please allow camera permissions in your browser settings, or use the manual entry below.");
      });
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(e => console.error("Failed to stop scanner", e));
        scannerRef.current = null;
      }
    };
  }, [loading, campaign, scanResult, errorMsg]);

  useEffect(() => {
    let barcode = '';
    let timeout: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      
      if (e.key === 'Enter') {
        if (barcode.length > 2) { 
          e.preventDefault(); 
          processCheckIn(barcode);
          barcode = '';
        }
      } else if (e.key.length === 1) { 
        barcode += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { barcode = ''; }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [scanResult, errorMsg]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      processCheckIn(manualCode);
      setManualCode('');
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setErrorMsg(null);
    setCameraError(null);
    isProcessingRef.current = false;
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFA45C]"/></div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-8rem)]">
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col relative">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 z-20">
          <button onClick={() => navigate('/checkin')} className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">{campaign?.name}</span>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center relative bg-black/5 dark:bg-black/50">
          <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
            <div id="reader" className="w-full h-full max-w-md mx-auto"></div>
            
            {!scanResult && !errorMsg && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                 <div className="w-64 h-64 border-2 border-[#FFA45C] rounded-3xl relative shadow-[0_0_0_4000px_rgba(0,0,0,0.5)]">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#FFA45C] rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#FFA45C] rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#FFA45C] rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#FFA45C] rounded-br-lg"></div>
                 </div>
                 <p className="mt-8 text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Align QR code within the frame</p>
              </div>
            )}
          </div>

          {cameraError && (
             <div className="absolute inset-0 bg-white dark:bg-gray-800 flex flex-col items-center justify-center p-6 z-20 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><CameraOff className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Camera Not Available</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">{cameraError}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium">Retry Camera</button>
             </div>
          )}

          {(scanResult || errorMsg) && (
            <div className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${scanResult?.status === 'success' ? 'bg-green-100 text-green-500' : scanResult?.status === 'already_checked_in' ? 'bg-yellow-100 text-yellow-500' : 'bg-red-100 text-red-500'}`}>
                {scanResult?.status === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
              </div>
              
              <h3 className={`text-2xl font-bold mb-2 ${scanResult?.status === 'success' ? 'text-green-600 dark:text-green-400' : scanResult?.status === 'already_checked_in' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                {scanResult?.text || 'Invalid Ticket'}
              </h3>
              
              {errorMsg ? (
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{errorMsg}</p>
              ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 w-full max-w-sm mb-6 shadow-sm">
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-1"><span className="font-semibold">Name:</span> {scanResult?.name}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-1"><span className="font-semibold">Email:</span> {scanResult?.email}</p>
                  {scanResult?.time && <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold">Time:</span> {scanResult?.time}</p>}
                </div>
              )}

              <button onClick={resetScanner} className="w-full max-w-sm bg-[#FFA45C] text-[#2b1500] font-bold py-3 rounded-lg hover:bg-orange-400 transition-colors shadow-sm">
                Scan Next Attendee
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-20">
          <p className="text-xs text-center text-gray-500 mb-2 flex items-center justify-center gap-2"><ScanLine className="w-4 h-4" /> External USB/Bluetooth Scanner Active</p>
          <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-md mx-auto">
            <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Or type Ticket ID manually" className="flex-1 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FFA45C] outline-none" />
            <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800"><Search className="w-4 h-4" /></button>
          </form>
        </div>
      </div>

      <div className="w-full md:w-80 flex flex-col h-full">
        {recentScans.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
              <History className="w-4 h-4 text-[#FFA45C]" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Check-ins</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {recentScans.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700/50 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col truncate pr-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{scan.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{scan.time}</span>
                  </div>
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center h-full flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-8 h-8 text-blue-500" /></div>
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Ready to Scan</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">Point the camera at the attendee's QR code. The system will automatically detect it.</p>
          </div>
        )}
      </div>
    </div>
  );
}