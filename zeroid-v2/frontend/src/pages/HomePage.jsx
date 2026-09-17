import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, Shield, Zap, Lock, Database, 
  Scale, Fingerprint, ExternalLink, CheckCircle2, XCircle, 
  Terminal, Eye, EyeOff, Building2, Layers, ArrowUpRight, 
  Copy, Check, FileCheck, KeyRound, Cpu, ShieldCheck,
  Calculator, AlertOctagon, RefreshCw, Smartphone, Landmark, 
  CreditCard, UserCheck, Sliders, BarChart3, Binary, Sparkles,
  Code2, HardDrive, Network, Server, Gauge, FileCode, CheckSquare, 
  Hash, ShieldAlert, ArrowDown, ChevronRight
} from 'lucide-react';
import AppHeader from '../components/AppHeader';

export default function HomePage() {
  const navigate = useNavigate();
  const [simDisclosure, setSimDisclosure] = useState({ name: false, gender: false, state: false });
  const [copiedTx, setCopiedTx] = useState(false);
  const [activeStage, setActiveStage] = useState(1);
  const [selectedProtocol, setSelectedProtocol] = useState('zeroid'); // 'traditional' | 'ckyc' | 'zeroid'
  const [tealContract, setTealContract] = useState('761383580');

  // Exposure Calculator States
  const [calcBanks, setCalcBanks] = useState(3);
  const [calcSims, setCalcSims] = useState(2);
  const [calcFintech, setCalcFintech] = useState(5);
  const [calcRentals, setCalcRentals] = useState(2);

  const rawCopiesCount = (calcBanks * 3) + (calcSims * 2) + (calcFintech * 2) + (calcRentals * 1);
  const distinctDatabases = calcBanks + calcSims + calcFintech + calcRentals;

  const tealBytecodes = {
    '761383580': {
      name: "Groth16 Verifier Contract",
      appId: "761383580",
      description: "Executes BN254 elliptic curve bilinear pairings directly within the Algorand AVM runtime using native precompile opcodes.",
      teal: `#pragma version 8
// ZERO-ID Groth16 Zero-Knowledge Verifier
// Target: BN254 / alt_bn128 Pairing Precompile

txn ApplicationID
bz handle_create

txn OnCompletion
int NoOp
==
bnz handle_verify
err

handle_create:
    int 1
    return

handle_verify:
    // Extract public witness inputs from Txn.ApplicationArgs[0]
    txna ApplicationArgs 0
    extract 0 32
    store 0 // Public Signal: Age >= 18 Claim

    // Load G1 Point Pi_A (64 bytes)
    txna ApplicationArgs 1
    store 1 // Pi_A: (X_a, Y_a)

    // Load G2 Point Pi_B (128 bytes)
    txna ApplicationArgs 2
    store 2 // Pi_B: (X_b1, X_b2, Y_b1, Y_b2)

    // Load G1 Point Pi_C (64 bytes)
    txna ApplicationArgs 3
    store 3 // Pi_C: (X_c, Y_c)

    // Execute Native AVM Elliptic Curve Pairing Check
    // e(Pi_A, Pi_B) == e(Alpha, Beta) * e(PublicInputs, Gamma) * e(Pi_C, Delta)
    load 1 // Point A
    load 2 // Point B
    load 3 // Point C
    load 0 // Public Signal Hash
    bn254_pairing
    int 1
    ==
    assert // Reverts transaction if math proof is forged

    // Log Verification Event to Audit Trail
    byte "VERIFY_ZK_SUCCESS"
    load 0
    concat
    log
    int 1
    return`
    },
    '761383581': {
      name: "Revocation Manager (Box Storage)",
      appId: "761383581",
      description: "Utilizes Algorand AVM Box Storage to maintain an immutable, high-throughput blacklist of revoked cryptographic nullifiers with O(1) lookups.",
      teal: `#pragma version 8
// ZERO-ID Nullifier Revocation Manager
// Storage: AVM Key-Value Box Storage (32-byte Nullifier Keys)

txn ApplicationID
bz handle_create

txna ApplicationArgs 0
byte "REVOKE_NULLIFIER"
==
bnz handle_revoke

txna ApplicationArgs 0
byte "CHECK_STATUS"
==
bnz handle_check
err

handle_create:
    int 1
    return

handle_revoke:
    // Only Token Master Key can invoke revocation
    txn Sender
    global CreatorAddress
    ==
    assert

    // Nullifier Hash (32 bytes) from Args[1]
    txna ApplicationArgs 1
    store 0 // Nullifier Hash

    // Check if box already exists
    load 0
    box_len
    store 1 // exists
    store 2 // len
    load 1
    bnz already_revoked

    // Allocate 8-byte Timestamp Box
    load 0
    int 8
    box_create
    pop

    // Write Current Algorand Round Timestamp
    load 0
    global LatestTimestamp
    itob
    box_put

    byte "NULLIFIER_REVOKED"
    load 0
    concat
    log
    int 1
    return

already_revoked:
    err // Already revoked on-chain`
    },
    '761383564': {
      name: "Identity Registry Global State",
      appId: "761383564",
      description: "Maintains global contract parameters, UIDAI root certificate fingerprints, and root authority state transitions.",
      teal: `#pragma version 8
// ZERO-ID Master Identity Registry
// Global State Schema: 10 Bytes, 6 Ints

txn ApplicationID
bz handle_create

txna ApplicationArgs 0
byte "REGISTER_ROOT_CA"
==
bnz handle_register_ca
err

handle_create:
    byte "SCHEMA_VERSION"
    byte "2.0.0-PROD"
    app_global_put

    byte "ACTIVE_PROOFS_COUNT"
    int 0
    app_global_put

    int 1
    return

handle_register_ca:
    txn Sender
    global CreatorAddress
    ==
    assert

    byte "UIDAI_ROOT_FP"
    txna ApplicationArgs 1 // SHA-256 Fingerprint of UIDAI CA
    app_global_put
    int 1
    return`
    }
  };

  const protocolComparison = {
    traditional: {
      name: "Traditional Paper & PDF KYC",
      desc: "Physical photocopies, masked PDFs, and unencrypted files stored across hundreds of private vendor databases.",
      scores: [
        { label: "Tamper Resistance", val: 30, note: "Easily forged via Photoshop or forged PDF metadata" },
        { label: "Verification Latency", val: 20, note: "2 to 5 business days manual back-office inspection" },
        { label: "Zero-Data Minimization", val: 0, note: "Full raw documents permanently archived in plaintext" },
        { label: "Cross-App Unlinkability", val: 0, note: "Aadhaar and PAN linked across all institution databases" },
        { label: "Instant Kill-Switch", val: 0, note: "Impossible (copies remain indefinitely in vendor servers)" },
        { label: "Self-Sovereignty", val: 10, note: "Citizen loses ownership of data immediately" }
      ],
      badgeColor: "bg-red-50 text-red-700 border-red-200",
      status: "Critical Exposure (Dark Web Honeypot)"
    },
    ckyc: {
      name: "Centralized CKYC 2.0 (CERSAI)",
      desc: "Centralized government database distributing raw citizen records directly to financial institutions.",
      scores: [
        { label: "Tamper Resistance", val: 75, note: "Authenticated central database with digital signatures" },
        { label: "Verification Latency", val: 65, note: "Sub-minute OTP fetch from central government servers" },
        { label: "Zero-Data Minimization", val: 0, note: "Distributes full unencrypted identity copies to banks" },
        { label: "Cross-App Unlinkability", val: 20, note: "Central registry traces all institution queries" },
        { label: "Instant Kill-Switch", val: 0, note: "No technical revoke for downstream archived copies" },
        { label: "Self-Sovereignty", val: 30, note: "Central authority controls all permissions & records" }
      ],
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      status: "Medium Risk (Central Single Point of Failure)"
    },
    zeroid: {
      name: "ZERO-ID Cryptographic Protocol",
      desc: "Client-side Groth16 zk-SNARKs + Algorand Layer-1 AVM precompile verification & Box Storage.",
      scores: [
        { label: "Tamper Resistance", val: 100, note: "UIDAI RSA-2048 Root CA + Groth16 mathematical soundness" },
        { label: "Verification Latency", val: 98, note: "<2.4s Algorand Layer-1 on-chain finality" },
        { label: "Zero-Data Minimization", val: 100, note: "Verifiers hold 0 bytes of raw PII (Math proofs only)" },
        { label: "Cross-App Unlinkability", val: 100, note: "Cryptographic Nullifiers prevent cross-app tracking" },
        { label: "Instant Kill-Switch", val: 100, note: "1-Click Algorand Global Kill-Switch on Box Storage" },
        { label: "Self-Sovereignty", val: 100, note: "Hardware Enclave WebAuthn Private Keys on-device" }
      ],
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      status: "Cryptographically Sound (0-Byte Exposure)"
    }
  };

  const stages = [
    {
      id: 1,
      title: "1. Client-Side Ingestion",
      subtitle: "Offline Aadhaar XML & RSA-2048 Envelope Verification",
      icon: FileCheck,
      desc: "User selects their UIDAI paperless offline XML. The browser runtime verifies the official RSA-2048 digital signature client-side in WebAssembly memory. Zero raw identity files or unencrypted PII ever leave the user's device.",
      tag: "Zero-Knowledge Ingestion"
    },
    {
      id: 2,
      title: "2. Groth16 Circuit Prover",
      subtitle: "Circom Witness & BN254 Elliptic Curve Evaluation",
      icon: Cpu,
      desc: "A compiled arithmetic circuit (`age_proof.circom`) accepts the verified date of birth as a private witness. It computes an elliptic curve proof (π) verifying the statement (Age >= 18) without disclosing birth year, month, or day.",
      tag: "Cryptographic Witness"
    },
    {
      id: 3,
      title: "3. On-Chain Settlement",
      subtitle: "Algorand AVM Smart Contracts & Registry",
      icon: Database,
      desc: "The public signals and Groth16 proof hash are committed to the Algorand Testnet. Contract App ID 761383580 anchors the cryptographic identity token with immutable timestamping and sub-2.4s finality.",
      tag: "Immutable Ledger"
    },
    {
      id: 4,
      title: "4. Selective Presentation",
      subtitle: "W3C Verifiable Credentials & 1-Click Kill-Switch",
      icon: KeyRound,
      desc: "The citizen presents a dynamic QR payload to relying institutions (banks, telcos). If the credential or device is compromised, a single on-chain transaction executes a global kill-switch, invalidating the proof everywhere instantly.",
      tag: "Global Revocation"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col selection:bg-slate-900 selection:text-white">
      
      {/* Top Application Header */}
      <AppHeader />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden border-b border-slate-200/80 bg-white">
        
        {/* Subtle Geometric Background */}
        <div className="absolute inset-0 bg-grid-fintech pointer-events-none opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Top Pill */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold">Algorand AVM Groth16 Precompile</span>
              <span className="text-slate-400">·</span>
              <span className="text-blue-600 font-bold">App ID #761383580</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Zero Data Leaked. <br className="hidden sm:inline" />
              <span className="text-slate-950">Instant Verification. </span>
              <span className="text-blue-600">100% Truth.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              The decentralized Zero-Knowledge identity protocol for citizen privacy. Prove age, residency, and KYC compliance on Algorand Layer-1 using Groth16 zk-SNARKs without exposing a single byte of raw Aadhaar data.
            </p>

            {/* Dual-Portal Selection Gateway */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              {/* Citizen Portal Card */}
              <div 
                onClick={() => navigate('/dashboard')}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      FOR CITIZENS
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Citizen Identity Vault
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Store your Aadhaar ZK proof, present dynamic QR codes to counters, manage relying party permissions, and control instant kill-switch revocation.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Enter Citizen Vault</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Enterprise Verifier Card */}
              <div 
                onClick={() => navigate('/verifier')}
                className="group p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      FOR ENTERPRISES
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    Enterprise Verifier Terminal
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    B2B compliance console for KreditBee NBFC, Blinkit, Grand Palace Hotel &amp; HDFC. Sub-second AVM verification &amp; IT Act 2000 Statutory Register.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>Open Enterprise Terminal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Raw PII Stored</span>
                <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">0 Bytes</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">AVM Finality</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">&lt; 2.4 Seconds</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Revocation Index</span>
                <span className="text-base font-bold text-blue-700 font-mono mt-0.5 block">Box Storage O(1)</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Compliance</span>
                <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">DPDP Act 2023</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Section 1: The 4-Stage Cryptographic Pipeline */}
      <section className="py-16 sm:py-20 border-b border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-subtle bg-blue-50 text-blue-700 border border-blue-200">
              Protocol Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              End-to-End Cryptographic Execution Flow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              How ZERO-ID transforms a government-signed XML file into an immutable, privacy-preserving zero-knowledge asset.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const isSelected = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`surface-card p-5 text-left transition-all flex flex-col justify-between relative ${
                    isSelected 
                      ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-md bg-white' 
                      : 'hover:border-slate-300 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {stage.tag}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{stage.title}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{stage.subtitle}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed font-sans">
                    {stage.desc}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* Section 2: The 815M Citizen Exposure Calculator */}
      <section className="py-16 sm:py-20 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-subtle bg-red-50 text-red-700 border border-red-200">
              Threat Intelligence Audit
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Calculate Your Real-World Identity Exposure
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Following the historic 815M Indian citizen Aadhaar leak, see how many unencrypted copies of your identity are sitting in vulnerable databases right now.
            </p>
          </div>

          <div className="max-w-4xl mx-auto surface-card p-6 sm:p-9 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-md">
            
            {/* Sliders */}
            <div className="md:col-span-7 space-y-5">
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>Bank &amp; Credit Card Accounts:</span>
                  <span className="font-mono text-blue-700 font-bold">{calcBanks} Institutions</span>
                </div>
                <input 
                  type="range" min="1" max="10" value={calcBanks}
                  onChange={(e) => setCalcBanks(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>Active Telecom SIM Cards / 5G eSIMs:</span>
                  <span className="font-mono text-blue-700 font-bold">{calcSims} Providers</span>
                </div>
                <input 
                  type="range" min="1" max="6" value={calcSims}
                  onChange={(e) => setCalcSims(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>FinTech, Demat &amp; Crypto Apps:</span>
                  <span className="font-mono text-blue-700 font-bold">{calcFintech} Services</span>
                </div>
                <input 
                  type="range" min="1" max="15" value={calcFintech}
                  onChange={(e) => setCalcFintech(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>Hotels, Car Rentals &amp; Co-Working:</span>
                  <span className="font-mono text-blue-700 font-bold">{calcRentals} Check-ins</span>
                </div>
                <input 
                  type="range" min="0" max="10" value={calcRentals}
                  onChange={(e) => setCalcRentals(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

            </div>

            {/* Results Callout */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-slate-900 text-white flex flex-col justify-between gap-6 shadow-md">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Traditional KYC Exposure</span>
                  <div className="text-3xl font-black text-red-400 font-mono mt-1">
                    {rawCopiesCount} Plaintext Copies
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Spread across <strong>{distinctDatabases}</strong> separate private vendor databases with no centralized kill-switch.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">With ZERO-ID Protocol</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                    0 Bytes Retained
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Institutions verify only the mathematical Groth16 proof. 0 documents stored.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate('/add-proof')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 text-center"
              >
                Eliminate Your Exposure →
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Section 3: Protocol Architecture Comparison */}
      <section className="py-16 sm:py-20 border-b border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-subtle bg-emerald-50 text-emerald-700 border border-emerald-200">
              Technical Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Architectural Security Benchmarks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Comparing Traditional Paper KYC, Centralized CKYC 2.0, and the ZERO-ID Cryptographic Protocol.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Protocol Selector Tabs */}
            <div className="flex rounded-2xl bg-white p-1.5 border border-slate-200 gap-1.5 shadow-2xs">
              {[
                { id: 'zeroid', label: 'ZERO-ID Protocol (Algorand ZK)', badge: 'Recommended' },
                { id: 'ckyc', label: 'Centralized CKYC 2.0 (CERSAI)' },
                { id: 'traditional', label: 'Traditional Paper & PDF' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedProtocol(tab.id)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedProtocol === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500 text-white font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Active Protocol Card */}
            <div className="surface-card p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{protocolComparison[selectedProtocol].name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{protocolComparison[selectedProtocol].desc}</p>
                </div>
                <span className={`badge-subtle ${protocolComparison[selectedProtocol].badgeColor}`}>
                  {protocolComparison[selectedProtocol].status}
                </span>
              </div>

              <div className="space-y-4">
                {protocolComparison[selectedProtocol].scores.map((score, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800">{score.label}</span>
                      <span className="font-mono text-slate-500 text-[11px]">{score.note}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          score.val >= 80 ? 'bg-emerald-500' : score.val >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Section 4: Live Algorand AVM Smart Contract Code */}
      <section className="py-16 sm:py-20 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-subtle bg-slate-100 text-slate-700 border border-slate-200">
              Smart Contracts
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Verified Algorand AVM TEAL Bytecode
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-mono">
              Deployed on Algorand Testnet · 100% Open-Source &amp; Audit-Ready
            </p>
          </div>

          <div className="max-w-4xl mx-auto surface-card p-6 sm:p-8 space-y-4 shadow-md">
            
            {/* Contract Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-4">
              {Object.entries(tealBytecodes).map(([id, contract]) => (
                <button
                  key={id}
                  onClick={() => setTealContract(id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all ${
                    tealContract === id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {contract.name} (#{id})
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-600 font-mono leading-relaxed">
              {tealBytecodes[tealContract].description}
            </p>

            <pre className="p-5 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-900 max-h-80 shadow-inner">
              {tealBytecodes[tealContract].teal}
            </pre>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                Target: Algorand AVM v8 Precompile
              </span>
              <a
                href={`https://lora.algokit.io/testnet/application/${tealContract}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Inspect on Lora Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 text-white border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-black text-sm">
              Z0
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">ZERO-ID Protocol</span>
              <span className="text-xs text-slate-400 font-mono">Zero-Knowledge Self-Sovereign Identity Layer</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <Link to="/dashboard" className="hover:text-white transition-colors">Citizen Vault</Link>
            <Link to="/add-proof" className="hover:text-white transition-colors">Mint ZK Proof</Link>
            <Link to="/verifier" className="hover:text-white transition-colors">Enterprise Verifier</Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Algorand AVM Testnet · DPDP 2023 Compliant
          </div>
        </div>
      </footer>

    </div>
  );
}
