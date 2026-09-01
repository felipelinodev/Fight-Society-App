'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Calendar,
  Clock,
  Swords,
  Shield,
  Zap,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  User as UserIcon,
} from 'lucide-react';

export interface ClassSchedule {
  id: string;
  art: string; // 'Jiu Jitsu (Gi)', 'Muay Thai', 'Jiu Jitsu (No-Gi)', etc.
  dayGroup: string; // 'Segunda, Quarta e Sexta', 'Terça e Quinta', 'Sábado', etc.
  level: string; // 'Iniciantes / Fundamental', 'Avançado & Sparring', 'Kids', etc.
  time: string; // '19:30 - 21:00'
  instructor?: string;
}

const DEFAULT_SCHEDULE: ClassSchedule[] = [
  {
    id: '1',
    art: 'Jiu Jitsu (Gi)',
    dayGroup: 'Segunda, Quarta e Sexta',
    level: 'Todos os Níveis',
    time: '07:00 - 08:30',
    instructor: 'Mestre Silva',
  },
  {
    id: '2',
    art: 'Jiu Jitsu Express',
    dayGroup: 'Segunda, Quarta e Sexta',
    level: 'Fundamental',
    time: '12:00 - 13:00',
    instructor: 'Prof. Rafael',
  },
  {
    id: '3',
    art: 'Muay Thai',
    dayGroup: 'Segunda, Quarta e Sexta',
    level: 'Iniciantes / Intermediário',
    time: '18:00 - 19:30',
    instructor: 'Kru Anderson',
  },
  {
    id: '4',
    art: 'Jiu Jitsu (Gi)',
    dayGroup: 'Segunda, Quarta e Sexta',
    level: 'Avançado & Sparring',
    time: '19:30 - 21:00',
    instructor: 'Mestre Silva',
  },
  {
    id: '5',
    art: 'Muay Thai Matinal',
    dayGroup: 'Terça e Quinta',
    level: 'Condicionamento & Técnica',
    time: '07:00 - 08:30',
    instructor: 'Kru Anderson',
  },
  {
    id: '6',
    art: 'Muay Thai',
    dayGroup: 'Terça e Quinta',
    level: 'Técnica & Sparring',
    time: '18:00 - 19:30',
    instructor: 'Kru Anderson',
  },
  {
    id: '7',
    art: 'Jiu Jitsu (No-Gi)',
    dayGroup: 'Terça e Quinta',
    level: 'Submission / Wrestling',
    time: '19:30 - 21:00',
    instructor: 'Prof. Rafael',
  },
  {
    id: '8',
    art: 'Open Mat (Tatame Livre)',
    dayGroup: 'Sábado',
    level: 'Todos os Membros',
    time: '10:00 - 12:00',
    instructor: 'Tatame Aberto',
  },
];

