"use client";

import { useEffect, useState } from 'react';
import { useSelector, useDispatch, Provider } from 'react-redux';
import {
  BarChart3,
  Briefcase,
  Users,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { fetchJobs } from '@/store/jobsSlice';
import { RootState, AppDispatch, store } from '@/store';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import MetricCard from '@/components/MetricCard';
import RecentJobs from '@/components/RecentJobs';
import QuickActionCard from '@/components/QuickActionCard';

export const dynamic = 'force-dynamic';

const generateSparklineData = (base: number, variance: number, points: number = 7) => {
  return Array.from({ length: points }, () => {
    return Math.max(10, base + Math.random() * variance * 2 - variance);
  });
};

function DashboardContent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading } = useSelector((state: RootState) => state.jobs);
  const [stats, setStats] = useState({
    totalApplicants: 0,
    screeningsRun: 0,
    activeJobs: 0,
    avgMatchScore: 0,
  });

  // Sparkline data for metric cards
  const sparklineData = {
    applicants: generateSparklineData(40, 25),
    screenings: generateSparklineData(30, 20),
    jobs: generateSparklineData(20, 15),
    scores: generateSparklineData(60, 30),
  };

  useEffect(() => {
    dispatch(fetchJobs());
    // Fetch real stats from analytics API
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${API_URL}/analytics`)
      .then(r => r.json())
      .then(data => {
        setStats({
          totalApplicants: data.overview?.totalApplicants || 0,
          screeningsRun: data.overview?.completedScreenings || 0,
          activeJobs: data.overview?.totalJobs || 0,
          avgMatchScore: data.overview?.avgMatchScore || 0,
        });
      })
      .catch(() => {});
  }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16">
        <TopHeader />

        <div className="p-6 lg:p-8 space-y-8">
          {/* Welcome + Page Header */}
          <div>
            <p className="text-sm text-slate-500 mb-1">Welcome back, Jane! 👋</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your hiring pipeline.</p>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label="Total Applicants"
              value={stats.totalApplicants}
              icon={Users}
              color="rose"
              change={{ value: 12, label: 'vs last month' }}
              sparklineData={sparklineData.applicants}
            />
            <MetricCard
              label="Screenings Run"
              value={stats.screeningsRun}
              icon={BarChart3}
              color="green"
              change={{ value: 8, label: 'vs last month' }}
              sparklineData={sparklineData.screenings}
            />
            <MetricCard
              label="Active Jobs"
              value={stats.activeJobs}
              icon={Briefcase}
              color="purple"
              change={{ value: -2, label: 'vs last month' }}
              sparklineData={sparklineData.jobs}
            />
            <MetricCard
              label="Avg Match Score"
              value={`${stats.avgMatchScore}%`}
              icon={TrendingUp}
              color="amber"
              change={{ value: 5, label: 'vs last month' }}
              sparklineData={sparklineData.scores}
            />
          </div>

          {/* Recent Jobs */}
          <div className="w-full">
            <RecentJobs />
          </div>

          {/* Quick Actions */}
          <div className="w-full">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickActionCard
                label="Create New Job"
                description="Post a new job opening"
                icon={Briefcase}
                color="rose"
                onClick={() => router.push('/jobs')}
              />
              <QuickActionCard
                label="Upload Resumes"
                description="Bulk import candidates"
                icon={Users}
                color="green"
                onClick={() => router.push('/candidates')}
              />
              <QuickActionCard
                label="Run AI Screening"
                description="Evaluate candidates"
                icon={BarChart3}
                color="purple"
                onClick={() => router.push('/jobs')}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Provider store={store}>
      <DashboardContent />
    </Provider>
  );
}
