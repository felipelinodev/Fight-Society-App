'use client';

import React, { useState } from 'react';
import { TrendingUp, Flame, Award, Zap, Calendar, Target, Shield } from 'lucide-react';

export function StatsSection() {
  const [period, setPeriod] = useState<'today' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const daysData = [
    { label: 'SEG', heightTop: 65, heightBottom: 35, count: 2 },
    { label: 'TER', heightTop: 80, heightBottom: 20, count: 2 },
    { label: 'QUA', heightTop: 45, heightBottom: 55, count: 1 },
    { label: 'QUI', heightTop: 90, heightBottom: 10, count: 2 },
    { label: 'SEX', heightTop: 70, heightBottom: 30, count: 2 },
    { label: 'SÁB', heightTop: 100, heightBottom: 0, count: 3 },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Estatísticas & Evolução</span>
            <TrendingUp className="w-5 h-5 text-red-600" />
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhe seu ritmo de treino e assiduidade no dojô
          </p>
        </div>
      </div>

      {/* Period Filter Tabs (Matching Screen 3 top pills) */}
      <div className="flex p-1.5 bg-slate-200/80 rounded-2xl gap-1">
        {[
          { id: 'today', label: 'Hoje' },
          { id: 'weekly', label: 'Semana' },
          { id: 'monthly', label: 'Mês' },
          { id: 'yearly', label: 'Ano' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPeriod(tab.id as any)}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              period === tab.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2 Top Metric Cards Grid (Matching Screen 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card 1: Red Bright Card (Matching Lime Card in Screen 3) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-rose-600 text-white shadow-lg shadow-red-500/20 relative overflow-hidden flex flex-col justify-between min-h-[190px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 text-white text-[11px] font-bold">
              <Flame size={13} className="text-amber-300 fill-amber-300" />
              <span>Assiduidade</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
              ...
            </div>
          </div>

          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              +24%
            </div>
            <p className="text-xs text-white/85 font-medium mt-1 leading-snug">
              Sua presença neste mês aumentou 24% em relação ao mês anterior.
            </p>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-bold text-white/90 mb-1">
              <span>Meta Mensal</span>
              <span>18 / 24 Treinos</span>
            </div>
            <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Dark Obsidian Card with Radar Attribute Polygon (Matching Dark Card in Screen 3) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-lg border border-slate-800/80 flex flex-col justify-between min-h-[190px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-red-400 text-[11px] font-bold">
              <Award size={13} />
              <span>Desempenho</span>
            </div>
            <span className="text-xs font-black text-amber-400">Nível 4</span>
          </div>

          {/* Radar Polygon Visualization */}
          <div className="relative py-2 flex items-center justify-center">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              {/* Outer polygon grid */}
              <polygon points="50,5 95,35 80,90 20,90 5,35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <polygon points="50,25 75,45 65,75 35,75 25,45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              
              {/* Inner active attribute shape */}
              <polygon
                points="50,15 88,38 72,82 25,82 12,38"
                fill="rgba(230, 57, 70, 0.35)"
                stroke="#FF2E4D"
                strokeWidth="2"
              />
              
              {/* Attribute labels */}
              <circle cx="50" cy="15" r="2.5" fill="#FFF" />
              <circle cx="88" cy="38" r="2.5" fill="#FFF" />
              <circle cx="72" cy="82" r="2.5" fill="#FFF" />
              <circle cx="25" cy="82" r="2.5" fill="#FFF" />
              <circle cx="12" cy="38" r="2.5" fill="#FFF" />
            </svg>
          </div>

          <div className="flex items-center justify-around text-[10px] font-bold text-slate-400 pt-1 border-t border-white/10">
            <span className="text-red-400">🥋 Gi: 10</span>
            <span className="text-amber-400">🥊 Thai: 6</span>
            <span className="text-emerald-400">⚡ No-Gi: 2</span>
          </div>
        </div>
      </div>

      {/* Frequency Bar Chart Overview (Matching Screen 3 bottom bars) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Frequência Semanal
            </span>
            <div className="text-2xl font-black text-slate-900">
              12 Horas <span className="text-xs font-semibold text-slate-400">de tatame</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Jiu Jitsu</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <span>Muay Thai</span>
            </div>
          </div>
        </div>

        {/* Vertical Bars */}
        <div className="flex items-end justify-between h-44 pt-4 px-2">
          {daysData.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 flex-1 max-w-[36px]">
              <div className="w-full flex flex-col justify-end gap-1 h-32">
                {/* Top Bar (Jiu Jitsu - Red) */}
                <div
                  className="w-full bg-red-600 rounded-md transition-all duration-700 hover:bg-red-500 shadow-sm"
                  style={{ height: `${day.heightTop}%` }}
                />
                {/* Bottom Bar (Muay Thai - Dark) */}
                {day.heightBottom > 0 && (
                  <div
                    className="w-full bg-slate-900 rounded-md transition-all duration-700 hover:bg-slate-800"
                    style={{ height: `${day.heightBottom}%` }}
                  />
                )}
              </div>
              <span className="text-[11px] font-black text-slate-600">
                {day.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
