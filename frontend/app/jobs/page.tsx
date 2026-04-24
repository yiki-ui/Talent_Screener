"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch, Provider } from "react-redux";
import {
  Briefcase, Plus, Search, Trash2, Eye, Users,
  MapPin, Clock, ChevronDown, X, Loader2
} from "lucide-react";
import Link from "next/link";
import { fetchJobs, createJob, deleteJob } from "@/store/jobsSlice";
import { RootState, AppDispatch, store } from "@/store";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export const dynamic = "force-dynamic";

const EXPERIENCE_LEVELS = ["Entry Level", "Junior", "Mid Level", "Senior", "Lead", "Principal"];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote"];

function JobsContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, loading, error } = useSelector((state: RootState) => state.jobs);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", department: "", location: "", type: "Full-time",
    experienceLevel: "Mid Level", description: "", requirements: "",
    skills: "", salaryMin: "", salaryMax: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  const filtered = jobs.filter((j: any) =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.department?.toLowerCase().includes(search.toLowerCase()) ||
    j.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await dispatch(createJob({
      ...form,
      requirements: form.requirements.split("\n").filter(Boolean),
      skills: form.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
      salary: form.salaryMin
        ? { min: Number(form.salaryMin), max: Number(form.salaryMax), currency: "USD" }
        : undefined,
    }));
    setSubmitting(false);
    setShowModal(false);
    setForm({
      title: "", department: "", location: "", type: "Full-time",
      experienceLevel: "Mid Level", description: "", requirements: "",
      skills: "", salaryMin: "", salaryMax: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    setDeleting(id);
    await dispatch(deleteJob(id));
    setDeleting(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16">
        <TopHeader />
        <div className="p-6 lg:p-8 space-y-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Jobs</h1>
              <p className="text-slate-500 mt-1">{jobs.length} total positions</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Job
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
          )}

          {/* Jobs Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No jobs found</p>
              <p className="text-slate-400 text-sm mt-1">Create your first job posting to get started</p>
              <button onClick={() => setShowModal(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((job: any) => (
                <div key={job._id} className="card hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-rose-500" />
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {job.status || "active"}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">{job.title}</h3>
                  <p className="text-sm text-rose-500 font-medium mb-3">{job.department}</p>

                  <div className="space-y-1.5 mb-4">
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {job.type || job.experienceLevel}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="w-3.5 h-3.5" />
                      {job.applicantCount ?? 0} applicants
                    </div>
                  </div>

                  {job.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {job.skills.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-xs text-slate-400">+{job.skills.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/jobs/${job._id}`}
                      className="flex-1 btn-secondary inline-flex items-center justify-center gap-1.5 text-sm py-2"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
                      disabled={deleting === job._id}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      {deleting === job._id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Create New Job</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department *</label>
                  <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Kigali, Rwanda / Remote"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                    {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                  <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
                    {EXPERIENCE_LEVELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
                  <input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    placeholder="e.g. Node.js, TypeScript, MongoDB"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Describe the role..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (one per line)</label>
                <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  rows={3} placeholder="3+ years Node.js experience&#10;Strong TypeScript skills&#10;..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Salary (USD)</label>
                  <input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                    placeholder="50000"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Salary (USD)</label>
                  <input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                    placeholder="80000"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {submitting ? "Creating..." : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Provider store={store}>
      <JobsContent />
    </Provider>
  );
}
