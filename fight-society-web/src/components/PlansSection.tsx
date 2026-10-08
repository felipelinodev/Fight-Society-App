'use client';

import React, { useState } from 'react';
import { Plan, MartialArt } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Shield, Zap, ArrowRight, Sparkles, Plus, Edit2, Flame, Swords, Trash2, X } from 'lucide-react';
import { CheckoutModal } from '@/components/CheckoutModal';
import { PlanScheduleManager } from '@/components/PlanScheduleManager';

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

  // Asaas checkout modal
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);

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
    const art = (plan.martialArt || '').toUpperCase();
    const name = (plan.name || '').toUpperCase();

    if (selectedArt === 'JIU_JITSU') {
      return (
        art === 'JIU_JITSU' ||
        name.includes('JIU') ||
        name.includes('BJJ') ||
        name.includes('KIMONO') ||
        art === ''
      );
    }

    if (selectedArt === 'MUAY_THAI') {
      return (
        art === 'MUAY_THAI' ||
        name.includes('THAI') ||
        name.includes('MUAY') ||
        name.includes('BOXE')
      );
    }

    return art === selectedArt;
  });

  const handleEnrollClick = (plan: Plan) => {
    if (!user || !token) {
      onOpenAuth();
      return;
    }
    setErrorMsg(null);
    setCheckoutPlan(plan);
  };

  const handleCheckout = async (cpf?: string) => {
    if (!user || !token || !checkoutPlan) return;
    const userEnrollments = await api.getMyEnrollments(token);
    let enrollment = userEnrollments.find((e) => e.planId === checkoutPlan.id);
    if (!enrollment) {
      enrollment = await api.createEnrollment(user.id, checkoutPlan.id, token);
    }
    const { invoiceUrl } = await api.createCheckout(enrollment.id, token, cpf);
    if (!invoiceUrl) {
      throw new Error('Não foi possível gerar a cobrança.');
    }
    window.location.href = invoiceUrl;
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
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Planos de Treino
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Acesso ilimitado ao dojô com pagamento via PIX, boleto ou cartão
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreatePlanModal}
            className="py-2 px-3.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus size={14} />
            <span>Criar Plano</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-md text-red-300 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Martial Art Filter Tabs - Flat Pro */}
      <div className="flex p-1 bg-[#121215] border border-zinc-800 rounded-lg gap-1">
        <button
          onClick={() => setSelectedArt('ALL')}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition ${
            selectedArt === 'ALL'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setSelectedArt('JIU_JITSU')}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            selectedArt === 'JIU_JITSU'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Shield size={13} />
          <span>Jiu Jitsu</span>
        </button>
        <button
          onClick={() => setSelectedArt('MUAY_THAI')}
          className={`flex-1 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-center gap-1.5 ${
            selectedArt === 'MUAY_THAI'
              ? 'bg-zinc-800 text-zinc-100 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Swords size={13} />
          <span>Muay Thai</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPlans.length === 0 ? (
          <div className="p-8 bg-[#121215] rounded-xl border border-zinc-800 text-center space-y-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto border border-zinc-700">
              <Swords size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-200">Nenhum plano disponível</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Não há planos cadastrados para este filtro no momento.
              </p>
            </div>
            <button
              onClick={() => setSelectedArt('ALL')}
              className="py-1.5 px-4 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs transition border border-zinc-700"
            >
              Ver Todos os Planos
            </button>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const isBJJ = plan.martialArt === 'JIU_JITSU';
            const isQuarterly = plan.durationDays >= 90 && plan.durationDays < 180;
            const isSemiAnnual = plan.durationDays >= 180;
            const isPopular = isQuarterly || isSemiAnnual;

            return (
              <div
                key={plan.id}
                className={`relative p-5 sm:p-6 rounded-xl transition border bg-[#121215] ${
                  isPopular
                    ? 'border-zinc-700 shadow-sm'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                      {isBJJ ? <Shield size={19} /> : <Zap size={19} />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white tracking-tight truncate">
                        {plan.name}
                      </h3>
                      <span className="text-xs font-medium text-zinc-400">
                        {isBJJ ? 'Jiu Jitsu' : 'Muay Thai'} • {getDurationLabel(plan.durationDays)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isPopular && (
                      <div className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/30 font-semibold">
                        Recomendado
                      </div>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => openEditPlanModal(plan)}
                        className="py-1 px-2.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition"
                        title="Editar Preço e Dados do Plano"
                      >
                        <Edit2 size={12} />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-5 mb-6">
                  {/* Description */}
                  {plan.description && (
                    <p className="text-[15px] text-zinc-300 leading-7 whitespace-pre-line break-words pb-5 border-b border-zinc-800">
                      {plan.description}
                    </p>
                  )}

                  {/* Training Schedules */}
                  <PlanScheduleManager
                    plan={plan}
                    onUpdate={() => onRefreshPlans?.()}
                    isDark={true}
                  />
                </div>

                {/* Price & Action Button */}
                <div className="flex items-center justify-between pt-5 border-t border-zinc-800">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-0.5">
                      Valor da Assinatura
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-semibold text-zinc-400">R$</span>
                      <span className="text-2xl font-extrabold text-white tracking-tight">
                        {Number(plan.price).toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-400 font-medium">
                        {getPeriodSuffix(plan.durationDays)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEnrollClick(plan)}
                    disabled={loadingPlanId === plan.id}
                    className="py-2.5 px-5 rounded-lg font-semibold text-xs flex items-center gap-2 transition bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-950/40 disabled:opacity-50"
                  >
                    {loadingPlanId === plan.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Matricular</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#141418] rounded-2xl p-6 sm:p-7 border border-zinc-800 max-h-[92vh] overflow-y-auto shadow-2xl text-zinc-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {editingPlan ? 'Editar Plano' : 'Novo Plano de Treino'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Defina os parâmetros técnicos e comerciais do plano de treino.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition -mr-1 -mt-1"
              >
                <X size={18} />
              </button>
            </div>

            {modalFeedback && (
              <div className="mb-5 p-3 rounded-lg bg-red-950/70 border border-red-800/80 text-red-300 text-xs font-medium">
                {modalFeedback}
              </div>
            )}

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Jiu Jitsu Mensal"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full py-2.5 px-3.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                    Modalidade
                  </label>
                  <select
                    value={planMartialArt}
                    onChange={(e) => setPlanMartialArt(e.target.value as any)}
                    className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-red-500 transition"
                  >
                    <option value="JIU_JITSU">Jiu Jitsu</option>
                    <option value="MUAY_THAI">Muay Thai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                    Valor (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-semibold text-zinc-500">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="150.00"
                      value={planPrice}
                      onChange={(e) => setPlanPrice(e.target.value)}
                      className="w-full py-2.5 pl-9 pr-3 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm font-semibold text-zinc-100 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Recurrence / Period Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                  Ciclo de Cobrança
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Mensal', days: '30', desc: '30 dias' },
                    { label: 'Trimestral', days: '90', desc: '90 dias' },
                    { label: 'Semestral', days: '180', desc: '180 dias' },
                    { label: 'Anual', days: '365', desc: '365 dias' },
                  ].map((p) => {
                    const isSelected = planDurationDays === p.days;

                    return (
                      <button
                        key={p.days}
                        type="button"
                        onClick={() => setPlanDurationDays(p.days)}
                        className={`py-2 px-3 rounded-lg text-left transition border ${
                          isSelected
                            ? 'bg-red-500/10 border-red-500/40 text-white'
                            : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800/80 hover:text-zinc-200'
                        }`}
                      >
                        <span className="block text-xs font-semibold">{p.label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-red-400 font-medium' : 'text-zinc-500'}`}>
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Days Input if needed */}
                <div className="mt-2.5 flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                  <span className="text-[11px] font-medium text-zinc-400">
                    Duração efetiva:{' '}
                    <strong className="text-zinc-200 font-semibold">
                      {planDurationDays === '30'
                        ? '1 mês (30 dias)'
                        : planDurationDays === '90'
                        ? '3 meses (90 dias)'
                        : planDurationDays === '180'
                        ? '6 meses (180 dias)'
                        : planDurationDays === '365'
                        ? '1 ano (365 dias)'
                        : `${planDurationDays} dias`}
                    </strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-500">Dias:</span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={planDurationDays}
                      onChange={(e) => setPlanDurationDays(e.target.value)}
                      className="w-16 py-1 px-2 bg-zinc-950 border border-zinc-700/80 rounded-md text-xs font-mono font-semibold text-zinc-100 text-center focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                  Descrição e Benefícios
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva as vantagens e turmas inclusas neste plano..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-700/80 rounded-lg text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-red-500 resize-none transition"
                />
              </div>

              {/* Modal Footer with Balanced Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 mt-5">
                {editingPlan ? (
                  <button
                    type="button"
                    onClick={handleDeletePlan}
                    disabled={submittingPlan}
                    className="py-2.5 px-3.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/25 text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <Trash2 size={13} />
                    <span>Excluir</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(false)}
                    className="py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPlan}
                    className="py-2.5 px-5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition shadow-sm shadow-red-950/40"
                  >
                    {submittingPlan ? 'Salvando...' : 'Salvar Plano'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asaas Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutPlan !== null}
        plan={checkoutPlan}
        onClose={() => setCheckoutPlan(null)}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
