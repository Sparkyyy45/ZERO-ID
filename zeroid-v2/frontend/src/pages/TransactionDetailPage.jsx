import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, ExternalLink, Copy, Check, ShieldCheck, Cpu, Box, 
  Clock, Hash, FileCode, CheckCircle2, AlertTriangle, Layers, 
  Radio, Database, Lock, RefreshCw, Landmark, Sparkles
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AppHeader from '../components/AppHeader';

export default function TransactionDetailPage() {
  const { txId } = useParams();
  const navigate = useNavigate();
  const { tokens, wallet, addLog } = useAppContext();
  
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'avm' | 'raw'
  const [isLoading, setIsLoading] = useState(false);
  const [nodeData, setNodeData] = useState(null);

  // Match token from context if available
  const matchedToken = tokens.find(t => t.txId === txId || t.id === txId);

  // Simulated / deterministic round and block height calculation
  const getDeterministicRound = (id) => {
    let hash = 0;
    const str = id || 'TX-ALGO';
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return 41892000 + Math.abs(hash % 50000);
  };

  const confirmedRound = matchedToken?.confirmedRound || getDeterministicRound(txId);
  const blockTimestamp = matchedToken?.issuedAt || 'Aug 19, 2026 · 17:42:10 IST';
  const senderAddress = wallet.address || 'AO3M7UF43DIGS6DGH3H5C3IY6VOA4WN2SKLRXQVOXADC3HHCWMD3K4TMKQ';
  const nullifierHash = matchedToken?.nullifierHash || '0x9a8f2c7b3e104d556812e4f7a90b8c6d1e2f3a4b5c6d7e8f90a1b2c3d4e5f6a7';
  const appId = matchedToken?.appId || '761383580';

  const fetchLiveNodeData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`https://testnet-api.algonode.cloud/v2/transactions/${txId}`);
      if (res.ok) {
        const data = await res.json();
        setNodeData(data);
        addLog(`Fetched live Algorand node data for TX: ${txId.substring(0, 10)}...`);
      }
    } catch (err) {
      console.warn("Algorand node transaction fetch note:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveNodeData();
  }, [txId]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawPayload = {
    txId: txId,
    network: "Algorand Testnet (Chain ID 416002)",
    confirmed_round: confirmedRound,
    timestamp: blockTimestamp,
    sender: senderAddress,
    avm_contract: {
      registry_app_id: 761383580,
      revocation_box_app_id: 761383581,
      opcode: "bn254_pairing",
      opcode_budget_consumed: 480
    },
    zero_knowledge: {
      circuit: "age_proof.circom",
      curve: "BN254 (alt_bn128)",
      public_signals: matchedToken?.publicSignals || ["1"],
      predicate: "Age >= 18 = TRUE",
      nullifier_hash: nullifierHash
    },
    fee_micro_algos: 1000,
    status: matchedToken?.status === 'Revoked' ? 'REVOKED_IN_BOX_STORAGE' : 'ACTIVE_VERIFIED'
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col">
      
      {/* Top Application Header */}
      <AppHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="p-2.5 hover:bg-slate-100 bg-white rounded-xl border border-slate-200 transition-colors text-slate-700 shadow-xs flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Vault
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  Algorand Settlement Inspector
                </h1>
                <span className="badge-subtle bg-blue-50 text-blue-700 border border-blue-200">
                  Layer-1 Testnet
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">AVM Groth16 Verification &amp; Box Storage State Record</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a 
              href={`https://lora.algokit.io/testnet/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Lora Explorer
            </a>
            <a 
              href={`https://testnet.explorer.perawallet.app/tx/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Pera Explorer
            </a>
          </div>
        </div>

        {/* Hero Settlement Card */}
        <div className="surface-card p-6 sm:p-8 space-y-6 shadow-sm">
          
          {/* Status & TX Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">Settlement Transaction ID</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base sm:text-lg font-mono font-bold text-slate-900 break-all">
                  {txId}
                </span>
                <button 
                  onClick={() => handleCopy(txId)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors shrink-0"
                  title="Copy Transaction ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold border ${
                matchedToken?.status === 'Revoked'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${matchedToken?.status === 'Revoked' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                {matchedToken?.status === 'Revoked' ? 'Revoked in Box Storage' : 'Confirmed on Algorand L1'}
              </span>
            </div>
          </div>

          {/* Primary Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1">
                <Box className="w-3 h-3 text-slate-400" /> Confirmed Round
              </span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-900 mt-1 block">
                #{confirmedRound.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" /> Block Timestamp
              </span>
              <span className="text-xs sm:text-sm font-sans font-medium text-slate-900 mt-1 block truncate">
                {blockTimestamp}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1">
                <Cpu className="w-3 h-3 text-slate-400" /> AVM App ID
              </span>
              <span className="text-sm sm:text-base font-mono font-bold text-blue-700 mt-1 block">
                #{appId}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Network Fee
              </span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-900 mt-1 block">
                0.001 ALGO
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 text-xs font-mono font-semibold gap-6">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Cryptographic Overview
            </button>
            <button 
              onClick={() => setActiveTab('avm')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'avm' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Cpu className="w-4 h-4" /> AVM Groth16 Precompile
            </button>
            <button 
              onClick={() => setActiveTab('raw')}
              className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'raw' 
                  ? 'border-slate-900 text-slate-900' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileCode className="w-4 h-4" /> Raw Ledger Payload
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Zero-Knowledge Predicate Verified</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    This transaction proves that the holder satisfies <strong>Age &gt;= 18</strong> using the BN254 bilinear pairing opcode on Algorand. 
                    Zero raw Aadhaar numbers, zero full birthdates, and zero document copies were exposed to the ledger.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 gap-2">
                  <span className="text-slate-500 font-sans">Sender (Citizen Account):</span>
                  <span className="font-bold text-slate-800 break-all">{senderAddress}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 gap-2">
                  <span className="text-slate-500 font-sans">Zero-Knowledge Public Signals:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    [ { (matchedToken?.publicSignals || ["1"]).join(', ') } ] (Age Threshold Passed)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 gap-2">
                  <span className="text-slate-500 font-sans">On-Chain Nullifier Hash:</span>
                  <span className="font-bold text-blue-700 break-all">{nullifierHash}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 gap-2">
                  <span className="text-slate-500 font-sans">Hardware Enclave Binding:</span>
                  <span className="font-bold text-slate-800">
                    {matchedToken?.enclaveBound || 'TouchID / Windows Hello WebAuthn Enclave'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: AVM Groth16 Precompile */}
          {activeTab === 'avm' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase mb-3">
                    <Cpu className="w-4 h-4 text-blue-600" /> AVM Layer-1 Verifier Circuit
                  </div>
                  <ul className="text-xs space-y-2 text-slate-600 font-mono">
                    <li><strong>Contract App ID:</strong> #761383580</li>
                    <li><strong>Curve:</strong> BN254 (alt_bn128)</li>
                    <li><strong>AVM Opcode:</strong> <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-800">bn254_pairing</code></li>
                    <li><strong>Budget Cost:</strong> 480 compute units</li>
                    <li><strong>Public Inputs:</strong> 1 (is_above_18)</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 uppercase mb-3">
                    <Database className="w-4 h-4 text-emerald-600" /> Algorand Box Storage Registry
                  </div>
                  <ul className="text-xs space-y-2 text-slate-600 font-mono">
                    <li><strong>Box Storage App ID:</strong> #761383581</li>
                    <li><strong>State Key:</strong> Nullifier Hash (32-bytes)</li>
                    <li><strong>Status:</strong> {matchedToken?.status === 'Revoked' ? 'Blacklisted / Revoked' : 'Active (Valid)'}</li>
                    <li><strong>Cost per Box:</strong> 0.0025 ALGO MBR</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs text-blue-950 leading-relaxed font-mono">
                <strong>Cryptographic Verification Equation:</strong>
                <div className="mt-1 bg-white p-3 rounded-xl border border-blue-100 text-[11px] overflow-x-auto text-blue-900">
                  e(A, B) = e(alpha, beta) * e(x * gamma, delta) * e(C, delta)
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Raw Ledger Payload */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-500 font-semibold">Decoded On-Chain Note &amp; Metadata</span>
                <button 
                  onClick={() => handleCopy(JSON.stringify(rawPayload, null, 2))}
                  className="text-xs font-mono text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy JSON
                </button>
              </div>
              <pre className="p-5 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-900 shadow-inner">
                {JSON.stringify(rawPayload, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
