'use client';

import React, { FormEvent, useState } from 'react';
import { KeyRound, Loader2, LogOut, Save, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function ProfileSection() {
  const { user, logout, updateProfile, updatePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const clearFeedback = () => {
    setMessage('');
    setError('');
  };

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearFeedback();
    if (email.trim().toLowerCase() !== user?.email.toLowerCase() && !profilePassword) {
      setError('Informe sua senha atual para alterar o e-mail.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        currentPassword: profilePassword || undefined,
      });
      setProfilePassword('');
      setMessage('Dados atualizados com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar os dados.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    clearFeedback();
    if (newPassword !== confirmPassword) {
      setError('A confirmação da senha não confere.');
      return;
    }
    setSavingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage('Senha alterada com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;

  const inputClass = 'w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-red-600 transition';
  const labelClass = 'mb-1 block text-xs font-mono uppercase tracking-wider text-zinc-400';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="flex items-end justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">Credenciais</p>
          <h2 className="text-lg font-bold text-zinc-100">Perfil de Usuário</h2>
        </div>
        <div className="flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-mono text-zinc-400 border border-zinc-800 bg-[#121215]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {user.role === 'ADMIN' ? 'ADMINISTRADOR' : 'ATLETA / ALUNO'}
        </div>
      </div>

      {(message || error) && (
        <div className={`rounded-md px-3.5 py-2.5 text-xs font-medium border ${
          error 
            ? 'bg-red-950/70 text-red-300 border-red-800/80' 
            : 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80'
        }`}>
          {error || message}
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-xl bg-[#121215] border border-zinc-800 p-5">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300">
            <UserIcon size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">Dados Cadastrais</h3>
            <p className="text-[11px] text-zinc-400">Identificação e contatos no sistema.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Nome Completo
          </label>
          <input
            required
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              E-mail
            </label>
            <input
              required
              type="email"
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Telefone / WhatsApp
            </label>
            <input
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 transition"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {email.trim().toLowerCase() !== user.email.toLowerCase() && (
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Senha atual para confirmar alteração de e-mail
            </label>
            <input
              required
              type="password"
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 transition"
              value={profilePassword}
              onChange={(e) => setProfilePassword(e.target.value)}
            />
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-zinc-800/80">
          <button
            disabled={savingProfile || savingPassword}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50 shadow-sm"
          >
            {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            <span>{savingProfile ? 'Gravando...' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-xl bg-[#121215] border border-zinc-800 p-5">
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300">
            <KeyRound size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">Segurança da Conta</h3>
            <p className="text-[11px] text-zinc-400">Atualização de credencial de acesso.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
            Senha Atual
          </label>
          <input
            required
            minLength={6}
            type="password"
            className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 transition"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Nova Senha
            </label>
            <input
              required
              minLength={6}
              type="password"
              placeholder="Mínimo 6 dígitos"
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-200 mb-1.5">
              Confirmar Nova Senha
            </label>
            <input
              required
              minLength={6}
              type="password"
              placeholder="Repita a nova senha"
              className="w-full rounded-lg border border-zinc-700/80 bg-zinc-900 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-red-500 transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800/80">
          <button
            disabled={savingProfile || savingPassword}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-800 border border-zinc-700 py-2.5 text-xs font-medium text-zinc-200 transition hover:bg-zinc-700 disabled:opacity-50"
          >
            {savingPassword ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={13} />}
            <span>{savingPassword ? 'Alterando...' : 'Atualizar Senha'}</span>
          </button>
        </div>
      </form>

      <button onClick={logout} className="flex w-full items-center justify-center gap-1.5 rounded-md bg-zinc-900 border border-zinc-800 py-2.5 text-xs font-medium text-red-400 transition hover:bg-zinc-800 hover:border-zinc-700">
        <LogOut size={14} />
        Encerrar Sessão
      </button>
    </div>
  );
}
