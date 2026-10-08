'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Enrollment, Payment, Plan } from '@/types/api';
import { MemberCard } from '@/components/MemberCard';
import { StudentsManagement } from '@/components/StudentsManagement';
import { PlansSection } from '@/components/PlansSection';
import { PaymentsHistory } from '@/components/PaymentsHistory';
import { BottomNav, TabType } from '@/components/BottomNav';
import { AuthModal } from '@/components/AuthModal';
import { ProfileSection } from '@/components/ProfileSection';
import { StudentCheckInsSection } from '@/components/StudentCheckInsSection';
import { DojoDescriptionSection } from '@/components/DojoDescriptionSection';
import {
  LogOut,
  User as UserIcon,
  QrCode,
  Users,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Swords,
  ShieldCheck,
  Flame,
  ArrowRight,
  TrendingUp,
  Shield,
  Clock,
  CalendarCheck,
} from 'lucide-react';

export default function Home() {
  const { user, token, logout, isLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [paymentSuccessBanner, setPaymentSuccessBanner] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Data from API
  const [plans, setPlans] = useState<Plan[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Helper to reload user enrollments + payments
  const refreshUserData = async () => {
    if (!token) return;
    try {
      const [enr, pay] = await Promise.all([
        api.getMyEnrollments(token),
        api.getMyPayments(token),
      ]);
      setEnrollments(enr);
      setPayments(pay);
    } catch {
      // silent
    }
  };

  const refreshPlans = () => {
    api
      .getPlans(token)
      .then((data) => {
        setPlans(data ?? []);
      })
      .catch((e) => {
        console.error('Erro ao carregar planos', e);
        setPlans([]);
      });
  };

  // Load public plans
  useEffect(() => {
    refreshPlans();
  }, [token]);

  // Load user data if logged in
  useEffect(() => {
    if (token && user) {
      refreshUserData();
    }
  }, [token, user]);

  // Handle Asaas redirect: ?payment=success
  useEffect(() => {
    if (!token || !user) return;

    const params = new URLSearchParams(window.location.search);
    const paymentResult = params.get('payment');

    if (paymentResult === 'success') {
      // Clean URL immediately so it doesn't re-trigger
      window.history.replaceState({}, '', window.location.pathname);

      setVerifyingPayment(true);
      setCurrentTab('home');

      // Poll for payment confirmation (webhook may take a few seconds)
      const pollForConfirmation = async () => {
        const MAX_ATTEMPTS = 8;
        const POLL_INTERVAL = 2000;

        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
          await new Promise((r) => setTimeout(r, POLL_INTERVAL));

          try {
            const updatedPayments = await api.getMyPayments(token);
            const paidPayment = updatedPayments.find((p) => p.status === 'PAID');

            if (paidPayment) {
              await refreshUserData();
              setVerifyingPayment(false);
              setPaymentSuccessBanner(true);
              setTimeout(() => setPaymentSuccessBanner(false), 8000);
              return;
            }
          } catch {
            // ignore, keep polling
          }
        }

        // After all attempts, refresh and show result anyway
        await refreshUserData();
        setVerifyingPayment(false);
        setPaymentSuccessBanner(true);
        setTimeout(() => setPaymentSuccessBanner(false), 8000);
      };

      pollForConfirmation();
    } else if (paymentResult === 'cancel') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [token, user]);

  // If a student is on an admin-only tab, redirect to home
  useEffect(() => {
    if (user && !isAdmin && (currentTab === 'students' || currentTab === 'payments')) {
      setCurrentTab('home');
    }
  }, [user, isAdmin, currentTab]);

  const activeEnrollment = enrollments.find((e) => e.status === 'ACTIVE') || enrollments[0] || null;

  const handleOpenLogin = () => {
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode('register');
    setIsAuthOpen(true);
  };

  return (
    <main className="relative w-full min-h-screen app-bg text-zinc-100 flex flex-col justify-between">
      {/* Scrollable Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto px-4 py-5 sm:px-6 sm:pt-6 pb-28 sm:pb-28 space-y-6">
        {/* Payment Verification Screen */}
        {verifyingPayment && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-150">
            <div className="surface rounded-xl p-6 border border-zinc-800 text-center max-w-sm mx-4 space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto">
                <div className="w-6 h-6 border-2 border-zinc-500 border-t-red-600 rounded-full animate-spin" />
              </div>
              <h3 className="text-base font-bold text-zinc-100">Confirmando Pagamento</h3>
              <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                Aguardando a confirmação do pagamento pelo Asaas.
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>Pagamento seguro via Asaas</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Success Banner */}
        {paymentSuccessBanner && (
          <div className="p-4 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 flex items-center gap-3 animate-in slide-in-from-top duration-200">
            <div className="w-8 h-8 rounded bg-emerald-900/60 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Pagamento Confirmado</h4>
              <p className="text-xs text-emerald-400/90 font-normal mt-0.5">
                Sua matrícula está ativa e liberada no sistema.
              </p>
            </div>
          </div>
        )}

        {/* Top Header */}
        <header className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-red-500/40 bg-black shrink-0 shadow-sm">
              <Image
                src="/logo_dojo.jpg"
                alt="Fight Society Dojo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                  {isAdmin ? 'Painel de Controle' : user ? 'Área do Aluno' : 'Fight Society'}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                    ADMIN
                  </span>
                )}
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {user ? user.name : 'Centro de Treinamento Bruno Silva'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={logout}
                className="py-1.5 px-3 rounded-lg bg-zinc-800/60 border border-zinc-700/70 text-zinc-300 hover:text-white hover:bg-zinc-700 text-xs font-medium transition flex items-center gap-1.5"
                title="Encerrar sessão"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            ) : (
              <button
                onClick={handleOpenLogin}
                className="py-1.5 px-4 rounded-lg btn-gradient text-white font-semibold text-xs tracking-wide transition shadow-xs"
              >
                Entrar
              </button>
            )}
          </div>
        </header>

        {/* TAB 1: HOME / DASHBOARD */}
        {currentTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* If Logged in Student: Member Card */}
            {user && !isAdmin && (
              <MemberCard
                user={user}
                enrollment={activeEnrollment}
                onPayClick={() => setCurrentTab('plans')}
              />
            )}

            {/* If Logged in Admin: Admin Welcome Card */}
            {user && isAdmin && (
              <div className="p-5 rounded-xl surface border border-zinc-800 text-zinc-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                    SISTEMA DE GESTÃO INTEGRADO
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    STATUS: OPERACIONAL
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-100">
                  Visão Geral do Dojo
                </h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Gerenciamento central de alunos, planos de treino, controle de acesso e conciliação financeira.
                </p>
              </div>
            )}

            {/* If Not Logged in: Visitor Welcome Card */}
            {!user && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#141418] to-[#18181f] border border-zinc-800 text-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-red-500/10 text-red-400 border border-red-500/30 mb-3 font-semibold">
                    <Swords size={11} />
                    <span>Matrículas Abertas</span>
                  </div>
                  <h3 className="text-xl font-bold text-gradient tracking-tight">
                    Jiu Jitsu Brasileiro & Muay Thai
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-lg leading-relaxed">
                    Treinamento técnico de alta performance ministrado pelo Mestre Bruno Silva. Escolha seu plano e comece a treinar hoje mesmo.
                  </p>
                  <div className="mt-5 flex gap-2.5">
                    <button
                      onClick={handleOpenRegister}
                      className="py-2.5 px-4 rounded-lg btn-gradient text-white font-semibold text-xs tracking-wide transition shadow-sm shadow-red-950/40"
                    >
                      Criar Conta
                    </button>
                    <button
                      onClick={handleOpenLogin}
                      className="py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs tracking-wide transition border border-zinc-700"
                    >
                      Acessar Perfil
                    </button>
                  </div>
                </div>

                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-red-500/30 shadow-md shrink-0 bg-black">
                  <Image
                    src="/logo_dojo.jpg"
                    alt="Fight Society Bruno Silva"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <DojoDescriptionSection />

            {/* Quick Action Navigation Grid */}
            {isAdmin ? (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setCurrentTab('students')}
                  className="p-3.5 rounded-lg surface border border-zinc-800 hover:border-zinc-700 flex flex-col items-center gap-2 group transition text-center"
                >
                  <div className="w-8 h-8 rounded bg-zinc-800/80 text-zinc-300 flex items-center justify-center group-hover:text-red-400 transition">
                    <Users size={16} />
                  </div>
                  <span className="text-xs font-medium text-zinc-300">Alunos</span>
                </button>

                <button
                  onClick={() => setCurrentTab('plans')}
                  className="p-3.5 rounded-lg surface border border-zinc-800 hover:border-zinc-700 flex flex-col items-center gap-2 group transition text-center"
                >
                  <div className="w-8 h-8 rounded bg-zinc-800/80 text-zinc-300 flex items-center justify-center group-hover:text-red-400 transition">
                    <Swords size={16} />
                  </div>
                  <span className="text-xs font-medium text-zinc-300">Planos</span>
                </button>

                <button
                  onClick={() => setCurrentTab('payments')}
                  className="p-3.5 rounded-lg surface border border-zinc-800 hover:border-zinc-700 flex flex-col items-center gap-2 group transition text-center"
                >
                  <div className="w-8 h-8 rounded bg-zinc-800/80 text-zinc-300 flex items-center justify-center group-hover:text-red-400 transition">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-xs font-medium text-zinc-300">Financeiro</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setCurrentTab('plans')}
                  className="p-3 rounded-lg surface border border-zinc-800 hover:border-zinc-700 flex flex-col items-center gap-1.5 group transition text-center"
                >
                  <div className="w-8 h-8 rounded bg-zinc-800/80 text-zinc-300 flex items-center justify-center group-hover:text-red-400 transition">
                    <Swords size={16} />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-300">Planos</span>
                </button>

                <button
                  onClick={() => setCurrentTab('checkins')}
                  className="p-3 rounded-lg surface border border-zinc-800 hover:border-zinc-700 flex flex-col items-center gap-1.5 group transition text-center"
                >
                  <div className="w-8 h-8 rounded bg-zinc-800/80 text-zinc-300 flex items-center justify-center group-hover:text-emerald-400 transition">
                    <CalendarCheck size={16} />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-300">Check-in</span>
                </button>

                <button
                  onClick={() => setCurrentTab('profile')}
                  className="p-3 rounded-lg surface border border-zinc-800 hover:border-zinc-700 flex flex-col items-center gap-1.5 group transition text-center"
                >
                  <div className="w-8 h-8 rounded bg-zinc-800/80 text-zinc-300 flex items-center justify-center group-hover:text-zinc-100 transition">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-[11px] font-medium text-zinc-300">Meu Perfil</span>
                </button>
              </div>
            )}

            {/* Recent Payments Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  {isAdmin ? 'Últimas Transações' : 'Histórico de Faturamento'}
                </h3>
                <button
                  onClick={() => setCurrentTab('payments')}
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
                >
                  Ver todos →
                </button>
              </div>

              {payments.length === 0 ? (
                <div className="p-4 surface rounded-lg border border-zinc-800 text-center text-xs text-zinc-500 font-normal">
                  Nenhum registro financeiro localizado.
                </div>
              ) : (
                <div className="surface rounded-xl border border-zinc-800 divide-y divide-zinc-800/80 overflow-hidden">
                  {payments.slice(0, 3).map((p) => {
                    const isPaid = p.status === 'PAID';
                    const isPending = p.status === 'PENDING';

                    return (
                      <div
                        key={p.id}
                        className="p-3.5 flex items-center justify-between hover:bg-zinc-800/30 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded flex items-center justify-center text-xs ${
                              isPaid
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                : isPending
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                                : 'bg-red-950/60 text-red-400 border border-red-800/60'
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 size={14} />
                            ) : isPending ? (
                              <Clock size={14} />
                            ) : (
                              <AlertTriangle size={14} />
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-medium text-zinc-200">
                              {p.enrollment?.plan?.name || 'Assinatura Fight Society'}
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {p.paidAt
                                ? new Date(p.paidAt).toLocaleDateString('pt-BR')
                                : isPending
                                ? 'Aguardando compensação'
                                : 'Cancelado'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-zinc-200 block">
                            R$ {Number(p.amount).toFixed(2)}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase ${
                              isPaid
                                ? 'text-emerald-400'
                                : isPending
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}
                          >
                            {isPaid ? 'Liquidado' : isPending ? 'Pendente' : 'Recusado'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ALUNOS & MATRÍCULAS (Apenas para ADMIN) */}
        {currentTab === 'students' && isAdmin && (
          <div className="animate-in fade-in duration-300">
            <StudentsManagement plans={plans} />
          </div>
        )}

        {/* TAB 3: PLANOS & PREÇOS */}
        {currentTab === 'plans' && (
          <div className="animate-in fade-in duration-300">
            <PlansSection
              plans={plans}
              onOpenAuth={handleOpenLogin}
              onRefreshPlans={refreshPlans}
              onEnrollmentSuccess={() => {
                refreshUserData();
              }}
            />
          </div>
        )}

        {/* TAB 4: FINANCEIRO & COBRANÇAS (Apenas para ADMIN) */}
        {currentTab === 'payments' && isAdmin && (
          <div className="animate-in fade-in duration-300">
            <PaymentsHistory />
          </div>
        )}

        {/* TAB CHECK-INS (Apenas para Alunos) */}
        {currentTab === 'checkins' && user && !isAdmin && (
          <div className="animate-in fade-in duration-300">
            <StudentCheckInsSection />
          </div>
        )}

        {/* TAB 5: PERFIL E CREDENCIAIS */}
        {currentTab === 'profile' && user && <ProfileSection />}
      </div>

      {/* Floating Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
      />
    </main>
  );
}
