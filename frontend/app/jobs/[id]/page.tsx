"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch, Provider } from "react-redux";
import {
  Briefcase, Users, BarChart3, Upload, Loader2, ArrowLeft,
  CheckCircle, AlertCircle, Trophy, TrendingUp, ChevronDown,
  FileText, MapPin, Clock, Star, X, Plus
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchJobs } from "@/store/jobsSlice";
import { fetchApplicants, uploadApplicantsJSON, uploadCSVFile } from "@/store/candidatesSlice";
import { triggerAIScreening, fetchScreeningsByJob } from "@/store/screeningSlice";
import { RootState, AppDispatch, store } from "@/store";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";

export const dynamic = "force-dynamic";

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-700 bg-green-100" :
    score >= 60 ? "text-amber-700 bg-amber-100" : "text-red-700 bg-red-100";
  return (
    <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${color}`}>
      {score}
    </span>
  );
}

function JobDetailContent() {
  const params = useParams();
  const jobId = params.id as string;
  const dispatch = useDispatch<AppDispatch>();

  const { jobs } = useSelector((state: RootState) => state.jobs);
  const { applicants, loading: candidatesLoading } = useSelector((state: RootState) => state.candidates);
  const { results, loading: screeningLoading } = useSelector((state: RootState) => state.screening);

  const job = jobs.find((j: any) => j._id === jobId);
  const jobApplicants = applicants[jobId] || [];
  const screenings = Object.values(results).filter((s: any) => s?.jobId === jobId);
  const latestScreening = screenings.sort((a: any, b: any) =>
    new Date(b?.createdAt).getTime() - new Date(a?.createdAt).getTime())[0] as any;

  const [tab, setTab] = useState<"candidates" | "screening">("candidates");
  const [shortlistSize, setShortlistSize] = useState<10 | 20>(10);
  const [uploadType, setUploadType] = useState<"json" | "csv">("json");
  const [jsonInput, setJsonInput] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchApplicants(jobId));
    dispatch(fetchScreeningsByJob(jobId));
  }, [jobId, dispatch]);

  const handleJSONUpload = async () => {
    setUploadError("");
    try {
      const data = JSON.parse(jsonInput);
      const arr = Array.isArray(data) ? data : [data];
      await dispatch(uploadApplicantsJSON({ jobId, data: arr }));
      setJsonInput("");
      setShowUpload(false);
      dispatch(fetchApplicants(jobId));
    } catch {
      setUploadError("Invalid JSON. Please check your input.");
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await dispatch(uploadCSVFile({ jobId, file }));
    dispatch(fetchApplicants(jobId));
    setShowUpload(false);
  };

  const handleScreening = async () => {
    await dispatch(triggerAIScreening({ jobId, shortlistSize }));
    setTab("screening");
  };

  if (!job && jobs.length > 0) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 pt-16">
          <TopHeader />
          <div className="p-8 text-center">
            <p className="text-slate-500">Job not found.</p>
            <Link href="/jobs" className="btn-primary mt-4 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16">
        <TopHeader />
        <div className="p-6 lg:p-8 space-y-6">

          {/* Back + Job Header */}
          <div>
            <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </Link>
            {job ? (
              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                      <p className="text-rose-500 font-medium">{job.department}</p>
                      <div className="flex flex-wrap gap-3 mt-2">
                        {job.location && (
                          <span className="flex items-center gap-1.5 text-sm text-slate-500">
                            <MapPin className="w-3.5 h-3.5" /> {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Clock className="w-3.5 h-3.5" /> {job.type}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-slate-500">
                          <Users className="w-3.5 h-3.5" /> {jobApplicants.length} candidates
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={shortlistSize}
                      onChange={(e) => setShortlistSize(Number(e.target.value) as 10 | 20)}
                      className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    >
                      <option value={10}>Top 10</option>
                      <option value={20}>Top 20</option>
                    </select>
                    <button
                      onClick={handleScreening}
                      disabled={screeningLoading || jobApplicants.length === 0}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      {screeningLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Screening...</>
                        : <><BarChart3 className="w-4 h-4" /> Run AI Screening</>}
                    </button>
                  </div>
                </div>

                {job.description && (
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {job.description}
                  </p>
                )}

                {job.requiredSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.requiredSkills.map((skill: string) => (
                      <span key={skill} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card animate-pulse h-40" />
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
            {(["candidates", "screening"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  tab === t ? "bg-rose-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}>
                {t === "candidates" ? `Candidates (${jobApplicants.length})` : "AI Screening Results"}
              </button>
            ))}
          </div>

          {/* Candidates Tab */}
          {tab === "candidates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Candidates</h2>
                <button onClick={() => setShowUpload(!showUpload)}
                  className="btn-secondary inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Candidates
                </button>
              </div>

              {/* Upload Panel */}
              {showUpload && (
                <div className="card border-2 border-dashed border-rose-200 bg-rose-50/30">
                  <div className="flex gap-2 mb-4">
                    {(["json", "csv"] as const).map((t) => (
                      <button key={t} onClick={() => setUploadType(t)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors uppercase ${
                          uploadType === t ? "bg-rose-500 text-white" : "bg-white text-slate-600 border border-slate-200"
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  {uploadType === "json" ? (
                    <div className="space-y-3">
                      <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        rows={6}
                        placeholder='[{"firstName": "Alice", "lastName": "Smith", "email": "alice@example.com", "headline": "Senior Engineer", "skills": [...], ...}]'
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none bg-white"
                      />
                      {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
                      <button onClick={handleJSONUpload} className="btn-primary inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Import JSON
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500 mb-3">Upload a CSV file with candidate data</p>
                      <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Choose CSV File
                        <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Candidate List */}
              {candidatesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
                </div>
              ) : jobApplicants.length === 0 ? (
                <div className="card text-center py-16">
                  <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No candidates yet</p>
                  <p className="text-slate-400 text-sm mt-1">Upload JSON or CSV to add candidates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobApplicants.map((applicant: any) => (
                    <div key={applicant._id} className="card hover:shadow-sm transition-shadow">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedCandidate(
                          expandedCandidate === applicant._id ? null : applicant._id
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {applicant.firstName?.[0]}{applicant.lastName?.[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {applicant.firstName} {applicant.lastName}
                            </p>
                            <p className="text-sm text-slate-500">{applicant.headline}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            applicant.availability?.status === "Available"
                              ? "bg-green-100 text-green-700"
                              : applicant.availability?.status === "Open to Opportunities"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {applicant.availability?.status || "Unknown"}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                            expandedCandidate === applicant._id ? "rotate-180" : ""
                          }`} />
                        </div>
                      </div>

                      {expandedCandidate === applicant._id && (
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                          {applicant.skills?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Skills</p>
                              <div className="flex flex-wrap gap-1.5">
                                {applicant.skills.map((s: any) => (
                                  <span key={s.name} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                    {s.name} · {s.level}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {applicant.experience?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Experience</p>
                              {applicant.experience.slice(0, 2).map((exp: any, i: number) => (
                                <div key={i} className="text-sm text-slate-600">
                                  <span className="font-medium">{exp.role}</span> at {exp.company}
                                  {exp.isCurrent && <span className="ml-2 text-xs text-green-600 font-medium">Current</span>}
                                </div>
                              ))}
                            </div>
                          )}
                          {applicant.location && (
                            <p className="text-sm text-slate-500 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> {applicant.location}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Screening Results Tab */}
          {tab === "screening" && (
            <div className="space-y-4">
              {screeningLoading ? (
                <div className="card text-center py-16">
                  <Loader2 className="w-10 h-10 text-rose-400 animate-spin mx-auto mb-4" />
                  <p className="text-slate-700 font-semibold">AI is screening candidates...</p>
                  <p className="text-slate-400 text-sm mt-1">This may take 15–30 seconds</p>
                </div>
              ) : !latestScreening ? (
                <div className="card text-center py-16">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No screening results yet</p>
                  <p className="text-slate-400 text-sm mt-1">Add candidates then run AI Screening</p>
                  <button
                    onClick={handleScreening}
                    disabled={jobApplicants.length === 0}
                    className="btn-primary mt-4 inline-flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" /> Run AI Screening
                  </button>
                </div>
              ) : (
                <>
                  {/* Screening Summary */}
                  <div className="card bg-gradient-to-r from-rose-50 to-slate-50 border border-rose-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="w-5 h-5 text-rose-500" />
                      <h2 className="font-bold text-slate-900">
                        Top {latestScreening.shortlistSize} Shortlist
                      </h2>
                    </div>
                    <p className="text-sm text-slate-500">
                      Screened {latestScreening.totalApplicants} candidates ·{" "}
                      {new Date(latestScreening.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Ranked Candidates */}
                  <div className="space-y-4">
                    {latestScreening.results?.map((result: any, index: number) => (
                      <div key={result.applicantId} className="card hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                          {/* Rank */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            index === 0 ? "bg-amber-100 text-amber-700" :
                            index === 1 ? "bg-slate-200 text-slate-700" :
                            index === 2 ? "bg-orange-100 text-orange-700" :
                            "bg-slate-100 text-slate-600"
                          }`}>
                            #{index + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <div>
                                <h3 className="font-bold text-slate-900">
                                  {result.name || `${result.firstName} ${result.lastName}`}
                                </h3>
                                <p className="text-sm text-slate-500">{result.headline}</p>
                              </div>
                              <ScoreBadge score={result.matchScore} />
                            </div>

                            {/* Score Breakdown */}
                            {result.scoreBreakdown && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                                {[
                                  { label: "Skills", value: result.scoreBreakdown.skills, weight: "40%" },
                                  { label: "Experience", value: result.scoreBreakdown.experience, weight: "30%" },
                                  { label: "Education", value: result.scoreBreakdown.education, weight: "15%" },
                                  { label: "Fit", value: result.scoreBreakdown.culturalFit, weight: "15%" },
                                ].map((item) => (
                                  <div key={item.label} className="bg-slate-50 rounded-lg p-2">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs text-slate-500">{item.label}</span>
                                      <span className="text-xs font-bold text-slate-700">{item.value}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-1">
                                      <div
                                        className="bg-rose-400 h-1 rounded-full"
                                        style={{ width: `${Math.min(item.value, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Strengths */}
                            {result.strengths?.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Strengths</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {result.strengths.map((s: string, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                      <CheckCircle className="w-3 h-3" /> {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Gaps */}
                            {result.gaps?.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Gaps / Risks</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {result.gaps.map((g: string, i: number) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                      <AlertCircle className="w-3 h-3" /> {g}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendation */}
                            {result.recommendation && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">AI Recommendation</p>
                                <p className="text-sm text-slate-700">{result.recommendation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function JobDetailPage() {
  return (
    <Provider store={store}>
      <JobDetailContent />
    </Provider>
  );
}
