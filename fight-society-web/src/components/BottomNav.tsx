'use client';

import React from 'react';
import { CreditCard, LayoutDashboard, LucideIcon, Swords, User as UserIcon, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type TabType = 'home' | 'students' | 'plans' | 'payments' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

interface NavItem {
  tab: TabType;
  title: string;
  icon: LucideIcon;
}

const studentItems: NavItem[] = [
  { tab: 'home', title: 'Minha matrícula', icon: LayoutDashboard },
  { tab: 'plans', title: 'Planos de treino', icon: Swords },
  { tab: 'profile', title: 'Meu perfil', icon: UserIcon },
];

const adminItems: NavItem[] = [
  { tab: 'home', title: 'Painel geral', icon: LayoutDashboard },
  { tab: 'students', title: 'Gestão de alunos', icon: Users },
  { tab: 'plans', title: 'Gerenciar planos', icon: Swords },
  { tab: 'payments', title: 'Financeiro', icon: CreditCard },
  { tab: 'profile', title: 'Meu perfil', icon: UserIcon },
];

export function BottomNav({ currentTab, onSelectTab }: BottomNavProps) {
  const { user } = useAuth();
  const items = user?.role === 'ADMIN' ? adminItems : studentItems;

  return (
    <nav className="floating-nav" aria-label="Navegação principal">
      <div className="floating-nav__inner">
        {items.map(({ tab, title, icon: Icon }) => {
          const isActive = currentTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              title={title}
              aria-label={title}
              aria-current={isActive ? 'page' : undefined}
              className={`floating-nav__item ${isActive ? 'floating-nav__item--active' : ''}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.6 : 2} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
