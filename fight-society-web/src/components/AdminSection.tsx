'use client';

import React, { useState, useEffect } from 'react';
import { User, Enrollment, Plan, MartialArt } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  Users,
  CreditCard,
  UserPlus,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Zap,
} from 'lucide-react';

interface AdminSectionProps {
  plans: Plan[];
  onRefreshPlans?: () => void;
}

export function AdminSection({ plans: initialPlans, onRefreshPlans }: AdminSectionProps) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'enrollments' | 'plans'>('enrollments');
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Enrollment modal
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Plan modal (Create & Edit)
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planMartialArt, setPlanMartialArt] = useState<MartialArt>('JIU_JITSU');
  const [planPrice, setPlanPrice] = useState('150.00');
  const [planDurationDays, setPlanDurationDays] = useState('30');

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [allUsers, allEnrollments, allPlans] = await Promise.all([
        api.getAllUsers(token),
        api.getAllEnrollments(token),
        api.getPlans(token),
      ]);
      setUsers(allUsers);
      setEnrollments(allEnrollments);
      setPlans(allPlans);
      if (onRefreshPlans) onRefreshPlans();
    } catch (err: any) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleToggleEnrollmentStatus = async (enrollment: Enrollment) => {
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

  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanDescription('');
    setPlanMartialArt('JIU_JITSU');
    setPlanPrice('150.00');
    setPlanDurationDays('30');
    setFeedback(null);
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description || '');
    setPlanMartialArt(plan.martialArt);
    setPlanPrice(String(plan.price));
    setPlanDurationDays(String(plan.durationDays));
    setFeedback(null);
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setFeedback(null);

    const priceNum = parseFloat(planPrice);
    const durationNum = parseInt(planDurationDays, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setFeedback('Informe um valor válido para o plano.');
      setSubmitting(false);
      return;
    }

    try {
      if (editingPlan) {
        await api.updatePlan(
          editingPlan.id,
          {
            name: planName,
            description: planDescription,
            martialArt: planMartialArt,
            price: priceNum,
            durationDays: durationNum,
          },
          token,
        );
      } else {
        await api.createPlan(
          {
            name: planName,
            description: planDescription,
            martialArt: planMartialArt,
            price: priceNum,
            durationDays: durationNum,
          },
          token,
        );
      }
      setShowPlanModal(false);
      await loadData();
    } catch (err: any) {
      setFeedback(err?.message || 'Erro ao salvar plano');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (planToDelete?: Plan) => {
    const target = planToDelete || editingPlan;
    if (!target || !token) return;
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o plano "${target.name}"?`);
    if (!confirmDelete) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await api.deletePlan(target.id, token);
      setShowPlanModal(false);
      await loadData();
    } catch (err: any) {
      setFeedback(err?.message || 'Erro ao excluir plano');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCount = enrollments.filter((e) => e.status === 'ACTIVE').length;
  const totalRevenue = enrollments
    .filter((e) => e.status === 'ACTIVE')
    .reduce((sum, e) => sum + Number(e.plan?.price || 0), 0);

  const filteredEnrollments = enrollments.filter((e) => {
    const term = search.toLowerCase();
    const userName = e.user?.name?.toLowerCase() || '';
    const userEmail = e.user?.email?.toLowerCase() || '';
    const pName = e.plan?.name?.toLowerCase() || '';
    return userName.includes(term) || userEmail.includes(term) || pName.includes(term);
  });

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Painel do Administrador</span>
            <ShieldCheck className="w-5 h-5 text-red-600" />
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Gestão de alunos, planos e faturamento
          </p>
        </div>

        {activeTab === 'enrollments' ? (
          <button
            onClick={() => setShowEnrollModal(true)}
            className="py-2 px-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition transform active:scale-95"
          >
            <UserPlus size={15} />
            <span>Matricular</span>
          </button>
        ) : (
          <button
            onClick={openCreatePlanModal}
            className="py-2 px-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition transform active:scale-95"
          >
            <Plus size={15} />
            <span>Novo Plano</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Users size={14} className="text-red-600" />
            <span>Alunos</span>
          </div>
          <div className="text-xl font-black text-slate-900">{users.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>Ativas</span>
          </div>
          <div className="text-xl font-black text-emerald-600">{activeCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <CreditCard size={14} className="text-red-600" />
            <span>Receita</span>
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 truncate">
            R$ {totalRevenue.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Matrículas vs Planos */}
      <div className="flex p-1.5 bg-slate-200/80 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'enrollments'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Alunos & Matrículas
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'plans'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gerenciar Planos ({plans.length})
        </button>
      </div>

      {/* Tab Content 1: Enrollments */}
      {activeTab === 'enrollments' && (
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar aluno ou plano..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
            />
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-400">
              Carregando matrículas...
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="p-8 text-center text-xs font-semibold text-slate-500 bg-white rounded-2xl border border-slate-200">
              Nenhuma matrícula encontrada.
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => {
              const isActive = enrollment.status === 'ACTIVE';
              return (
                <div
                  key={enrollment.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-red-200 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900 truncate">
                        {enrollment.user?.name || 'Aluno'}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {enrollment.plan?.name} • R$ {Number(enrollment.plan?.price || 0).toFixed(2)}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {enrollment.user?.email}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleEnrollmentStatus(enrollment)}
                    className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                      isActive
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                    title={isActive ? 'Desativar Matrícula' : 'Reativar Matrícula'}
                  >
                    {isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    <span className="hidden sm:inline">{isActive ? 'Desativar' : 'Ativar'}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab Content 2: Plans Management */}
      {activeTab === 'plans' && (
        <div className="space-y-3">
          {plans.map((plan) => {
            const isBJJ = plan.martialArt === 'JIU_JITSU';
            return (
              <div
                key={plan.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-red-200 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    {isBJJ ? <Shield size={20} /> : <Zap size={20} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{plan.name}</h4>
                    <p className="text-[11px] font-bold text-red-600">
                      R$ {Number(plan.price).toFixed(2)}{' '}
                      <span className="text-slate-400 font-normal">({plan.durationDays} dias)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditPlanModal(plan)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition"
                    title="Excluir Plano"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {editingPlan ? 'Editar Plano' : 'Criar Novo Plano'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Defina o nome, valor, duração em dias e modalidade do plano.
            </p>

            {feedback && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
                {feedback}
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jiu Jitsu Mensal VIP"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Modalidade
                </label>
                <select
                  value={planMartialArt}
                  onChange={(e) => setPlanMartialArt(e.target.value as any)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="JIU_JITSU">🥋 Jiu Jitsu</option>
                  <option value="MUAY_THAI">🥊 Muay Thai</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                    Duração (Dias)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="30"
                    value={planDurationDays}
                    onChange={(e) => setPlanDurationDays(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Benefícios e detalhes do plano..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingPlan && (
                  <button
                    type="button"
                    onClick={() => handleDeletePlan()}
                    disabled={submitting}
                    className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition"
                  >
                    Excluir
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition"
                >
                  {submitting ? 'Salvando...' : 'Salvar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Enrollment Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100">
            <h3 className="text-lg font-black text-slate-900 mb-1">Matricular Aluno</h3>
            <p className="text-xs text-slate-500 mb-4">
              Vincule um aluno cadastrado a um plano de artes marciais.
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
                  <option value="">Selecione um aluno...</option>
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
                  {submitting ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
