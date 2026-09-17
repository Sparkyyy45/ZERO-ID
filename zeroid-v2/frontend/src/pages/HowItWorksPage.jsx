import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, ShieldCheck, ArrowRight, Smartphone, Sparkles, 
  Lock, Eye, EyeOff, Building2, CheckCircle2, XCircle, 
  HelpCircle, ChevronDown, ChevronUp, QrCode, CreditCard, 
  Hotel, Wine, PhoneCall, Landmark, FileCheck, ArrowUpRight,
  ShieldAlert, KeyRound, Check
} from 'lucide-react';
import AppHeader from '../components/AppHeader';

export default function HowItWorksPage() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState('club');
  const [openFaq, setOpenFaq] = useState(0);

  const scenarios = {
    club: {
      id: 'club',
      title: 'Nightclub & 18+ Events',
      icon: Wine,
      question: 'Are you 18 or older?',
      oldWay: {
        action: 'You hand the bouncer your physical Aadhaar or Driver\'s License.',
        leaks: ['Exact Birth Date & Year', 'Full Home Address', 'Father / Care-of Name', '12-Digit Aadhaar Number'],
        risk: 'Bouncer or staff can photograph your card or memorize your personal details.'
      },
      zeroIdWay: {
        action: 'You flash your dynamic ZERO-ID QR code on your phone.',
        shares: ['Age >= 18: TRUE (Verified ✅)'],
        hidden: ['Full Birth Date', 'Home Address', 'Aadhaar Number', 'Family Details'],
        benefit: 'They get instant proof you are an adult. They learn zero other details.'
      }
    },
    hotel: {
      id: 'hotel',
      title: 'Hotel Check-In',
      icon: Hotel,
      question: 'Are you a valid registered guest?',
      oldWay: {
        action: 'Receptionist takes your Aadhaar and makes a paper photocopy.',
        leaks: ['Full Aadhaar Photocopy', 'Biometric Photo', 'Home Address', 'Father\'s Name'],
        risk: 'Photocopy sits in an unlocked binder or drawer for years where anyone can copy it.'
      },
      zeroIdWay: {
        action: 'Receptionist scans your hotel disclosure QR code.',
        shares: ['Verified Citizen: TRUE', 'Age >= 18: VALID (Groth16)', 'Selective Disclosure Token'],
        hidden: ['12-Digit Aadhaar Number', 'Exact Birth Date', 'Full Street Address'],
        benefit: 'Hotel gets 100% legal compliance without keeping dangerous paper copies.'
      }
    },
    sim: {
      id: 'sim',
      title: 'Buying a SIM Card',
      icon: PhoneCall,
      question: 'Are you authorized to purchase a phone number?',
      oldWay: {
        action: 'Store clerk uploads your Aadhaar PDF and keeps a digital copy on their laptop.',
        leaks: ['Raw PDF File', 'Full Residential Address', 'Date of Birth', 'Aadhaar Number'],
        risk: 'Rogue store agents can issue unauthorized SIMs in your name without your knowledge.'
      },
      zeroIdWay: {
        action: 'Store terminal verifies a 1-time cryptographic proof.',
        shares: ['Verified Citizen Status', 'Legal Name'],
        hidden: ['Raw Aadhaar Document', 'Unchecked Personal Details'],
        benefit: 'You can revoke the telecom\'s verification permission anytime from your vault.'
      }
    },
    bank: {
      id: 'bank',
      title: 'Opening a Bank Account',
      icon: Landmark,
      question: 'Do you satisfy statutory banking KYC requirements?',
      oldWay: {
        action: 'Bank archives your full Aadhaar PDF across 50+ internal backend databases.',
        leaks: ['Permanent storage of full identity documents on central servers'],
        risk: 'If the bank or its third-party IT vendor suffers a data breach, your identity is leaked.'
      },
      zeroIdWay: {
        action: 'Bank receives a verified mathematical zero-knowledge proof.',
        shares: ['Age >= 18 (True)', 'Verified Citizen', 'Legal Name & State'],
        hidden: ['0 raw identity documents stored on the bank\'s servers'],
        benefit: 'Full RBI & PMLA compliance with 0 bytes of sensitive document risk.'
      }
    }
  };

  const faqs = [
    {
      q: "Does ZERO-ID store my Aadhaar photo or number?",
      a: "No, never! When you load your offline Aadhaar file, it is processed 100% locally inside your web browser. We do not have a centralized database, and your raw files never leave your device."
    },
    {
      q: "How does someone verify me if they can't see my document?",
      a: "Think of it like a math puzzle. Your official government-signed file creates a unique mathematical certificate (a zero-knowledge proof). The verifier's scanner checks that the math is 100% genuine without needing to read the private numbers inside."
    },
    {
      q: "What is the 'Kill-Switch' and how does it protect me?",
      a: "If you lose your phone or want to stop a company from using your identity, you can click 'Execute Kill-Switch' in your vault. This permanently blacklists your proof on the Algorand blockchain in under 3 seconds, so no one can ever impersonate you."
    },
    {
      q: "Is this legal for banks and companies in India?",
      a: "Yes! India's Digital Personal Data Protection (DPDP) Act 2023 specifically mandates 'Data Minimization' — requiring companies to only collect what they strictly need. ZERO-ID provides 100% verifiable compliance while storing zero unnecessary documents."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col selection:bg-slate-900 selection:text-white">
      
      {/* Top Application Header */}
      <AppHeader />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-14 sm:pb-20 border-b border-slate-200/80 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-mono text-blue-700 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simple Guide for Everyday Users</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.2]">
            How ZERO-ID Works <br />
            <span className="text-blue-600">(In Plain English)</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            No complex math formulas. Here is how ZERO-ID lets you prove who you are without ever giving away your personal identity documents.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-tight shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Open Your Vault</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => navigate('/add-proof')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs tracking-tight shadow-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Create Your First ID</span>
            </button>
          </div>

        </div>
      </section>

      {/* The Everyday Analogy: Apple Pay for Your Identity */}
      <section className="py-14 sm:py-16 border-b border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="surface-card p-6 sm:p-9 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl space-y-6 antialiased border border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-300 shadow-inner">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">The Simple Concept</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">Think of it like Apple Pay, but for your Identity</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 shadow-sm">
                <div className="font-bold text-slate-200 flex items-center gap-2 text-base">
                  <CreditCard className="w-5 h-5 text-amber-400" /> When You Pay with Apple Pay:
                </div>
                <p className="text-slate-300 leading-relaxed font-medium">
                  You don't hand the cashier your 16-digit credit card number or CVV code. Your phone generates a secure 1-time digital code that proves you have money, without exposing your physical card.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-400/20 space-y-3 shadow-sm">
                <div className="font-bold text-white flex items-center gap-2 text-base">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> When You Verify with ZERO-ID:
                </div>
                <p className="text-slate-200 leading-relaxed font-medium">
                  You don't give the hotel, bar, or bank a photocopy of your Aadhaar card. Your phone generates a secure 1-time digital code that proves you satisfy their rules (like Age &gt;= 18), without exposing your private data.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* The 3 Simple Steps */}
      <section className="py-14 sm:py-18 border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-subtle bg-blue-50 text-blue-700 border border-blue-200">
              3 Simple Steps
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              How You Use ZERO-ID in Real Life
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Set up once in 60 seconds, use anywhere forever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="surface-card p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm mb-4">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-900">Load Once, Save on Phone</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Download your free paperless Aadhaar file from the government portal. Your phone creates your private identity card locally. <strong>No files are ever sent to our servers.</strong>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Private &amp; on-device only</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="surface-card p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold text-sm mb-4">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-900">Answer Only What's Needed</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  When someone asks for proof, you show a dynamic QR code. It answers their specific question (like <em>"Is this person an adult?"</em>) with a certified <strong>YES</strong>, while keeping your address and birthdate completely hidden.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero extra data leaked</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="surface-card p-6 sm:p-7 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center font-bold text-sm mb-4">
                  3
                </div>
                <h3 className="font-bold text-base text-slate-900">Revoke Access in 1 Tap</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Moved out of a rental apartment or closed a bank account? Tap <strong>'Revoke'</strong> in your vault. Their verification is instantly disabled on the blockchain so they can never use your record again.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-mono text-slate-600 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Instant global kill-switch</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Interactive Real-World Scenarios */}
      <section className="py-14 sm:py-18 border-b border-slate-200/80 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="badge-subtle bg-purple-50 text-purple-700 border border-purple-200">
              Interactive Scenarios
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              See the Difference in Everyday Life
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a scenario below to compare what happens today vs. with ZERO-ID.
            </p>
          </div>

          {/* Scenario Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(scenarios).map((sc) => {
              const Icon = sc.icon;
              const isSelected = activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setActiveScenario(sc.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{sc.title}</span>
                </button>
              );
            })}
          </div>

          {/* Active Scenario Comparison Card */}
          {scenarios[activeScenario] && (
            <div className="surface-card p-6 sm:p-8 space-y-6 shadow-md max-w-4xl mx-auto">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">Scenario Question</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    "{scenarios[activeScenario].question}"
                  </div>
                </div>
                <span className="badge-subtle bg-blue-50 text-blue-700 border border-blue-200">
                  {scenarios[activeScenario].title}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* The Old Way */}
                <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-red-950">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>The Old Way (Physical Photocopy)</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-medium">
                    {scenarios[activeScenario].oldWay.action}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-red-200">
                    <span className="text-[10px] font-mono uppercase text-red-800 font-bold block">Sensitive Data Leaked:</span>
                    <ul className="space-y-1 text-[11px] text-red-700 font-mono">
                      {scenarios[activeScenario].oldWay.leaks.map((leak, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span>✕</span> {leak}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-red-200 text-[11px] text-red-900 font-sans">
                    <strong>The Danger:</strong> {scenarios[activeScenario].oldWay.risk}
                  </div>
                </div>

                {/* The ZERO-ID Way */}
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>The ZERO-ID Way (Privacy Shield)</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed font-medium">
                    {scenarios[activeScenario].zeroIdWay.action}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-emerald-200">
                    <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">What the Verifier Receives:</span>
                    <ul className="space-y-1 text-[11px] text-emerald-800 font-mono">
                      {scenarios[activeScenario].zeroIdWay.shares.map((share, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span>✓</span> <strong>{share}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-emerald-900 font-sans">
                    <strong>Your Protection:</strong> {scenarios[activeScenario].zeroIdWay.benefit}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-14 sm:py-18 border-b border-slate-200/80 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center space-y-2">
            <span className="badge-subtle bg-slate-100 text-slate-700 border border-slate-200">
              Clear Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Common questions about security, privacy, and how ZERO-ID works.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="surface-card border border-slate-200/90 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-900">{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Ready to Take Back Control CTA */}
      <section className="py-16 bg-slate-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Ready to Take Control of Your Identity?
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Mint your first zero-knowledge identity proof in under 60 seconds. 100% private, on-device, and free.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/add-proof')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-tight shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Mint Your First Proof</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs tracking-tight shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Go to Citizen Vault</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
