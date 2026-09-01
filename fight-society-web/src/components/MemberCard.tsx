'use client';

import React from 'react';
import { User, Enrollment } from '@/types/api';
import { ShieldCheck, CheckCircle2, AlertCircle, Calendar, CreditCard, Swords } from 'lucide-react';

interface MemberCardProps {
  user: User;
  enrollment?: Enrollment | null;
  onPayClick?: () => void;
}

export function MemberCard({ user, enrollment, onPayClick }: MemberCardProps) {
  const isBJJ = enrollment?.plan?.martialArt === 'JIU_JITSU';
  const isThai = enrollment?.plan?.martialArt === 'MUAY_THAI';
  const isActive = enrollment?.status === 'ACTIVE';

  const planName = enrollment?.plan?.name || 'Sem Matrícula Ativa';
  const planPrice = enrollment?.plan?.price ? Number(enrollment.plan.price).toFixed(2) : '0.00';

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white p-6 shadow-2xl border border-red-900/30 overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -right-16 -top-16 w-52 h-52 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Card Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-red-600 flex items-center justify-center shadow-md">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-red-400 block">
              FIGHT SOCIETY ACADEMY
            </span>
            <span className="text-xs font-bold text-slate-300">
              {isBJJ ? 'Jiu Jitsu Brasileiro' : isThai ? 'Muay Thai' : 'Cartão de Matrícula'}
            </span>
          </div>
        </div>

        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isActive 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {isActive ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {isActive ? 'Ativa' : 'Pendente'}
          </span>
        </div>
      </div>

      {/* Card Body / Plan & Price */}
      <div className="relative z-10 mb-6">
        <div className="text-xs font-semibold text-slate-400 mb-1">
          Plano Contratado
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            R$ {planPrice}
            <span className="text-xs font-normal text-slate-400 ml-1">/período</span>
          </div>
          {!isActive && onPayClick && (
            <button
              onClick={onPayClick}
              className="py-1.5 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition transform active:scale-95"
            >
              Matricular
            </button>
          )}
        </div>
        <div className="text-xs font-bold text-red-300 mt-1">
          {planName}
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono">
        <div>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-sans">
            Aluno
          </span>
          <span className="font-bold text-slate-200 tracking-wide">
            {user.name.toUpperCase()}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-sans">
            Status da Mensalidade
          </span>
          <span className={`font-bold ${isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isActive ? 'EM DIA' : 'PENDENTE'}
          </span>
        </div>
      </div>
    </div>
  );
}
