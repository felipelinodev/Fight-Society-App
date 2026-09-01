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

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm">
      <div className="p-2 rounded-full bg-slate-950/90 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between px-4">
        {/* Tab 1: Home (Meu Passe para Aluno, Painel para Admin) */}
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

        {/* Tab 2: Admin vê "Alunos", Aluno vê "Planos" */}
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

        {/* Center QR Code Action Button */}
        <button
          onClick={onCenterClick}
          className="relative -top-2 w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/40 hover:scale-110 active:scale-95 transition-all"
          title="Acesso / Catraca"
        >
          <QrCode size={22} className="stroke-[2.5]" />
        </button>

        {/* Tab 3: Admin vê "Planos", Aluno vê "Meu Perfil" */}
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

        {/* Tab 4: Admin vê "Financeiro" */}
        {isAdmin && (
          <button
            onClick={() => onSelectTab('payments')}
            className={`flex flex-col items-center p-2.5 rounded-full transition-all ${
              currentTab === 'payments'
                ? 'bg-white/15 text-red-500 scale-105'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Financeiro da Academia"
          >
            <CreditCard size={20} className={currentTab === 'payments' ? 'stroke-[2.5]' : 'stroke-2'} />
          </button>
        )}
      </div>
    </div>
  );
}
