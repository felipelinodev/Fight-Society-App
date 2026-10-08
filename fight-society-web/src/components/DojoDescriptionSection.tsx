'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
    <section className="p-5 rounded-2xl bg-gradient-to-br from-[#141418] to-[#18181f] border border-zinc-800 space-y-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-red-500/40 bg-black shrink-0 shadow-sm">
            <Image
              src="/logo_dojo.jpg"
              alt="Fight Society"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-zinc-300">Sobre o Centro de Treinamento</h2>
            <p className="text-sm font-bold text-white mt-0.5">Filosofia & Metodologia Fight Society</p>
          </div>
        </div>
        {isAdmin && dojo && !editing && (
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setEditing(true)} className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800" title="Editar descrição">
              <Pencil size={15} />
            </button>
            <button type="button" onClick={handleDelete} disabled={saving} className="p-1.5 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800" title="Excluir descrição">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {editing || !dojo ? (
        <div className="space-y-3">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Digite a apresentação institucional da academia..."
            rows={5}
            className="w-full rounded-md border border-zinc-700 bg-zinc-900/80 p-3 text-sm text-zinc-200 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 resize-y"
          />
          <div className="flex justify-end gap-2">
            {dojo && <button type="button" onClick={() => { setDescription(dojo.description); setEditing(false); }} className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition">Cancelar</button>}
            <button type="button" onClick={handleSave} disabled={saving || !description.trim()} className="px-4 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition disabled:opacity-50">
              {saving ? 'Gravando...' : dojo ? 'Salvar Alterações' : <><Plus size={13} className="inline mr-1" />Adicionar Descrição</>}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 whitespace-pre-wrap">{dojo.description}</p>
      )}
    </section>
  );
}
