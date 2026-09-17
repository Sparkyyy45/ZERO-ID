import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, ShieldCheck, Scale, BarChart3, Layers, 
  ExternalLink, UserCheck, CheckCircle2, Cpu, Radio, Sparkles
} from 'lucide-react';

export default function EnterpriseHeader({ 
  activeMainTab, 
  onSwitchTab, 
  registerCount, 
  currentProfile,
  onOpenBenchmark,
  onOpenArchFlow
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Enterprise Brand & Active Persona */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/verifier" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-mono font-black text-sm tracking-tighter shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all">
              B2B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white font-sans">
                  ZERO-ID
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider">
                  Enterprise Console
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 hidden sm:block">
                Statutory Compliance &amp; Zero-PII Verifier Terminal
              </p>
            </div>
          </Link>

          {/* Primary View Switcher Tabs (Terminal vs Statutory Register) */}
          <nav className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              onClick={() => onSwitchTab('verifier')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMainTab === 'verifier'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Verifier Terminal</span>
            </button>
            <button
              onClick={() => onSwitchTab('register')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeMainTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Statutory Register</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                {registerCount || 4}
              </span>
            </button>
          </nav>
        </div>

        {/* Right: Telemetry Indicators & Quick Switcher to Citizen App */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Inspection Modals */}
          {onOpenBenchmark && (
            <button
              onClick={onOpenBenchmark}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/50 transition-colors"
              title="Benchmark Against Alternatives"
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
              <span>Benchmark</span>
            </button>
          )}

          {onOpenArchFlow && (
            <button
              onClick={onOpenArchFlow}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 transition-colors"
              title="View Cryptographic Flow Architecture"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Architecture</span>
            </button>
          )}

          {/* Live Node Status */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300">AVM v8</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-bold">0.38s</span>
          </div>

          {/* Quick Switch to Citizen Vault (Real World Pairing Switcher) */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all shadow-xs"
            title="Switch to Citizen Mobile Identity Vault"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Citizen Vault</span>
            <span className="sm:hidden">Vault</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

        </div>

      </div>
    </header>
  );
}
