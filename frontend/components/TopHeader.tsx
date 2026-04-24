'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Bell, Search, ChevronDown, Menu, Calendar } from 'lucide-react';
import { toggleSidebar } from '@/store/uiSlice';

export default function TopHeader() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dispatch = useDispatch();

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white/90 backdrop-blur-md border-b-2 border-slate-200 z-40 transition-all duration-300">
      <div className="flex items-center justify-between h-full px-6">

        {/* Left: Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidates, jobs..."
              className="w-80 pl-10 pr-12 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded font-mono">&amp;#8984;K</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsProfileOpen(false); }}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 relative border-2 border-transparent hover:border-slate-200"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 rounded-full ring-2 ring-white flex items-center justify-center">
                <span className="text-[10px] font-bold text-white leading-none">3</span>
              </span>
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border-2 border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b-2 border-slate-100">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                </div>
                {[
                  { title: '3 new candidates applied', sub: 'Senior Developer position', time: '2 min ago' },
                  { title: 'AI screening completed', sub: 'Marketing Manager role', time: '1 hour ago' },
                  { title: 'New resume uploaded', sub: 'UX Designer position', time: '3 hours ago' },
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.sub}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white text-sm text-slate-700 transition-all">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">May 12 &ndash; May 18, 2024</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationOpen(false); }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 border-2 border-transparent hover:border-slate-200 transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                JD
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-900 leading-none">Jane Doe</p>
                <p className="text-xs text-slate-500 mt-0.5">Recruiter</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border-2 border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b-2 border-slate-100">
                  <p className="font-semibold text-slate-900">Jane Doe</p>
                  <p className="text-xs text-slate-500">jane@talentai.com</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors">Profile Settings</button>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors">Account Settings</button>
                <div className="border-t-2 border-slate-100 my-1" />
                <button className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 transition-colors">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
