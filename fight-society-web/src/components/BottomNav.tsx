'use client';

import React from 'react';
import { LayoutDashboard, Users, Swords, CreditCard, QrCode, User as UserIcon, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type TabType = 'home' | 'students' | 'plans' | 'payments' | 'schedule' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onCenterClick: () => void;
}

export function BottomNav({ currentTab, onSelectTab, onCenterClick }: BottomNavProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm">
      <div className="p-2 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between px-3">
        {/* 1. First Item (Left) */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
            currentTab === 'home'
              ? 'bg-white/15 text-red-500 scale-105'
              : 'text-slate-400 hover:text-white'
          }`}
          title={isAdmin ? 'Painel Geral' : 'Meu Passe'}
        >
          <LayoutDashboard size={20} className={currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
        </button>

        {/* 2. Second Item (Center-Left) */}
        {isAdmin ? (
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
        ) : (
          <button
            onClick={() => onSelectTab('plans')}
            className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
              currentTab === 'plans'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Planos de Treino"
          >
            <Swords size={20} className={currentTab === 'plans' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>
        )}

        {/* 3. Center QR Code (Floating Symmetrically in the Middle) */}
        <button
          onClick={onCenterClick}
          className="relative -top-2 w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-110 active:scale-95 transition-all shrink-0"
          title="Catraca / Check-in"
        >
          <QrCode size={22} className="stroke-[2.5]" />
        </button>

        {/* 4. Fourth Item (Center-Right) */}
        {isAdmin ? (
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
        ) : (
          <button
            onClick={() => onSelectTab('schedule')}
            className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
              currentTab === 'schedule'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Horários das Aulas"
          >
            <Calendar size={20} className={currentTab === 'schedule' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>
        )}

        {/* 5. Fifth Item (Right) */}
        {isAdmin ? (
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
        ) : (
          <button
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
              currentTab === 'profile'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Meu Perfil"
          >
            <UserIcon size={20} className={currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>
        )}
      </div>
    </div>
  );
}
