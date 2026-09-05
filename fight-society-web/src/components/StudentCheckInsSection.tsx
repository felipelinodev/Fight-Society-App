'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Swords,
  Activity,
  Flame,
  Shield,
  Zap,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { CheckIn, Enrollment } from '@/types/api';

export function StudentCheckInsSection() {
  const { user, token } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [activeEnrollment, setActiveEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      api.getMyCheckIns(token).catch(() => []),
      api.getMyEnrollments(token).catch(() => []),
    ])
      .then(([ckins, enrollments]) => {
        setCheckIns(ckins || []);
        const active = (enrollments || []).find((e: Enrollment) => e.status === 'ACTIVE');
        setActiveEnrollment(active || null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Calculations for statistics
  const totalPresencas = checkIns.length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const presencasEsteMes = checkIns.filter((ci) => {
    const d = new Date(ci.checkedInAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-red-600">
            Frequência & Presença
          </p>
          <h2 className="text-2xl font-black text-slate-900">Meus Check-ins</h2>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 shadow-xs border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Aluno</span>
        </div>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Total Check-ins */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white shadow-md border border-red-900/30">
          <div className="w-8 h-8 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center mb-2">
            <Flame size={16} />
          </div>
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
            Total de Treinos
          </span>
          <div className="text-2xl font-black mt-0.5">
            {loading ? '—' : totalPresencas}
          </div>
          <span className="text-[10px] text-red-400 font-semibold mt-1 block">
            Presenças acumuladas
          </span>
        </div>

        {/* This Month */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Activity size={16} />
          </div>
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
            Neste Mês
          </span>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {loading ? '—' : presencasEsteMes}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
            {presencasEsteMes === 1 ? '1 treino realizado' : `${presencasEsteMes} treinos realizados`}
          </span>
        </div>

        {/* Enrollment Status */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Shield size={16} />
          </div>
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
            Matrícula
          </span>
          <div className="text-sm font-black text-slate-900 mt-1 truncate">
            {activeEnrollment ? activeEnrollment.plan?.name || 'Ativa' : 'Sem Matrícula'}
          </div>
          <span
            className={`text-[10px] font-bold mt-1 inline-flex items-center gap-1 ${
              activeEnrollment ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeEnrollment ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            {activeEnrollment ? 'Liberado para treinar' : 'Matricule-se para treinar'}
          </span>
        </div>
      </div>

      {/* Info notice about read-only policy */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800">
          <p className="font-bold">Como funciona o Check-in?</p>
          <p className="text-[11px] text-amber-700/90 mt-0.5 leading-relaxed">
            Sua presença é validada e registrada pelo professor ou pela recepção na chegada à academia.
            Esta tela lista todo o seu histórico de treinos confirmados.
          </p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck size={16} className="text-red-600" />
            <span>Histórico de Presenças</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {checkIns.length} {checkIns.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400 bg-white rounded-3xl border border-slate-200/80">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Carregando seus check-ins...
          </div>
        ) : checkIns.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <CalendarCheck size={26} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">
                Nenhum check-in registrado ainda
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Assim que você comparecer aos treinos e seu professor registrar sua presença, ela aparecerá aqui!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {checkIns.map((ci, index) => {
              const date = new Date(ci.checkedInAt);

              return (
                <div
                  key={ci.id}
                  className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-red-200 hover:shadow-md transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {ci.enrollment?.plan?.name || 'Treino Fight Society'}
                        </h4>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-wider">
                            Último
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate">{ci.note || 'Presença confirmada pelo professor'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="text-right shrink-0 pl-2">
                    <span className="text-xs font-black text-slate-900 block">
                      {date.toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                      <Clock size={10} />
                      {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
