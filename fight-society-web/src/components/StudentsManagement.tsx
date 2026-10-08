'use client';

import React, { useState, useEffect } from 'react';
import { User, Enrollment, Plan, Payment } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { StudentDetailModal } from './StudentDetailModal';
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CreditCard,
  Search,
  UserPlus,
  Swords,
  Mail,
  ChevronRight,
} from 'lucide-react';

interface StudentsManagementProps {
  plans: Plan[];
}

export function StudentsManagement({ plans }: StudentsManagementProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING' | 'INACTIVE'>('ALL');

  // Modal Matricular
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal Detalhes do Aluno
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [allUsers, allEnrollments, allPayments] = await Promise.all([
        api.getAllUsers(token),
        api.getAllEnrollments(token),
        api.getAllPayments(token).catch(() => []),
      ]);
      setUsers(allUsers.filter((u) => u.role === 'STUDENT'));
      setEnrollments(allEnrollments);
      setPayments(allPayments);
    } catch (err: any) {
      console.error('Erro ao carregar dados de alunos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleCreateEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUserId || !selectedPlanId) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.createEnrollment(selectedUserId, selectedPlanId, token);
      setShowEnrollModal(false);
      setSelectedUserId('');
      setSelectedPlanId('');
      await loadData();
    } catch (err: any) {
      setFeedback(err?.message || 'Erro ao criar matrícula');
    } finally {
      setSubmitting(false);
    }
  };

  // Build composite student list
  const studentsWithDetails = users.map((student) => {
    const studentEnrollments = enrollments.filter((e) => e.userId === student.id);
    const activeEnrollment = studentEnrollments.find((e) => e.status === 'ACTIVE');
    const latestEnrollment = activeEnrollment || studentEnrollments[0] || null;

    const studentPayments = payments.filter((p) => p.userId === student.id);
    const hasPaid = studentPayments.some((p) => p.status === 'PAID');

    let paymentStatus: 'PAID' | 'PENDING' | 'NONE' = 'NONE';
    if (activeEnrollment) {
      paymentStatus = hasPaid ? 'PAID' : 'PENDING';
    }

    return {
      student,
      enrollment: latestEnrollment,
      hasActiveEnrollment: !!activeEnrollment,
      paymentStatus,
      paymentsCount: studentPayments.length,
    };
  });

  // Calculate Metrics
  const totalStudents = studentsWithDetails.length;
  const activeEnrollmentsCount = studentsWithDetails.filter((s) => s.hasActiveEnrollment).length;
  const paidStudentsCount = studentsWithDetails.filter((s) => s.paymentStatus === 'PAID').length;
  const pendingStudentsCount = studentsWithDetails.filter(
    (s) => s.hasActiveEnrollment && s.paymentStatus !== 'PAID',
  ).length;

  // Filtered List
  const filteredStudents = studentsWithDetails.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      item.student.name.toLowerCase().includes(term) ||
      item.student.email.toLowerCase().includes(term) ||
      (item.enrollment?.plan?.name?.toLowerCase().includes(term) ?? false);

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return item.hasActiveEnrollment;
    if (statusFilter === 'PENDING') return item.hasActiveEnrollment && item.paymentStatus !== 'PAID';
    if (statusFilter === 'INACTIVE') return !item.hasActiveEnrollment;
    return true;
  });

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-200">
      {/* Header seguindo a identidade oficial do app */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="min-w-0">
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block">
            GESTÃO DE MEMBROS
          </span>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 mt-0.5 truncate">
            Controle de Alunos & Matrículas
          </h2>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="py-1.5 px-3.5 rounded-lg btn-gradient text-white font-semibold text-xs tracking-wide transition shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <UserPlus size={14} />
          <span>Matricular Aluno</span>
        </button>
      </div>

      {/* KPI Cards: Mesma grade e estética de Financeiro e Painel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl surface border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>TOTAL</span>
            <Users size={14} className="text-zinc-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">
            {totalStudents}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">Atletas cadastrados</span>
        </div>

        <div className="p-3.5 rounded-xl surface border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>ATIVOS</span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {activeEnrollmentsCount}
          </div>
          <span className="text-[10px] font-mono text-emerald-500 block mt-0.5">Acesso liberado</span>
        </div>

        <div className="p-3.5 rounded-xl surface border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>EM DIA</span>
            <CreditCard size={14} className="text-zinc-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">
            {paidStudentsCount}
          </div>
          <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">Faturas liquidadas</span>
        </div>

        <div className="p-3.5 rounded-xl surface border border-zinc-800">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono mb-1">
            <span>PENDENTES</span>
            <AlertTriangle size={14} className="text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
            {pendingStudentsCount}
          </div>
          <span className="text-[10px] font-mono text-amber-500 block mt-0.5">Cobrança pendente</span>
        </div>
      </div>

      {/* Filter Tabs - Barra segmentada unificada do app */}
      <div className="flex p-1 surface border border-zinc-800 rounded-lg gap-1">
        {[
          { id: 'ALL', label: `Todos (${totalStudents})` },
          { id: 'ACTIVE', label: `Ativos (${activeEnrollmentsCount})` },
          { id: 'PENDING', label: `Pendentes (${pendingStudentsCount})` },
          { id: 'INACTIVE', label: `Inativos (${totalStudents - activeEnrollmentsCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id as any)}
            className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
              statusFilter === tab.id
                ? 'bg-zinc-800 text-zinc-100 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campo de Busca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-zinc-500 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou plano..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 surface border border-zinc-800 rounded-lg text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-2.5 text-xs text-zinc-500 hover:text-zinc-200 p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Lista de Alunos no Formato Fight Society */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-zinc-500 surface rounded-xl border border-zinc-800">
            Carregando cadastro de atletas...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 surface rounded-xl border border-zinc-800">
            Nenhum aluno localizado para este critério.
          </div>
        ) : (
          filteredStudents.map(({ student, enrollment, hasActiveEnrollment, paymentStatus }) => {
            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="group p-4 rounded-xl surface border border-zinc-800 hover:border-zinc-700 transition cursor-pointer space-y-3 shadow-xs"
              >
                {/* Linha Superior: Avatar estilizado, Nome, Email e Badges Técnicas */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center justify-center font-mono font-bold text-xs shrink-0 group-hover:border-red-500/40 transition">
                      {student.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-100 truncate group-hover:text-red-400 transition">
                        {student.name}
                      </h4>
                      <p className="text-xs font-mono text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} className="shrink-0 text-zinc-500" />
                        <span className="truncate">{student.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badges com a identidade oficial do app */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                        hasActiveEnrollment
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {hasActiveEnrollment ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      <span>{hasActiveEnrollment ? 'ATIVO' : 'INATIVO'}</span>
                    </span>

                    {hasActiveEnrollment && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          paymentStatus === 'PAID'
                            ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                            : 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        <CreditCard size={11} />
                        <span>{paymentStatus === 'PAID' ? 'LIQUIDADO' : 'PENDENTE'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Linha Inferior: Plano associado e seta para detalhes */}
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-800/80 text-xs">
                  <div className="flex items-center gap-2 text-zinc-400 min-w-0">
                    <Swords size={13} className="text-red-500 shrink-0" />
                    <span className="font-medium text-zinc-300 truncate">
                      {enrollment?.plan?.name || 'Nenhum plano associado'}
                    </span>
                    {enrollment?.plan?.price && (
                      <span className="text-zinc-500 font-mono shrink-0">
                        • R$ {Number(enrollment.plan.price).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono text-zinc-500 group-hover:text-zinc-200 transition shrink-0 ml-2">
                    <span className="hidden sm:inline">FICHA</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Matricular Aluno */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md surface rounded-xl p-6 border border-zinc-800 shadow-2xl text-zinc-100">
            <h3 className="text-base font-bold text-zinc-100 mb-1">Matricular Aluno</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Vincule um atleta a um plano de treino ativo no dojo.
            </p>

            {feedback && (
              <div className="mb-4 p-2.5 rounded-md bg-red-950/70 border border-red-800/80 text-red-300 text-xs font-medium">
                {feedback}
              </div>
            )}

            <form onSubmit={handleCreateEnrollment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                  Aluno
                </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-red-500 transition"
                >
                  <option value="">Selecione o aluno...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                  Plano de Treino
                </label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-red-500 transition"
                >
                  <option value="">Selecione o plano...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {Number(p.price).toFixed(2)} ({p.durationDays} dias)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-800/80 mt-5">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-5 rounded-lg btn-gradient text-white text-xs font-semibold tracking-wide transition shadow-sm"
                >
                  {submitting ? 'Gravando...' : 'Confirmar Matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalhes do Aluno */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          enrollment={
            studentsWithDetails.find((s) => s.student.id === selectedStudent.id)?.enrollment || null
          }
          onClose={() => setSelectedStudent(null)}
          onRefresh={loadData}
        />
      )}
    </div>
  );
}
