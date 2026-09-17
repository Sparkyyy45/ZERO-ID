import React, { useState } from 'react';
import { 
  Cpu, Shield, Lock, Layers, ArrowRight, CheckCircle2, 
  Terminal, Database, X, Sparkles, Binary, KeyRound, Smartphone 
} from 'lucide-react';

export default function ArchitectureFlowModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  if (!isOpen) return null;

  const pipelineStages = [
    {
      step: 1,
      title: "UIDAI Signed XML Ingestion",
      sub: "Government Source of Truth",
      icon: Lock,
      color: "blue",
      math: "XML-DSig RSA-2048 SHA-256 Digest",
      desc: "Citizen loads official offline paperless e-KYC XML downloaded from UIDAI. The file contains government digital signature over canonical identity elements."
    },
    {
      step: 2,
      title: "Client-Side Cryptographic Validation",
      sub: "Tamper-Proof Verification",
      icon: Shield,
      color: "emerald",
      math: "S^e ≡ H(M) (mod N_UIDAI)",
      desc: "Client-side parser verifies the digital signature against UIDAI's root public key certificate. If even 1 bit of birth year or name was modified, execution halts."
    },
    {
      step: 3,
      title: "Circom zk-SNARK Groth16 Prover",
      sub: "Zero-Knowledge Witness Generation",
      icon: Binary,
      color: "indigo",
      math: "π = (A ∈ G₁, B ∈ G₂, C ∈ G₁) [128 Bytes]",
      desc: "Private birth year and secret salt are fed into Circom R1CS circuit compiled to WebAssembly (snarkjs). Proves calculatedAge ≥ 18 with ZERO raw data disclosure."
    },
    {
      step: 4,
      title: "WebAuthn Secure Enclave Binding",
      sub: "Physical Silicon Coprocessor Lock",
      icon: Cpu,
      color: "amber",
      math: "ECDSA_P256(Nonce, Ephemeral_Challenge)",
      desc: "Proof payload is cryptographically bound to Apple Secure Enclave / Android StrongBox via WebAuthn FIDO2. Forwarded screenshots fail silicon check."
    },
    {
      step: 5,
      title: "Dynamic Presentation QR",
      sub: "Ephemeral 300s TTL Nonce",
      icon: Smartphone,
      color: "purple",
      math: "Payload = { π, Disclosed_Signals, Nonce_300s, Attestation }",
      desc: "Generates a high-density, dynamic QR code refreshing every 300 seconds. Completely self-contained and verifiable in air-gapped environments."
    },
    {
      step: 6,
      title: "Algorand AVM Bilinear Pairing",
      sub: "Layer-1 Native TEAL Bytecode",
      icon: Layers,
      color: "blue",
      math: "e(A, B) == e(α, β) · e(x, γ) · e(C, δ)",
      desc: "Algorand AVM v8 executes native `bn254_pairing` opcode in App #761383580 in 3.4ms for $0.0002 gas fee, eliminating Ethereum's 15s delays."
    },
    {
      step: 7,
      title: "Algorand Box Storage Revocation Index",
      sub: "O(1) Instant Sovereign Kill-Switch",
      icon: Database,
      color: "rose",
      math: "Nullifier = Poseidon(IdentitySecret, DomainSeparator)",
      desc: "Verifier queries Algorand Box Storage for nullifier blacklist. If citizen activated Kill-Switch, Layer-1 immediately returns BLOCKED in sub-4s."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Cryptographic Architecture Flow</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  7-STAGE PIPELINE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Interactive data flow showing how identity moves from UIDAI XML to Algorand Layer-1 AVM verification.
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Visual Stages */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Top Quick Stage Selector */}
          <div className="grid grid-cols-7 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            {pipelineStages.map((stage, i) => (
              <button
                key={stage.step}
                onClick={() => setActiveStep(i)}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  activeStep === i 
                    ? 'bg-white text-slate-900 shadow-xs font-bold' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <div className="text-[10px] font-mono">Stage {stage.step}</div>
                <div className="text-[11px] font-semibold truncate hidden sm:block mt-0.5">{stage.title.split(' ')[0]}</div>
              </button>
            ))}
          </div>

          {/* Active Stage Highlight Card */}
          <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-mono font-bold text-xs">
                  {pipelineStages[activeStep].step}
                </span>
                <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  {pipelineStages[activeStep].sub}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Step {activeStep + 1} of 7
              </span>
            </div>

            <div>
              <h4 className="text-xl font-bold text-white tracking-tight">
                {pipelineStages[activeStep].title}
              </h4>
              <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                {pipelineStages[activeStep].desc}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-mono">Cryptographic Primitive</span>
                <span className="font-semibold">{pipelineStages[activeStep].math}</span>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
          </div>

          {/* Complete 7-Step Vertical Flow for Scannability */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              End-to-End Cryptographic Chain
            </h5>

            <div className="space-y-2">
              {pipelineStages.map((stage, i) => {
                const Icon = stage.icon;
                const isSelected = activeStep === i;
                return (
                  <div
                    key={stage.step}
                    onClick={() => setActiveStep(i)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-indigo-50/70 border-indigo-300 shadow-xs' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{stage.step}. {stage.title}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-medium">({stage.sub})</span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">{stage.math}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {stage.step <= 4 ? 'Client Edge' : stage.step === 5 ? 'Presentation' : 'Algorand L1'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            TEAL v8 Precompile · App #761383580 · Box Storage Index
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Close Architecture Flow
          </button>
        </div>
      </div>
    </div>
  );
}
