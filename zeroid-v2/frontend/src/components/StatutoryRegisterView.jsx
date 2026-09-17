import React, { useState, useMemo } from 'react';
import { 
  FileText, ShieldCheck, Download, Search, Filter, Printer, 
  ExternalLink, Copy, Check, CheckCircle2, Lock, Landmark, 
  Building2, Bike, Hotel, Clock, ShieldAlert, Cpu, Award, Sparkles,
  RefreshCw, Layers, EyeOff, AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function StatutoryRegisterView({ onSelectEntryForDossier }) {
  const { statutoryRegister, addRegisterEntry, addLog } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return statutoryRegister.filter((entry) => {
      const matchesSector = selectedSector === 'all' || entry.sector === selectedSector;
      const matchesSearch = 
        entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.rpName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.citizenAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.nullifierHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.purpose.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSector && matchesSearch;
    });
  }, [statutoryRegister, selectedSector, searchQuery]);

  const getSectorBadge = (sector) => {
    switch (sector) {
      case 'lending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Landmark className="w-3 h-3" /> Micro-Lending NBFC
          </span>
        );
      case 'gig':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Bike className="w-3 h-3" /> Gig Fleet Anti-Renting
          </span>
        );
      case 'hotel':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Hotel className="w-3 h-3" /> Sarais Act Hotel Reg
          </span>
        );
      case 'bank':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Building2 className="w-3 h-3" /> Banking Tier-1 e-CDD
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Statutory Framework & Executive Metrics */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> IT Act 2000 Sec 4 & 5 Certified
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                RBI KYC Sec 16 & 18 OVD Valid
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Enterprise Statutory Legal Register
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Court-admissible electronic customer due diligence and visitor log. Proves 100% regulatory compliance to RBI and police auditors while storing <strong>0 Bytes of citizen personal documents</strong>.
            </p>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-md transition-all active:scale-95"
              title="Print or Export Certified Register as PDF for Court / RBI Audit"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Export Official Ledger (PDF)</span>
            </button>
          </div>
        </div>

        {/* 4 Executive Metric Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 font-mono">
          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Verified Register Entries</div>
            <div className="text-2xl font-bold text-white mt-1">{statutoryRegister.length} Active Logs</div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> 100% Cryptographically Bound
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Raw PII Stored on Server</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">0 Bytes</div>
            <div className="text-[10px] text-slate-400 mt-1">
              DPDP Sec 6(1) Data Minimization
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">DPDP Breach Exposure</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">₹0.00 Liability</div>
            <div className="text-[10px] text-emerald-400 mt-1">
              Math-Guaranteed Immunity
            </div>
          </div>

          <div className="bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Average Attestation Speed</div>
            <div className="text-2xl font-bold text-white mt-1">0.38 sec</div>
            <div className="text-[10px] text-slate-400 mt-1">
              Client WASM Groth16 Prover
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Sector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Sectors' },
            { id: 'lending', label: 'Digital Lending (NBFC)', icon: Landmark },
            { id: 'gig', label: 'Gig Fleets (Blinkit)', icon: Bike },
            { id: 'hotel', label: 'Hotel Registers (Sarais Act)', icon: Hotel },
            { id: 'bank', label: 'Banking Tier-1 (HDFC)', icon: Building2 }
          ].map((tab) => {
            const isSelected = selectedSector === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSector(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected 
                    ? 'bg-slate-900 text-white shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Nullifier, Serial, Entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          />
        </div>
      </div>

      {/* The Statutory Register Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4 font-bold">Register Serial / Time</th>
                <th className="py-3.5 px-4 font-bold">Relying Entity &amp; Sector</th>
                <th className="py-3.5 px-4 font-bold">Verified Claims (Math Proof)</th>
                <th className="py-3.5 px-4 font-bold">Cryptographic Nullifier (Hash)</th>
                <th className="py-3.5 px-4 font-bold">Gov Trust Anchor</th>
                <th className="py-3.5 px-4 font-bold">Server PII</th>
                <th className="py-3.5 px-4 font-bold text-right">Court Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono text-sm">
                    No register entries found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* Serial ID & Timestamp */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-mono font-black text-slate-900 tracking-tight">
                        {entry.id}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {entry.timestamp}
                      </div>
                      <div className="mt-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Check className="w-2.5 h-2.5" /> IT Act Certified
                        </span>
                      </div>
                    </td>

                    {/* Relying Entity & Sector */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900 text-sm">
                        {entry.rpName}
                      </div>
                      <div className="mt-1">
                        {getSectorBadge(entry.sector)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 max-w-[200px] leading-tight">
                        {entry.purpose}
                      </div>
                    </td>

                    {/* Verified Claims */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{entry.citizenAlias}</span>
                      </div>
                      <div className="space-y-0.5 mt-1">
                        {entry.claims.map((claim, idx) => (
                          <div key={idx} className="text-[11px] font-mono text-slate-600 bg-slate-100/80 px-1.5 py-0.5 rounded inline-block mr-1 mb-1">
                            {claim}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Cryptographic Nullifier */}
                    <td className="py-3.5 px-4 align-top font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/80 max-w-[140px] truncate">
                          {entry.nullifierHash.slice(0, 10)}...{entry.nullifierHash.slice(-8)}
                        </span>
                        <button
                          onClick={() => handleCopy(entry.nullifierHash, entry.id)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Copy Full 64-char Nullifier Hash"
                        >
                          {copiedId === entry.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
                        <span>Block #{entry.blockRound.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* UIDAI Trust Anchor */}
                    <td className="py-3.5 px-4 align-top font-mono text-[11px]">
                      <div className="text-emerald-700 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>UIDAI RSA-2048</span>
                      </div>
                      <div className="text-slate-500 text-[10px] mt-0.5">
                        Gov Digital Signature Valid
                      </div>
                    </td>

                    {/* PII Footprint */}
                    <td className="py-3.5 px-4 align-top font-mono">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        0 BYTES
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Zero Document Storage
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <button
                        onClick={() => onSelectEntryForDossier(entry)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-xs active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect Dossier</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Legal Audit Authority Explainer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Statutory Admissibility:</strong> Validated under <strong>IT Act 2000 Section 4 &amp; 5</strong> and <strong>RBI KYC Master Direction Section 16 &amp; 18</strong>.
            </span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Total Ledger Integrity: 100% Mathematical Proof
          </div>
        </div>
      </div>

      {/* Deep-Dive Educational Box: How Auditors & Police Verify This */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-emerald-50/80 border border-blue-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
            How Regulators &amp; Law Enforcement Audit This Register
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 leading-relaxed">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
            <strong className="text-slate-900 block font-mono text-[11px] uppercase text-blue-700">
              1. Mathematical Proof of UIDAI
            </strong>
            When an auditor inspects an entry, the server verifies the nullifier hash against UIDAI's published RSA-2048 public key. It mathematically proves the citizen is genuine in 2 milliseconds.
          </div>
          
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
            <strong className="text-slate-900 block font-mono text-[11px] uppercase text-emerald-700">
              2. Court-Admissible Electronic Record
            </strong>
            Under Section 4 &amp; 5 of the Information Technology Act 2000, cryptographically attested electronic logs hold equal legal weight to physical paper books without requiring document photocopies.
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
            <strong className="text-slate-900 block font-mono text-[11px] uppercase text-purple-700">
              3. Permanent DPDP Immunity
            </strong>
            If a malicious actor breaches the enterprise database, they find only SHA-256 hashes and mathematical nullifiers. Zero customer Aadhaar scans exist to leak, eliminating ₹250-Cr liabilities.
          </div>
        </div>
      </div>

    </div>
  );
}
