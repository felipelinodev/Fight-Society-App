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

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100';
  const labelClass = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500';

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-end justify-between gap-3">
        <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-red-600">Conta</p>
        <h2 className="text-2xl font-black text-slate-900">Meu Perfil</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 shadow-xs border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {user.role === 'ADMIN' ? 'Administrador' : 'Aluno'}
        </div>
      </div>

      {(message || error) && (
        <div className={`rounded-2xl px-4 py-3 text-xs font-bold ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="space-y-4 rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600"><UserIcon size={20} /></div>
          <div><h3 className="text-sm font-black text-slate-900">Dados pessoais</h3><p className="text-[11px] text-slate-500">Atualize suas informações de acesso.</p></div>
        </div>
        <label><span className={labelClass}>Nome</span><input required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label><span className={labelClass}>E-mail</span><input required type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label><span className={labelClass}>Telefone</span><input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        {email.trim().toLowerCase() !== user.email.toLowerCase() && (
          <label><span className={labelClass}>Senha atual para confirmar o novo e-mail</span><input required type="password" className={inputClass} value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} /></label>
        )}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <button disabled={savingProfile || savingPassword} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60">
            {savingProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {savingProfile ? 'Salvando...' : 'Salvar dados'}
          </button>
        </div>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 rounded-3xl bg-white border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><KeyRound size={20} /></div>
          <div><h3 className="text-sm font-black text-slate-900">Alterar senha</h3><p className="text-[11px] text-slate-500">Use pelo menos 6 caracteres.</p></div>
        </div>
        <label><span className={labelClass}>Senha atual</span><input required minLength={6} type="password" className={inputClass} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></label>
        <label><span className={labelClass}>Nova senha</span><input required minLength={6} type="password" className={inputClass} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></label>
        <label><span className={labelClass}>Confirmar nova senha</span><input required minLength={6} type="password" className={inputClass} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></label>
        <div className="mt-6 border-t border-slate-100 pt-5">
          <button disabled={savingProfile || savingPassword} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
            {savingPassword ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            {savingPassword ? 'Alterando...' : 'Alterar senha'}
          </button>
        </div>
      </form>

      <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-50 py-3.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100"><LogOut size={16} />Sair da conta</button>
    </div>
  );
}
