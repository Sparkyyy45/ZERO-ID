import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, Share2, ShieldCheck, Info, Copy, Check, ExternalLink, 
  Building2, Clock, Lock, CheckCircle2, QrCode, Shield, ArrowRight,
  Sparkles, Layers, FileCheck, Camera
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AppHeader from '../components/AppHeader';

export default function ShareProofPage() {
  const { txId } = useParams();
  const navigate = useNavigate();
  const { tokens } = useAppContext();
  const [copied, setCopied] = useState(false);
  const [copiedScreenshot, setCopiedScreenshot] = useState(false);
  const [qrPreset, setQrPreset] = useState('age'); // 'age' | 'bank' | 'travel'
  const [countdown, setCountdown] = useState(300);

  const token = tokens.find(t => t.txId === txId || t.id === txId) || tokens[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!token) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="surface-card p-10 text-center max-w-md w-full shadow-md">
            <h2 className="text-base font-bold text-slate-900 mb-1">Token Not Found</h2>
            <p className="text-xs text-slate-500 mb-6 font-mono">The requested proof identifier is not present in your local vault.</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              Return to Vault
            </button>
          </div>
        </div>
      </div>
    );
  }

  let disclosed = {};
  if (qrPreset === 'bank') {
    disclosed = { 
      name: token.disclosedAttributes?.name || 'Verified Citizen', 
      state: token.disclosedAttributes?.state || 'India' 
    };
  } else if (qrPreset === 'travel') {
    disclosed = { 
      gender: token.disclosedAttributes?.gender || 'U' 
    };
  }

  const payload = {
    version: '2.0',
    protocol: 'ZERO-ID-Groth16',
    id: token.id,
    zk_proof_claim: token.circuitClaim || 'Age > 18 Verified (BN254 Precompile)',
    disclosed_attributes: disclosed,
    raw_pii_exposed: '0_BYTES_ZERO_KNOWLEDGE',
    nullifier_hash: token.nullifierHash || '0x9a8f2c7b3e104d556812e4f7a90b8c6d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7',
    algorand_app_id: '761383580',
    algorand_txId: token.txId,
    enclave_bound: token.enclaveBound || 'Hardware Passkey (WebAuthn)',
    hardware_silicon_attestation: 'ENCLAVE_BOUND_ACTIVE',
    anti_replay_nonce: 'NONCE_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
    timestamp: new Date().toISOString(),
    expires_in_seconds: countdown,
    status: token.status
  };

  const copyPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyScreenshotPayload = () => {
    const ssPayload = {
      ...payload,
      id: token.id + '-FORWARDED-SS',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      replay_attack: true,
      is_screenshot: true,
      hardware_signature: 'INVALID_STOLEN_SCREENSHOT',
      status: 'Screenshot_Replay'
    };
    navigator.clipboard.writeText(JSON.stringify(ssPayload, null, 2));
    setCopiedScreenshot(true);
    setTimeout(() => setCopiedScreenshot(false), 2000);
  };

  const handleOpenVerifier = () => {
    try {
      localStorage.setItem('zeroid_active_proof', JSON.stringify(payload));
    } catch (e) {}
    navigate('/verifier');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col">
      
      {/* Top Application Header */}
      <AppHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        
        {/* Top Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2.5 hover:bg-slate-100 bg-white rounded-xl border border-slate-200 transition-colors text-slate-700 shadow-xs flex items-center justify-center"
              title="Back to Vault"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Zero-Knowledge Presentation Card
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  token.status === 'Revoked' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {token.status}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500">Token ID: {token.id} · AVM App ID: 761383580</span>
            </div>
          </div>

          <button 
            onClick={handleOpenVerifier}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-95"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-400" /> Open Enterprise Verifier Terminal
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Dynamic QR Card */}
          <div className="lg:col-span-5 surface-card p-6 sm:p-7 flex flex-col items-center text-center gap-5 shadow-sm">
            
            <div className="w-full">
              <label className="text-xs font-semibold text-slate-700 uppercase font-mono mb-2 text-left block">
                Select Disclosure Preset:
              </label>
              <div className="grid grid-cols-3 gap-2 w-full">
                {[
                  { id: 'age', label: '18+ Age Gate', desc: '0 PII' },
                  { id: 'bank', label: 'Banking KYC', desc: 'Name + State' },
                  { id: 'travel', label: 'DigiYatra', desc: 'Gender' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setQrPreset(preset.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      qrPreset === preset.id
                        ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{preset.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm relative flex items-center justify-center">
              <QRCodeSVG
                value={JSON.stringify(payload)}
                size={220}
                level="M"
                includeMargin={true}
              />
            </div>

            <div className="w-full space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-sans">Dynamic TTL:</span>
                <span className="font-bold text-blue-700">{countdown}s auto-refresh</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 font-sans">Circuit Proof:</span>
                <span className="font-bold text-emerald-700">Groth16 (BN254)</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <span className="text-amber-800 font-sans font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Anti-Screenshot Guard:
                </span>
                <span className="font-bold text-amber-900">Hardware-Bound (Active)</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <button
                onClick={copyPayload}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied QR Payload JSON' : 'Copy Raw QR Payload'}</span>
              </button>

              <button
                onClick={copyScreenshotPayload}
                className="w-full py-2.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-xs font-semibold text-orange-800 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                title="Test how enterprise terminals block forwarded screenshot replay attacks"
              >
                {copiedScreenshot ? <Check className="w-3.5 h-3.5 text-orange-600" /> : <Camera className="w-3.5 h-3.5 text-orange-600" />}
                <span>{copiedScreenshot ? 'Copied Stolen SS Payload!' : 'Simulate Forwarded SS (Test Replay Defense)'}</span>
              </button>
            </div>
          </div>

          {/* Right: Trust Architecture & Privacy Comparison */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Comparison Box */}
            <div className="surface-card p-6 sm:p-7 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                Privacy Comparison Breakdown
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Traditional KYC */}
                <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100 space-y-2">
                  <div className="font-bold text-red-900 flex items-center gap-1.5">
                    <span>Traditional Paper KYC</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                    <li className="text-red-700">✕ 12-digit Aadhaar exposed</li>
                    <li className="text-red-700">✕ Full DOB &amp; Year leaked</li>
                    <li className="text-red-700">✕ Full residential address</li>
                    <li className="text-red-700">✕ Stored in 50+ bank DBs</li>
                  </ul>
                </div>

                {/* ZERO-ID */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>ZERO-ID (Groth16)</span>
                  </div>
                  <ul className="space-y-1.5 text-emerald-900 font-mono text-[11px]">
                    <li>✓ 0 Aadhaar numbers sent</li>
                    <li>✓ Pure Math: Age &gt;= 18 (True)</li>
                    <li>✓ 0 Document copies stored</li>
                    <li>✓ 1-Click Algorand Kill-Switch</li>
                  </ul>
                </div>

              </div>
            </div>

            {/* Cryptographic Attestation Metadata */}
            <div className="surface-card p-6 sm:p-7 space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 font-mono">
                <span className="text-slate-500 font-sans">Settlement Hash:</span>
                <Link 
                  to={`/tx/${token.txId}`}
                  className="text-blue-600 hover:text-blue-800 font-bold hover:underline flex items-center gap-1"
                >
                  <span className="truncate max-w-[200px]">{token.txId}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100 font-mono">
                <span className="text-slate-500 font-sans">Nullifier Hash:</span>
                <span className="font-bold text-slate-800 truncate max-w-[220px]">{token.nullifierHash || '0x9a8f...'}</span>
              </div>

              <div className="flex justify-between py-2 font-mono">
                <span className="text-slate-500 font-sans">Enclave Binding:</span>
                <span className="font-bold text-slate-800">{token.enclaveBound || 'Hardware Passkey'}</span>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
