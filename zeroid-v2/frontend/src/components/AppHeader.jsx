import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Shield, Layers, Plus, Building2, QrCode, Smartphone, 
  ExternalLink, Copy, Check, RefreshCw, ChevronDown, 
  AlertTriangle, Home, ArrowUpRight, HelpCircle, X, Sparkles, BarChart3,
  Scale
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProtocolComparisonModal from './ProtocolComparisonModal';

export default function AppHeader({ onOpenQr, onOpenKillSwitch }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { wallet, tokens, statutoryRegister } = useAppContext();
  const [walletDropdown, setWalletDropdown] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [showPhoneSyncModal, setShowPhoneSyncModal] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);

  const activeToken = tokens.find(t => t.status === 'Active') || tokens[0];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const navLinks = [
    { path: '/dashboard', label: 'Citizen Vault', icon: Shield },
    { path: '/add-proof', label: 'Mint ZK Proof', icon: Plus },
    { path: '/how-it-works', label: 'How It Works', icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Nav Tabs */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center font-mono font-black text-sm tracking-tighter shadow-xs group-hover:bg-blue-600 transition-colors">
              Z0
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">ZERO-ID</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Citizen Vault
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const currentFull = location.pathname + location.search;
              const isActive = link.path.includes('?') 
                ? currentFull === link.path 
                : (location.pathname === link.path && !location.search.includes('tab=register'));
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive 
                        ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40' 
                        : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions, Network Status & Wallet Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Present QR button if available */}
          {onOpenQr && (
            <button
              onClick={() => onOpenQr(activeToken)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 transition-colors shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Present QR</span>
            </button>
          )}

          {/* Quick Phone Sync Launcher */}
          <button
            onClick={() => setShowPhoneSyncModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-2xs"
            title="Open Citizen Vault on your Smartphone"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Mobile Vault</span>
          </button>

          {/* Dedicated Link to Enterprise Verifier Portal */}
          <Link
            to="/verifier"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all shadow-2xs"
            title="Switch to Enterprise Verifier Console (For NBFCs, Fleets & Hotels)"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">Enterprise Console</span>
            <span className="sm:hidden">Enterprise</span>
            <ArrowUpRight className="w-3 h-3 text-slate-400" />
          </Link>

          {/* Network Node Status */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600 font-medium">Algorand L1</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">3.8s</span>
          </div>

          {/* Wallet Trigger Pill */}
          <div className="relative">
            <button
              onClick={() => setWalletDropdown(!walletDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition-all ${
                wallet.isPera
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100/70 shadow-2xs'
                  : wallet.address
                    ? 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80 shadow-2xs'
                    : 'bg-slate-900 text-white border-transparent hover:bg-slate-800 shadow-xs font-sans font-semibold'
              }`}
            >
              {wallet.isPera ? (
                <Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : wallet.address ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              ) : (
                <Shield className="w-3.5 h-3.5" />
              )}
              
              <span className="truncate max-w-[110px] sm:max-w-[140px]">
                {wallet.address 
                  ? `${wallet.address.substring(0, 5)}...${wallet.address.substring(wallet.address.length - 4)}`
                  : 'Connect Wallet'}
              </span>

              {wallet.address && (
                <span className="hidden sm:inline font-bold text-slate-900 ml-1 pl-1 border-l border-slate-300">
                  {wallet.balance} ALGO
                </span>
              )}

              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Wallet Popover Menu */}
            {walletDropdown && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">Account Details</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    {wallet.network || 'Algorand Testnet'}
                  </span>
                </div>

                {wallet.address ? (
                  <div className="py-3 space-y-3 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Public Key:</span>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                        <span className="truncate max-w-[180px]">{wallet.address}</span>
                        <button 
                          onClick={() => handleCopy(wallet.address)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors"
                          title="Copy Address"
                        >
                          {copiedAddr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 text-xs font-sans">Live Balance:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{wallet.balance} ALGO</span>
                        <button 
                          onClick={wallet.refreshBalance} 
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors"
                          title="Refresh"
                        >
                          <RefreshCw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <a
                        href={`https://lora.algokit.io/testnet/account/${wallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View on Lora Explorer
                      </a>

                      <a
                        href="https://bank.testnet.algorand.network/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Get Testnet ALGO Faucet
                      </a>

                      <button
                        onClick={() => {
                          wallet.disconnectWallet();
                          setWalletDropdown(false);
                        }}
                        className="w-full text-center py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors mt-1"
                      >
                        Disconnect Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 space-y-2.5">
                    <button
                      onClick={() => {
                        wallet.connectWallet();
                        setWalletDropdown(false);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                    >
                      <Smartphone className="w-4 h-4" /> Connect Pera Wallet App
                    </button>
                    <button
                      onClick={() => {
                        if (wallet.connectCitizenKey) {
                          wallet.connectCitizenKey();
                        } else {
                          wallet.connectDemoAccount();
                        }
                        setWalletDropdown(false);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Connect Hardware Enclave Key
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Emergency Kill Switch Header Action if handler passed */}
          {onOpenKillSwitch && (
            <button
              onClick={onOpenKillSwitch}
              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
              title="Algorand Emergency Kill-Switch"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

      {/* Mobile Vault Pairing Modal */}
      {showPhoneSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="surface-card p-6 sm:p-7 max-w-sm w-full rounded-3xl shadow-2xl space-y-4 text-center border border-slate-200 relative">
            <button 
              onClick={() => setShowPhoneSyncModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">Open Vault on Phone</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Scan with your smartphone camera to access your Citizen Vault on mobile.</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
              <QRCodeSVG 
                value={`${window.location.origin}/dashboard`}
                size={180}
                level="M"
                includeMargin={true}
              />
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 truncate">
              {window.location.origin}/dashboard
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/dashboard`);
                setShowPhoneSyncModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Copy Mobile Link &amp; Close
            </button>
          </div>
        </div>
      )}

      {/* Global Benchmark Modal */}
      <ProtocolComparisonModal 
        isOpen={showBenchmarkModal} 
        onClose={() => setShowBenchmarkModal(false)} 
      />
    </header>
  );
}
