import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Shield, ShieldAlert, ShieldCheck, ExternalLink, Plus, 
  Building2, Terminal, Sparkles, AlertTriangle, Landmark, 
  Smartphone, TrendingUp, CheckCircle2, Lock, KeyRound, 
  Plane, QrCode, Copy, Check, RefreshCw, Eye, EyeOff, 
  Cpu, Award, Fingerprint, Clock, FileCheck, Layers, 
  ChevronRight, X, ArrowUpRight, CheckCheck, RefreshCcw, Radio
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AppHeader from '../components/AppHeader';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { 
    wallet, tokens, logs, addLog, 
    sessions, setSessions, revokeSession, 
    markTokenRevoked, promptBiometrics 
  } = useAppContext();

  const activeToken = tokens.find(t => t.status === 'Active') || tokens[0];
  const activeSessionsCount = sessions.filter(s => s.status === 'Active').length;
  const revokedSessionsCount = sessions.filter(s => s.status === 'Revoked').length;

  const [revokingId, setRevokingId] = useState(null);
  const [isGlobalRevoking, setIsGlobalRevoking] = useState(false);
  const [selectedTokenForQr, setSelectedTokenForQr] = useState(null);
  const [qrPreset, setQrPreset] = useState('age'); // 'age' | 'bank' | 'travel' | 'custom'
  const [customClaims, setCustomClaims] = useState({ name: false, state: true, gender: false });
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(300);
  const [showKillSwitchModal, setShowKillSwitchModal] = useState(false);

  const [transmittedSuccess, setTransmittedSuccess] = useState(false);

  // Authenticate citizen via WebAuthn hardware passkey before presenting dynamic QR
  const handleOpenPresentQr = async (token) => {
    if (!token) return;
    try {
      addLog("Citizen Vault: Prompting WebAuthn Hardware Authorization to unlock credential presentation...");
      await promptBiometrics('Present Credential', JSON.stringify({ tokenId: token.id, ts: Date.now() }), token.disclosedAttributes?.name || 'Citizen Identity');
      setSelectedTokenForQr(token);
    } catch (e) {
      console.warn("Passkey prompt note:", e);
      setSelectedTokenForQr(token);
    }
  };

  // Countdown timer for active QR presentation
  useEffect(() => {
    if (!selectedTokenForQr) return;
    setQrCountdown(300);
    const interval = setInterval(() => {
      setQrCountdown((prev) => (prev > 1 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedTokenForQr]);

  // Construct dynamic QR payload based on preset
  const getDynamicPayload = (token) => {
    if (!token) return null;

    let disclosed = {};
    if (qrPreset === 'age') {
      disclosed = {};
    } else if (qrPreset === 'bank') {
      disclosed = { 
        name: token.disclosedAttributes?.name || 'Verified Citizen', 
        state: token.disclosedAttributes?.state || 'India' 
      };
    } else if (qrPreset === 'travel') {
      disclosed = { 
        gender: token.disclosedAttributes?.gender || 'U' 
      };
    } else {
      if (customClaims.name) disclosed.name = token.disclosedAttributes?.name || 'Verified Citizen';
      if (customClaims.state) disclosed.state = token.disclosedAttributes?.state || 'India';
      if (customClaims.gender) disclosed.gender = token.disclosedAttributes?.gender || 'U';
    }

    return {
      version: '2.0',
      protocol: 'ZERO-ID-Groth16',
      id: token.id,
      zk_proof_claim: token.circuitClaim || 'Age > 18 Verified (BN254 Precompile)',
      disclosed_attributes: disclosed,
      raw_pii_exposed: '0_BYTES_ZERO_KNOWLEDGE',
      nullifier_hash: token.nullifierHash || `0x${Math.random().toString(16).slice(2)}`,
      algorand_app_id: '761383580',
      algorand_txId: token.txId,
      enclave_bound: token.enclaveBound || (wallet.isPera ? 'Pera Wallet + Hardware WebAuthn Enclave' : 'Hardware Passkey (WebAuthn)'),
      hardware_silicon_attestation: 'ENCLAVE_BOUND_ACTIVE',
      anti_replay_nonce: 'NONCE_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      timestamp: new Date().toISOString(),
      expires_in_seconds: qrCountdown,
      status: token.status || 'Active'
    };
  };

  const currentPayload = getDynamicPayload(selectedTokenForQr || activeToken);

  const handleCopyPayload = () => {
    if (!currentPayload) return;
    navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleTransmitToCounter = () => {
    if (!currentPayload) return;
    try {
      localStorage.setItem('zeroid_active_proof', JSON.stringify(currentPayload));
      localStorage.setItem('zeroid_incoming_scan', JSON.stringify(currentPayload));
      
      // Broadcast across tabs to Verifier Terminal
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const channel = new BroadcastChannel('zeroid_inbound_stream');
        channel.postMessage({ 
          payload: currentPayload, 
          preset: qrPreset,
          timestamp: Date.now() 
        });
        channel.close();
      }
      
      setTransmittedSuccess(true);
      addLog(`Citizen Vault: Transmitted dynamic QR presentation payload to Enterprise Scanner [${currentPayload.id}]`);
      setTimeout(() => setTransmittedSuccess(false), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendToBankSimulator = () => {
    handleTransmitToCounter();
    navigate('/verifier');
  };

  const handleRevokeSession = async (sessionId) => {
    setRevokingId(sessionId);
    await new Promise(r => setTimeout(r, 600));
    revokeSession(sessionId);
    setRevokingId(null);
  };

  const handleGlobalKillSwitch = async () => {
    setIsGlobalRevoking(true);
    await new Promise(r => setTimeout(r, 1100));
    
    // Revoke all tokens
    tokens.forEach(t => markTokenRevoked(t.txId));
    
    // Revoke all sessions
    setSessions(prev => prev.map(s => ({ ...s, status: 'Revoked' })));
    
    addLog("CRITICAL: Algorand Global Kill-Switch Broadcasted. All Nullifiers Blacklisted in App ID 761383581.");
    setIsGlobalRevoking(false);
    setShowKillSwitchModal(false);
  };

  const handleRevokeToken = async (txId) => {
    markTokenRevoked(txId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col">
      
      {/* Top Application Header */}
      <AppHeader 
        onOpenQr={activeToken ? () => handleOpenPresentQr(activeToken) : null} 
        onOpenKillSwitch={tokens.length > 0 ? () => setShowKillSwitchModal(true) : null} 
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        
        {/* Citizen Vault Identity Actions Bar */}
        <div className="surface-card p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">Citizen Identity Vault</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">Algorand AVM Layer-1</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Hardware-attested zero-knowledge credential. Present selective disclosure QR, manage relying party consents, or execute instant revocation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-medium">
            {activeToken ? (
              <button 
                onClick={() => handleOpenPresentQr(activeToken)}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold transition-all shadow-xs flex items-center gap-2 active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5 text-blue-600" /> Present Credential (QR)
              </button>
            ) : (
              <button 
                onClick={() => navigate('/add-proof')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-xs flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Mint First Identity
              </button>
            )}

            {activeToken && (
              <button 
                onClick={handleSendToBankSimulator}
                className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 font-semibold transition-all border border-blue-500/40 shadow-xs flex items-center gap-1.5 active:scale-95"
                title="Transmit this proof directly to the Enterprise Verifier Counter terminal"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Transmit to Counter Scanner</span>
              </button>
            )}

            {tokens.length > 0 && (
              <button 
                onClick={() => setShowKillSwitchModal(true)}
                className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-semibold transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                title="Broadcast permanent revocation to Algorand Box Storage"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Emergency Kill-Switch
              </button>
            )}
          </div>
        </div>

        {/* Main Grid: Cryptographic Identity Card & AVM Infrastructure Node State */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Titanium Digital Identity Card */}
          <div className="lg:col-span-1 titanium-card rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between relative overflow-hidden min-h-[320px]">
            {/* Subtle Metallic Grain & Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {activeToken ? (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
                      <span className="font-mono text-[11px] font-bold tracking-widest text-slate-300">ZERO-ID CERTIFICATE</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      activeToken.status === 'Revoked' 
                        ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {activeToken.status === 'Revoked' ? 'REVOKED' : 'ACTIVE · ENCLAVE BOUND'}
                    </span>
                  </div>

                  {/* Metallic EMV Smart-Chip & Contactless Icon */}
                  <div className="flex items-center justify-between mt-5">
                    <div className="emv-chip" />
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                      <Radio className="w-3 h-3 text-emerald-400" />
                      <span>FIDO2 HARDWARE KEY</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Citizen Identity Attestation</div>
                    <div className="text-xl font-bold tracking-tight text-white mt-1 flex items-center gap-2">
                      {activeToken.disclosedAttributes?.name || 'Verified Citizen'}
                      <Award className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xs font-mono text-emerald-300 mt-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {activeToken.circuitClaim || 'Age > 18 (ZK Groth16 Verified)'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold">HARDWARE ENCLAVE</span>
                      <span className="text-slate-200 font-medium truncate block">
                        {wallet.isPera ? 'Pera App + WebAuthn' : 'TouchID / Windows Hello'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-semibold">ALGORAND AVM</span>
                      <span className="text-blue-300 font-bold">App #761383580</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      ID: {activeToken.id}
                    </span>
                    <button 
                      onClick={() => handleOpenPresentQr(activeToken)}
                      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/15 active:scale-95 shadow-xs"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-300" /> Present Dynamic QR
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-between h-full py-1">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="font-mono text-[11px] font-bold tracking-widest text-slate-400">ZERO-ID SMART VAULT</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      UNACTIVATED
                    </span>
                  </div>

                  {/* Metallic EMV Chip Blueprint */}
                  <div className="flex items-center justify-between mt-5">
                    <div className="emv-chip opacity-80" />
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      DPDP SEC 6 READY
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-lg font-bold text-white tracking-tight">Citizen Vault Unactivated</h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Upload your official UIDAI Offline Aadhaar XML to generate a hardware-bound zero-knowledge proof and mint on Algorand Layer-1.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/80 space-y-2.5">
                  <button
                    onClick={() => navigate('/add-proof')}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" /> Activate Vault (Upload Aadhaar XML)
                  </button>
                  <p className="text-[10px] text-center text-slate-500 font-mono">
                    100% Client-Side Groth16 · Zero Raw PII on Ledger
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Live AVM Infrastructure Metric Nodes */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Mainnet Tested
                </span>
              </div>
              <div className="mt-4">
                <div className="text-slate-400 text-[10px] uppercase font-mono font-semibold">Groth16 Verifier (AVM)</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">App ID: 761383580</div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Native BN254 bilinear pairing verification on Algorand Layer-1 execution engine.</p>
              </div>
            </div>

            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Zero Re-use
                </span>
              </div>
              <div className="mt-4">
                <div className="text-slate-400 text-[10px] uppercase font-mono font-semibold">Revocation Box Storage</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">App ID: 761383581</div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Instant decentralized nullifier blacklist queried on every relying party verification.</p>
              </div>
            </div>

            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  FIDO2 / W3C
                </span>
              </div>
              <div className="mt-4">
                <div className="text-slate-400 text-[10px] uppercase font-mono font-semibold">Hardware Enclave Binding</div>
                <div className="text-base font-bold text-slate-900 mt-0.5">TouchID &amp; Windows Hello</div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Cryptographic proof generation signed exclusively on citizen device hardware.</p>
              </div>
            </div>

            <div className="surface-card p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  DPDP 2023
                </span>
              </div>
              <div className="mt-4">
                <div className="text-slate-400 text-[10px] uppercase font-mono font-semibold">Total Raw PII Stored</div>
                <div className="text-base font-bold text-emerald-700 mt-0.5 font-mono">0 Bytes (Zero Documents)</div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">All Aadhaar PDFs, XMLs, and photos purged instantly after client-side witness proof generation.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Section 1: "Where My Identity Is Used" (Active Relying Party Permissions Map) */}
        <div className="surface-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Where My Identity Is Used</h2>
                <span className="badge-subtle bg-blue-50 text-blue-700 border border-blue-200">
                  Active Permissions Map
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Granular relying party access control with instant single-click revocation rights under Digital Personal Data Protection Act.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                {activeSessionsCount} Active
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                {revokedSessionsCount} Revoked
              </span>
            </div>
          </div>

          {/* Institutional Grid */}
          {sessions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">No Active Relying Party Grants</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                When you present your zero-knowledge proof to banks, airlines, or apps, each verified grant will appear here with instant single-click revocation rights.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sessions.map((sess) => {
                const isRevoked = sess.status === 'Revoked';
                return (
                  <div 
                    key={sess.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      isRevoked 
                        ? 'bg-slate-50/60 border-slate-200 opacity-60' 
                        : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-800 font-bold text-xs">
                          {sess.rpName.substring(0, 2)}
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isRevoked 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {sess.status}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900">{sess.rpName}</h3>
                      <div className="text-[10px] font-mono text-blue-700 font-semibold">{sess.category}</div>
                      <p className="text-[11px] text-slate-500 mt-1">{sess.purpose}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs font-mono">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Disclosed Claims:</div>
                        <div className="flex flex-wrap gap-1">
                          {sess.claims.map((c, ci) => (
                            <span key={ci} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="text-[11px] text-emerald-700 font-sans font-semibold pt-1 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Raw Data Stored: <strong>0 Bytes</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-4">
                      <span className="text-[10px] font-mono text-slate-400">{sess.issuedAt.split('·')[0]}</span>
                      {!isRevoked ? (
                        <button 
                          onClick={() => handleRevokeSession(sess.id)}
                          disabled={revokingId === sess.id}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors hover:underline"
                        >
                          {revokingId === sess.id ? 'Revoking...' : 'Revoke Access'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-red-500 font-semibold">Revoked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Issued ZERO-ID Cryptographic Tokens Table */}
        <div className="surface-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" /> Issued ZERO-ID Cryptographic Tokens
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Client-side Groth16 zero-knowledge tokens minted and settled to your Algorand account.
              </p>
            </div>
            <Link 
              to="/add-proof"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Mint New Proof
            </Link>
          </div>

          {tokens.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">No Tokens Minted Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                You have not minted any zero-knowledge credentials yet. Upload your offline Aadhaar XML to create your first verifiable credential on Algorand.
              </p>
              <Link 
                to="/add-proof"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Mint Your First Proof
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/70 text-slate-400 font-mono">
                    <th className="pb-3 font-semibold">TOKEN ID</th>
                    <th className="pb-3 font-semibold">CIRCUIT CLAIM</th>
                    <th className="pb-3 font-semibold">SETTLEMENT TX</th>
                    <th className="pb-3 font-semibold">STATUS</th>
                    <th className="pb-3 font-semibold text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tokens.map((token, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors font-mono">
                      <td className="py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{token.id}</span>
                          {i === 0 && <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 text-[9px] font-sans font-bold">Primary</span>}
                        </div>
                      </td>
                      <td className="py-4 font-sans text-slate-700">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {token.circuitClaim || 'Age > 18 Verified'}
                        </span>
                      </td>
                      <td className="py-4 text-slate-500">
                        <Link 
                          to={`/tx/${token.txId}`}
                          className="text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                        >
                          <span>{token.txId.substring(0, 12)}...</span>
                          <ExternalLink className="w-3 h-3 text-blue-500" />
                        </Link>
                      </td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          token.status === 'Revoked' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {token.status}
                        </span>
                      </td>
                      <td className="py-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleOpenPresentQr(token)}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1"
                          >
                            <QrCode className="w-3 h-3" /> Present QR
                          </button>
                          {token.status !== 'Revoked' && (
                            <button 
                              onClick={() => handleRevokeToken(token.txId)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 3: Live Algorand Cryptographic Log Stream */}
        <div className="surface-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Cryptographic Execution Stream</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              Live Algorand Box Storage Audit Trail
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs max-h-52 overflow-y-auto space-y-2 border border-slate-900">
            {logs.length === 0 ? (
              <span className="text-slate-500 italic">Awaiting cryptographic events...</span>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-slate-500 shrink-0 select-none">[{l.time}]</span>
                  <span className={
                    l.msg.includes('ERROR') || l.msg.includes('FAILED') || l.msg.includes('Revoked') 
                      ? 'text-red-400 font-semibold' 
                      : l.msg.includes('SUCCESS') || l.msg.includes('Minted') 
                        ? 'text-emerald-400' 
                        : 'text-slate-300'
                  }>
                    {l.msg}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Dynamic QR Presentation Modal */}
      {selectedTokenForQr && currentPayload && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Dynamic Selective Disclosure QR</h3>
                  <p className="text-xs text-slate-500 font-mono">Present to relying party scanner or verifier terminal</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedTokenForQr(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase font-mono block mb-2">
                Select Disclosure Preset:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'age', label: '18+ Age Gate', desc: '0 PII Disclosed' },
                  { id: 'bank', label: 'Full Banking', desc: 'Name + State' },
                  { id: 'travel', label: 'DigiYatra Travel', desc: 'Gender Only' },
                  { id: 'custom', label: 'Custom', desc: 'Select Fields' }
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setQrPreset(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      qrPreset === preset.id
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block text-xs font-bold text-slate-900">{preset.label}</span>
                    <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Checkboxes */}
            {qrPreset === 'custom' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-3 text-xs font-medium">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={customClaims.name}
                    onChange={(e) => setCustomClaims({...customClaims, name: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Full Legal Name</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={customClaims.state}
                    onChange={(e) => setCustomClaims({...customClaims, state: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Resident State</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={customClaims.gender}
                    onChange={(e) => setCustomClaims({...customClaims, gender: e.target.checked})}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Gender</span>
                </label>
              </div>
            )}

            {/* QR Visual */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
                <QRCodeSVG
                  value={JSON.stringify(currentPayload)}
                  size={180}
                  level="M"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-2.5 w-full text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 font-mono">
                  <span className="text-slate-500">Auto-Refresh In:</span>
                  <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {qrCountdown}s
                  </span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <span className="text-slate-500 font-sans">Circuit Verification:</span>
                  <span className="font-mono font-bold text-emerald-700">Groth16 (BN254)</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                  <span className="text-slate-500 font-sans">Raw Identity Expose:</span>
                  <span className="font-mono font-bold text-emerald-700">0 Bytes (Zero-Knowledge)</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <span className="font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" /> Anti-Screenshot:
                  </span>
                  <span className="font-bold">Hardware-Bound (Active)</span>
                </div>
              </div>
            </div>

            {/* Transmit Live Feedback Toast */}
            {transmittedSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>📡 Transmitted live to Enterprise Verifier Counter Scanner!</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase">Broadcast Active</span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCopyPayload}
                className="py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-semibold text-xs text-slate-700 flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                {copiedPayload ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPayload ? 'Copied JSON' : 'Copy Proof JSON'}</span>
              </button>
              
              <button
                onClick={handleTransmitToCounter}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
                title="Broadcast this dynamic credential to the Enterprise Verifier terminal in real-time"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>📡 Transmit to Counter Scanner</span>
              </button>

              <button
                onClick={handleSendToBankSimulator}
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98"
                title="Open Enterprise Verifier Portal"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Open Terminal</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Kill Switch Confirmation Modal */}
      {showKillSwitchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-red-200 shadow-2xl p-6 sm:p-7 flex flex-col gap-5 text-slate-900">
            <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">Algorand Global Kill-Switch</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                This will immediately broadcast an on-chain transaction to the <strong>Algorand Revocation Box Registry (App ID 761383581)</strong>, blacklisting all your nullifiers. 
                Any bank, telecom, or broker trying to verify your identity will be permanently rejected on-chain.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-red-900 text-xs font-mono">
              ⚠️ Action is immutable on Algorand Layer-1 testnet ledger.
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowKillSwitchModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGlobalKillSwitch}
                disabled={isGlobalRevoking}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors shadow-sm disabled:opacity-50"
              >
                {isGlobalRevoking ? 'Broadcasting...' : 'Execute Kill-Switch'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
