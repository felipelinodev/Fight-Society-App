'use client';

import React from 'react';
import { Calendar, Clock, Swords, Shield, Zap, Sparkles } from 'lucide-react';

export function ScheduleSection() {
  const schedule = [
    {
      day: 'Segunda, Quarta e Sexta',
      classes: [
        { time: '07:00 - 08:30', art: 'Jiu Jitsu (Gi)', level: 'Todos os Níveis', icon: Shield },
        { time: '12:00 - 13:00', art: 'Jiu Jitsu Express', level: 'Fundamental', icon: Shield },
        { time: '18:00 - 19:30', art: 'Muay Thai', level: 'Iniciantes / Intermediário', icon: Swords },
        { time: '19:30 - 21:00', art: 'Jiu Jitsu (Gi)', level: 'Avançado & Sparring', icon: Shield },
      ],
    },
    {
      day: 'Terça e Quinta',
      classes: [
        { time: '07:00 - 08:30', art: 'Muay Thai Matinal', level: 'Condicionamento', icon: Swords },
        { time: '18:00 - 19:30', art: 'Muay Thai', level: 'Técnica & Sparring', icon: Swords },
        { time: '19:30 - 21:00', art: 'Jiu Jitsu (No-Gi / Sem Kimono)', level: 'Submission / Wrestling', icon: Zap },
      ],
    },
    {
      day: 'Sábado',
      classes: [
        { time: '10:00 - 12:00', art: 'Open Mat (Tatame Livre)', level: 'Todos os Membros', icon: Sparkles },
      ],
    },
  ];

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Grade de Horários & Aulas</span>
            <Calendar className="w-5 h-5 text-red-600" />
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Horários das aulas de Jiu Jitsu e Muay Thai no tatame
          </p>
        </div>
      </div>

      {/* Schedule Days List */}
      <div className="space-y-4">
        {schedule.map((group, idx) => (
          <div key={idx} className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-red-600 uppercase tracking-wider">
              <Clock size={14} />
              <span>{group.day}</span>
            </div>

            <div className="space-y-2">
              {group.classes.map((cls, cIdx) => {
                const Icon = cls.icon;
                return (
                  <div
                    key={cIdx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-red-50/50 hover:border-red-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white text-red-600 flex items-center justify-center shadow-xs">
                        <Icon size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{cls.art}</h4>
                        <span className="text-[10px] font-medium text-slate-500">{cls.level}</span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      {cls.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
