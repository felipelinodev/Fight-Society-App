'use client';

import React from 'react';
import { CalendarCheck, CreditCard, LayoutDashboard, LucideIcon, Swords, User as UserIcon, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type TabType = 'home' | 'students' | 'plans' | 'payments' | 'checkins' | 'profile';

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
  { tab: 'home', title: 'Início', icon: LayoutDashboard },
  { tab: 'checkins', title: 'Check-in', icon: CalendarCheck },
  { tab: 'plans', title: 'Planos', icon: Swords },
  { tab: 'profile', title: 'Perfil', icon: UserIcon },
];

const adminItems: NavItem[] = [
  { tab: 'home', title: 'Painel', icon: LayoutDashboard },
  { tab: 'students', title: 'Alunos', icon: Users },
  { tab: 'plans', title: 'Planos', icon: Swords },
  { tab: 'payments', title: 'Financeiro', icon: CreditCard },
  { tab: 'profile', title: 'Perfil', icon: UserIcon },
];

export function BottomNav({ currentTab, onSelectTab }: BottomNavProps) {
  const { user } = useAuth();
  const items = user?.role === 'ADMIN' ? adminItems : studentItems;

  return (
    <nav className="flat-nav" aria-label="Navegação principal">
      <div className="flat-nav__inner">
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
              className={`flat-nav__item ${isActive ? 'flat-nav__item--active' : ''}`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-red-500' : 'text-zinc-400'} aria-hidden="true" />
              <span className={`text-[11px] font-medium tracking-tight transition-colors ${
                isActive ? 'text-white font-semibold' : 'text-zinc-400'
              }`}>
                {title}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
