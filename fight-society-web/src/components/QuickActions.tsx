'use client';

import React from 'react';
import { CreditCard, Shield, QrCode, TrendingUp, Calendar, Zap } from 'lucide-react';

interface QuickActionsProps {
  onPayClick: () => void;
  onPlansClick: () => void;
  onStatsClick: () => void;
  onCheckinClick: () => void;
}

export function QuickActions({
  onPayClick,
  onPlansClick,
  onStatsClick,
  onCheckinClick,
}: QuickActionsProps) {
  const actions = [
    {
      label: 'Pagar',
      icon: CreditCard,
      onClick: onPayClick,
      highlight: true,
    },
    {
      label: 'Planos',
      icon: Shield,
      onClick: onPlansClick,
      highlight: false,
    },
    {
      label: 'Check-in',
      icon: QrCode,
      onClick: onCheckinClick,
      highlight: false,
    },
    {
      label: 'Estatísticas',
      icon: TrendingUp,
      onClick: onStatsClick,
      highlight: false,
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 group transition transform active:scale-95"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center transition-all duration-300 ${
                  action.highlight
                    ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 group-hover:scale-105'
                    : 'bg-white text-slate-700 border border-slate-200/80 shadow-sm group-hover:border-red-200 group-hover:bg-red-50/50 group-hover:text-red-600'
                }`}
              >
                <Icon size={22} className={action.highlight ? 'stroke-[2.5]' : 'stroke-2'} />
              </div>
              <span className="text-xs font-bold text-slate-700 group-hover:text-red-600 transition">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
