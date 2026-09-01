'use client';

import React, { useState } from 'react';
import { Plan } from '@/types/api';
import { CreditCard, QrCode, Copy, Check, X, ShieldCheck, ArrowRight, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface PixCheckoutModalProps {
  isOpen: boolean;
  plan: Plan | null;
  onClose: () => void;
  onPayWithCard: () => void;
  isCardLoading?: boolean;
}

export function PixCheckoutModal({
  isOpen,
  plan,
  onClose,
  onPayWithCard,
  isCardLoading = false,
}: PixCheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'pix'>('pix');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !plan) return null;

  const priceFormatted = Number(plan.price).toFixed(2);
  // Standard simulated Pix Copia e Cola string with standard EMVCo payload format
  const pixPayload = `00020126580014BR.GOV.BCB.PIX0136fightsociety-pagamentos-${plan.id.slice(0, 8)}520400005303986540${priceFormatted.length}${priceFormatted}5802BR5913FIGHT SOCIETY6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-red-100 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <span className="text-[10px] font-black uppercase text-red-600 tracking-wider block">
            Matrícula & Pagamento
          </span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {plan.name}
          </h3>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-2xl font-black text-slate-900">R$ {priceFormatted}</span>
            <span className="text-xs text-slate-500 font-medium">({plan.durationDays} dias)</span>
          </div>
        </div>

        {/* Payment Method Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setSelectedMethod('pix')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              selectedMethod === 'pix'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode size={15} />
            <span>Pagar com PIX</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition ${
              selectedMethod === 'card'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard size={15} />
            <span>Cartão (Stripe)</span>
          </button>
        </div>

        {/* PIX METHOD VIEW */}
        {selectedMethod === 'pix' && (
          <div className="space-y-4 animate-in fade-in duration-200 text-center">
            {/* Pix QR Code Container */}
            <div className="w-48 h-48 mx-auto bg-slate-900 rounded-3xl p-3.5 flex items-center justify-center shadow-lg border border-slate-800">
              <div className="w-full h-full bg-white rounded-2xl p-2 flex flex-col items-center justify-center">
                {/* Simulated High-Res QR Code Pattern */}
                <div className="grid grid-cols-8 gap-1 w-36 h-36 p-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 7 || i === 56 || i === 63 || i === 18 || i === 27 || i === 36
                          ? 'bg-black'
                          : i % 5 === 0
                          ? 'bg-red-600'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full w-fit mx-auto border border-emerald-200">
              <Clock size={12} />
              <span>Aprovação Imediata via Pix</span>
            </div>

            {/* Pix Copia e Cola Box */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-1.5">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-500">
                <span>Código Pix Copia e Cola</span>
                <span className="text-red-600 font-bold">1 Clique</span>
              </div>
              <div className="text-[11px] font-mono text-slate-700 truncate bg-white p-2 rounded-xl border border-slate-200 select-all">
                {pixPayload}
              </div>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyPix}
              className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-500/20 flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Código Pix Copiado com Sucesso!' : 'Copiar Código Pix'}</span>
            </button>

            <p className="text-[11px] text-slate-400">
              Abra o aplicativo do seu banco, escolha <strong>Pix Copia e Cola</strong> e cole o código para concluir.
            </p>
          </div>
        )}

        {/* CARD (STRIPE) VIEW */}
        {selectedMethod === 'card' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Pagamento com Cartão</h4>
                  <p className="text-[11px] text-slate-500">Crédito ou débito processado com segurança pela Stripe</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Plano</span>
                  <span className="font-bold text-slate-900">{plan.name}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total</span>
                  <span className="font-black text-slate-900">R$ {priceFormatted}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onPayWithCard}
              disabled={isCardLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              {isCardLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continuar para Stripe Checkout</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>Ambiente de pagamento seguro com criptografia de ponta a ponta</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
