import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, Html5QrcodeScannerState } from 'html5-qrcode';
import {
  Camera, CameraOff, RefreshCw, Upload, FlipHorizontal,
  Volume2, VolumeX, Image as ImageIcon, CheckCircle2, Zap
} from 'lucide-react';

// Unique DOM ID counter per component mount — avoids Html5Qrcode DOM conflicts
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
  const [lastScannedText, setLastScannedText] = useState(null);

  const instanceId = useRef(`zeroid-qr-${++_instanceCounter}`);
  const scannerRef = useRef(null);
  const isMountedRef = useRef(true);
  const startingRef = useRef(false);
  const scanCooldownRef = useRef(false);
  const turboIntervalRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
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
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }, [soundEnabled]);

  // Explicitly release all MediaStream tracks from any video elements in container
  const stopAllMediaTracks = useCallback(() => {
    try {
      const container = document.getElementById(instanceId.current);
      if (container) {
        const videos = container.querySelectorAll('video');
        videos.forEach(v => {
          if (v.srcObject && typeof v.srcObject.getTracks === 'function') {
            v.srcObject.getTracks().forEach(track => {
              try { track.stop(); } catch (_) {}
            });
            v.srcObject = null;
          }
        });
      }
    } catch (_) {}
  }, []);

  // Thoroughly stop and destroy any active scanner and release hardware camera lock
  const destroyScanner = useCallback(async () => {
    // 1. Clear turbo native BarcodeDetector loop
    if (turboIntervalRef.current) {
      clearInterval(turboIntervalRef.current);
      turboIntervalRef.current = null;
    }

    // 2. Stop and clear Html5Qrcode instance
    const s = scannerRef.current;
    scannerRef.current = null;
    if (s) {
      try {
        const state = s.getState ? s.getState() : (s.isScanning ? Html5QrcodeScannerState.SCANNING : Html5QrcodeScannerState.NOT_STARTED);
        if (state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED || s.isScanning) {
          await s.stop();
        }
      } catch (e) {
        // Ignore stop error
      }
      try {
        s.clear();
      } catch (e) {}
    }

    // 3. Stop all hardware media tracks
    stopAllMediaTracks();

    // 4. Brief pause for OS/driver to release camera resource
    await new Promise(r => setTimeout(r, 200));
  }, [stopAllMediaTracks]);

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
          // If enumerateDevices returned empty (common before permission is granted),
          // don't fail yet—startScanner can still request { facingMode: 'user' } directly!
          setSelectedCameraId('user_default');
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          // Still allow user to click Start/Retry which triggers browser permission dialog
          setSelectedCameraId('user_default');
        }
      });
  }, []);

  const startScanner = useCallback(async (camIdOrFacing) => {
    if (startingRef.current) return;
    startingRef.current = true;
    if (!isMountedRef.current) { startingRef.current = false; return; }

    setIsStarting(true);
    setCameraError(null);
    setIsScanning(false);
    setLastScannedText(null);

    // MUST destroy old instance and release camera stream first
    await destroyScanner();
    if (!isMountedRef.current) { startingRef.current = false; setIsStarting(false); return; }

    const container = document.getElementById(instanceId.current);
    if (!container) {
      startingRef.current = false;
      setIsStarting(false);
      return;
    }
    container.innerHTML = '';

    let scanner;
    try {
      scanner = new Html5Qrcode(instanceId.current, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      });
      scannerRef.current = scanner;

      // Generous 85% responsive qrbox so user does not need to awkwardly align into a tiny box
      const config = {
        fps: 20,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          return {
            width: Math.max(160, Math.floor(minEdge * 0.85)),
            height: Math.max(160, Math.floor(minEdge * 0.85))
          };
        },
        aspectRatio: 1.0,
        videoConstraints: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const handleDecode = (text) => {
        if (!text || scanCooldownRef.current) return;
        scanCooldownRef.current = true;
        setLastScannedText(text);
        playChime();
        if (onScanSuccess) onScanSuccess(text);
        setTimeout(() => {
          scanCooldownRef.current = false;
        }, 2200);
      };

      // Decide target camera:
      // If camIdOrFacing is a real deviceId string, try deviceId.
      // If it fails or if camIdOrFacing is 'user_default', use { facingMode: 'user' }.
      let targetCamera = { facingMode: 'user' };
      if (camIdOrFacing && camIdOrFacing !== 'user_default') {
        targetCamera = camIdOrFacing;
      }

      try {
        await scanner.start(targetCamera, config, handleDecode, () => {});
      } catch (e1) {
        console.warn('Initial camera start failed, retrying with facingMode user:', e1?.message || e1);
        stopAllMediaTracks();
        await new Promise(r => setTimeout(r, 200));

        try { scanner.clear(); } catch (_) {}
        container.innerHTML = '';

        scanner = new Html5Qrcode(instanceId.current, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
          experimentalFeatures: { useBarCodeDetectorIfSupported: true }
        });
        scannerRef.current = scanner;

        // Fallback to simple facingMode: 'user' (works reliably across all OS webcams)
        await scanner.start({ facingMode: 'user' }, config, handleDecode, () => {});
      }

      if (!isMountedRef.current) {
        await destroyScanner();
        startingRef.current = false;
        setIsStarting(false);
        return;
      }

      setIsScanning(true);

      // Turbo booster: Native BarcodeDetector running directly on <video> element for instant 5ms decode
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const videoEl = container.querySelector('video');
          if (videoEl) {
            turboIntervalRef.current = setInterval(async () => {
              if (scanCooldownRef.current || !isMountedRef.current || videoEl.readyState < 2) return;
              try {
                const barcodes = await barcodeDetector.detect(videoEl);
                if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                  handleDecode(barcodes[0].rawValue);
                }
              } catch (_) {}
            }, 120);
          }
        } catch (_) {}
      }

    } catch (err) {
      console.error('Camera fatal error:', err);
      if (isMountedRef.current) {
        setIsScanning(false);
        const msg = (err && (err.message || String(err))) || '';
        if (msg.includes('video source') || msg.includes('Could not start') || err.name === 'NotReadableError') {
          setCameraError('Camera is busy or in use by another tab/app. Close other camera apps and click Retry.');
        } else if (err.name === 'NotAllowedError' || msg.includes('Permission') || msg.includes('permission')) {
          setCameraError('Camera permission denied. Click the 🔒 in your browser address bar → allow Camera → retry.');
        } else {
          setCameraError(`Camera unavailable: ${msg || 'Could not access webcam. You can also use Image Upload or Quick Scan.'}`);
        }
        if (onError) onError(err);
      }
    } finally {
      startingRef.current = false;
      if (isMountedRef.current) setIsStarting(false);
    }
  }, [destroyScanner, playChime, onScanSuccess, onError, stopAllMediaTracks]);

  // Lifecycle when tab or camera changes
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

  // Cleanup on unmount
  useEffect(() => () => {
    isMountedRef.current = false;
    destroyScanner();
  }, [destroyScanner]);

  const handleRetry = () => {
    setCameraError(null);
    setIsScanning(false);
    startScanner(selectedCameraId || { facingMode: 'user' });
  };

  const switchCamera = () => {
    if (cameras.length <= 1) {
      // Toggle between facingMode user and environment
      setSelectedCameraId(prev => prev === 'user' ? 'environment' : 'user');
      return;
    }
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
      setLastScannedText(text);
      if (onScanSuccess) onScanSuccess(text);
    } catch (e) {
      // Fallback: try native BarcodeDetector on image
      let detected = false;
      if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const imgBitmap = await createImageBitmap(file);
          const results = await barcodeDetector.detect(imgBitmap);
          if (results && results.length > 0 && results[0].rawValue) {
            playChime();
            setLastScannedText(results[0].rawValue);
            if (onScanSuccess) onScanSuccess(results[0].rawValue);
            detected = true;
          }
        } catch (_) {}
      }
      if (!detected) {
        setCameraError('No QR code detected in image. Please try a clearer screenshot.');
        if (onError) onError(e);
      }
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'camera' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Image Upload</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'camera' && (
            <button
              onClick={switchCamera}
              title="Switch Camera / Facing Mode"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setSoundEnabled(v => !v)}
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative w-full aspect-square max-h-[380px] sm:max-h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden">

        {/* Hidden div for file decoding */}
        <div id={`${instanceId.current}-file`} className="hidden" />

        {activeTab === 'camera' ? (
          <>
            {/* Html5Qrcode renders video into this div */}
            <div
              id={instanceId.current}
              className="w-full h-full [&_video]:w-full [&_video]:h-full [&_video]:object-contain [&_img]:hidden"
            />

            {/* Loading state */}
            {isStarting && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 gap-3 z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                <span className="text-xs text-slate-400 font-mono">Starting HD camera stream...</span>
              </div>
            )}

            {/* Active scanning HUD */}
            {isScanning && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-[78%] aspect-square border-2 border-dashed border-blue-500/40 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                  <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />
                  
                  {/* Scanning laser animation */}
                  <div className="absolute inset-x-2 h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#60a5fa] animate-[scannerLaser_2.2s_ease-in-out_infinite]" />
                  
                  <div className="w-3 h-3 border border-blue-400/40 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
                  </div>

                  <div className="absolute -bottom-8 px-3 py-1 rounded-full bg-slate-900/90 border border-blue-500/30 text-[10px] font-mono text-blue-300 flex items-center gap-1.5 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>HOLD ZERO-ID QR IN FRONT OF CAMERA</span>
                  </div>
                </div>
              </div>
            )}

            {/* Scan Success Overlay Badge */}
            {lastScannedText && (
              <div className="absolute top-4 inset-x-4 p-3 rounded-2xl bg-emerald-950/95 border border-emerald-500/60 shadow-xl flex items-center gap-2.5 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-emerald-200">QR Code Captured!</div>
                  <div className="text-[10px] font-mono text-emerald-400 truncate">{lastScannedText}</div>
                </div>
                <Zap className="w-4 h-4 text-emerald-300 animate-pulse shrink-0" />
              </div>
            )}

            {/* Error overlay */}
            {cameraError && (
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-950/95 z-20 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <CameraOff className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 mb-1">Camera Notice</h4>
                  <p className="text-xs text-slate-400 max-w-xs font-mono leading-relaxed">{cameraError}</p>
                </div>
                <div className="flex gap-2 pt-1 flex-wrap justify-center">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Screenshot Instead
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById(`${instanceId.current}-fileinput`)?.click()}
            className={`w-full h-full p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragOver ? 'bg-blue-950/40 border-2 border-dashed border-blue-400' : 'bg-slate-950'
            }`}
          >
            <input
              id={`${instanceId.current}-fileinput`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
            />
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
              {isProcessingFile ? <RefreshCw className="w-8 h-8 animate-spin text-blue-400" /> : <ImageIcon className="w-8 h-8" />}
            </div>
            <h4 className="font-bold text-sm text-slate-100 mb-1">
              {isProcessingFile ? 'Decoding QR Code...' : 'Drop QR Screenshot Here'}
            </h4>
            <p className="text-xs text-slate-400 font-mono mb-4 max-w-xs">
              Take a screenshot of the citizen QR and drop it here, or click Browse
            </p>
            <span className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-sm transition-colors">
              Browse Image...
            </span>
            {cameraError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono max-w-xs">
                {cameraError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-pulse' : isStarting ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
          <span>
            {isScanning ? 'Dual Engine Active (Html5Qrcode + Hardware BarcodeDetector)' : isStarting ? 'Initializing camera stream...' : 'Camera Ready'}
          </span>
        </div>
        <div className="text-slate-500 flex items-center gap-1">
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>Groth16 BN254</span>
        </div>
      </div>

      <style>{`
        @keyframes scannerLaser {
          0%, 100% { top: 6%; opacity: 0.25; }
          50% { top: 92%; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
