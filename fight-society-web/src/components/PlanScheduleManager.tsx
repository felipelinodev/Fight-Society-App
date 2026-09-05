'use client';

import React, { useState } from 'react';
import { Plan, PlanSchedule } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  UserCheck,
  X,
} from 'lucide-react';

interface PlanScheduleManagerProps {
  plan: Plan;
  onUpdate: () => void;
  isDark?: boolean;
}

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DAY_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function PlanScheduleManager({ plan, onUpdate, isDark = false }: PlanScheduleManagerProps) {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const schedules = plan.schedules || [];

  const [showAddForm, setShowAddForm] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1); // Segunda
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');
  const [instructor, setInstructor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await api.createPlanSchedule(
        plan.id,
        { dayOfWeek, startTime, endTime, instructor: instructor || undefined },
        token,
      );
      setShowAddForm(false);
      setInstructor('');
      onUpdate();
    } catch (err: any) {
      alert(err?.message || 'Erro ao adicionar horário');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    setDeletingId(id);
    try {
      await api.deletePlanSchedule(id, token);
      onUpdate();
    } catch (err: any) {
      alert(err?.message || 'Erro ao remover horário');
    } finally {
      setDeletingId(null);
    }
  };

  // Group schedules by day
  const groupedByDay: Record<number, PlanSchedule[]> = {};
  schedules.forEach((s) => {
    if (!groupedByDay[s.dayOfWeek]) groupedByDay[s.dayOfWeek] = [];
    groupedByDay[s.dayOfWeek].push(s);
  });

  if (schedules.length === 0 && !isAdmin) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4
          className={`text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5 ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          <Calendar size={13} className="text-red-500" />
          Horários de Treino
        </h4>
        {isAdmin && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className={`p-1 rounded-lg transition ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
            title="Adicionar horário"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {schedules.length === 0 && (
        <p className={`text-[11px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Nenhum horário cadastrado
        </p>
      )}

      {/* Schedule List grouped by day */}
      {Object.keys(groupedByDay)
        .map(Number)
        .sort((a, b) => a - b)
        .map((day) => (
          <div key={day} className="space-y-1">
            <span
              className={`text-[10px] font-black uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              {DAY_NAMES[day]}
            </span>
            {groupedByDay[day].map((s) => (
              <div
                key={s.id}
                className={`flex items-center justify-between p-2 rounded-xl border ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700/80'
                    : 'bg-slate-50 border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-red-500 shrink-0" />
                  <span
                    className={`text-[11px] font-bold ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {s.startTime} — {s.endTime}
                  </span>
                  {s.instructor && (
                    <span
                      className={`text-[10px] flex items-center gap-1 ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <UserCheck size={10} />
                      {s.instructor}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(s.id);
                    }}
                    disabled={deletingId === s.id}
                    className={`p-1 rounded-lg transition ${
                      isDark
                        ? 'text-slate-400 hover:text-rose-400 hover:bg-white/10'
                        : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                    }`}
                    title="Remover"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ))}

      {/* Add Schedule Form */}
      {showAddForm && isAdmin && (
        <form
          onSubmit={handleAdd}
          className="p-3 rounded-2xl bg-white border border-red-200/60 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800">Novo Horário</span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Dia</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {DAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Início</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Fim</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Instrutor (opcional)</label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Nome do instrutor"
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-bold shadow-md transition-all active:scale-[0.98]"
          >
            {submitting ? 'Salvando...' : 'Adicionar Horário'}
          </button>
        </form>
      )}
    </div>
  );
}
