'use client';

import React from 'react';
import { LayoutDashboard, Users, Swords, CreditCard, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type TabType = 'home' | 'students' | 'plans' | 'payments' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export function BottomNav({ currentTab, onSelectTab }: BottomNavProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    // Clean 3-tab navigation for Student: [Minha Matrícula] [Planos] [Meu Perfil]
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[84%] max-w-xs">
        <div className="p-2 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-around px-4">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-all ${
              currentTab === 'home'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Minha Matrícula"
          >
            <LayoutDashboard size={20} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>

          <button
            onClick={() => onSelectTab('plans')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-all ${
              currentTab === 'plans'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Planos de Treino"
          >
            <Swords size={20} className={currentTab === 'plans' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-all ${
              currentTab === 'profile'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Meu Perfil"
          >
            <UserIcon size={20} className={currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>
        </div>
      </div>
    );
  }

  // 4-tab navigation for Admin: [Painel] [Alunos] [Planos] [Financeiro]
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm">
      <div className="p-2 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between px-4">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
            currentTab === 'home'
              ? 'bg-white/15 text-red-500 scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Painel Geral"
        >
          <LayoutDashboard size={20} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
        </button>

        <button
          onClick={() => onSelectTab('students')}
          className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
            currentTab === 'students'
              ? 'bg-white/15 text-red-500 scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Gestão de Alunos"
        >
          <Users size={20} className={currentTab === 'students' ? 'stroke-[2.5]' : 'stroke-2'} />
        </button>

        <button
          onClick={() => onSelectTab('plans')}
          className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
            currentTab === 'plans'
              ? 'bg-white/15 text-red-500 scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Gerenciar Planos"
        >
          <Swords size={20} className={currentTab === 'plans' ? 'stroke-[2.5]' : 'stroke-2'} />
        </button>

        <button
          onClick={() => onSelectTab('payments')}
          className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
            currentTab === 'payments'
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
