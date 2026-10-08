'use client';

import React from 'react';
import Image from 'next/image';
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
    <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#141418] to-[#18181f] border border-zinc-800 text-zinc-100 p-6 overflow-hidden shadow-sm">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-red-500/40 bg-black shrink-0 shadow-sm">
            <Image
              src="/logo_dojo.jpg"
              alt="Fight Society"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400 block font-semibold">
              FIGHT SOCIETY — ID PASS
            </span>
            <span className="text-xs font-semibold text-white">
              {isBJJ ? 'Jiu Jitsu Brasileiro' : isThai ? 'Muay Thai' : 'Credencial de Membro'}
            </span>
          </div>
        </div>

        <div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium tracking-wide uppercase ${
            isActive 
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
              : 'bg-amber-950/50 text-amber-400 border border-amber-800/50'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {isActive ? 'Ativo' : 'Pendente'}
          </span>
        </div>
      </div>

      {/* Main Stats / Plan Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
            Plano Contratado
          </span>
          <div className="text-lg font-bold text-zinc-100 tracking-tight">
            {planName}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">
            R$ {planPrice} <span className="text-zinc-400">/ ciclo</span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end justify-center">
          {!isActive && onPayClick ? (
            <button
              onClick={onPayClick}
              className="py-2 px-4 rounded-md bg-red-600 hover:bg-red-700 text-white font-medium text-xs tracking-wide transition shadow-none flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              <span>Regularizar Matrícula</span>
            </button>
          ) : (
            <div className="text-right">
              <span className="text-[10px] font-mono text-zinc-400 uppercase block">Situação</span>
              <span className="text-xs font-semibold text-emerald-400">Acesso Liberado</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            Titular
          </span>
          <span className="font-semibold text-zinc-200 tracking-tight">
            {user.name}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
            ID de Registro
          </span>
          <span className="font-mono text-xs text-zinc-400">
            #{user.id ? user.id.slice(0, 8).toUpperCase() : 'FS-001'}
          </span>
        </div>
      </div>
    </div>
  );
}
