'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

const DEFAULT_FALLBACK_PLANS: Plan[] = [
  {
    id: 'bjj-mensal',
    name: 'Jiu Jitsu Mensal',
    description: 'Acesso completo a todas as turmas de Jiu Jitsu (Gi e No-Gi)',
    price: 150.0,
    durationDays: 30,
    martialArt: 'JIU_JITSU',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'bjj-trimestral',
    name: 'Jiu Jitsu Trimestral',
    description: 'Acesso trimestral com desconto exclusivo',
    price: 390.0,
    durationDays: 90,
    martialArt: 'JIU_JITSU',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'muay-mensal',
    name: 'Muay Thai Mensal',
    description: 'Treinos de Muay Thai de segunda a sexta com Kru certificado',
    price: 140.0,
    durationDays: 30,
    martialArt: 'MUAY_THAI',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'thai-trimestral',
    name: 'Muay Thai Trimestral',
    description: 'Treino intensivo trimestral com foco em técnica e condicionamento',
    price: 360.0,
    durationDays: 90,
    martialArt: 'MUAY_THAI',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

export default function Home() {
  const { user, token, logout, isLoading } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [paymentSuccessBanner, setPaymentSuccessBanner] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Data from API
  const [plans, setPlans] = useState<Plan[]>(DEFAULT_FALLBACK_PLANS);
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
        if (data && data.length > 0) {
          setPlans(data);
        } else {
          setPlans(DEFAULT_FALLBACK_PLANS);
        }
      })
      .catch((e) => {
        console.error('Erro ao carregar planos', e);
        setPlans(DEFAULT_FALLBACK_PLANS);
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

  // Handle Stripe redirect: ?payment=success&session_id=...
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
    <main className="relative w-full min-h-screen bg-slate-50 overflow-hidden flex flex-col justify-between">
      {/* Scrollable Content Area */}
      <div className="flex-1 w-full max-w-3xl mx-auto overflow-y-auto px-4 py-5 sm:px-5 sm:pt-6 pb-32 sm:pb-32 space-y-6">
        {/* Payment Verification Loading Screen */}
        {verifyingPayment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-sm mx-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <div className="w-8 h-8 border-[3px] border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Verificando Pagamento...</h3>
              <p className="text-xs text-slate-500 font-medium">
                Estamos confirmando seu pagamento com o Stripe. Isso pode levar alguns segundos.
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>Processado com segurança pela Stripe</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Success Banner */}
        {paymentSuccessBanner && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h4 className="text-sm font-black">Pagamento Confirmado! 🎉</h4>
              <p className="text-[11px] text-white/90 font-medium">
                Sua matrícula foi ativada com sucesso. Bons treinos!
              </p>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-black text-sm shadow-md border border-white">
                {user ? user.name.slice(0, 2).toUpperCase() : <Swords size={18} />}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 block">
                {isAdmin ? 'Painel Administrativo' : user ? 'Área do Aluno' : 'Fight Society'}
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                {user ? user.name : 'Academia de Lutas'}
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                    Admin
                  </span>
                )}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={logout}
                className="p-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-400 hover:text-red-600 hover:border-red-200 transition shadow-xs"
                title="Sair da Conta"
              >
                <LogOut size={18} />
              </button>
            ) : (
              <button
                onClick={handleOpenLogin}
                className="py-2 px-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition"
              >
                Entrar
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: HOME / DASHBOARD */}
        {currentTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-300">
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
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white shadow-xl border border-red-900/40 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold uppercase mb-3">
                    <ShieldCheck size={13} />
                    <span>Administração Geral</span>
                  </div>
                  <h3 className="text-xl font-black text-white leading-tight">
                    Gestão da Academia Fight Society
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Controle de matrículas, inadimplências, planos e faturamento Stripe.
                  </p>
                </div>
              </div>
            )}

            {/* If Not Logged in: Visitor Welcome Card */}
            {!user && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase mb-3">
                    <Swords size={13} />
                    <span>Matrículas Abertas</span>
                  </div>
                  <h3 className="text-xl font-black text-white leading-tight">
                    Jiu Jitsu Brasileiro & Muay Thai
                  </h3>
                  <p className="text-xs text-white/85 mt-1.5">
                    Cadastre-se para obter seu passe de acesso e assinar seu plano.
                  </p>
                </div>
                <div className="mt-5 flex gap-2 relative z-10">
                  <button
                    onClick={handleOpenRegister}
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-black text-white font-bold text-xs shadow-md hover:bg-slate-900 transition"
                  >
                    Cadastrar
                  </button>
                  <button
                    onClick={handleOpenLogin}
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            )}

            {/* Quick Action Navigation Buttons (Distinct for Student vs Admin) */}
            {isAdmin ? (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setCurrentTab('students')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-200 flex flex-col items-center gap-2 group transition text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                    <Users size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Alunos</span>
                </button>

                <button
                  onClick={() => setCurrentTab('plans')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-200 flex flex-col items-center gap-2 group transition text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                    <Swords size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Planos</span>
                </button>

                <button
                  onClick={() => setCurrentTab('payments')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-200 flex flex-col items-center gap-2 group transition text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                    <CreditCard size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Financeiro</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentTab('plans')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-200 flex flex-col items-center gap-2 group transition text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                    <Swords size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Ver Planos</span>
                </button>

                <button
                  onClick={() => setCurrentTab('profile')}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-200 flex flex-col items-center gap-2 group transition text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition">
                    <UserIcon size={18} />
                  </div>
                  <span className="text-xs font-bold text-slate-800">Meu Perfil</span>
                </button>
              </div>
            )}

            {/* Recent Payments Feed */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  {isAdmin ? 'Últimas Cobranças da Academia' : 'Meus Pagamentos Recentes'}
                </h3>
                <button
                  onClick={() => setCurrentTab('payments')}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Ver todos
                </button>
              </div>

              {payments.length === 0 ? (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center text-xs font-medium text-slate-500">
                  Nenhum pagamento registrado até o momento.
                </div>
              ) : (
                payments.slice(0, 3).map((p) => {
                  const isPaid = p.status === 'PAID';
                  const isPending = p.status === 'PENDING';

                  return (
                    <div
                      key={p.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-600'
                              : isPending
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {isPaid ? (
                            <CheckCircle2 size={16} />
                          ) : isPending ? (
                            <Clock size={16} />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {p.enrollment?.plan?.name || 'Mensalidade Stripe'}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {p.paidAt
                              ? new Date(p.paidAt).toLocaleDateString('pt-BR')
                              : isPending
                              ? 'Aguardando Pagamento'
                              : 'Não Concluído'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-900 block">
                          R$ {Number(p.amount).toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isPaid
                              ? 'text-emerald-600'
                              : isPending
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {isPaid ? 'Pago' : isPending ? 'Pendente' : 'Recusado'}
                        </span>
                      </div>
                    </div>
                  );
                })
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

        {/* TAB 4: FINANCEIRO & COBRANÇAS STRIPE (Apenas para ADMIN) */}
        {currentTab === 'payments' && isAdmin && (
          <div className="animate-in fade-in duration-300">
            <PaymentsHistory />
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
