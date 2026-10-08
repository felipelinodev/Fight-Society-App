'use client';

import React, { useState, useEffect } from 'react';
import { User, Enrollment, Payment, CheckIn } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  X,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  Swords,
  Clock,
  AlertTriangle,
  UserCheck,
  Activity,
} from 'lucide-react';

interface StudentDetailModalProps {
  student: User;
  enrollment: Enrollment | null;
  onClose: () => void;
  onRefresh: () => void;
}

export function StudentDetailModal({ student, enrollment, onClose, onRefresh }: StudentDetailModalProps) {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'payments' | 'checkins'>('info');

  useEffect(() => {
    if (!token) return;
    setLoadingData(true);
    Promise.all([
      api.getAllPayments(token).then((all) => all.filter((p) => p.userId === student.id)).catch(() => []),
      api.getCheckIns(token, { userId: student.id }).catch(() => []),
    ])
      .then(([pays, ckins]) => {
        setPayments(pays);
        setCheckIns(ckins);
      })
      .finally(() => setLoadingData(false));
  }, [token, student.id]);

  const handleCheckIn = async () => {
    if (!token || !enrollment) return;
    setCheckingIn(true);
    try {
      await api.createCheckIn(student.id, enrollment.id, token);
      setCheckInSuccess(true);
      const updated = await api.getCheckIns(token, { userId: student.id }).catch(() => []);
      setCheckIns(updated);
      setTimeout(() => setCheckInSuccess(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Erro ao registrar check-in');
    } finally {
      setCheckingIn(false);
    }
  };

  const hasActiveEnrollment = enrollment?.status === 'ACTIVE';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] surface rounded-t-xl sm:rounded-xl border border-zinc-800 shadow-2xl overflow-hidden flex flex-col text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 pb-4 surface border-b border-zinc-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-mono font-bold text-sm shrink-0">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 pr-8">
              <h3 className="text-base font-bold text-zinc-100 truncate">{student.name}</h3>
              <p className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 truncate mt-0.5">
                <Mail size={12} className="shrink-0 text-zinc-500" />
                <span className="truncate">{student.email}</span>
              </p>
            </div>
          </div>

          {/* Quick Status Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                hasActiveEnrollment
                  ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {hasActiveEnrollment ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
              <span>{hasActiveEnrollment ? 'Matrícula Ativa' : 'Sem Matrícula'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
              <Activity size={11} className="text-zinc-400" />
              <span>{checkIns.length} {checkIns.length === 1 ? 'Presença' : 'Presenças'}</span>
            </span>
          </div>
        </div>

        {/* Detail Tabs - Segmented Control do App */}
        <div className="p-2 border-b border-zinc-800 shrink-0 bg-[#0d0d10]">
          <div className="flex p-1 surface border border-zinc-800 rounded-lg gap-1">
            {[
              { id: 'info' as const, label: 'Informações' },
              { id: 'payments' as const, label: `Pagamentos (${payments.length})` },
              { id: 'checkins' as const, label: `Presenças (${checkIns.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
                  activeDetailTab === tab.id
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loadingData ? (
            <div className="py-8 text-center text-xs font-mono text-zinc-500">Carregando dados...</div>
          ) : (
            <>
              {/* INFO TAB */}
              {activeDetailTab === 'info' && (
                <div className="space-y-4">
                  {/* Personal Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Dados Cadastrais</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Email</span>
                        <p className="text-xs font-medium text-zinc-200 truncate mt-0.5">{student.email}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Telefone</span>
                        <p className="text-xs font-medium text-zinc-200 mt-0.5">{student.phone || '—'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">CPF</span>
                        <p className="text-xs font-medium text-zinc-200 mt-0.5">{student.cpf || '—'}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase block">Registro</span>
                        <p className="text-xs font-medium text-zinc-200 mt-0.5">
                          {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">Plano Contratado</h4>
                    {enrollment ? (
                      <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <Swords size={15} className="text-red-500" />
                          <span className="text-xs font-bold text-zinc-100">
                            {enrollment.plan?.name || 'Plano Fight Society'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase">Status</span>
                            <span className={`text-xs font-mono font-bold ${hasActiveEnrollment ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {enrollment.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase">Início</span>
                            <span className="text-xs font-mono text-zinc-200">
                              {new Date(enrollment.startDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
                            <span className="text-[10px] font-mono text-zinc-500 block uppercase">Valor</span>
                            <span className="text-xs font-mono font-bold text-zinc-100">
                              R$ {Number(enrollment.plan?.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 text-center text-xs text-zinc-500">
                        Nenhuma matrícula vinculada.
                      </div>
                    )}
                  </div>

                  {/* Quick Check-In Button */}
                  {hasActiveEnrollment && (
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="w-full py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition btn-gradient text-white disabled:opacity-50 shadow-sm"
                    >
                      {checkingIn ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Registrando...</span>
                        </>
                      ) : checkInSuccess ? (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Presença Registrada com Sucesso</span>
                        </>
                      ) : (
                        <>
                          <UserCheck size={15} />
                          <span>Registrar Presença Manual</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* PAYMENTS TAB */}
              {activeDetailTab === 'payments' && (
                <div className="space-y-2">
                  {payments.length === 0 ? (
                    <div className="py-8 text-center text-xs font-mono text-zinc-500">
                      Nenhum pagamento registrado.
                    </div>
                  ) : (
                    payments.map((p) => {
                      const isPaid = p.status === 'PAID';
                      const isPending = p.status === 'PENDING';

                      return (
                        <div
                          key={p.id}
                          className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-7 h-7 rounded flex items-center justify-center border text-xs shrink-0 ${
                                isPaid
                                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                                  : isPending
                                  ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                                  : 'bg-red-950/60 text-red-400 border-red-800/60'
                              }`}
                            >
                              {isPaid ? <CheckCircle2 size={13} /> : isPending ? <Clock size={13} /> : <AlertTriangle size={13} />}
                            </div>
                            <div>
                              <h4 className="text-xs font-medium text-zinc-200">
                                {p.enrollment?.plan?.name || 'Mensalidade'}
                              </h4>
                              <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                                {p.paidAt
                                  ? new Date(p.paidAt).toLocaleDateString('pt-BR')
                                  : isPending
                                  ? 'Aguardando compensação'
                                  : 'Não concluído'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-zinc-100 block">
                              R$ {Number(p.amount).toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] font-mono uppercase ${
                                isPaid ? 'text-emerald-400' : isPending ? 'text-amber-400' : 'text-red-400'
                              }`}
                            >
                              {isPaid ? 'Liquidado' : isPending ? 'Pendente' : 'Recusado'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* CHECK-INS TAB */}
              {activeDetailTab === 'checkins' && (
                <div className="space-y-2">
                  {hasActiveEnrollment && (
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className="w-full py-2 mb-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 flex items-center justify-center gap-1.5 transition"
                    >
                      <UserCheck size={14} />
                      {checkingIn ? 'Registrando...' : checkInSuccess ? 'Presença Registrada' : 'Adicionar Presença'}
                    </button>
                  )}

                  {checkIns.length === 0 ? (
                    <div className="py-8 text-center text-xs font-mono text-zinc-500">
                      Nenhum check-in registrado.
                    </div>
                  ) : (
                    checkIns.map((ci) => (
                      <div
                        key={ci.id}
                        className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0">
                            <UserCheck size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-zinc-200">
                              {ci.enrollment?.plan?.name || 'Treino'}
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">
                              {ci.note || 'Acesso registrado'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-medium text-zinc-300 block">
                            {new Date(ci.checkedInAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {new Date(ci.checkedInAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
