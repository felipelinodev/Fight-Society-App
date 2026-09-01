'use client';

import React, { useState } from 'react';
import { User, Enrollment } from '@/types/api';
import { Wifi, QrCode, ShieldCheck, CheckCircle2, AlertCircle, Calendar, CreditCard, Swords } from 'lucide-react';

interface MemberCardProps {
  user: User;
  enrollment?: Enrollment | null;
  onPayClick?: () => void;
}

export function MemberCard({ user, enrollment, onPayClick }: MemberCardProps) {
  const [showQrModal, setShowQrModal] = useState(false);

  const isBJJ = enrollment?.plan?.martialArt === 'JIU_JITSU';
  const isThai = enrollment?.plan?.martialArt === 'MUAY_THAI';
  const isActive = enrollment?.status === 'ACTIVE';

  const planName = enrollment?.plan?.name || 'Sem Matrícula Ativa';
  const planPrice = enrollment?.plan?.price ? Number(enrollment.plan.price).toFixed(2) : '0.00';

  return (
    <>
      <div className="relative w-full rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white p-5 sm:p-6 shadow-2xl border border-red-900/30 overflow-hidden group">
        {/* Background Glow */}
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-52 h-52 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shadow-md">
              <Swords className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-red-400 block">
                FIGHT SOCIETY
              </span>
              <span className="text-xs font-bold text-slate-300">
                {isBJJ ? 'Jiu Jitsu' : isThai ? 'Muay Thai' : 'Cartão de Aluno'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition transform active:scale-90"
              title="QR Code de Acesso"
            >
              <QrCode size={18} />
            </button>
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <Wifi size={18} className="rotate-90" />
            </div>
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
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {isActive ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {isActive ? 'Matrícula Ativa' : 'Inativa / Pendente'}
              </span>
            </div>
          </div>
          <div className="text-xs font-bold text-red-300 mt-1">
            {planName}
          </div>
        </div>

        {/* Card Footer */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono">
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-sans">
              Nome do Aluno
            </span>
            <span className="font-bold text-slate-200 tracking-wide">
              {user.name.toUpperCase()}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-sans">
              Status Pagamento
            </span>
            <span className={`font-bold ${isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isActive ? 'EM DIA' : 'PENDENTE'}
            </span>
          </div>
        </div>
      </div>

      {/* QR Code Modal for Dojo Turnstile */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-6 text-center shadow-2xl border border-red-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <QrCode size={26} />
            </div>
            <h3 className="text-lg font-black text-slate-900">Catraca de Entrada</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Aproxime este código do leitor da academia para liberar a sua entrada.
            </p>

            <div className="w-44 h-44 mx-auto bg-slate-900 rounded-2xl p-3 flex items-center justify-center shadow-inner">
              <div className="w-full h-full bg-white rounded-xl flex flex-col items-center justify-center p-2">
                <div className="grid grid-cols-6 gap-1 w-28 h-28 p-1">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-black'
                          : i % 4 === 0
                          ? 'bg-red-600'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 text-[11px] font-bold text-slate-400 font-mono">
              ALUNO: {user.name.toUpperCase()}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="mt-5 w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
