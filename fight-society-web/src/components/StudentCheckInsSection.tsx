'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, CalendarCheck, Clock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { CheckIn, Enrollment } from '@/types/api';

export function StudentCheckInsSection() {
  const { token } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      api.getMyCheckIns(token).catch(() => []),
      api.getMyEnrollments(token).catch(() => []),
    ])
      .then(([ckins, userEnrollments]) => {
        setCheckIns(ckins || []);
        setEnrollments(userEnrollments || []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Extract unique enrollment filters with check-in counts
  const enrollmentMap = new Map<string, { id: string; name: string; count: number }>();

  checkIns.forEach((ci) => {
    const eId = ci.enrollmentId || 'other';
    const name = ci.enrollment?.plan?.name || 'Matrícula';
    if (!enrollmentMap.has(eId)) {
      enrollmentMap.set(eId, { id: eId, name, count: 0 });
    }
    enrollmentMap.get(eId)!.count += 1;
  });

  enrollments.forEach((e) => {
    if (!enrollmentMap.has(e.id)) {
      enrollmentMap.set(e.id, {
        id: e.id,
        name: e.plan?.name || 'Matrícula',
        count: 0,
      });
    }
  });

  const filterOptions = Array.from(enrollmentMap.values());

  const filteredCheckIns =
    selectedEnrollmentId === 'ALL'
      ? checkIns
      : checkIns.filter((ci) => ci.enrollmentId === selectedEnrollmentId);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 block">
            REGISTRO DE ACESSO
          </span>
          <h2 className="text-lg font-bold text-zinc-100 mt-0.5">Histórico de Presenças</h2>
        </div>
        <span className="px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-[#121215] text-zinc-300 border border-zinc-800">
          {checkIns.length} {checkIns.length === 1 ? 'REGISTRO' : 'REGISTROS'}
        </span>
      </div>

      {/* Filter by Enrollment / Plan */}
      {filterOptions.length > 0 && (
        <div className="flex items-center gap-1.5 p-1 bg-[#121215] border border-zinc-800 rounded-lg overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedEnrollmentId('ALL')}
            className={`py-1.5 px-3 rounded-md text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
              selectedEnrollmentId === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Todas</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                selectedEnrollmentId === 'ALL'
                  ? 'bg-zinc-700 text-zinc-200'
                  : 'bg-zinc-900 text-zinc-500'
              }`}
            >
              {checkIns.length}
            </span>
          </button>

          {filterOptions.map((opt) => {
            const isSelected = selectedEnrollmentId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedEnrollmentId(opt.id)}
                className={`py-1.5 px-3 rounded-md text-xs font-medium transition shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="truncate max-w-[150px]">{opt.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected
                      ? 'bg-zinc-700 text-zinc-200'
                      : 'bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Check-ins List */}
      <div className="space-y-2">
        {loading ? (
          <div className="py-10 text-center text-xs font-mono text-zinc-500 bg-[#121215] rounded-xl border border-zinc-800">
            Carregando registros de check-in...
          </div>
        ) : filteredCheckIns.length === 0 ? (
          <div className="py-10 text-center bg-[#121215] rounded-xl border border-zinc-800 p-6 space-y-2">
            <div className="w-9 h-9 rounded-md bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-700">
              <CalendarCheck size={18} />
            </div>
            <p className="text-xs font-bold text-zinc-300">Nenhum check-in registrado</p>
            <p className="text-[11px] text-zinc-500">
              Aproxime seu código QR na catraca para registrar presença na aula.
            </p>
          </div>
        ) : (
          filteredCheckIns.map((ci) => {
            const date = new Date(ci.checkedInAt);
            const planName = ci.enrollment?.plan?.name || 'Treino';

            return (
              <div
                key={ci.id}
                className="p-3 rounded-xl bg-[#121215] border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={15} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-zinc-200 truncate">
                      {planName}
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {date.toLocaleDateString('pt-BR')} às{' '}
                      {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                  Confirmado
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
