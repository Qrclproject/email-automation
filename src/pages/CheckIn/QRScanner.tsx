import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { ArrowLeft, CheckCircle2, XCircle, Loader2, ScanLine, CameraOff, History, Camera, Barcode } from 'lucide-react';
import { api } from '../../services/api';

export default function QRScanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'external'>('camera');
  const [manualCode, setManualCode] = useState('');

  // ✅ Dynamic key tied to the specific campaign ID
  const FEED_KEY = `recent-checkins-${id}`;

  // ✅ Persisted feed per campaign — survives remounts and navigation
  const [recentScans, setRecentScans] = useState<any[]>(() => {
    try { 
      return JSON.parse(localStorage.getItem(FEED_KEY) || '[]'); 
    } catch { 
      return []; 
    }
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const isScannerRunningRef = useRef(false);
  const isMountedRef = useRef(true);
  const manualInputRef = useRef<HTMLInputElement>(null);

  // ✅ Single source of truth for logging a scan to the side feed
  const addScan = (entry: { name: string; email: string; time: string; status: 'success' | 'duplicate'; data: any }) => {
    setRecentScans(prev => {
      const next = [entry, ...prev].slice(0, 8); // Increased to 8 to show more details
      localStorage.setItem(FEED_KEY, JSON.stringify(next)); // FIXED: Using FEED_KEY
      return next;
    });
  };

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
      const response = await api.post(`/campaigns/${id}/checkin`, { scannedValue: scannedText });

      const attendee = response.data?.attendee ?? {};
      
      const name = attendee['Full Name'] || attendee['Attendee Name'] || attendee['Name'] || attendee.name || attendee['name'] || attendee['Recipient Name'] || 'Unknown';
      const email = attendee.email || attendee['Email Address'] || attendee['Email'] || attendee['email address'] || attendee['email'] || 'N/A';
      const timeStr = new Date(response.data?.checkedInAt ?? Date.now()).toLocaleTimeString();

      setScanResult({ status: 'success', name, email, time: timeStr, text: 'Access Granted', data: attendee });
      addScan({ name, email, time: timeStr, status: 'success', data: attendee });

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error processing ticket';

      if (errorMessage === 'Already checked in') {
        const attendee = err.response?.data?.attendee ?? {};
        
        const name = attendee['Full Name'] || attendee['Attendee Name'] || attendee['Name'] || attendee.name || attendee['name'] || attendee['Recipient Name'] || 'Unknown';
        const email = attendee.email || attendee['Email Address'] || attendee['Email'] || attendee['email address'] || attendee['email'] || 'N/A';
        const time = new Date(err.response.data?.checkedInAt ?? Date.now()).toLocaleTimeString();

        setScanResult({ status: 'already_checked_in', name, email, time, text: 'Ticket Already Used!', data: attendee });
        addScan({ name, email, time, status: 'duplicate', data: attendee });
      } else {
        setErrorMsg(errorMessage);
      }
    } finally {
      setTimeout(() => { isProcessingRef.current = false; }, 500);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (!loading && campaign && !scanResult && !errorMsg && scanMode === 'camera') {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          if (!isProcessingRef.current && isMountedRef.current) {
            processCheckIn(decodedText);
          }
        },
        () => { /* Ignore background errors */ }
      )
        .then(() => { if (isMountedRef.current) isScannerRunningRef.current = true; })
        .catch((err) => {
          if (isMountedRef.current) {
            console.error("Camera start error:", err);
            setCameraError("Could not access the camera. Please allow permissions or switch to External Scanner mode.");
            scannerRef.current = null;
          }
        });
    }

    return () => {
      isMountedRef.current = false;
      if (scannerRef.current && isScannerRunningRef.current) {
        scannerRef.current.stop().catch(() => {});
        isScannerRunningRef.current = false;
      }
      scannerRef.current = null;
    };
  }, [loading, campaign, scanResult, errorMsg, scanMode]);

  useEffect(() => {
    if (scanMode === 'external' && manualInputRef.current && !scanResult && !errorMsg) {
      manualInputRef.current.focus();
    }
  }, [scanMode, scanResult, errorMsg]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode) {
      processCheckIn(manualCode);
      setManualCode('');
      setTimeout(() => { manualInputRef.current?.focus(); }, 100);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setErrorMsg(null);
    setCameraError(null);
    isProcessingRef.current = false;
  };

  const handleClearFeed = () => {
    if (window.confirm("Are you sure you want to clear the recent check-ins feed for this event? This will only clear the display on this device.")) {
      setRecentScans([]);
      localStorage.removeItem(FEED_KEY); // FIXED: Using FEED_KEY
    }
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFA45C]"/></div>;

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <button
          onClick={() => navigate('/checkin')}
          className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 text-sm font-medium transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Event Check-in
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
          {campaign?.name}
        </h1>

        <div className="flex items-center gap-3 mt-3">
          <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold px-2.5 py-1 rounded-md">
            {campaign?.status || 'Active'}
          </span>
          {campaign?.createdAt && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Created {new Date(campaign.createdAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:h-[calc(100vh-18rem)]">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col relative min-h-[520px] md:min-h-0">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap items-center justify-between gap-3 z-20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">QR Scanner</h2>
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setScanMode('camera')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${scanMode === 'camera' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <Camera className="w-4 h-4" /> Camera
              </button>
              <button
                onClick={() => setScanMode('external')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${scanMode === 'external' ? 'bg-[#FFA45C] text-[#2b1500] shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <Barcode className="w-4 h-4" /> External Scanner
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative bg-black/5 dark:bg-black/50">
            {scanMode === 'camera' && (
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
            )}

            {scanMode === 'external' && !scanResult && !errorMsg && (
              <div className="w-full max-w-lg p-6 flex flex-col items-center">
                <div className="w-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-lg text-center mb-6 flex items-center justify-center gap-2 text-sm font-medium">
                  <ScanLine className="w-5 h-5" /> External scanner mode active – focus the input field below and scan.
                </div>

                <form onSubmit={handleManualSubmit} className="w-full">
                  <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">External Scanner</label>
                  <div className="flex gap-2">
                    <input
                      ref={manualInputRef}
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Scan QR code..."
                      className="flex-1 border-2 border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-4 py-3 text-lg focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 outline-none transition-all"
                    />
                    <button type="submit" className="bg-[#FFA45C] text-[#2b1500] px-6 py-3 rounded-lg text-sm font-bold hover:bg-orange-400 transition-colors shadow-sm">
                      Check In
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">The scanner will auto-submit when it sends Enter.</p>
                </form>
              </div>
            )}

            {cameraError && scanMode === 'camera' && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 flex flex-col items-center justify-center p-6 z-20 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><CameraOff className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Camera Not Available</h3>
                <p className="text-sm text-gray-500 max-w-sm mb-6">{cameraError}</p>
                <button onClick={() => setScanMode('external')} className="px-6 py-2.5 bg-[#FFA45C] text-[#2b1500] rounded-lg font-bold hover:bg-orange-400 transition-colors shadow-sm">
                  Switch to External Scanner
                </button>
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
                    {campaign?.checkInDisplayColumns && campaign.checkInDisplayColumns.length > 0 ? (
                      campaign.checkInDisplayColumns.map((col: string) => (
                        <div key={col} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-1 mb-1 last:border-0 last:pb-0 last:mb-0">
                          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{col}:</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white text-right break-words max-w-[60%]">
                            {scanResult?.data?.[col] || 'N/A'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-1"><span className="font-semibold">Name:</span> {scanResult?.name}</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 mb-1"><span className="font-semibold">Email:</span> {scanResult?.email}</p>
                        {scanResult?.time && <p className="text-sm text-gray-800 dark:text-gray-200"><span className="font-semibold">Time:</span> {scanResult?.time}</p>}
                      </>
                    )}
                  </div>
                )}

                <button onClick={resetScanner} className="w-full max-w-sm bg-[#FFA45C] text-[#2b1500] font-bold py-3 rounded-lg hover:bg-orange-400 transition-colors shadow-sm">
                  Scan Next Attendee
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Feed */}
        <div className="w-full md:w-80 flex flex-col md:h-full">
          {recentScans.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-2">
                <History className="w-4 h-4 text-[#FFA45C]" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Check-ins</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {recentScans.map((scan, index) => (
                  <div key={`${scan.name}-${scan.time}-${index}`} className="flex items-start justify-between gap-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700/50 animate-in slide-in-from-right-4 duration-300">
                    
                    {/* Complete Details Column */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{scan.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">{scan.email}</span>
                      
                      {/* Display extra columns selected during campaign creation */}
                      {scan.data && campaign?.checkInDisplayColumns && (
                        <div className="flex flex-col gap-0.5 border-t border-gray-200 dark:border-gray-600/50 pt-1 mt-1">
                          {campaign.checkInDisplayColumns
                            .filter((c: string) => !['name', 'full name', 'attendee name', 'email', 'email address'].includes(c.toLowerCase()))
                            .map((col: string) => (
                              <span key={col} className="text-[11px] text-gray-600 dark:text-gray-300 truncate">
                                <span className="font-medium text-gray-500 dark:text-gray-400">{col}:</span> {scan.data[col] || 'N/A'}
                              </span>
                            ))}
                        </div>
                      )}
                      
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">{scan.time}</span>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md shrink-0 self-start ${
                      scan.status === 'success'
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {scan.status === 'success' ? 'Checked In' : 'Already Checked In'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleClearFeed}
                  className="w-full text-xs font-medium text-gray-400 hover:text-red-500 transition-colors py-1"
                >
                  Clear feed
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-6 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                <ScanLine className="w-8 h-8 text-[#FFA45C]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ready to Scan</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Select a mode above and start scanning attendees.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}