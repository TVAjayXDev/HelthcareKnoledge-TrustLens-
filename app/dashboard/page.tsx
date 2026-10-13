"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DashboardData } from "@/lib/contract";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [timeframe, setTimeframe] = useState("Past 30 Days");
  const [riskFilter, setRiskFilter] = useState("All");
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json: DashboardData) => setData(json))
      .catch((err) => console.error("Error loading dashboard data:", err));
  }, []);

  const handleNotify = () => {
    setNotified(true);
    setTimeout(() => setNotified(false), 3500);
  };

  const timeframes = ["Past 7 Days", "Past 30 Days", "Quarter-to-Date", "All-Time"];

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen selection:bg-surface-container-highest selection:text-on-surface">
      <Navbar />

      <main className="w-full pt-20 bg-surface">
        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-12 pb-24 pt-6 space-y-8">
          {/* Top Context & Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 text-label-sm font-label-sm text-secondary uppercase tracking-widest font-semibold">
                <span>Clinical Governance</span>
                <span className="text-secondary/40">/</span>
                <span>Knowledge Audit</span>
                <span className="text-secondary/40">/</span>
                <span className="text-on-surface font-bold">Campus Safety Overview</span>
              </div>
              <h1 className="font-headline-lg text-3xl sm:text-headline-lg font-bold text-on-surface tracking-tight">
                Knowledge Gaps &amp; Corpus Integrity
              </h1>
              <p className="font-body-md text-body-md text-secondary leading-relaxed">
                Real-time telemetry on unanswered clinical inquiries, expired hospital policies, and cross-departmental documentation conflicts across Northfield Health System.
              </p>
            </div>

            {/* Timeframe & Export Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center p-1 bg-surface-container rounded-full border border-outline-variant/20">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-1.5 rounded-full font-label-sm text-label-sm transition-all font-medium ${
                      timeframe === tf
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-secondary hover:text-on-surface"
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4 Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
                  Unanswered Inquiries
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FBE6E4] text-[#B4403A] font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[13px]">gpp_maybe</span>
                  Needs Policy Coverage
                </span>
              </div>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-display text-4xl font-bold tracking-tight text-on-surface">
                  {data ? data.summary.unansweredQuestions : 0}
                </span>
                <span className="font-label-sm text-label-sm text-[#B4403A] font-medium">live telemetry</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mb-4 leading-normal">
                Triggered clinical safety silence guardrail due to zero validated ground truth.
              </p>
              <div className="w-full pt-2 border-t border-outline-variant/20">
                <div className="flex items-center justify-between text-label-sm font-label-sm text-secondary mb-2">
                  <span>Safety Inhibit Frequency</span>
                  <span className="font-semibold text-on-surface">Live volume</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-[#B4403A] rounded-full" style={{ width: data?.summary.unansweredQuestions ? "68%" : "0%" }} />
                </div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
                  Outdated Documents
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FBF0DA] text-[#B7791F] font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[13px]">history_toggle_off</span>
                  Audit Overdue
                </span>
              </div>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-display text-4xl font-bold tracking-tight text-on-surface">
                  {data ? data.summary.outdatedDocuments : 0}
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-medium">indexed policies</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mb-4 leading-normal">
                Past scheduled clinical governance threshold (&gt;180 days review interval).
              </p>
              <div className="w-full pt-2 border-t border-outline-variant/20">
                <div className="flex items-center justify-between text-label-sm font-label-sm text-secondary mb-2">
                  <span>Corpus Aging Rate</span>
                  <span className="font-semibold text-on-surface">review interval</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-[#B7791F] rounded-full" style={{ width: data?.summary.outdatedDocuments ? "42%" : "0%" }} />
                </div>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
                  Cross-Policy Conflicts
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FBE6E4] text-[#B4403A] font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[13px]">rule</span>
                  Precedence Alert
                </span>
              </div>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-display text-4xl font-bold tracking-tight text-on-surface">
                  {data ? data.summary.conflictsFound : 0}
                </span>
                <span className="font-label-sm text-label-sm text-[#B4403A] font-medium">Precedence Check</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mb-4 leading-normal">
                Payer rule turnaround vs internal departmental standard conflict detected.
              </p>
              <div className="w-full pt-2 border-t border-outline-variant/20">
                <div className="flex items-center justify-between text-label-sm font-label-sm text-secondary mb-2">
                  <span>Critical Discrepancies</span>
                  <span className="font-semibold text-on-surface">100% resolved</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-[#2F7D5B] rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <span className="font-label-md text-label-md text-secondary uppercase tracking-wider font-semibold">
                  Unratified Uploads
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[13px]">draft</span>
                  Pending Review
                </span>
              </div>
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-display text-4xl font-bold tracking-tight text-on-surface">
                  {data?.summary.neverReviewed ?? 2}
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-medium">HOSP-BYLAW-88-RevB</span>
              </div>
              <p className="font-body-sm text-body-sm text-secondary mb-4 leading-normal">
                Draft departmental guidelines ingested with zero formal committee ratification.
              </p>
              <div className="w-full pt-2 border-t border-outline-variant/20">
                <div className="flex items-center justify-between text-label-sm font-label-sm text-secondary mb-2">
                  <span>Awaiting Ratification</span>
                  <span className="font-semibold text-on-surface">Action Required</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: "25%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Efficiency Highlight Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-gradient-to-br from-[#8B5CF6]/10 via-[#3B82F6]/10 to-[#14B8A6]/10 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#E4F2EA] text-[#2F7D5B]">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </span>
                  <span className="font-label-md text-label-md text-secondary font-semibold uppercase tracking-wider">
                    Clinical Efficiency &amp; Safety Yield
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-x-4 gap-y-2 mb-3">
                  <span className="font-headline-lg text-3xl sm:text-headline-lg font-bold text-on-surface tracking-tight block leading-tight">
                    1,420 hours <span className="font-label-md text-label-md font-normal text-secondary">(Illustrative)</span>
                  </span>
                  <span className="font-body-lg text-body-lg text-secondary block">
                    of clinician manual search eliminated this month
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm font-body-sm text-secondary">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5B]" />
                    Equiv. to <strong>3.8 Full-Time Coordinators</strong>
                  </span>
                  <span className="text-secondary/40">•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5B]" />
                    <strong>100%</strong> Citation Grounding Adherence
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 w-full lg:w-auto">
                <div className="px-4 py-2.5 rounded-full bg-[#E4F2EA]/70 text-[#2F7D5B] font-label-md text-label-md flex items-center gap-2 shadow-sm border border-[#2F7D5B]/20">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                  <span className="font-semibold">Est. Monthly ROI: $118,400 (Illustrative)</span>
                  <span className="text-[#2F7D5B]/70 font-normal">in saved overhead</span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary lg:text-right">
                  Measured across Northfield Health demo queries
                </span>
              </div>
            </div>
          </div>

          {/* Mid Section Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Questions We Couldn't Answer (7 cols) */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-outline-variant/20 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface leading-snug">
                      Questions We Couldn&apos;t Answer
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-[#B4403A] animate-pulse shrink-0" />
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary mt-1">
                    Inquiries where AI synthesis was inhibited due to lack of ratified hospital guidance.
                  </p>
                </div>
                <span className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-surface-container text-secondary shrink-0 font-medium">
                  Active Log
                </span>
              </div>

              {/* Filter */}
              <div className="flex items-center justify-between gap-3 p-2 bg-surface-container-low rounded-xl text-body-sm font-body-sm border border-outline-variant/10">
                <div className="flex items-center gap-2 text-secondary px-2">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Filter:</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {["All", "Ambulatory", "ICU", "Pediatrics"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setRiskFilter(cat)}
                      className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-all font-medium ${
                        riskFilter === cat
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-lowest text-secondary hover:text-on-surface"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unanswered List */}
              <div className="space-y-3.5">
                {!data?.unanswered || data.unanswered.length === 0 ? (
                  <div className="py-12 px-6 text-center bg-surface-container-low/60 rounded-xl border border-dashed border-outline-variant/30 space-y-2">
                    <span className="material-symbols-outlined text-3xl text-[#2F7D5B]">check_circle</span>
                    <p className="font-headline-sm text-base font-bold text-on-surface">No Unanswered Inquiries Logged</p>
                    <p className="font-body-sm text-body-sm text-secondary max-w-md mx-auto">
                      All clinical inquiries evaluated by TrustLens have been grounded in ratified hospital policies. New knowledge gaps will appear here automatically when safe silence is triggered.
                    </p>
                  </div>
                ) : (
                  data.unanswered.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all space-y-3 border border-outline-variant/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                            {item.department}
                          </span>
                          <p className="font-body-md text-base font-semibold text-on-surface">
                            &ldquo;{item.question}&rdquo;
                          </p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FBE6E4] text-[#B4403A] font-label-sm text-label-sm font-semibold">
                          <span className="material-symbols-outlined text-[13px]">warning</span>
                          Gap Logged
                        </span>
                      </div>
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-sm font-body-sm border-t border-outline-variant/10">
                        <div className="flex items-center gap-3 text-secondary">
                          <span className="flex items-center gap-1 font-medium text-on-surface">
                            <span className="material-symbols-outlined text-[16px] text-secondary">query_stats</span>
                            Asked {item.timesAsked} time{item.timesAsked === 1 ? "" : "s"}
                          </span>
                          <span className="text-secondary/40">•</span>
                          <span className="text-secondary font-mono text-label-sm">{item.suggestedDocument}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Analytics & Stale Docs (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Gaps by Department */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-outline-variant/20 space-y-5">
                <div className="flex items-start justify-between pb-2 border-b border-outline-variant/20">
                  <div>
                    <h2 className="font-headline-sm text-lg font-bold text-on-surface">Gaps by Department</h2>
                    <p className="font-body-sm text-body-sm text-secondary mt-0.5">Distribution of unratified procedural queries.</p>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-[20px]">donut_large</span>
                </div>

                <div className="space-y-4 pt-1">
                  {(data?.gapsByDepartment ?? [
                    { department: "Emergency Medicine", gaps: 14 },
                    { department: "Ambulatory & Telehealth", gaps: 12 },
                    { department: "Intensive Care Unit", gaps: 9 },
                    { department: "Pediatric Emergency", gaps: 7 },
                  ]).map((dept, i) => (
                    <div key={i} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-body-sm font-body-sm">
                        <span className="font-medium text-on-surface">{dept.department}</span>
                        <span className="text-secondary font-label-sm font-semibold">{dept.gaps} gaps</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, (dept.gaps / 14) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stale Documents Requiring Audit */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-7 shadow-sm border border-outline-variant/20 space-y-5">
                <div className="flex items-start justify-between pb-2 border-b border-outline-variant/20">
                  <div>
                    <h2 className="font-headline-sm text-lg font-bold text-on-surface">Stale Documents Requiring Audit</h2>
                    <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                      Hospital policies past scheduled clinical review.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#B7791F] text-[20px]">hourglass_empty</span>
                </div>

                <div className="space-y-3">
                  {(data?.staleDocuments ?? [
                    { documentId: "HOSP-BYLAW-88", owner: "Hospital Operations / Dr. A. Cho", daysOverdue: 342 },
                    { documentId: "SOP-REV-108", owner: "Patient Financial Services", daysOverdue: 260 },
                    { documentId: "ICU-CENT-14", owner: "Critical Care Quality Council", daysOverdue: 115 },
                    { documentId: "PEDS-FEVER-03", owner: "Pediatric Emergency Directorate", daysOverdue: 88 },
                  ]).map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/10"
                    >
                      <div className="space-y-1">
                        <p className="font-body-sm text-body-sm font-semibold text-on-surface leading-snug font-mono">
                          {doc.documentId}
                        </p>
                        <p className="text-label-sm text-secondary">{doc.owner}</p>
                      </div>
                      <span className="shrink-0 self-start sm:self-center inline-flex items-center px-2.5 py-1 rounded-full bg-[#FBF0DA] text-[#B7791F] font-label-sm text-label-sm font-semibold">
                        {doc.daysOverdue} days overdue
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleNotify}
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container transition-all active:scale-[0.99] shadow-sm font-medium border border-outline-variant/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {notified ? "check_circle" : "forward_to_inbox"}
                    </span>
                    <span>{notified ? "Auditing Notifications Sent to 4 Authors" : "Notify All 4 Document Owners"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
