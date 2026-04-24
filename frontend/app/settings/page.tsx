"use client";

import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import { Provider } from 'react-redux';
import { store } from '@/store';

function SettingsContent() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16">
        <TopHeader />
        <div className="p-6 lg:p-8 space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Configure your account and application preferences.</p>
          
          <div className="card mt-8 p-12 text-center text-slate-500">
            Settings module is under construction.
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Provider store={store}>
      <SettingsContent />
    </Provider>
  );
}
