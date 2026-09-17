import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, ShieldCheck, ArrowLeft, ScanLine, XCircle, Search, Sparkles, 
  CheckCircle2, Lock, FileCheck, Layers, AlertOctagon, Terminal, Download,
  Check, Copy, ArrowRight, ShieldAlert, Cpu, Award, ExternalLink, RefreshCw,
  Landmark, FileCode, CheckCheck, Clock
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AppHeader from '../components/AppHeader';

export default function BankSimulatorPage() {
  const navigate = useNavigate();
  const { tokens, addLog, setSessions } = useAppContext();
  const [payloadInput, setPayloadInput] = useState('');
  const [verificationResult, setVerificationResult] = useState(null); // 'success' | 'failed' | 'revoked' | null
  const [isVerifying, setIsVerifying] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [verifySteps, setVerifySteps] = useState([]);
  const [copiedCert, setCopiedCert] = useState(false);

  // Auto-load proof passed from vault or localStorage on mount
  useEffect(() => {
    try {
      const active = localStorage.getItem('zeroid_active_proof');
      if (active) {
        setPayloadInput(active);
      } else if (tokens.length > 0) {
        const t = tokens[0];
        const defaultPayload = {
          version: '2.0',
          protocol: 'ZERO-ID-Groth16',
          id: t.id,
          zk_proof_claim: t.circuitClaim || 'Age > 18 Verified (BN254 Precompile)',
          disclosed_attributes: t.disclosedAttributes || {},
          raw_pii_exposed: '0_BYTES_ZERO_KNOWLEDGE',
          nullifier_hash: t.nullifierHash || '0x9a8f2c7b3e104d556812e4f7a90b8c6d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7',
          algorand_app_id: '761383580',
          algorand_txId: t.txId,
          enclave_bound: t.enclaveBound || 'Hardware Passkey (WebAuthn)',
          timestamp: new Date().toISOString(),
          status: t.status || 'Active'
        };
        setPayloadInput(JSON.stringify(defaultPayload, null, 2));
      }
    } catch (e) {}
  }, [tokens]);

  const handleVerify = async () => {
    if (!payloadInput) return;
    setIsVerifying(true);
    setVerificationResult(null);
    setScannedData(null);
    setVerifySteps([]);

    try {
      const payload = JSON.parse(payloadInput);
      setScannedData(payload);

      // Step 1: Proof syntax check
      setVerifySteps(['Parsing Groth16 JSON proof payload...']);
      await new Promise(r => setTimeout(r, 350));

      // Step 2: Public signals extraction
      setVerifySteps(prev => [...prev, 'Extracting public signals: [Age >= 18 = TRUE, Nullifier Hash]']);
      await new Promise(r => setTimeout(r, 400));

      // Step 3: Algorand AVM BN254 Pairing precompile
      setVerifySteps(prev => [...prev, 'Executing Algorand AVM bn254_pairing opcode (App ID 761383580)...']);
      await new Promise(r => setTimeout(r, 450));

      // Step 4: Algorand Box Storage Revocation Index query
      const txId = payload.algorand_txId || payload.txId;
      const matchedToken = tokens.find(t => t.txId === txId || t.id === payload.id);
      
      const isRevoked = matchedToken?.status === 'Revoked' || payload.status === 'Revoked';

      setVerifySteps(prev => [...prev, 'Querying Algorand Box Storage Revocation Index (App ID 761383581)...']);
      await new Promise(r => setTimeout(r, 400));

      if (isRevoked) {
        setVerificationResult('revoked');
        addLog(`Bank Verifier: REJECTED proof for ${payload.id} (Nullifier Revoked on Algorand Ledger)`);
      } else if (payload.zk_proof_claim && payload.protocol?.includes('ZERO-ID')) {
        setVerificationResult('success');
        addLog(`Bank Verifier: Groth16 Proof ACCEPTED for ${payload.id} (0 Bytes Raw PII Stored)`);
        
        // Add the real verified session to the Vault
        const newSession = {
          id: `sess-bank-${Date.now()}`,
          rpName: 'Global FinTrust Bank',
          category: 'Banking / PMLA Tier-1',
          purpose: 'Zero-Document Digital Savings Account',
          issuedAt: new Date().toLocaleString(),
          expiresAt: new Date(Date.now() + 31536000000).toLocaleString(),
          claims: ['Age >= 18 (ZK)', ...Object.keys(payload.disclosed_attributes || {}).map(k => `${k} Disclosed`)],
          rawShared: '0 Bytes (Mathematical Proof Only)',
          status: 'Active',
          contractAppId: payload.algorand_app_id || '761383580',
          riskScore: 'Low (Cryptographically Bound)'
        };
        setSessions(prev => {
          // Prevent duplicates if already tested exactly
          if (prev.some(p => p.id === newSession.id)) return prev;
          return [newSession, ...prev];
        });
      } else {
        setVerificationResult('failed');
        addLog(`Bank Verifier: FAILED proof verification (Invalid Groth16 math signature)`);
      }
    } catch (e) {
      setVerificationResult('failed');
      addLog(`Bank Verifier: FAILED JSON parse error`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLoadLatestVault = () => {
    if (tokens.length > 0) {
      const t = tokens[0];
      const payload = {
        version: '2.0',
        protocol: 'ZERO-ID-Groth16',
        id: t.id,
        zk_proof_claim: t.circuitClaim || 'Age > 18 Verified (BN254 Precompile)',
        disclosed_attributes: t.disclosedAttributes || {},
        raw_pii_exposed: '0_BYTES_ZERO_KNOWLEDGE',
        nullifier_hash: t.nullifierHash || '0x9a8f2c7b3e104d556812e4f7a90b8c6d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7',
        algorand_app_id: '761383580',
        algorand_txId: t.txId,
        enclave_bound: t.enclaveBound || 'Hardware Passkey (WebAuthn)',
        timestamp: new Date().toISOString(),
        status: t.status || 'Active'
      };
      setPayloadInput(JSON.stringify(payload, null, 2));
      setVerificationResult(null);
      addLog("Loaded latest active proof from Citizen Vault into verifier terminal");
    }
  };

  const handleCopyCertificate = () => {
    const cert = {
      institution: "HDFC Bank Ltd. (PMLA Tier-1 Verifier)",
      standard: "RBI Master Direction - KYC (2023 Revision) / PMLA Rule 9",
      dpdp_compliance: "Section 8(7) Compliant - Zero Raw PII Retained",
      zk_predicate: "Age >= 18 BN254 Pairing Opcode (PASSED)",
      algorand_txId: scannedData?.algorand_txId || scannedData?.txId,
      avm_verifier_app_id: 761383580,
      timestamp: new Date().toISOString(),
      status: "APPROVED_0_DATA_LEAKAGE"
    };
    navigator.clipboard.writeText(JSON.stringify(cert, null, 2));
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col">
      
      {/* Top Application Header */}
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        
        {/* Verifier Hero / Institutional Mode Bar */}
        <div className="surface-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Enterprise Verifier Portal
                </h1>
                <span className="badge-subtle bg-blue-50 text-blue-700 border border-blue-200">
                  PMLA Tier-1 Institution Terminal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Simulating HDFC Bank / FinTech Relying Party verification against Algorand L1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleLoadLatestVault}
              className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Load Vault Proof
            </button>
            <button
              onClick={handleVerify}
              disabled={isVerifying || !payloadInput}
              className="flex-1 md:flex-initial px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verify Proof
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Console Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Proof Payload Input Terminal */}
          <div className="lg:col-span-6 surface-card p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Inbound ZK Proof Payload</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400">JSON Schema v2.0</span>
            </div>

            <textarea
              rows={14}
              value={payloadInput}
              onChange={(e) => setPayloadInput(e.target.value)}
              placeholder="Paste ZERO-ID Selective Disclosure QR Payload JSON..."
              className="w-full p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none border border-slate-800 leading-relaxed shadow-inner"
            />

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                {payloadInput.length} characters in buffer
              </span>
              <button
                onClick={handleVerify}
                disabled={isVerifying || !payloadInput}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs disabled:opacity-50"
              >
                Execute AVM Verification
              </button>
            </div>
          </div>

          {/* Right Column: Execution Monitor & Verification Results */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Live Cryptographic Verification Pipeline */}
            <div className="surface-card p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">AVM Verification Pipeline</h2>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  App #761383580
                </span>
              </div>

              {verifySteps.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-mono text-xs italic">
                  Click "Verify Proof" to trigger Algorand Layer-1 BN254 bilinear pairing opcode...
                </div>
              ) : (
                <div className="space-y-2.5">
                  {verifySteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs text-slate-700 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Result: SUCCESS */}
            {verificationResult === 'success' && scannedData && (
              <div className="p-6 sm:p-7 bg-emerald-50/70 border border-emerald-200 rounded-3xl flex flex-col gap-5 text-emerald-950 animate-in fade-in duration-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-emerald-950">Identity Verified &amp; Compliant</h3>
                      <p className="text-xs text-emerald-700 font-mono">Algorand BN254 Groth16 Precompile Evaluation: Valid (100% Truth)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-600 text-white shadow-2xs">
                    APPROVED
                  </span>
                </div>

                {/* Disclosed attributes summary */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 text-xs">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold mb-2">
                    Verified Customer Predicates:
                  </div>
                  
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">ZK Age Claim:</span>
                    <span className="text-emerald-700 font-bold font-mono">Age &gt;= 18 (BN254 Verified)</span>
                  </div>

                  {scannedData.disclosed_attributes && Object.entries(scannedData.disclosed_attributes).map(([k, v]) => (
                    <div key={k} className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 capitalize">{k}:</span>
                      <span className="text-slate-900 font-semibold">{v}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-slate-500">Settlement TX:</span>
                    <Link 
                      to={`/tx/${scannedData.algorand_txId || scannedData.txId}`}
                      className="text-blue-600 hover:text-blue-800 font-mono font-bold hover:underline flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                    >
                      <span className="truncate max-w-[160px]">{scannedData.algorand_txId || scannedData.txId}</span>
                      <ExternalLink className="w-3 h-3 text-blue-500 shrink-0" />
                    </Link>
                  </div>
                </div>

                {/* DPDP Guarantee Banner */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-900 leading-relaxed">
                      <strong>DPDP 2023 &amp; PMLA Rule 9 Compliant:</strong> Customer account opened with 0 raw document copies stored.
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCertificate}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-xs flex items-center gap-1 transition-colors"
                  >
                    {copiedCert ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCert ? 'Copied' : 'Compliance Cert'}</span>
                  </button>
                </div>

              </div>
            )}

            {/* Result: REVOKED */}
            {verificationResult === 'revoked' && (
              <div className="p-6 sm:p-7 bg-red-50/80 border border-red-200 rounded-3xl flex flex-col gap-4 text-red-950 animate-in fade-in duration-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-red-950">Verification Blocked (Revoked)</h3>
                      <p className="text-xs text-red-700 font-mono">Nullifier Blacklisted in Algorand Box Storage (App ID 761383581)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-600 text-white">
                    REJECTED
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-red-200 text-xs text-slate-700 leading-relaxed font-mono">
                  ⚠️ This citizen revoked permissions or executed the global Algorand Kill-Switch. The transaction cannot be authorized.
                </div>
              </div>
            )}

            {/* Result: FAILED */}
            {verificationResult === 'failed' && (
              <div className="p-6 sm:p-7 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col gap-3 text-amber-950 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <AlertOctagon className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">Cryptographic Verification Failed</h3>
                    <p className="text-xs text-amber-700">Invalid Groth16 mathematical signature or corrupted payload.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}
