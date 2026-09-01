'use client';

import React, { useState, useEffect } from 'react';
import { Payment } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { CreditCard, CheckCircle2, Clock, XCircle, Search, DollarSign, ArrowDownLeft, ShieldCheck } from 'lucide-react';

export function PaymentsHistory() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED'>('ALL');

  const loadPayments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = isAdmin ? await api.getAllPayments(token) : await api.getMyPayments(token);
      setPayments(data || []);
    } catch (e) {
      console.error('Erro ao carregar pagamentos', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [token, isAdmin]);

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === 'PENDING')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filteredPayments = payments.filter((p) => {
    if (filter !== 'ALL' && p.status !== filter) return false;
    const term = search.toLowerCase();
    const planName = p.enrollment?.plan?.name?.toLowerCase() || '';
    return planName.includes(term);
  });

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isAdmin ? 'Financeiro da Academia' : 'Meus Pagamentos'}</span>
            <CreditCard className="w-5 h-5 text-red-600" />
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {isAdmin
              ? 'Histórico geral de todas as cobranças da academia'
              : 'Histórico dos seus pagamentos e mensalidades'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Recebido</span>
            <CheckCircle2 size={15} className="text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            R$ {totalPaid.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Pagamentos aprovados</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Pendente</span>
            <Clock size={15} className="text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-500">
            R$ {totalPending.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Aguardando confirmação</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1.5 bg-slate-200/80 rounded-2xl gap-1">
        {[
          { id: 'ALL', label: `Todos (${payments.length})` },
          { id: 'PAID', label: 'Pagos' },
          { id: 'PENDING', label: 'Pendentes' },
          { id: 'FAILED', label: 'Falhou' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              filter === tab.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            Carregando pagamentos...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-500 bg-white rounded-2xl border border-slate-200">
            Nenhum pagamento registrado neste filtro.
          </div>
        ) : (
          filteredPayments.map((p) => {
            const isPaid = p.status === 'PAID';
            const isPending = p.status === 'PENDING';

            return (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-red-200 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-600'
                        : isPending
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isPaid ? <CheckCircle2 size={20} /> : isPending ? <Clock size={20} /> : <XCircle size={20} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">
                      {p.enrollment?.plan?.name || 'Mensalidade'}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 block">
                    R$ {Number(p.amount).toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      isPaid ? 'text-emerald-600' : isPending ? 'text-amber-600' : 'text-rose-600'
                    }`}
                  >
                    {isPaid ? 'Confirmado' : isPending ? 'Pendente' : 'Recusado'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
