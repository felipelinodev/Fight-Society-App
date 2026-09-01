'use client';

import React from 'react';
import { ArrowUpRight, Flame, Shield, Award, Zap, QrCode, CreditCard } from 'lucide-react';

interface OnboardingViewProps {
  onStart: () => void;
}

export function OnboardingView({ onStart }: OnboardingViewProps) {
  return (
    <div className="relative min-h-[92vh] w-full max-w-md mx-auto bg-gradient-to-b from-red-500 via-red-600 to-rose-700 text-white rounded-[40px] p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl border-4 border-slate-900/10">
      {/* Background Decorative Rings */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 top-1/2 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Pill */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
          <Flame className="w-4 h-4 text-white fill-white" />
          <span className="text-xs font-black tracking-wider uppercase">FIGHT SOCIETY</span>
        </div>
        <div className="text-[11px] font-semibold text-white/80 tracking-wide">
          BJJ & MUAY THAI
        </div>
      </div>

      {/* Hero Illustration / Graphical Center Area (Matching Screen 1) */}
      <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
        {/* Floating Martial Arts Badges (Matching floating coins/cards) */}
        <div className="absolute top-4 left-4 p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg animate-float">
          <QrCode className="w-5 h-5 text-white" />
        </div>
        <div className="absolute top-8 right-6 p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div className="absolute bottom-6 left-8 p-2 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg animate-float" style={{ animationDelay: '2.5s' }}>
          <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
        </div>

        {/* Central Graphic Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-black/30 via-red-800/40 to-white/20 border-2 border-white/25 flex items-center justify-center shadow-2xl backdrop-blur-sm">
          {/* Warrior Silhouette Badge */}
          <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-full bg-black/40 border border-white/30 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-3xl bg-white text-red-600 flex items-center justify-center mb-3 shadow-xl">
              <Shield className="w-9 h-9 fill-red-600 stroke-red-600" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-red-200">Dojô Digital</span>
            <span className="text-xl font-black text-white">JIU JITSU • THAI</span>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-white/70 font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Matrículas & Pagamentos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Headline & Call to Action (Matching Screen 1) */}
      <div className="relative z-10 pt-4">
        <h1 className="text-3xl sm:text-4xl font-black leading-tight text-white tracking-tight">
          Artes Marciais <br />
          Feitas para{' '}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black rounded-full text-white text-xl sm:text-2xl font-black align-middle mx-1">
            Guerreiros <ArrowUpRight className="w-5 h-5 text-red-400" />
          </span>
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-white/80 font-medium leading-relaxed">
          Gerencie sua matrícula de Jiu Jitsu e Muay Thai, realize pagamentos instantâneos com Stripe e acompanhe sua evolução.
        </p>

        {/* Bottom Action Row (Matching Screen 1) */}
        <div className="mt-8 flex items-center justify-between pt-2">
          <button
            onClick={onStart}
            className="text-xs font-bold text-white/70 hover:text-white uppercase tracking-wider py-2 px-3 transition"
          >
            Pular
          </button>

          <button
            onClick={onStart}
            className="group flex items-center gap-3 pl-6 pr-2.5 py-2.5 rounded-full bg-black hover:bg-slate-900 text-white font-bold text-sm shadow-xl transition transform active:scale-95"
          >
            <span>Começar Agora</span>
            <div className="w-9 h-9 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center transition">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
