import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  Camera, CameraOff, RefreshCw, Upload, Sparkles, AlertCircle, 
  CheckCircle2, FlipHorizontal, Volume2, VolumeX, Image as ImageIcon
} from 'lucide-react';

export default function QrCameraScanner({ onScanSuccess, onError }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload'
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const scannerRef = useRef(null);
  const scannerContainerId = 'zeroid-qr-reader';

  // Synthesize a high-tech positive chime on successful scan using Web Audio API
  const playSuccessChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12); // A6
      gain1.gain.setValueAtTime(0.15, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // AudioContext policy fallback
    }
  };

  // Discover available cameras
  useEffect(() => {
    let isMounted = true;
    Html5Qrcode.getCameras()
      .then(devices => {
        if (!isMounted) return;
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera or first device
          const backCam = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('rear') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setCameras([]);
          setCameraError('No video input camera detected on this system.');
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('Camera enumeration note:', err);
        setCameraError(err.message || 'Camera permission required to scan QR code.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Manage scanner lifecycle
  useEffect(() => {
    let qrScanner = null;

    const startScanner = async () => {
      if (activeTab !== 'camera' || !selectedCameraId) return;

      try {
        setCameraError(null);
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch (e) {}
        }

        qrScanner = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
        scannerRef.current = qrScanner;

        const config = {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.75);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0
        };

        await qrScanner.start(
          selectedCameraId,
          config,
          (decodedText) => {
            playSuccessChime();
            onScanSuccess(decodedText);
          },
          () => {
            // Frame failed to detect QR, silent ignore
          }
        );

        setIsScanning(true);
      } catch (err) {
        console.error('Failed to start scanner:', err);
        setIsScanning(false);
        setCameraError(err.message || 'Camera is in use or permission denied.');
        if (onError) onError(err);
      }
    };

    if (activeTab === 'camera') {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {}).finally(() => {
            try {
              scannerRef.current.clear();
            } catch (e) {}
          });
        }
      }
      setIsScanning(false);
    };
  }, [activeTab, selectedCameraId]);

  // Handle QR Image file upload / drag-and-drop
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsProcessingFile(true);
    setCameraError(null);

    let fileScanner = null;
    try {
      fileScanner = new Html5Qrcode('zeroid-file-reader', {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });

      const decodedText = await fileScanner.scanFile(file, false);
      playSuccessChime();
      onScanSuccess(decodedText);
    } catch (err) {
      console.warn('File decode error:', err);
      setCameraError('Could not detect a valid QR code in this image. Ensure the image is clear and well-lit.');
      if (onError) onError(err);
    } finally {
      setIsProcessingFile(false);
      if (fileScanner) {
        try {
          fileScanner.clear();
        } catch (e) {}
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="w-full flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-200">
      
      {/* Scanner Header Tabs */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'camera'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Image Upload</span>
            </button>
          </div>
        </div>

        {/* Audio Toggle & Camera Flip */}
        <div className="flex items-center gap-2">
          {cameras.length > 1 && activeTab === 'camera' && (
            <button
              onClick={() => {
                const currentIndex = cameras.findIndex(c => c.id === selectedCameraId);
                const nextIndex = (currentIndex + 1) % cameras.length;
                setSelectedCameraId(cameras[nextIndex].id);
              }}
              title="Switch Camera"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Main Viewport Area */}
      <div className="relative w-full aspect-square max-h-[380px] sm:max-h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* Hidden container for file decoding */}
        <div id="zeroid-file-reader" className="hidden"></div>

        {activeTab === 'camera' ? (
          <>
            {/* HTML5 QR Code DOM target */}
            <div 
              id={scannerContainerId} 
              className="w-full h-full object-cover flex items-center justify-center [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
            />

            {/* High-Tech Viewfinder HUD Overlay */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                
                {/* Dark Vignette outside target */}
                <div className="relative w-[70%] aspect-square border-2 border-dashed border-blue-500/40 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.15)]">
                  
                  {/* Four Cyber Corner Brackets */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-xl"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-xl"></div>

                  {/* Animated High-Tech Laser Line */}
                  <div className="absolute inset-x-2 h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_#60a5fa] animate-[scannerLaser_2.2s_ease-in-out_infinite]"></div>

                  {/* Reticle Crosshair */}
                  <div className="w-3 h-3 border border-blue-400/40 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping"></div>
                  </div>

                  {/* HUD Label */}
                  <div className="absolute -bottom-7 px-3 py-0.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-[10px] font-mono text-blue-300 flex items-center gap-1.5 backdrop-blur-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>ALIGN ZERO-ID QR IN FRAME</span>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Error / Permission Fallback */}
            {cameraError && (
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-950/90 backdrop-blur-sm z-20 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <CameraOff className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100 mb-1">Camera Stream Inactive</h4>
                  <p className="text-xs text-slate-400 max-w-xs font-mono">{cameraError}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" /> Use Image Upload
                  </button>
                  <button
                    onClick={() => {
                      setCameraError(null);
                      setSelectedCameraId(selectedCameraId || (cameras[0]?.id || ''));
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Drag & Drop Upload View */
          <div 
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`w-full h-full p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
              dragOver ? 'bg-blue-950/40 border-2 border-dashed border-blue-400' : 'bg-slate-950'
            }`}
            onClick={() => document.getElementById('qr-file-input')?.click()}
          >
            <input 
              id="qr-file-input"
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
              {isProcessingFile ? (
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              ) : (
                <ImageIcon className="w-8 h-8" />
              )}
            </div>

            <h4 className="font-bold text-sm text-slate-100 mb-1">
              {isProcessingFile ? 'Decoding QR Code...' : 'Drop QR Code Screenshot Here'}
            </h4>
            <p className="text-xs text-slate-400 font-mono mb-4 max-w-xs">
              Supports PNG, JPG, or SVG screenshots captured from the Citizen Vault presentation card.
            </p>

            <span className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors">
              Browse Files...
            </span>

            {cameraError && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono max-w-xs">
                {cameraError}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Viewport Footer Information */}
      <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span>Camera Engine: Html5Qrcode v2.3</span>
        </div>
        <div className="text-slate-500">
          Groth16 / BN254 Ready
        </div>
      </div>

      <style>{`
        @keyframes scannerLaser {
          0%, 100% {
            top: 5%;
            opacity: 0.2;
          }
          50% {
            top: 92%;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
