"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch, Provider } from "react-redux";
import {
  Users, Search, MapPin, Briefcase, ChevronDown,
  CheckCircle, Star, Loader2, Filter
} from "lucide-react";
import Link from "next/link";
import { fetchJobs } from "@/store/jobsSlice";
import { fetchApplicants } from "@/store/candidatesSlice";
import { RootState, AppDispatch, store } from "@/store";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export const dynamic = "force-dynamic";

const AVAILABILITY_COLORS: Record<string, string> = {
  "Available": "bg-green-100 text-green-700",
  "Open to Opportunities": "bg-amber-100 text-amber-700",
  "Not Available": "bg-slate-100 text-slate-500",
};

function CandidatesContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs } = useSelector((state: RootState) => state.jobs);
  const { applicants, loading } = useSelector((state: RootState) => state.candidates);
  const [search, setSearch] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchJobs()).then((action: any) => {
      const loadedJobs = action.payload || [];
      loadedJobs.forEach((job: any) => dispatch(fetchApplicants(job._id)));
    });
  }, [dispatch]);

  // Flatten all applicants across all jobs, deduplicate by email
  const allApplicants = Object.values(applicants).flat();
  const unique = Array.from(new Map(allApplicants.map((a: any) => [a.email, a])).values());

  const filtered = unique.filter((a: any) => {
    const matchSearch =
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      a.headline?.toLowerCase().includes(search.toLowerCase()) ||
      a.location?.toLowerCase().includes(search.toLowerCase()) ||
      a.skills?.some((s: any) => s.name?.toLowerCase().includes(search.toLowerCase()));
    const matchAvailability =
      filterAvailability === "All" || a.availability?.status === filterAvailability;
    return matchSearch && matchAvailability;
  });

  const availabilityCounts = {
    Available: unique.filter((a: any) => a.availability?.status === "Available").length,
    "Open to Opportunities": unique.filter((a: any) => a.availability?.status === "Open to Opportunities").length,
    "Not Available": unique.filter((a: any) => a.availability?.status === "Not Available").length,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16">
        <TopHeader />
        <div className="p-6 lg:p-8 space-y-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Candidates</h1>
            <p className="text-slate-500 mt-1">{unique.length} total across all jobs</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(availabilityCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterAvailability(filterAvailability === status ? "All" : status)}
                className={`card text-left transition-all hover:shadow-md ${
                  filterAvailability === status ? "ring-2 ring-rose-400" : ""
                }`}
              >
                <p className="text-2xl font-bold text-slate-900">{count}</p>
                <p className="text-sm text-slate-500 mt-1">{status}</p>
              </button>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, skill, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="All">All Availability</option>
              <option>Available</option>
              <option>Open to Opportunities</option>
              <option>Not Available</option>
            </select>
          </div>

          {/* Candidate List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-16">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No candidates found</p>
              <p className="text-slate-400 text-sm mt-1">
                {unique.length === 0
                  ? "Upload candidates from a job page to get started"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((applicant: any) => (
                <div key={applicant._id || applicant.email} className="card hover:shadow-sm transition-shadow">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === applicant._id ? null : applicant._id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-11 h-11 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {applicant.firstName?.[0]}{applicant.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {applicant.firstName} {applicant.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{applicant.headline}</p>
                        {applicant.location && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {applicant.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`hidden sm:inline text-xs font-medium px-2.5 py-1 rounded-full ${
                        AVAILABILITY_COLORS[applicant.availability?.status] || "bg-slate-100 text-slate-500"
                      }`}>
                        {applicant.availability?.status || "Unknown"}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                        expandedId === applicant._id ? "rotate-180" : ""
                      }`} />
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedId === applicant._id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Skills */}
                      {applicant.skills?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {applicant.skills.map((s: any) => (
                              <span key={s.name} className={`text-xs px-2 py-0.5 rounded-full ${
                                s.level === "Expert" ? "bg-rose-100 text-rose-700" :
                                s.level === "Advanced" ? "bg-purple-100 text-purple-700" :
                                s.level === "Intermediate" ? "bg-blue-100 text-blue-700" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {s.name} · {s.level}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {applicant.experience?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Experience</p>
                          <div className="space-y-1">
                            {applicant.experience.slice(0, 3).map((exp: any, i: number) => (
                              <div key={i} className="text-sm text-slate-600">
                                <span className="font-medium">{exp.role}</span>
                                <span className="text-slate-400"> at {exp.company}</span>
                                {exp.isCurrent && (
                                  <span className="ml-1.5 text-xs text-green-600 font-medium">· Current</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {applicant.education?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Education</p>
                          {applicant.education.slice(0, 1).map((edu: any, i: number) => (
                            <p key={i} className="text-sm text-slate-600">
                              {edu.degree} in {edu.fieldOfStudy}
                              <span className="text-slate-400"> · {edu.institution}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Availability */}
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Availability</p>
                        <p className="text-sm text-slate-600">
                          {applicant.availability?.status} · {applicant.availability?.type}
                        </p>
                      </div>

                      {/* Social Links */}
                      {applicant.socialLinks && (
                        <div className="md:col-span-2 flex gap-3">
                          {applicant.socialLinks.github && (
                            <a href={applicant.socialLinks.github} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-rose-500 hover:underline">GitHub</a>
                          )}
                          {applicant.socialLinks.linkedin && (
                            <a href={applicant.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-rose-500 hover:underline">LinkedIn</a>
                          )}
                          {applicant.socialLinks.portfolio && (
                            <a href={applicant.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-rose-500 hover:underline">Portfolio</a>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Provider store={store}>
      <CandidatesContent />
    </Provider>
  );
}
