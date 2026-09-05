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

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 pb-4 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white/80 hover:text-white"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-600 text-white flex items-center justify-center font-black text-lg shadow-lg">
              {student.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-black truncate">{student.name}</h3>
              <p className="text-xs text-white/70 flex items-center gap-1.5 truncate">
                <Mail size={12} />
                {student.email}
              </p>
            </div>
          </div>

          {/* Quick Status Badges */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                hasActiveEnrollment
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                  : 'bg-white/10 text-white/60 border border-white/10'
              }`}
            >
              {hasActiveEnrollment ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              {hasActiveEnrollment ? 'Matrícula Ativa' : 'Sem Matrícula'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Activity size={12} />
              {checkIns.length} Check-ins
            </span>
          </div>
        </div>

        {/* Detail Tabs */}
        <div className="flex border-b border-slate-200 shrink-0">
          {[
            { id: 'info' as const, label: 'Informações' },
            { id: 'payments' as const, label: `Pagamentos (${payments.length})` },
            { id: 'checkins' as const, label: `Presenças (${checkIns.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDetailTab(tab.id)}
              className={`flex-1 py-3 text-xs font-bold transition-all ${
                activeDetailTab === tab.id
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loadingData ? (
            <div className="py-8 text-center text-xs font-bold text-slate-400">Carregando dados...</div>
          ) : (
            <>
              {/* INFO TAB */}
              {activeDetailTab === 'info' && (
                <div className="space-y-4">
                  {/* Personal Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Dados Pessoais</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Email</span>
                        <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{student.email}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Telefone</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{student.phone || '—'}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">CPF</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{student.cpf || '—'}</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Cadastro</span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Enrollment Info */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Matrícula</h4>
                    {enrollment ? (
                      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                        <div className="flex items-center gap-2">
                          <Swords size={16} className="text-red-600" />
                          <span className="text-sm font-black text-slate-900">
                            {enrollment.plan?.name || 'Plano desconhecido'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-500 font-bold block">Status</span>
                            <span className={`text-xs font-black ${hasActiveEnrollment ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {enrollment.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-500 font-bold block">Início</span>
                            <span className="text-xs font-black text-slate-900">
                              {new Date(enrollment.startDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50">
                            <span className="text-[10px] text-slate-500 font-bold block">Valor</span>
                            <span className="text-xs font-black text-slate-900">
                              R$ {Number(enrollment.plan?.price || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
                        Nenhuma matrícula encontrada
                      </div>
                    )}
                  </div>

                  {/* Quick Check-In Button */}
                  {hasActiveEnrollment && (
                    <button
                      onClick={handleCheckIn}
                      disabled={checkingIn}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                        checkInSuccess
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:from-red-500 hover:to-rose-500'
                      }`}
                    >
                      {checkingIn ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Registrando...
                        </>
                      ) : checkInSuccess ? (
                        <>
                          <CheckCircle2 size={18} />
                          Check-in Registrado! ✓
                        </>
                      ) : (
                        <>
                          <UserCheck size={18} />
                          Registrar Check-in
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
                    <div className="py-8 text-center text-xs font-medium text-slate-500">
                      Nenhum pagamento encontrado
                    </div>
                  ) : (
                    payments.map((p) => {
                      const isPaid = p.status === 'PAID';
                      const isPending = p.status === 'PENDING';

                      return (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : isPending
                                  ? 'bg-amber-50 text-amber-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {isPaid ? <CheckCircle2 size={16} /> : isPending ? <Clock size={16} /> : <AlertTriangle size={16} />}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">
                                {p.enrollment?.plan?.name || 'Pagamento'}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {p.paidAt
                                  ? new Date(p.paidAt).toLocaleDateString('pt-BR')
                                  : isPending
                                  ? 'Aguardando'
                                  : 'Não Concluído'}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900 block">
                              R$ {Number(p.amount).toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                isPaid ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-rose-600'
                              }`}
                            >
                              {isPaid ? 'Pago' : isPending ? 'Pendente' : 'Recusado'}
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
                      className="w-full py-3 mb-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <UserCheck size={15} />
                      {checkingIn ? 'Registrando...' : checkInSuccess ? 'Check-in Registrado! ✓' : 'Novo Check-in'}
                    </button>
                  )}

                  {checkIns.length === 0 ? (
                    <div className="py-8 text-center text-xs font-medium text-slate-500">
                      Nenhum check-in registrado
                    </div>
                  ) : (
                    checkIns.map((ci) => (
                      <div
                        key={ci.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <UserCheck size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {ci.enrollment?.plan?.name || 'Treino'}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {ci.note || 'Check-in registrado'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 block">
                            {new Date(ci.checkedInAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[10px] text-slate-500">
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
