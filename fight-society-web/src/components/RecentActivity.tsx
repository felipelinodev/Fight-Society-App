'use client';

import React from 'react';
import { Payment } from '@/types/api';
import { Shield, Zap, CheckCircle2, CreditCard, ChevronRight, Award } from 'lucide-react';

interface RecentActivityProps {
  payments: Payment[];
  onViewAll?: () => void;
}

export function RecentActivity({ payments, onViewAll }: RecentActivityProps) {
  const dummyActivities = [
    {
      id: 'act-1',
      title: 'Treino de Jiu Jitsu (Gi)',
      category: 'Presença Confirmada',
      date: 'Hoje, 19:30',
      icon: Shield,
      amount: '+150 XP',
      isPositive: true,
      color: 'bg-red-50 text-red-600',
    },
    {
      id: 'act-2',
      title: 'Treino de Muay Thai',
      category: 'Sparring & Manopla',
      date: 'Ontem, 18:00',
      icon: Zap,
      amount: '+120 XP',
      isPositive: true,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'act-3',
      title: 'Graduação de Grau',
      category: 'Faixa Azul • 2º Grau',
      date: 'Sábado passado',
      icon: Award,
      amount: 'Conquistado',
      isPositive: true,
      color: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          Atividades Recentes
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5 hover:underline"
        >
          <span>Ver todas</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {/* Real Payments from Stripe if available */}
        {payments && payments.length > 0 && payments.slice(0, 2).map((payment) => {
          const isPaid = payment.status === 'PAID';
          const isPending = payment.status === 'PENDING';
          return (
            <div
              key={payment.id}
              className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-red-200 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                    isPaid
                      ? 'bg-emerald-50 text-emerald-600'
                      : isPending
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {payment.enrollment?.plan?.name || 'Mensalidade Stripe'}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500">
                    {payment.paidAt
                      ? new Date(payment.paidAt).toLocaleDateString('pt-BR')
                      : isPending
                      ? 'Aguardando Pagamento'
                      : 'Pendente'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-900 block">
                  -R$ {Number(payment.amount).toFixed(2)}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isPaid
                      ? 'text-emerald-600'
                      : isPending
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {isPaid ? 'Pago ✅' : isPending ? 'Pendente ⏳' : 'Recusado ❌'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Regular Activity feed */}
        {dummyActivities.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-red-200 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] font-medium text-slate-500">{item.category} • {item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-red-600 block">
                  {item.amount}
                </span>
                <span className="text-[10px] font-medium text-slate-400">Dojô</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
