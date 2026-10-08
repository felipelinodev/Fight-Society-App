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
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block">
            CONCILIAÇÃO & RECEBÍVEIS
          </span>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
            <span>{isAdmin ? 'Módulo Financeiro' : 'Histórico de Faturamento'}</span>
            <CreditCard className="w-4 h-4 text-red-500" />
          </h2>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>RECEITA CONFIRMADA</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">
            R$ {totalPaid.toFixed(2)}
          </div>
          <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">Liquidado via Gateway</span>
        </div>

        <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>A COMPENSAR</span>
            <Clock size={14} className="text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">
            R$ {totalPending.toFixed(2)}
          </div>
          <span className="text-[10px] font-mono text-amber-400 block mt-0.5">Cobranças em aberto</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-[#121215] border border-zinc-800 rounded-lg gap-1">
        {[
          { id: 'ALL', label: `Todos (${payments.length})` },
          { id: 'PAID', label: 'Liquidados' },
          { id: 'PENDING', label: 'Pendentes' },
          { id: 'FAILED', label: 'Cancelados' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
              filter === tab.id
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500">
            Carregando transações financeiras...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 bg-[#121215] rounded-xl border border-zinc-800">
            Nenhum registro localizado para o filtro selecionado.
          </div>
        ) : (
          filteredPayments.map((p) => {
            const isPaid = p.status === 'PAID';
            const isPending = p.status === 'PENDING';

            return (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-between gap-3 hover:border-zinc-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center border ${
                      isPaid
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                        : isPending
                        ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                        : 'bg-red-950/60 text-red-400 border-red-800/60'
                    }`}
                  >
                    {isPaid ? <CheckCircle2 size={16} /> : isPending ? <Clock size={16} /> : <XCircle size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">
                      {p.enrollment?.plan?.name || 'Mensalidade Fight Society'}
                    </h4>
                    <p className="text-[10px] font-mono text-zinc-500">
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
    </div>
  );
}
