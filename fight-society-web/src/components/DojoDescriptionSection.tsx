'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { DojoDescription } from '@/types/api';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function DojoDescriptionSection() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [dojo, setDojo] = useState<DojoDescription | null>(null);
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadDescription = async () => {
    try {
      const data = await api.getDojoDescription();
      setDojo(data);
      setDescription(data?.description || '');
    } catch (error) {
      console.error('Erro ao carregar descrição do dojo', error);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(loadDescription, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleSave = async () => {
    if (!token || !description.trim()) return;
    setSaving(true);
    try {
      const saved = dojo
        ? await api.updateDojoDescription(dojo.id, description, token)
        : await api.createDojoDescription(description, token);
      setDojo(saved);
      setDescription(saved.description);
      setEditing(false);
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Erro ao salvar descrição do dojo'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dojo || !token || !window.confirm('Tem certeza que deseja excluir a descrição do dojo?')) return;
    setSaving(true);
    try {
      await api.deleteDojoDescription(dojo.id, token);
      setDojo(null);
      setDescription('');
      setEditing(false);
    } catch (error: unknown) {
      alert(getErrorMessage(error, 'Erro ao excluir descrição do dojo'));
    } finally {
      setSaving(false);
    }
  };

  if (!dojo && !isAdmin) return null;

  return (
    <section className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <BookOpen size={19} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900">Sobre o dojo</h2>
            <p className="text-[11px] text-slate-400 font-medium">Conheça a Fight Society</p>
          </div>
        </div>
        {isAdmin && dojo && !editing && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setEditing(true)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50" title="Editar descrição">
              <Pencil size={16} />
            </button>
            <button type="button" onClick={handleDelete} disabled={saving} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50" title="Excluir descrição">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {editing || !dojo ? (
        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Digite a descrição do dojo..."
            rows={5}
            className="w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-y"
          />
          <div className="flex justify-end gap-2">
            {dojo && <button type="button" onClick={() => { setDescription(dojo.description); setEditing(false); }} className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">Cancelar</button>}
            <button type="button" onClick={handleSave} disabled={saving || !description.trim()} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 disabled:opacity-50">
              {saving ? 'Salvando...' : dojo ? 'Salvar alterações' : <><Plus size={14} className="inline mr-1" />Adicionar descrição</>}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-6 text-slate-600 whitespace-pre-wrap">{dojo.description}</p>
      )}
    </section>
  );
}
