'use client';

import React from 'react';
import { LayoutDashboard, Users, Swords, CreditCard, QrCode, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type TabType = 'home' | 'students' | 'plans' | 'payments' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onCenterClick: () => void;
}

export function BottomNav({ currentTab, onSelectTab, onCenterClick }: BottomNavProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    // Student Bottom Nav: Perfectly centered 3-item capsule: [Meu Passe] [QR CODE] [Planos]
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[80%] max-w-xs">
        <div className="p-2 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-around px-4">
          {/* Left: Meu Passe */}
          <button
            onClick={() => onSelectTab('home')}
            className={`p-2.5 rounded-full transition-all ${currentTab === 'home'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
              }`}
            title="Meu Passe"
          >
            <LayoutDashboard size={21} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>

          {/* Center: Red Floating QR Button */}
          <button
            onClick={onCenterClick}
            className="relative -top-2 w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-110 active:scale-95 transition-all shrink-0"
            title="Catraca / Check-in"
          >
            <QrCode size={22} className="stroke-[2.5]" />
          </button>

          {/* Right: Planos */}
          <button
            onClick={() => onSelectTab('plans')}
            className={`p-2.5 rounded-full transition-all ${currentTab === 'plans'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
              }`}
            title="Planos de Treino"
          >
            <Swords size={21} className={currentTab === 'plans' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>
        </div>
      </div>
    );
  }

  // Admin Bottom Nav: 5 items perfectly centered
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm">
      <div className="p-2 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between px-3">
        {/* Admin 1: Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`p-2.5 rounded-full transition-all ${currentTab === 'home'
              ? 'bg-white/15 text-red-500 scale-105'
              : 'text-slate-400 hover:text-white'
            }`}
          title="Painel Geral"
        >
          <LayoutDashboard size={20} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
        </button>

        {/* Admin 2: Alunos */}
        <button
          onClick={() => onSelectTab('students')}
          className={`p-2.5 rounded-full transition-all ${currentTab === 'students'
              ? 'bg-white/15 text-red-500 scale-105'
              : 'text-slate-400 hover:text-white'
            }`}
          title="Gestão de Alunos"
        >
          <Users size={20} className={currentTab === 'students' ? 'stroke-[2.5]' : 'stroke-2'} />
        </button>

        {/* Admin Center: QR Code */}
        <button
          onClick={onCenterClick}
          className="relative -top-2 w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-110 active:scale-95 transition-all shrink-0"
          title="Catraca / Check-in"
        >
          <QrCode size={22} className="stroke-[2.5]" />
        </button>

        {/* Admin 4: Planos */}
        <button
          onClick={() => onSelectTab('plans')}
          className={`p-2.5 rounded-full transition-all ${currentTab === 'plans'
              ? 'bg-white/15 text-red-500 scale-105'
              : 'text-slate-400 hover:text-white'
            }`}
          title="Gerenciar Planos"
        >
          <Swords size={20} className={currentTab === 'plans' ? 'stroke-[2.5]' : 'stroke-2'} />
        </button>

        {/* Admin 5: Financeiro */}
        <button
          onClick={() => onSelectTab('payments')}
          className={`p-2.5 rounded-full transition-all ${currentTab === 'payments'
              ? 'bg-white/15 text-red-500 scale-105'
              : 'text-slate-400 hover:text-white'
            }`}
          title="Financeiro"
        >
          <CreditCard size={20} className={currentTab === 'payments' ? 'stroke-[2.5]' : 'stroke-2'} />
        </button>
      </div>
    </div>
  );
}