export function ScheduleSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [classes, setClasses] = useState<ClassSchedule[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);
  const [art, setArt] = useState('Jiu Jitsu (Gi)');
  const [dayGroup, setDayGroup] = useState('Segunda, Quarta e Sexta');
  const [level, setLevel] = useState('Todos os Níveis');
  const [time, setTime] = useState('19:30 - 21:00');
  const [instructor, setInstructor] = useState('');

  // Load from LocalStorage or Default
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fight_society_schedule');
      if (saved) {
        setClasses(JSON.parse(saved));
      } else {
        setClasses(DEFAULT_SCHEDULE);
      }
    } catch {
      setClasses(DEFAULT_SCHEDULE);
    }
  }, []);

  const saveToStorage = (updated: ClassSchedule[]) => {
    setClasses(updated);
    try {
      localStorage.setItem('fight_society_schedule', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setArt('Jiu Jitsu (Gi)');
    setDayGroup('Segunda, Quarta e Sexta');
    setLevel('Todos os Níveis');
    setTime('19:30 - 21:00');
    setInstructor('');
    setShowModal(true);
  };

  const openEditModal = (item: ClassSchedule) => {
    setEditingClass(item);
    setArt(item.art);
    setDayGroup(item.dayGroup);
    setLevel(item.level);
    setTime(item.time);
    setInstructor(item.instructor || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      const updated = classes.map((c) =>
        c.id === editingClass.id
          ? { ...c, art, dayGroup, level, time, instructor }
          : c,
      );
      saveToStorage(updated);
    } else {
      const newClass: ClassSchedule = {
        id: String(Date.now()),
        art,
        dayGroup,
        level,
        time,
        instructor,
      };
      saveToStorage([...classes, newClass]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta aula da grade?')) {
      const updated = classes.filter((c) => c.id !== id);
      saveToStorage(updated);
    }
  };

  // Group classes by dayGroup
  const uniqueDayGroups = Array.from(new Set(classes.map((c) => c.dayGroup)));

  const getArtIcon = (artName: string) => {
    if (artName.includes('Muay Thai')) return Swords;
    if (artName.includes('No-Gi')) return Zap;
    if (artName.includes('Open Mat')) return Sparkles;
    return Shield;
  };

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
            {isAdmin
              ? 'Gerenciamento de turmas e horários de treino'
              : 'Horários das aulas de Jiu Jitsu e Muay Thai'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="py-2 px-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition transform active:scale-95"
          >
            <Plus size={15} />
            <span>Nova Aula</span>
          </button>
        )}
      </div>

      {/* Schedule Grouped by Days */}
      <div className="space-y-4">
        {uniqueDayGroups.length === 0 ? (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center text-xs font-semibold text-slate-500">
            Nenhum horário cadastrado.
          </div>
        ) : (
          uniqueDayGroups.map((dayGroupTitle) => {
            const dayClasses = classes.filter((c) => c.dayGroup === dayGroupTitle);

            return (
              <div
                key={dayGroupTitle}
                className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-black text-red-600 uppercase tracking-wider">
                  <Clock size={14} />
                  <span>{dayGroupTitle}</span>
                </div>

                <div className="space-y-2">
                  {dayClasses.map((cls) => {
                    const Icon = getArtIcon(cls.art);

                    return (
                      <div
                        key={cls.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 hover:bg-red-50/40 hover:border-red-100 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white text-red-600 flex items-center justify-center shadow-xs shrink-0">
                            <Icon size={17} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 truncate">
                              {cls.art}
                            </h4>
                            <p className="text-[10px] font-medium text-slate-500 truncate">
                              {cls.level} {cls.instructor ? `• ${cls.instructor}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                            {cls.time}
                          </span>

                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditModal(cls)}
                                className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                                title="Editar Horário"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDelete(cls.id)}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                                title="Excluir Horário"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admin Create / Edit Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {editingClass ? 'Editar Horário' : 'Cadastrar Nova Aula'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Defina a modalidade, dias da semana, horário e professor responsável.
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Modalidade / Arte Marcial
                </label>
                <select
                  value={art}
                  onChange={(e) => setArt(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                >
                  <option value="Jiu Jitsu (Gi)">Jiu Jitsu (Com Kimono)</option>
                  <option value="Jiu Jitsu (No-Gi)">Jiu Jitsu (No-Gi / Sem Kimono)</option>
                  <option value="Jiu Jitsu Kids">Jiu Jitsu Kids / Infantil</option>
                  <option value="Muay Thai">Muay Thai Tradicional</option>
                  <option value="Muay Thai Matinal">Muay Thai Matinal</option>
                  <option value="Muay Thai Feminino">Muay Thai Feminino</option>
                  <option value="Open Mat (Tatame Livre)">Open Mat (Tatame Livre)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Dias da Semana
                </label>
                <select
                  value={dayGroup}
                  onChange={(e) => setDayGroup(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                >
                  <option value="Segunda, Quarta e Sexta">Segunda, Quarta e Sexta</option>
                  <option value="Terça e Quinta">Terça e Quinta</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Segunda a Sexta (Diário)">Segunda a Sexta (Diário)</option>
                  <option value="Domingo">Domingo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Horário (Início - Fim)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 19:30 - 21:00"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Nível / Turma
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Todos os Níveis"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Professor / Instrutor (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Mestre Silva"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition"
                >
                  Salvar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
