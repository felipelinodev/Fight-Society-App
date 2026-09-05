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
  Filter,
  Swords,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ShieldCheck,
  RefreshCw,
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

  const handleToggleStatus = async (enrollment: Enrollment) => {
    if (!token) return;
    try {
      if (enrollment.status === 'ACTIVE') {
        await api.deactivateEnrollment(enrollment.id, token);
      } else {
        await api.reactivateEnrollment(enrollment.id, token);
      }
      await loadData();
    } catch (err: any) {
      alert(err?.message || 'Erro ao alterar status da matrícula');
    }
  };

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
    const hasPendingPayment = studentPayments.some((p) => p.status === 'PENDING' || p.status === 'FAILED');

    // Payment state:
    // "PAID" if active enrollment and paid, "PENDING" if active but pending, "NONE" if no enrollment
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
    <div className="w-full space-y-5 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Controle de Alunos & Pagamentos</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhe quem pagou, quem está pendente e matrículas ativas
          </p>
        </div>

        <button
          onClick={() => setShowEnrollModal(true)}
          className="py-2.5 px-4 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/25 flex items-center gap-2 transition-all transform active:scale-95 shrink-0"
        >
          <UserPlus size={15} />
          <span>Matricular Aluno</span>
        </button>
      </div>

      {/* KPI Cards: Quem pagou vs Quem deixou de pagar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Alunos */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-600">Total de Alunos</span>
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700">
              <Users size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalStudents}</div>
        </div>

        {/* Matrículas Ativas */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-600">Matrículas Ativas</span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-600 tracking-tight">{activeEnrollmentsCount}</div>
        </div>

        {/* Pagos em Dia */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-600">Pagos em Dia</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">{paidStudentsCount}</div>
        </div>

        {/* Inadimplentes / Pendentes */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-600">Pendentes</span>
            <div className="p-1.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">{pendingStudentsCount}</div>
        </div>
      </div>

      {/* Modern Segmented Filter Tabs (Grid 4 col - Sem Rolar) */}
      <div className="p-1 bg-slate-100/90 border border-slate-200/80 rounded-2xl shadow-inner grid grid-cols-4 gap-1">
        {[
          {
            id: 'ALL',
            label: 'Todos',
            count: totalStudents,
            icon: Users,
            color: 'text-slate-500',
          },
          {
            id: 'ACTIVE',
            label: 'Ativos',
            count: activeEnrollmentsCount,
            icon: CheckCircle2,
            color: 'text-emerald-500',
          },
          {
            id: 'PENDING',
            label: 'Pendentes',
            count: pendingStudentsCount,
            icon: AlertTriangle,
            color: 'text-amber-500',
          },
          {
            id: 'INACTIVE',
            label: 'Inativos',
            count: totalStudents - activeEnrollmentsCount,
            icon: XCircle,
            color: 'text-slate-400',
          },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`w-full py-2 px-1 sm:px-2 rounded-xl text-[11px] sm:text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              <Icon size={13} className={`shrink-0 ${isActive ? 'text-white' : tab.color}`} />
              <span className="truncate">{tab.label}</span>
              <span
                className={`py-0.5 px-1.5 sm:px-2 rounded-full text-[9px] sm:text-[10px] font-black shrink-0 transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou plano..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition shadow-xs placeholder:text-slate-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
          >
            ✕
          </button>
        )}
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs font-bold text-slate-400">
            Carregando lista de alunos...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-500 bg-white rounded-2xl border border-slate-200">
            Nenhum aluno encontrado para este filtro.
          </div>
        ) : (
          filteredStudents.map(({ student, enrollment, hasActiveEnrollment, paymentStatus }) => {
            const isBJJ = enrollment?.plan?.martialArt === 'JIU_JITSU';

            return (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-red-200 hover:shadow-md transition-all duration-200 space-y-3 cursor-pointer"
              >
                {/* Top Row: Name, Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                      {student.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {student.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {/* Enrollment Status Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        hasActiveEnrollment
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {hasActiveEnrollment ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {hasActiveEnrollment ? 'Matrícula Ativa' : 'Sem Matrícula'}
                    </span>

                    {/* Payment Status Badge */}
                    {hasActiveEnrollment && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          paymentStatus === 'PAID'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                        }`}
                      >
                        <CreditCard size={11} />
                        {paymentStatus === 'PAID' ? 'Pago em Dia' : 'Pagamento Pendente'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Plan Info & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Swords size={14} className="text-red-600 shrink-0" />
                    <span className="font-bold">
                      {enrollment?.plan?.name || 'Nenhum plano associado'}
                    </span>
                    {enrollment?.plan?.price && (
                      <span className="text-slate-400 font-medium">
                        (R$ {Number(enrollment.plan.price).toFixed(2)})
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {enrollment ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(enrollment);
                        }}
                        className={`py-1.5 px-3 rounded-full font-extrabold text-xs transition-all active:scale-95 ${
                          hasActiveEnrollment
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200/60'
                        }`}
                      >
                        {hasActiveEnrollment ? 'Desativar' : 'Reativar'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUserId(student.id);
                          setShowEnrollModal(true);
                        }}
                        className="py-1.5 px-3 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 font-extrabold text-xs transition-all active:scale-95"
                      >
                        Matricular
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Matricular Aluno */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100">
            <h3 className="text-lg font-black text-slate-900 mb-1">Matricular Aluno</h3>
            <p className="text-xs text-slate-500 mb-4">
              Selecione o aluno e o plano de treino para ativar a matrícula.
            </p>

            {feedback && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
                {feedback}
              </div>
            )}

            <form onSubmit={handleCreateEnrollment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Aluno
                </label>
                <select
                  required
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
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
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Plano
                </label>
                <select
                  required
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Selecione o plano...</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {Number(p.price).toFixed(2)} ({p.durationDays} dias)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEnrollModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition"
                >
                  {submitting ? 'Salvando...' : 'Confirmar Matrícula'}
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
