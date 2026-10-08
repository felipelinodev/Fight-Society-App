'use client';

import React, { useState } from 'react';
import { Plan, PlanSchedule } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  Clock,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
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

function getDurationLabel(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = eh * 60 + em - (sh * 60 + sm);
  if (!Number.isFinite(diff) || diff <= 0) return null;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return m + " min";
  return m === 0 ? h + "h" : h + "h" + String(m).padStart(2, "0");
}

export function PlanScheduleManager({ plan, onUpdate, isDark = false }: PlanScheduleManagerProps) {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const schedules = plan.schedules || [];

  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(1); // Segunda
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');
  const [instructor, setInstructor] = useState('');
  const [note, setNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setDayOfWeek(1);
    setStartTime('19:00');
    setEndTime('20:30');
    setInstructor('');
    setNote('');
  };

  const openEdit = (s: PlanSchedule) => {
    setEditingId(s.id);
    setDayOfWeek(s.dayOfWeek);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setInstructor(s.instructor || '');
    setNote(s.note || '');
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await api.updatePlanSchedule(
          editingId,
          { dayOfWeek, startTime, endTime, instructor: instructor.trim(), note: note.trim() },
          token,
        );
      } else {
        await api.createPlanSchedule(
          plan.id,
          {
            dayOfWeek,
            startTime,
            endTime,
            instructor: instructor.trim() || undefined,
            note: note.trim() || undefined,
          },
          token,
        );
      }
      resetForm();
      onUpdate();
    } catch (err: any) {
      alert(err?.message || 'Erro ao salvar horário');
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

  const sorted = [...schedules].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime),
  );

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex items-center gap-2 p-1.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex-1 min-w-0 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left hover:bg-zinc-800/50 transition"
        >
          <Calendar size={14} className="text-zinc-500 shrink-0" />
          <span className="min-w-0">
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Horários de treino
            </span>
            {!open && sorted.length > 0 && (
              <span className="block mt-0.5 text-[11px] text-zinc-500 truncate">
                {[...new Set(sorted.map((s) => DAY_SHORT[s.dayOfWeek]))].join(" · ")}
              </span>
            )}
          </span>
          <ChevronDown
            size={16}
            className={`ml-auto shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {isAdmin && !showAddForm && (
          <button
            onClick={() => {
              resetForm();
              setOpen(true);
              setShowAddForm(true);
            }}
            className="shrink-0 py-1.5 px-2.5 rounded-md bg-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-700 border border-zinc-700 text-[11px] font-medium flex items-center gap-1 transition"
            title="Adicionar horário"
          >
            <Plus size={12} />
            Adicionar
          </button>
        )}
      </div>

      {open && (
        <div className="px-3.5 pb-3.5 pt-1">
      {sorted.length === 0 && (
        <p className="text-xs text-zinc-500">Nenhum horário cadastrado</p>
      )}

      <div className="space-y-3">
        {sorted.map((s) => {
          const duration = getDurationLabel(s.startTime, s.endTime);
          return (
            <div
              key={s.id}
              className="group flex overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 transition"
            >
              <div className="w-16 shrink-0 flex items-center justify-center bg-red-500/10 border-r border-red-500/20 py-3">
                <span className="text-base font-bold leading-none tracking-wide text-red-400 uppercase">
                  {DAY_SHORT[s.dayOfWeek]}
                </span>
              </div>

              <div className="flex-1 min-w-0 p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-tight text-white tabular-nums">
                      {s.startTime}
                      <span className="mx-1.5 font-normal text-zinc-600">→</span>
                      {s.endTime}
                    </p>
                    {duration && (
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
                        <Clock size={11} />
                        {duration} de aula
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center shrink-0 -mt-1 -mr-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(s);
                        }}
                        className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(s.id);
                        }}
                        disabled={deletingId === s.id}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {(s.instructor || s.note) && (
                  <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-zinc-800">
                    {s.instructor && (
                      <span className="flex items-center gap-1.5 rounded-full bg-zinc-800/80 py-0.5 pl-0.5 pr-2.5 text-xs text-zinc-300">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-bold uppercase text-white">
                          {s.instructor.trim().charAt(0)}
                        </span>
                        {s.instructor}
                      </span>
                    )}
                    {s.note && (
                      <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 text-[11px] font-semibold text-amber-300 whitespace-pre-line break-words">
                        {s.note}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Schedule Form */}
      {showAddForm && isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">{editingId ? 'Editar Horário' : 'Novo Horário'}</span>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-zinc-400 mb-1">Dia</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full py-1.5 px-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              >
                {DAY_NAMES.map((name, i) => (
                  <option key={i} value={i}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-400 mb-1">Início</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full py-1.5 px-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-zinc-400 mb-1">Fim</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full py-1.5 px-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-zinc-400 mb-1">Instrutor (opcional)</label>
            <input
              type="text"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="Nome do instrutor"
              className="w-full py-1.5 px-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-red-500 placeholder:text-zinc-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-zinc-400 mb-1">Observação (opcional)</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              placeholder="Ex: Aula de No-Gi, traga protetor bucal"
              className="w-full py-1.5 px-2 bg-zinc-950 border border-zinc-800 rounded-md text-xs text-zinc-200 focus:outline-none focus:border-red-500 placeholder:text-zinc-600 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition"
          >
            {submitting ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Adicionar Horário'}
          </button>
        </form>
      )}
        </div>
      )}
    </section>
  );
}
