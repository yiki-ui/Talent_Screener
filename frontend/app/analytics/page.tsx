"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import {
  BarChart3, Users, Briefcase, TrendingUp, Award,
  Target, MapPin, Loader2, Code2, CheckCircle
} from "lucide-react";

export const dynamic = "force-dynamic";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const SKILL_LEVEL_COLORS: Record<string, string> = {
  Expert: "bg-rose-500",
  Advanced: "bg-purple-500",
  Intermediate: "bg-blue-500",
  Beginner: "bg-slate-400",
};

const AVAILABILITY_COLORS: Record<string, string> = {
  Available: "bg-emerald-500",
  "Open to Opportunities": "bg-amber-500",
  "Not Available": "bg-slate-400",
};

function AnalyticsContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/analytics`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-16">
          <TopHeader />
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-10 h-10 text-rose-400 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-16">
          <TopHeader />
          <div className="p-8">
            <div className="card p-8 text-center">
              <p className="text-red-500">Failed to load analytics: {error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { overview, topSkills, availabilityBreakdown, locationBreakdown, scoreDistribution, skillLevelDistribution } = data;

  const maxSkillCount = Math.max(...topSkills.map((s: any) => s.count), 1);
  const maxScoreCount = Math.max(...scoreDistribution.map((s: any) => s.count), 1);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16">
        <TopHeader />
        <div className="p-6 lg:p-8 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Analytics</h1>
            <p className="text-slate-500 mt-1">Real-time insights from your talent pipeline</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-rose-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{overview.totalApplicants}</p>
              <p className="text-sm text-slate-500 mt-0.5">Total Candidates</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{overview.totalJobs}</p>
              <p className="text-sm text-slate-500 mt-0.5">Active Jobs</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{overview.completedScreenings}</p>
              <p className="text-sm text-slate-500 mt-0.5">AI Screenings Run</p>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{overview.avgMatchScore}%</p>
              <p className="text-sm text-slate-500 mt-0.5">Avg Match Score</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Top Skills */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Code2 className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-bold text-slate-900">Top Skills in Talent Pool</h2>
              </div>
              <div className="space-y-3">
                {topSkills.map((skill: any) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                      <span className="text-xs text-slate-400">
                        {skill.count} candidates · {skill.avgYears} avg yrs
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500"
                        style={{ width: `${(skill.count / maxSkillCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Distribution */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Target className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-bold text-slate-900">AI Score Distribution</h2>
              </div>
              {overview.totalEvaluated === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="w-10 h-10 text-slate-200 mb-3" />
                  <p className="text-slate-400 text-sm">Run an AI Screening first to see score distribution</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scoreDistribution.map((bucket: any) => (
                    <div key={bucket.range}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{bucket.range}%</span>
                        <span className="text-xs text-slate-400">{bucket.count} candidates</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${maxScoreCount > 0 ? (bucket.count / maxScoreCount) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Availability */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900">Availability</h2>
              </div>
              <div className="space-y-4">
                {availabilityBreakdown.map((item: any) => (
                  <div key={item.status} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${AVAILABILITY_COLORS[item.status] || "bg-slate-300"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{item.status}</p>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Level Distribution */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Award className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold text-slate-900">Skill Levels</h2>
              </div>
              <div className="space-y-4">
                {skillLevelDistribution.map((item: any) => (
                  <div key={item.level} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${SKILL_LEVEL_COLORS[item.level] || "bg-slate-300"}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{item.level}</p>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Breakdown */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-bold text-slate-900">Locations</h2>
              </div>
              <div className="space-y-4">
                {locationBreakdown.map((item: any) => (
                  <div key={item.location} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700">{item.location}</p>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Screening Summary */}
          {overview.totalEvaluated > 0 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-bold text-slate-900">AI Screening Summary</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-500">Total Evaluated</p>
                  <p className="text-2xl font-bold text-slate-900">{overview.totalEvaluated}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Shortlisted</p>
                  <p className="text-2xl font-bold text-emerald-600">{overview.totalShortlisted}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Avg Match Score</p>
                  <p className="text-2xl font-bold text-purple-600">{overview.avgMatchScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Screenings Run</p>
                  <p className="text-2xl font-bold text-amber-600">{overview.completedScreenings}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Provider store={store}>
      <AnalyticsContent />
    </Provider>
  );
}
