'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { X, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ name, email, password, phone });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Falha na autenticação. Verifique os dados informados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md surface rounded-2xl p-6 sm:p-7 border border-zinc-800 text-zinc-100 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-red-500/40 bg-black shrink-0 shadow-sm">
            <Image
              src="/logo_dojo.jpg"
              alt="Fight Society"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {mode === 'login' ? 'Acesso ao Sistema' : 'Registro de Novo Aluno'}
            </h2>
            <p className="text-xs text-zinc-400 font-medium">
              Centro de Treinamento Bruno Silva
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-950/70 border border-red-800/80 text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
                <input
                  type="text"
                  required
                  placeholder="Nome do atleta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
              <input
                type="email"
                required
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-zinc-400 w-4 h-4" />
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-md btn-gradient text-white font-medium text-xs tracking-wide flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Acessar Conta' : 'Concluir Registro'}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="mt-5 text-center text-xs text-zinc-500">
          {mode === 'login' ? (
            <p>
              Novo aluno?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-zinc-300 hover:text-white transition ml-1"
              >
                Cadastre-se aqui
              </button>
            </p>
          ) : (
            <p>
              Já possui cadastro?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-zinc-300 hover:text-white transition ml-1"
              >
                Entrar na conta
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
