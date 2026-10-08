'use client';

import React, { useEffect, useState } from 'react';
import { Plan } from '@/types/api';
import { useAuth } from '@/lib/auth-context';
import {
  QrCode,
  Barcode,
  CreditCard,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  plan: Plan | null;
  onClose: () => void;
  /** Creates the Asaas charge and redirects to the invoice; rejects with an Error on failure. */
  onCheckout: (cpf?: string) => Promise<void>;
}

const METHODS = [
  { icon: QrCode, label: 'PIX' },
  { icon: Barcode, label: 'Boleto' },
  { icon: CreditCard, label: 'Cartão' },
];

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function CheckoutModal({ isOpen, plan, onClose, onCheckout }: CheckoutModalProps) {
  const { user } = useAuth();
  const [cpf, setCpf] = useState('');
  const [needsCpf, setNeedsCpf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setNeedsCpf(!user?.cpf);
      setCpf('');
      setError(null);
    }
  }, [isOpen, user?.cpf]);

  if (!isOpen || !plan) return null;

  const priceFormatted = Number(plan.price).toFixed(2).replace('.', ',');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (needsCpf && cpf.replace(/\D/g, '').length !== 11) {
      setError('Informe um CPF válido com 11 dígitos.');
      return;
    }

    setLoading(true);
    try {
      await onCheckout(needsCpf ? cpf : undefined);
    } catch (err: any) {
      const message: string = err?.message || 'Erro ao gerar a cobrança.';
      if (message.startsWith('CPF_REQUIRED')) {
        setNeedsCpf(true);
        setError('Informe seu CPF para gerar a cobrança.');
      } else {
        setError(message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md surface rounded-xl p-6 sm:p-7 border border-zinc-800 text-zinc-100 max-h-[92vh] overflow-y-auto shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition"
        >
          <X size={18} />
        </button>

        <div className="mb-5 pb-4 border-b border-zinc-800">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 block">
            Matrícula
          </span>
          <h3 className="text-lg font-bold text-zinc-100 tracking-tight mt-1">{plan.name}</h3>
          <p className="mt-1 text-2xl font-extrabold text-white tracking-tight">
            <span className="text-sm font-semibold text-zinc-400 mr-1">R$</span>
            {priceFormatted}
            <span className="ml-1.5 text-xs font-medium text-zinc-500">/ {plan.durationDays} dias</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="text-xs text-zinc-400 mb-2.5">Formas de pagamento aceitas</p>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 py-3 text-xs font-medium text-zinc-300"
                >
                  <Icon size={18} className="text-zinc-400" />
                  {label}
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-500">
              Você escolhe a forma de pagamento na próxima tela. Sua matrícula é ativada
              automaticamente assim que o pagamento for confirmado.
            </p>
          </div>

          {needsCpf && (
            <div>
              <label htmlFor="checkout-cpf" className="block text-xs font-semibold text-zinc-200 mb-1.5">
                CPF
              </label>
              <input
                id="checkout-cpf"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                className="w-full py-2.5 px-3 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-red-500 transition"
              />
              <p className="mt-1.5 text-[11px] text-zinc-500">
                Necessário para emitir a cobrança. Fica salvo no seu perfil.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg btn-gradient text-white text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Ir para pagamento
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck size={13} className="text-emerald-500" />
            Pagamento processado com segurança pelo Asaas
          </p>
        </form>
      </div>
    </div>
  );
}
