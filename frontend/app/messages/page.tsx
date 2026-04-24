"use client";

import { MessageSquare } from 'lucide-react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';

function MessagesContent() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16">
        <TopHeader />
        <div className="p-6 lg:p-8">
          <div className="max-w-2xl mx-auto">
            <div className="card p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-slate-300" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Messages</h1>
              <p className="text-slate-500">This feature is coming in the next release</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Provider store={store}>
      <MessagesContent />
    </Provider>
  );
}
