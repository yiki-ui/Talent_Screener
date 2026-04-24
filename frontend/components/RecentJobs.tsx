import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Briefcase, Users, Calendar, ArrowRight, Plus } from 'lucide-react';
import { fetchJobs } from '@/store/jobsSlice';
import type { RootState, AppDispatch } from '@/store';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function RecentJobs() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading } = useSelector((state: RootState) => state.jobs);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    const sorted = [...jobs]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
    setRecentJobs(sorted);
  }, [jobs]);

  if (loading && recentJobs.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">Recent Jobs</h2>
          </div>
          <button onClick={() => router.push('/jobs')} className="flex items-center gap-1 text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors">
            View all
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-slate-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentJobs.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">Recent Jobs</h2>
          </div>
          <button onClick={() => router.push('/jobs')} className="flex items-center gap-1 text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors">
            View all
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="p-12 text-center flex flex-col items-center">
          <div className="relative w-48 h-48 mb-6">
            <Image 
              src="/empty-jobs.png" 
              alt="No jobs yet" 
              fill
              className="object-contain opacity-90"
            />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs yet</h3>
          <p className="text-sm text-slate-500 mb-6">Create your first job posting to get started</p>
          <button onClick={() => router.push('/jobs')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900">Recent Jobs</h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 rounded-full">
            {recentJobs.length}
          </span>
        </div>
        <button onClick={() => router.push('/jobs')} className="flex items-center gap-1 text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors">
          View all
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {recentJobs.map((job) => {
          const applicantCount = job.applicantCount || 0;
          return (
            <div
              key={job._id}
              onClick={() => router.push(`/jobs/${job._id}`)}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
            >
              <div className="w-11 h-11 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Briefcase className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
                <p className="text-sm text-slate-500 truncate">{job.department || 'General'}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {applicantCount} applicant{applicantCount !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(job.createdAt)}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
}