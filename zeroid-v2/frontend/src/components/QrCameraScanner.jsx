import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  Camera, CameraOff, RefreshCw, Upload, FlipHorizontal,
  Volume2, VolumeX, Image as ImageIcon
} from 'lucide-react';

// Unique DOM ID counter per component mount â€” avoids Html5Qrcode DOM conflicts
let _instanceCounter = 0;

export default function QrCameraScanner({ onScanSuccess, onError }) {
  const [activeTab, setActiveTab] = useState('camera');
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const instanceId = useRef(`zeroid-qr-${++_instanceCounter}`);
  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);
  const startingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }, [soundEnabled]);

  // CRITICAL: properly await stop+clear+delay so browser releases camera stream
  const destroyScanner = useCallback(async () => {
    const s = scannerRef.current;
    if (!s) return;
    scannerRef.current = null;
    try { if (s.isScanning) await s.stop(); } catch (e) {}
    try { s.clear(); } catch (e) {}
    // Give browser 350ms to release MediaStream â€” this prevents "could not start video source"
    await new Promise(r => setTimeout(r, 350));
  }, []);

  // Enumerate cameras once on mount
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then(devices => {
        if (!isMountedRef.current) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          const preferred = devices.find(d =>
            /front|user|integrated|facetime/i.test(d.label)
          ) || devices[0];
          setSelectedCameraId(preferred.id);
        } else {
          setCameraError('No camera detected on this device.');
        }
      })
      .catch(() => {
        if (isMountedRef.current)
          setCameraError('Camera permission denied. Click the ðŸ”’ in your address bar and allow camera.');
      });
  }, []);

  const startScanner = useCallback(async (camId) => {
    if (startingRef.current) return;
    startingRef.current = true;
    if (!isMountedRef.current) { startingRef.current = false; return; }

    setIsStarting(true);
    setCameraError(null);
    setIsScanning(false);

    // MUST destroy old instance and wait for stream release first
    await destroyScanner();
    if (!isMountedRef.current) { startingRef.current = false; setIsStarting(false); return; }

    let scanner;
    try {
      scanner = new Html5Qrcode(instanceId.current, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1.0 };
      const onDecode = (text) => { playChime(); onScanSuccess(text); };
      const onFail = () => {};

      // Try deviceId first, fall back to facingMode:'user' (works on all laptops)
      try {
        await scanner.start(camId, config, onDecode, onFail);
      } catch (e1) {
        console.warn('deviceId start failed, trying facingMode fallback:', e1.message);
        await scanner.start({ facingMode: 'user' }, config, onDecode, onFail);
      }

      if (!isMountedRef.current) { await scanner.stop().catch(() => {}); scanner.clear(); startingRef.current = false; setIsStarting(false); return; }
      setIsScanning(true);
    } catch (err) {
      console.error('Camera start error:', err);
      if (isMountedRef.current) {
        setIsScanning(false);
        const msg = err.message || '';
        if (msg.includes('video source') || msg.includes('Could not start') || err.name === 'NotReadableError') {
          setCameraError('Camera is in use by another tab or app. Close other camera apps and click Retry.');
        } else if (err.name === 'NotAllowedError' || msg.includes('permission')) {
          setCameraError('Camera permission denied. Click the ðŸ”’ lock in your browser address bar â†’ allow Camera â†’ retry.');
        } else {
          setCameraError(`Camera error: ${msg || 'Unknown error. Try Image Upload instead.'}`);
        }
        if (onError) onError(err);
      }
    } finally {
      startingRef.current = false;
      if (isMountedRef.current) setIsStarting(false);
    }
  }, [destroyScanner, playChime, onScanSuccess, onError]);

  // Camera tab/camera lifecycle
  useEffect(() => {
    if (activeTab === 'camera' && selectedCameraId) {
      startScanner(selectedCameraId);
    } else if (activeTab !== 'camera') {
      destroyScanner().then(() => { if (isMountedRef.current) setIsScanning(false); });
    }
    return () => {
      destroyScanner().then(() => { if (isMountedRef.current) setIsScanning(false); });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedCameraId]);

  // Final cleanup on unmount
  useEffect(() => () => { isMountedRef.current = false; destroyScanner(); }, [destroyScanner]);

  const handleRetry = () => {
    setCameraError(null);
    setIsScanning(false);
    if (selectedCameraId) startScanner(selectedCameraId);
  };

  const switchCamera = () => {
    const idx = cameras.findIndex(c => c.id === selectedCameraId);
    setSelectedCameraId(cameras[(idx + 1) % cameras.length].id);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsProcessingFile(true);
    setCameraError(null);
    const fileReaderId = `${instanceId.current}-file`;
    let fs = null;
    try {
      fs = new Html5Qrcode(fileReaderId, { verbose: false });
      const text = await fs.scanFile(file, false);
      playChime();
      onScanSuccess(text);
    } catch (e) {
      setCameraError('No QR code found in image. Try a clearer screenshot.');
      if (onError) onError(e);
    } finally {
      setIsProcessingFile(false);
      try { fs?.clear(); } catch (_) {}
    }
  };

  return (
    <div className="w-full flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-200">

      {/* Tabs */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'camera' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <Camera className="w-3.5 h-3.5" /><span>Live Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
          >
            <Upload className="w-3.5 h-3.5" /><span>Image Upload</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {cameras.length > 1 && activeTab === 'camera' && (
            <button onClick={switchCamera} title="Switch Camera" className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => setSoundEnabled(v => !v)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative w-full aspect-square max-h-[380px] sm:max-h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden">

        {/* Hidden div for file decoding â€” unique per instance */}
        <div id={`${instanceId.current}-file`} className="hidden" />

        {activeTab === 'camera' ? (
          <>
            {/* Html5Qrcode renders video into this div */}
            <div
              id={instanceId.current}
              className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_img]:hidden"
            />

            {/* Loading state */}
            {isStarting && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 gap-3 z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                <span className="text-xs text-slate-400 font-mono">Starting camera stream...</span>
              </div>
            )}

            {/* Active scanning HUD */}
            {isScanning && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-[70%] aspect-square border-2 border-dashed border-blue-500/40 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />
                  <div className="absolute inset-x-2 h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#60a5fa] animate-[scannerLaser_2.2s_ease-in-out_infinite]" />
                  <div className="w-3 h-3 border border-blue-400/40 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                  </div>
                  <div className="absolute -bottom-7 px-3 py-0.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-[10px] font-mono text-blue-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>ALIGN ZERO-ID QR IN FRAME</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {cameraError && (
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-950/95 z-20 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <CameraOff className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 mb-1">Camera Unavailable</h4>
                  <p className="text-xs text-slate-400 max-w-xs font-mono">{cameraError}</p>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={handleRetry} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                  </button>
                  <button onClick={() => setActiveTab('upload')} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
                    <Upload className="w-3.5 h-3.5" /> Upload Instead
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById(`${instanceId.current}-fileinput`)?.click()}
            className={`w-full h-full p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${dragOver ? 'bg-blue-950/40 border-2 border-dashed border-blue-400' : 'bg-slate-950'}`}
          >
            <input id={`${instanceId.current}-fileinput`} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
              {isProcessingFile ? <RefreshCw className="w-8 h-8 animate-spin text-blue-400" /> : <ImageIcon className="w-8 h-8" />}
            </div>
            <h4 className="font-bold text-sm text-slate-100 mb-1">{isProcessingFile ? 'Decoding QR Code...' : 'Drop QR Screenshot Here'}</h4>
            <p className="text-xs text-slate-400 font-mono mb-4 max-w-xs">Take a screenshot of the citizen QR and drop it here, or click Browse</p>
            <span className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700">Browse Files...</span>
            {cameraError && <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono max-w-xs">{cameraError}</div>}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-pulse' : isStarting ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
          <span>{isScanning ? 'Camera Active â€” Scanning for QR...' : isStarting ? 'Initializing camera stream...' : 'Camera Engine: Html5Qrcode v2.3'}</span>
        </div>
        <div className="text-slate-500">Groth16 / BN254 Ready</div>
      </div>

      <style>{`
        @keyframes scannerLaser {
          0%, 100% { top: 5%; opacity: 0.2; }
          50% { top: 92%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
