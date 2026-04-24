'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Home, Briefcase, Users, BarChart3,
  FileText, Settings, HelpCircle, Menu, Crown, ChevronUp,
  MessageSquare, CalendarDays
} from 'lucide-react';
import Link from 'next/link';

const sidebarItems = [
  { icon: Home,           label: 'Dashboard',   href: '/' },
  { icon: Briefcase,      label: 'Jobs',         href: '/jobs' },
  { icon: Users,          label: 'Candidates',   href: '/candidates' },
  { icon: BarChart3,      label: 'Analytics',    href: '/analytics' },
  { icon: FileText,       label: 'Reports',      href: '/reports' },
  { icon: MessageSquare,  label: 'Messages',     href: '/messages' },
  { icon: CalendarDays,   label: 'Calendar',     href: '/calendar' },
  { icon: Settings,       label: 'Settings',     href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  return (
    <aside className={`
      fixed left-0 top-0 h-full bg-white border-r-2 border-slate-200
      transition-all duration-300 z-50 flex flex-col
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>

      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b-2 border-slate-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-sm">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900">TalentAI</h1>
              <p className="text-xs text-slate-500">Recruiter</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-sm mx-auto">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
        )}
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-4 h-4 text-slate-500" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute -right-3 top-6 w-6 h-6 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-sm"
          >
            <ChevronUp className="w-3 h-3 text-slate-500 rotate-90" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-0.5 px-3">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-rose-50 text-rose-600 border-2 border-rose-100'
                      : 'text-slate-600 hover:bg-slate-50 border-2 border-transparent hover:border-slate-100'
                    }
                    ${isCollapsed ? 'justify-center px-2' : ''}
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-rose-500' : 'text-slate-400'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Upgrade to Pro */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 border-2 border-rose-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-4 h-4 text-rose-500" />
              <p className="text-sm font-bold text-rose-700">Upgrade to Pro</p>
            </div>
            <p className="text-xs text-rose-600 mb-3 leading-relaxed">Unlock advanced features and smarter insights.</p>
            <button className="w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
              Upgrade Now →
            </button>
          </div>
        </div>
      )}

      {/* Help Center */}
      <div className="px-3 pb-3 border-t-2 border-slate-200 pt-3">
        <button className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 border-2 border-transparent hover:border-slate-100 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
          <HelpCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
          {!isCollapsed && <span>Help Center</span>}
        </button>
      </div>

      {/* User Profile Card */}
      <div className="border-t-2 border-slate-200 p-3">
        <button
          onClick={() => setIsUserOpen(!isUserOpen)}
          className={`flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 border-2 border-transparent hover:border-slate-100 transition-all ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            JD
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">Jane Doe</p>
                <p className="text-xs text-slate-500 truncate">jane@talentai.com</p>
              </div>
              <ChevronUp className={`w-4 h-4 text-slate-400 transition-transform ${isUserOpen ? '' : 'rotate-180'}`} />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
