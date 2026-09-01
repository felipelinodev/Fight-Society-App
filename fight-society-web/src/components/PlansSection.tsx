'use client';

import React, { useState } from 'react';
import { Plan, MartialArt } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Shield, Zap, Check, ArrowRight, Sparkles, Plus, Edit2, Flame, Swords, Trash2 } from 'lucide-react';

interface PlansSectionProps {
  plans: Plan[];
  onOpenAuth: () => void;
  onEnrollmentSuccess?: () => void;
  onRefreshPlans?: () => void;
}

export function PlansSection({
  plans,
  onOpenAuth,
  onEnrollmentSuccess,
  onRefreshPlans,
}: PlansSectionProps) {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [selectedArt, setSelectedArt] = useState<'ALL' | MartialArt>('ALL');
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit / Create Plan Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planMartialArt, setPlanMartialArt] = useState<MartialArt>('JIU_JITSU');
  const [planPrice, setPlanPrice] = useState('150.00');
  const [planDurationDays, setPlanDurationDays] = useState('30');
  const [submittingPlan, setSubmittingPlan] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  const getDurationLabel = (days: number) => {
    if (days === 30) return 'Mensal (30 dias)';
    if (days === 60) return 'Bimestral (60 dias)';
    if (days === 90) return 'Trimestral (90 dias)';
    if (days === 180) return 'Semestral (6 meses)';
    if (days === 365) return 'Anual (1 ano)';
    return `${days} dias`;
  };

  const getPeriodSuffix = (days: number) => {
    if (days === 30) return '/mês';
    if (days === 60) return '/bimestre';
    if (days === 90) return '/trimestre';
    if (days === 180) return '/semestre';
    if (days === 365) return '/ano';
    return `/${days} dias`;
  };

  const filteredPlans = plans.filter((plan) => {
    if (selectedArt === 'ALL') return true;
    return plan.martialArt === selectedArt;
  });

  const handleEnrollAndPay = async (plan: Plan) => {
    if (!user || !token) {
      onOpenAuth();
      return;
    }

    setErrorMsg(null);
    setLoadingPlanId(plan.id);

    try {
      // 1. Get or create enrollment
      let userEnrollments = await api.getMyEnrollments(token);
      let enrollment = userEnrollments.find(
        (e) => e.planId === plan.id,
      );

      if (!enrollment) {
        enrollment = await api.createEnrollment(user.id, plan.id, token);
      }

      // 2. Create Stripe checkout session
      const { checkoutUrl } = await api.createCheckout(enrollment.id, token);

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Não foi possível gerar a URL de pagamento do Stripe.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Erro ao processar matrícula.');
    } finally {
      setLoadingPlanId(null);
    }
  };

  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanName('');
    setPlanDescription('');
    setPlanMartialArt('JIU_JITSU');
    setPlanPrice('150.00');
    setPlanDurationDays('30');
    setModalFeedback(null);
    setShowPlanModal(true);
  };

  const openEditPlanModal = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description || '');
    setPlanMartialArt(plan.martialArt);
    setPlanPrice(String(plan.price));
    setPlanDurationDays(String(plan.durationDays));
    setModalFeedback(null);
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      onOpenAuth();
      return;
    }
    setSubmittingPlan(true);
    setModalFeedback(null);

    const priceNum = parseFloat(planPrice);
    const durationNum = parseInt(planDurationDays, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      setModalFeedback('Informe um valor numérico válido para o preço.');
      setSubmittingPlan(false);
      return;
    }

    try {
      if (editingPlan) {
        await api.updatePlan(
          editingPlan.id,
          {
            name: planName,
            description: planDescription,
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
      if (onRefreshPlans) onRefreshPlans();
    } catch (err: any) {
      setModalFeedback(err?.message || 'Erro ao salvar plano.');
    } finally {
      setSubmittingPlan(false);
    }
  };

  const handleDeletePlan = async () => {
    if (!editingPlan || !token) return;
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o plano "${editingPlan.name}"?`);
    if (!confirmDelete) return;

    setSubmittingPlan(true);
    setModalFeedback(null);
    try {
      await api.deletePlan(editingPlan.id, token);
      setShowPlanModal(false);
      if (onRefreshPlans) onRefreshPlans();
    } catch (err: any) {
      setModalFeedback(err?.message || 'Erro ao excluir plano.');
    } finally {
      setSubmittingPlan(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Planos de Treino</span>
            <Flame className="w-5 h-5 text-red-600 fill-red-600" />
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acesso ilimitado ao dojô com pagamentos seguros via Stripe
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreatePlanModal}
            className="py-2 px-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition transform active:scale-95"
          >
            <Plus size={15} />
            <span>Novo Plano</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Martial Art Filter Tabs */}
      <div className="flex p-1.5 bg-slate-200/80 rounded-2xl gap-1">
        <button
          onClick={() => setSelectedArt('ALL')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            selectedArt === 'ALL'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setSelectedArt('JIU_JITSU')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            selectedArt === 'JIU_JITSU'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield size={14} />
          <span>Jiu Jitsu</span>
        </button>
        <button
          onClick={() => setSelectedArt('MUAY_THAI')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            selectedArt === 'MUAY_THAI'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Swords size={14} />
          <span>Muay Thai</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPlans.map((plan) => {
          const isBJJ = plan.martialArt === 'JIU_JITSU';
          const isQuarterly = plan.durationDays >= 90 && plan.durationDays < 180;
          const isSemiAnnual = plan.durationDays >= 180;
          const isPopular = isQuarterly || isSemiAnnual;

          return (
            <div
              key={plan.id}
              className={`relative p-5 rounded-3xl transition-all duration-300 border ${
                isPopular
                  ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white border-red-800/40 shadow-xl'
                  : 'bg-white text-slate-900 border-slate-200/80 shadow-xs hover:border-red-200'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-2.5 right-6 px-3 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles size={11} />
                  <span>Mais Escolhido</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isPopular ? 'bg-red-600 text-white' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {isBJJ ? <Shield size={20} /> : <Zap size={20} />}
                  </div>
                  <div>
                    <h3 className={`text-base font-black tracking-tight ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                      {plan.name}
                    </h3>
                    <span className={`text-[11px] font-bold ${isPopular ? 'text-red-400' : 'text-slate-500'}`}>
                      {isBJJ ? 'Jiu Jitsu' : 'Muay Thai'} • {getDurationLabel(plan.durationDays)}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => openEditPlanModal(plan)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition ${
                      isPopular
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600'
                    }`}
                    title="Editar Preço e Dados do Plano"
                  >
                    <Edit2 size={12} />
                    <span>Editar</span>
                  </button>
                )}
              </div>

              {plan.description && (
                <p className={`text-xs mb-4 ${isPopular ? 'text-slate-400' : 'text-slate-600'}`}>
                  {plan.description}
                </p>
              )}

              {/* Features List */}
              <div className="space-y-2 mb-5">
                {[
                  'Aulas ilimitadas durante a vigência',
                  'Acompanhamento de graduação e evolução',
                  'Acesso com QR Code na catraca',
                  'Pagamento seguro com Stripe',
                ].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      isPopular ? 'bg-red-500/20 text-red-400' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      <Check size={10} className="stroke-[3]" />
                    </div>
                    <span className={isPopular ? 'text-slate-300' : 'text-slate-700'}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Price & Action Button */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/20">
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-wider block ${
                    isPopular ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Investimento
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black ${isPopular ? 'text-white' : 'text-slate-900'}`}>
                      R$ {Number(plan.price).toFixed(2)}
                    </span>
                    <span className={`text-xs font-semibold ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                      {getPeriodSuffix(plan.durationDays)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleEnrollAndPay(plan)}
                  disabled={loadingPlanId === plan.id}
                  className={`py-3 px-5 rounded-2xl font-bold text-xs flex items-center gap-2 transition transform active:scale-95 shadow-md ${
                    isPopular
                      ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                  }`}
                >
                  {loadingPlanId === plan.id ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Matricular Agora</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Plan Modal (Integrated directly in Plans Section) */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900 mb-1">
              {editingPlan ? 'Editar Valor & Dados do Plano' : 'Criar Novo Plano'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Altere o valor em R$, nome, duração ou modalidade do plano.
            </p>

            {modalFeedback && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold">
                {modalFeedback}
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
                  <option value="JIU_JITSU">Jiu Jitsu</option>
                  <option value="MUAY_THAI">Muay Thai</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Valor / Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="150.00"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-black text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Recurrence / Period Flags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Recorrência do Plano
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { label: 'Mensal', days: '30' },
                    { label: 'Trimestral', days: '90' },
                    { label: 'Semestral', days: '180' },
                    { label: 'Anual', days: '365' },
                    { label: 'Bimestral', days: '60' },
                    { label: 'Outro', days: 'custom' },
                  ].map((p) => {
                    const isSelected =
                      p.days === 'custom'
                        ? !['30', '60', '90', '180', '365'].includes(planDurationDays)
                        : planDurationDays === p.days;

                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => {
                          if (p.days !== 'custom') {
                            setPlanDurationDays(p.days);
                          }
                        }}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Duração em dias:
                  </span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planDurationDays}
                    onChange={(e) => setPlanDurationDays(e.target.value)}
                    className="w-24 py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-[11px] text-slate-400">
                    ({planDurationDays === '30'
                      ? '1 mês'
                      : planDurationDays === '90'
                      ? '3 meses'
                      : planDurationDays === '180'
                      ? '6 meses'
                      : planDurationDays === '365'
                      ? '1 ano'
                      : `${planDurationDays} dias`})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Descrição
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalhes e benefícios do plano..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingPlan && (
                  <button
                    type="button"
                    onClick={handleDeletePlan}
                    disabled={submittingPlan}
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
                  disabled={submittingPlan}
                  className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md transition"
                >
                  {submittingPlan ? 'Salvando...' : 'Salvar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
