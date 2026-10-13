"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AskResponse, DocumentRecord } from "@/lib/contract";
import { SILENCE_LINE } from "@/lib/constants";

type ScenarioKey = "A" | "B" | "C";

export default function DemoPage() {
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>("A");
  const [query, setQuery] = useState(
    "Can nursing staff initiate IV potassium without attending physician co-signature?"
  );
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<AskResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // Fetch from /api/ask
  const fetchAsk = async (questionText: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText }),
      });
      if (res.ok) {
        const data: AskResponse = await res.json();
        setApiResponse(data);
      }
    } catch (e) {
      console.error("Error asking question:", e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAsk(query);
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDocuments(data);
      })
      .catch((err) => console.error("Error fetching documents:", err));
  }, []);

  const switchScenario = (scenario: ScenarioKey) => {
    setActiveScenario(scenario);
    let newQuery = "";
    if (scenario === "A") {
      newQuery = "Can nursing staff initiate IV potassium without attending physician co-signature?";
    } else if (scenario === "B") {
      newQuery = "How long can a patient wait for prior authorization approval before urgent escalation?";
    } else {
      newQuery = "What is our policy on telehealth prescribing for Schedule II-IV controlled substances?";
    }
    setQuery(newQuery);
    fetchAsk(newQuery);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const qLower = query.toLowerCase();
    if (qLower.includes("potassium")) {
      setActiveScenario("A");
    } else if (qLower.includes("prior auth") || qLower.includes("authorization") || qLower.includes("escalation")) {
      setActiveScenario("B");
    } else {
      setActiveScenario("C");
    }
    fetchAsk(query);
  };

  const copySynthesis = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(query);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen selection:bg-surface-container-highest selection:text-on-surface">
      <Navbar />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
        <div className="flex flex-col w-full">
          {/* Ambient Scrim */}
          <div className="relative w-full overflow-hidden pb-12">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[980px] h-[340px] pointer-events-none opacity-20 blur-[90px] bg-gradient-to-r from-on-tertiary-container via-surface-tint to-outline-variant rounded-full" />

            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-12 pt-6 flex flex-col gap-6">
              {/* Notice Banner */}
              <div className="w-full bg-surface-container-lowest rounded-full px-5 py-2.5 shadow-sm border border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-[#2F7D5B] animate-pulse" />
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Interactive Clinical Corpus Sandbox for <strong className="font-semibold text-on-surface">Northfield Health</strong>.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                  <span className="font-label-sm text-label-sm text-secondary font-medium">
                    {SILENCE_LINE}
                  </span>
                </div>
              </div>

              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2">
                <div className="flex flex-col max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high w-fit mb-3">
                    <span className="material-symbols-outlined text-[14px] text-on-surface">labs</span>
                    <span className="font-label-sm text-label-sm text-on-surface tracking-wider uppercase font-medium">
                      Interactive Sandbox
                    </span>
                  </div>
                  <h1 className="font-headline-lg text-3xl sm:text-headline-lg font-bold text-on-surface tracking-tight">
                    Test Verified Clinical Synthesis in Real Time
                  </h1>
                  <p className="font-body-lg text-body-lg text-secondary mt-2">
                    Explore how TrustLens verifies hospital guidance against Northfield Health’s synthetic policy corpus across three common clinical scenarios.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
                  <button
                    onClick={() => switchScenario("A")}
                    className="inline-flex items-center gap-2 bg-surface-container-lowest text-on-surface font-label-md text-label-md px-5 py-2.5 rounded-full shadow-sm border border-outline-variant/30 hover:bg-surface-container-low transition-all font-medium"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">restart_alt</span>
                    <span>Reset Sandbox</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Documents Loaded Strip */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[20px] text-primary">inventory_2</span>
                    <span className="font-headline-sm text-lg font-bold text-on-surface">Active Policy Corpus</span>
                    <span className="font-label-sm text-label-sm bg-surface-container px-2.5 py-0.5 rounded-full text-secondary font-medium">
                      {documents.length} Active Document{documents.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary">
                    Real-time indexed policy corpus in Supabase pgvector
                  </span>
                </div>

                {documents.length === 0 ? (
                  <div className="py-8 text-center text-secondary font-body-sm bg-surface-container-low/50 rounded-xl border border-dashed border-outline-variant/30">
                    No active policy documents found. Please log in as an Administrator to upload and publish policies.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                    {documents.map((doc) => {
                      const isOverdue = (doc.daysOverdue ?? 0) > 0 || doc.freshness === "review_overdue";
                      return (
                        <div
                          key={doc.id}
                          className="bg-surface-container-low rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-sm border border-outline-variant/10"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-label-sm text-label-sm text-secondary truncate font-mono" title={doc.id}>
                                {doc.id}
                              </span>
                              <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary font-medium shrink-0">
                                Tier {doc.tier}
                              </span>
                            </div>
                            <p className="font-label-md text-label-md text-on-surface font-semibold line-clamp-2" title={doc.title}>
                              {doc.title}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                            <span className="font-label-sm text-label-sm text-secondary truncate max-w-[90px]">
                              {doc.docType || "Policy"}
                            </span>
                            {doc.freshness === "superseded" && (
                              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#B4403A] bg-[#FBE6E4] px-2 py-0.5 rounded-full font-medium shrink-0" title={doc.newerVersionId ? `Superseded by ${doc.newerVersionId}` : "Superseded revision"}>
                                <span className="material-symbols-outlined text-[12px]">history</span> Superseded
                              </span>
                            )}
                            {doc.freshness === "draft" && (
                              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded-full font-medium shrink-0">
                                <span className="material-symbols-outlined text-[12px]">draft</span> Draft
                              </span>
                            )}
                            {(doc.freshness === "review_overdue" || (doc.freshness !== "superseded" && doc.freshness !== "draft" && (doc.daysOverdue ?? 0) > 0)) && (
                              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#B7791F] bg-[#FBF0DA] px-2 py-0.5 rounded-full font-medium shrink-0">
                                <span className="material-symbols-outlined text-[12px]">warning</span> Overdue ({doc.daysOverdue}d)
                              </span>
                            )}
                            {doc.freshness === "current" && (
                              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#2F7D5B] bg-[#E4F2EA] px-2 py-0.5 rounded-full font-medium shrink-0">
                                <span className="material-symbols-outlined text-[12px]">check_circle</span> Current
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3 Scenario Selector Cards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                      Select Verification Archetype
                    </span>
                    <span className="text-secondary">•</span>
                    <span className="font-body-sm text-body-sm text-secondary">
                      3 pre-indexed scenarios demonstrative of grounded AI governance
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Scenario Card 1: Active A */}
                  <div
                    onClick={() => switchScenario("A")}
                    className={`cursor-pointer rounded-2xl p-6 transition-all flex flex-col justify-between gap-6 relative overflow-hidden group border ${
                      activeScenario === "A"
                        ? "bg-surface-container-lowest shadow-md border-primary"
                        : "bg-surface-container-lowest shadow-sm hover:shadow-md border-outline-variant/20"
                    }`}
                  >
                    {activeScenario === "A" && (
                      <div className="absolute top-0 right-0 h-1.5 w-full bg-primary" />
                    )}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          High Confidence • Verified
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary font-medium">Scenario A</span>
                      </div>
                      <h3 className="font-headline-sm text-lg font-bold text-on-surface">Verified Clinical Synthesis</h3>
                      <p className="font-body-sm text-body-sm text-secondary">
                        Nurse asks about IV potassium protocol. Multi-source verification confirms exact dosage and autonomous RN threshold with zero physician co-sign.
                      </p>
                      <div className="bg-surface-container-low rounded-xl p-3 mt-1">
                        <span className="font-label-sm text-label-sm text-secondary uppercase block mb-1 font-semibold">Query Probe:</span>
                        <p className="font-body-sm text-body-sm text-on-surface italic">
                          "Can nursing staff initiate IV potassium without attending physician co-signature?"
                        </p>
                      </div>
                    </div>
                    <button
                      className={`w-full inline-flex items-center justify-center gap-2 font-label-md text-label-md px-5 py-3 rounded-full transition-all font-medium ${
                        activeScenario === "A"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      <span>{activeScenario === "A" ? "Active Scenario" : "Run Scenario A"}</span>
                    </button>
                  </div>

                  {/* Scenario Card 2: Conflict B */}
                  <div
                    onClick={() => switchScenario("B")}
                    className={`cursor-pointer rounded-2xl p-6 transition-all flex flex-col justify-between gap-6 relative overflow-hidden group border ${
                      activeScenario === "B"
                        ? "bg-surface-container-lowest shadow-md border-primary"
                        : "bg-surface-container-lowest shadow-sm hover:shadow-md border-outline-variant/20"
                    }`}
                  >
                    {activeScenario === "B" && (
                      <div className="absolute top-0 right-0 h-1.5 w-full bg-primary" />
                    )}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBE6E4] text-[#B4403A] font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                          <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
                          Cross-Policy Conflict
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary font-medium">Scenario B</span>
                      </div>
                      <h3 className="font-headline-sm text-lg font-bold text-on-surface">Payer vs SOP Precedence</h3>
                      <p className="font-body-sm text-body-sm text-secondary">
                        Payer rule requires urgent 72-hour turnaround while internal institutional SOP allows 5 business days. System detects conflict and enforces Tier 3 precedence.
                      </p>
                      <div className="bg-surface-container-low rounded-xl p-3 mt-1">
                        <span className="font-label-sm text-label-sm text-secondary uppercase block mb-1 font-semibold">Query Probe:</span>
                        <p className="font-body-sm text-body-sm text-on-surface italic">
                          "How long can a patient wait for prior authorization approval before urgent escalation?"
                        </p>
                      </div>
                    </div>
                    <button
                      className={`w-full inline-flex items-center justify-center gap-2 font-label-md text-label-md px-5 py-3 rounded-full transition-all font-medium ${
                        activeScenario === "B"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">rule</span>
                      <span>{activeScenario === "B" ? "Active Scenario" : "Run Scenario B"}</span>
                    </button>
                  </div>

                  {/* Scenario Card 3: Silence C */}
                  <div
                    onClick={() => switchScenario("C")}
                    className={`cursor-pointer rounded-2xl p-6 transition-all flex flex-col justify-between gap-6 relative overflow-hidden group border ${
                      activeScenario === "C"
                        ? "bg-surface-container-lowest shadow-md border-primary"
                        : "bg-surface-container-lowest shadow-sm hover:shadow-md border-outline-variant/20"
                    }`}
                  >
                    {activeScenario === "C" && (
                      <div className="absolute top-0 right-0 h-1.5 w-full bg-primary" />
                    )}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF0DA] text-[#B7791F] font-label-sm text-label-sm font-semibold tracking-wide uppercase">
                          <span className="material-symbols-outlined text-[14px]">gpp_maybe</span>
                          Silence Guard
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary font-medium">Scenario C</span>
                      </div>
                      <h3 className="font-headline-sm text-lg font-bold text-on-surface">Safe Silence ("I Don't Know")</h3>
                      <p className="font-body-sm text-body-sm text-secondary">
                        Staff inquires on telehealth controlled substance initiation. Northfield Health has no ratified SOP; system enforces grounding guard and logs gap.
                      </p>
                      <div className="bg-surface-container-low rounded-xl p-3 mt-1">
                        <span className="font-label-sm text-label-sm text-secondary uppercase block mb-1 font-semibold">Query Probe:</span>
                        <p className="font-body-sm text-body-sm text-on-surface italic">
                          "What is our policy on telehealth prescribing for Schedule II-IV controlled substances?"
                        </p>
                      </div>
                    </div>
                    <button
                      className={`w-full inline-flex items-center justify-center gap-2 font-label-md text-label-md px-5 py-3 rounded-full transition-all font-medium ${
                        activeScenario === "C"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      <span>{activeScenario === "C" ? "Active Scenario" : "Run Scenario C"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Search & Query Bar */}
              <div className="w-full bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
                <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined w-5 h-5 text-secondary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[20px]">
                      search
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low rounded-full font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-outline-variant transition-all"
                      placeholder="Try your own question against Northfield Health corpus..."
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-7 py-3.5 rounded-full hover:bg-neutral-800 transition-all shrink-0 font-medium disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {loading ? "hourglass_empty" : "psychology"}
                    </span>
                    <span>{loading ? "Synthesizing..." : "Synthesize Query"}</span>
                  </button>
                </form>

                {/* Suggested Query Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="font-label-sm text-label-sm text-secondary font-medium">Quick Questions:</span>
                  <button
                    onClick={() => switchScenario("A")}
                    className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
                  >
                    IV Potassium Autonomy
                  </button>
                  <button
                    onClick={() => switchScenario("B")}
                    className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
                  >
                    Prior Auth Wait Standard
                  </button>
                  <button
                    onClick={() => switchScenario("C")}
                    className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors"
                  >
                    Schedule II Telehealth Prescribing
                  </button>
                </div>
              </div>

              {/* Dynamic Output Container: Left (60%) Grounded Answer, Right (40%) Trust Checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT PANEL: 7 cols */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* SCENARIO A: Verified Answer */}
                  {activeScenario === "A" && (
                    <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col gap-6 relative overflow-hidden">
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#2F7D5B]/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#E4F2EA] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#2F7D5B] text-[22px]">verified</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline-sm text-lg font-bold text-on-surface">Verified Clinical Synthesis</span>
                              <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-bold">
                                Grounded Answer
                              </span>
                            </div>
                            <span className="font-label-sm text-label-sm text-secondary">
                              Grounded answer • 0 unverified claims
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={copySynthesis}
                            className="p-2 rounded-full hover:bg-surface-container-low text-secondary transition-colors"
                            title="Copy synthesis"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {copied ? "check" : "content_copy"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 font-body-md text-body-md text-on-surface leading-relaxed">
                        <p>
                          <strong>Yes.</strong> Registered nursing staff at Northfield Health may initiate intravenous potassium replacement autonomously, provided serum potassium is documented below <strong>3.2 mEq/L</strong> and the dose adheres strictly to the standardized ED nurse-driven protocol
                          <sup className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm ml-0.5 font-bold">[1]</sup>.
                        </p>

                        <div className="bg-surface-container-low rounded-xl p-5 flex flex-col gap-3 my-1 border border-outline-variant/10">
                          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center gap-1.5 font-semibold">
                            <span className="material-symbols-outlined text-[16px] text-primary">fact_check</span>
                            Autonomous RN Initiation Criteria Checklist
                          </span>
                          <ul className="space-y-2.5">
                            <li className="flex items-start gap-2.5">
                              <span className="material-symbols-outlined text-[#2F7D5B] text-[18px] shrink-0 mt-0.5">check_circle</span>
                              <span className="font-body-sm text-body-sm text-on-surface">
                                <strong>Baseline ECG Verified:</strong> Continuous telemetry established with no existing wide QRS or heart block <sup className="text-secondary font-label-sm font-bold">[2]</sup>.
                              </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="material-symbols-outlined text-[#2F7D5B] text-[18px] shrink-0 mt-0.5">check_circle</span>
                              <span className="font-body-sm text-body-sm text-on-surface">
                                <strong>Rate Limitation:</strong> Peripheral IV infusion not to exceed 10 mEq/hr; central line rate cap is 20 mEq/hr with mandatory infusion pump lock <sup className="text-secondary font-label-sm font-bold">[1]</sup>.
                              </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="material-symbols-outlined text-[#2F7D5B] text-[18px] shrink-0 mt-0.5">check_circle</span>
                              <span className="font-body-sm text-body-sm text-on-surface">
                                <strong>Co-Signature Requirement:</strong> Attending physician co-signature is <em>deferred for up to 4 hours</em> following administration under Standing Order SOP-ED-402 <sup className="text-secondary font-label-sm font-bold">[1, 4]</sup>.
                              </span>
                            </li>
                          </ul>
                        </div>

                        <p className="text-secondary font-body-sm text-body-sm">
                          Clinical warning: If renal impairment is documented (eGFR &lt; 30 mL/min or creatinine &gt; 2.0 mg/dL), standing nurse order is strictly suspended and mandatory nephrology or attending consultation is required prior to infusion initiation.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant/20 -mx-6 -mb-6 p-4 px-6 bg-surface-container-low/50">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#2F7D5B] text-[18px]">verified</span>
                          <span className="font-label-sm text-label-sm text-on-surface">
                            All 3 claims grounded in Northfield Health retrieved documents.
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-label-sm text-label-sm text-secondary">Audit Token:</span>
                          <code className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono">
                            #NFH-VER-0941
                          </code>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENARIO B: Conflict Screen */}
                  {activeScenario === "B" && (
                    <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col gap-6 relative overflow-hidden">
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#B4403A]/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#FBE6E4] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#B4403A] text-[22px]">compare_arrows</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline-sm text-lg font-bold text-on-surface">Cross-Policy Precedence Conflict</span>
                              <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#FBE6E4] text-[#B4403A] font-bold">
                                Precedence rule applied: Tier 3 outranks Tier 4
                              </span>
                            </div>
                            <span className="font-label-sm text-label-sm text-secondary">
                              Explicit policy divergence detected • Hierarchical resolution applied
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FBE6E4]/40 border border-[#B4403A]/20 flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#B4403A] text-[22px] shrink-0">warning</span>
                        <div className="flex flex-col gap-1">
                          <strong className="text-on-surface font-label-md">Direct Conflict Detected Across 2 Documents</strong>
                          <p className="font-body-sm text-body-sm text-secondary">
                            Northfield Health&apos;s internal standard (<strong>SOP-REV-108: Prior Authorization Workflow</strong>) specifies an escalation threshold of <strong>5 business days</strong>. However, external payer directive (<strong>PAYER-RHP-2024: Prior Authorization Escalation Standard</strong>) mandates expedited escalation within <strong>72 hours (3 calendar days)</strong> for acute inpatient admissions.
                          </p>
                        </div>
                      </div>

                      <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                        <strong>Operational Verdict:</strong> Because external regulatory and contractual payer obligations reside at <strong>Tier 3 Precedence</strong>, they legally supersede institutional internal guidelines (<strong>Tier 4 Precedence</strong>). Nursing and administrative staff must initiate expedited peer-to-peer escalation at <strong>72 hours</strong>.
                      </p>

                      <div className="bg-surface-container-low rounded-xl p-5 flex flex-col gap-3 border border-outline-variant/10">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center gap-1.5 font-semibold">
                          <span className="material-symbols-outlined text-[16px] text-primary">rule</span>
                          Precedence Resolution Matrix
                        </span>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                            <span className="font-body-sm text-body-sm">
                              Tier 3 Payer Rules (PAYER-RHP-2024): 72-Hour Mandate
                            </span>
                            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-[#E4F2EA] text-[#2F7D5B] font-bold">
                              ENFORCED PRECEDENCE
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-lowest opacity-60 border border-outline-variant/20">
                            <span className="font-body-sm text-body-sm line-through">
                              Tier 4 Institutional SOPs (SOP-REV-108): 5-Business Day Standard
                            </span>
                            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-[#FBE6E4] text-[#B4403A] font-bold">
                              SUPERSEDED / INACTIVE
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant/20 -mx-6 -mb-6 p-4 px-6 bg-surface-container-low/50">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#2F7D5B] text-[18px]">verified</span>
                          <span className="font-label-sm text-label-sm text-on-surface">
                            Conflict resolved: Payer Rule (Tier 3) supersedes internal hospital SOP (Tier 4).
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCENARIO C: Silence Screen */}
                  {activeScenario === "C" && (
                    <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20 flex flex-col gap-6 relative overflow-hidden">
                      <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#B7791F]/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-outline-variant/20">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#FBF0DA] flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-[#B7791F] text-[22px]">gpp_maybe</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline-sm text-lg font-bold text-on-surface">Safe Silence Enforced</span>
                              <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#FBF0DA] text-[#B7791F] font-bold">
                                below the grounding threshold
                              </span>
                            </div>
                            <span className="font-label-sm text-label-sm text-secondary">
                              Absence of ratified internal SOP • System refuses speculative answer
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[#FBF0DA]/50 border border-[#B7791F]/20 flex items-start gap-3">
                        <span className="material-symbols-outlined text-[#B7791F] text-[22px] shrink-0">shield</span>
                        <div className="flex flex-col gap-1">
                          <strong className="text-on-surface font-label-md">Knowledge Gap Detected: Ratified Institutional SOP Missing</strong>
                          <p className="font-body-sm text-body-sm text-secondary">
                            While state regulatory statutes (<strong>NFH-REG-2024: State Standing Order Delegation Rule</strong>) define delegation boundaries, Northfield Health has <strong>not yet ratified a hospital-wide clinical policy</strong> governing local provider workflow.
                          </p>
                        </div>
                      </div>

                      <p className="font-headline-sm text-xl font-bold text-on-surface pt-2">
                        &quot;I do not have sufficient ratified hospital guidance to answer this question.&quot;
                      </p>

                      <p className="font-body-md text-body-md text-secondary leading-relaxed">
                        To ensure strict clinical safety, TrustLens is programmed to deliberately abstain rather than infer probabilistic clinical rules. Ungrounded guidance in this domain risks non-compliant controlled substance distribution.
                      </p>

                      <div className="bg-surface-container-low rounded-xl p-5 flex flex-col gap-3 border border-outline-variant/10">
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary flex items-center gap-1.5 font-semibold">
                          <span className="material-symbols-outlined text-[16px] text-primary">pending_actions</span>
                          Automated actions triggered
                        </span>
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                          <span className="material-symbols-outlined text-[#2F7D5B] text-[18px]">check_circle</span>
                          <span className="font-body-sm text-body-sm text-on-surface">Gap logged for governance review</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant/20 -mx-6 -mb-6 p-4 px-6 bg-surface-container-low/50">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#2F7D5B] text-[18px]">verified</span>
                          <span className="font-label-sm text-label-sm text-on-surface">
                            {SILENCE_LINE}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline Verification Distribution Chart */}
                  <div className="w-full bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          Synthesized Claim Grounding Distribution
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary font-medium">
                        Grounding check
                      </span>
                    </div>

                    <div className="w-full flex flex-col gap-2 pt-2">
                      <div className="w-full flex items-center gap-3">
                        <span className="w-24 font-label-sm text-label-sm text-secondary truncate font-medium">Claim 1</span>
                        <div className="flex-1 bg-surface-container-low h-3 rounded-full overflow-hidden flex">
                          <div className="bg-primary h-full rounded-full" style={{ width: "98%" }} />
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface font-semibold w-10 text-right">98%</span>
                      </div>
                      <div className="w-full flex items-center gap-3">
                        <span className="w-24 font-label-sm text-label-sm text-secondary truncate font-medium">Claim 2</span>
                        <div className="flex-1 bg-surface-container-low h-3 rounded-full overflow-hidden flex">
                          <div className="bg-primary h-full rounded-full" style={{ width: "100%" }} />
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface font-semibold w-10 text-right">100%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                      <span className="font-label-sm text-label-sm text-secondary">Zero probabilistic extrapolation</span>
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-[#2F7D5B] font-medium">
                        <span className="material-symbols-outlined text-[14px]">format_image_left</span> Grounding guard active
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL: 5 cols Trust Checklist & Citations */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Trust Checklist Dossier */}
                  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-5">
                    <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-primary">fact_check</span>
                        <h3 className="font-headline-sm text-lg font-bold text-on-surface">Trust Checklist Panel</h3>
                      </div>
                      <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-bold">
                        5 / 5 Passed
                      </span>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                        <span className="material-symbols-outlined text-[#2F7D5B] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Tier Precedence Enforced</span>
                          <span className="font-body-sm text-body-sm text-secondary">
                            Tier 2 Clinical Guidelines &amp; Tier 4 Institutional SOPs aligned without contradiction.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                        <span className="material-symbols-outlined text-[#2F7D5B] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Corpus Freshness &amp; Ratification</span>
                          <span className="font-body-sm text-body-sm text-secondary">
                            All consulted policies ratified within the last 180 days (Current).
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                        <span className="material-symbols-outlined text-[#2F7D5B] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Author &amp; Approver Validation</span>
                          <span className="font-body-sm text-body-sm text-secondary">
                            Verified by Clinical Governance Committee and Pharmacy &amp; Therapeutics.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                        <span className="material-symbols-outlined text-[#2F7D5B] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Conflict Spectrum Audit</span>
                          <span className="font-body-sm text-body-sm text-secondary">
                            Cross-document contradictions checked across retrieved policy passages.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
                        <span className="material-symbols-outlined text-[#2F7D5B] text-[20px] shrink-0 mt-0.5">check_circle</span>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Traceable Provenance</span>
                          <span className="font-body-sm text-body-sm text-secondary">
                            Strictly anchored to exact source passages.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Retrieved Citations */}
                  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px] text-primary">menu_book</span>
                        <h4 className="font-headline-sm text-lg font-bold text-on-surface">Active Retrieved Citations</h4>
                      </div>
                      <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded-full text-secondary font-medium">
                        {apiResponse?.citations?.length || (activeScenario === "B" ? 2 : activeScenario === "C" ? 0 : 3)} Documents
                      </span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {activeScenario === "A" && (
                        <>
                          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">[1]</span>
                                <div className="flex flex-col">
                                  <span className="font-label-md text-label-md font-semibold text-on-surface">SOP-ED-402</span>
                                  <span className="text-secondary text-label-sm font-label-sm">ED Potassium Repletion Standing Protocol</span>
                                </div>
                              </div>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">Tier 4 Institutional SOPs</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary italic">
                              &quot;Section 3.2: Registered nurses with emergency credentials may autonomously initiate protocolized potassium chloride infusions for serum levels &lt; 3.2 mEq/L.&quot;
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">[2]</span>
                                <div className="flex flex-col">
                                  <span className="font-label-md text-label-md font-semibold text-on-surface">CARD-GUIDE-2024</span>
                                  <span className="text-secondary text-label-sm font-label-sm">Inpatient Potassium Repletion Guideline</span>
                                </div>
                              </div>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">Tier 2 Clinical Guidelines</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary italic">
                              &quot;Acute inpatient repletion guidelines require verified baseline 12-lead telemetry confirmation prior to hypertonic electrolyte infusion.&quot;
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">[3]</span>
                                <div className="flex flex-col">
                                  <span className="font-label-md text-label-md font-semibold text-on-surface">NFH-REG-2024</span>
                                  <span className="text-secondary text-label-sm font-label-sm">State Standing Order Delegation Rule</span>
                                </div>
                              </div>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-secondary font-medium">Tier 1 Regulatory Statutes</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary italic">
                              &quot;Statutory Delegation Rule § 14-8: Hospital standing orders provide legally compliant coverage deferring immediate provider counter-signature up to 4 hours.&quot;
                            </p>
                          </div>
                        </>
                      )}

                      {activeScenario === "B" && (
                        <>
                          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 border border-outline-variant/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">[1]</span>
                                <div className="flex flex-col">
                                  <span className="font-label-md text-label-md font-semibold text-on-surface">PAYER-RHP-2024</span>
                                  <span className="text-secondary text-label-sm font-label-sm">Prior Authorization Escalation Standard</span>
                                </div>
                              </div>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-[#E4F2EA] text-[#2F7D5B] font-medium">Tier 3 Payer Rules</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary italic">
                              &quot;Section 7.1: Failure to resolve prior authorization within 72 continuous hours mandates immediate expedited clinical peer review with hospital medical director.&quot;
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-2 opacity-75 border border-outline-variant/10">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-surface text-secondary flex items-center justify-center font-label-sm text-label-sm font-bold">[2]</span>
                                <div className="flex flex-col">
                                  <span className="font-label-md text-label-md font-semibold text-on-surface">SOP-REV-108</span>
                                  <span className="text-secondary text-label-sm font-label-sm">Prior Authorization Workflow</span>
                                </div>
                              </div>
                              <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-[#FBF0DA] text-[#B7791F] font-medium">Tier 4 Institutional SOPs (Review Overdue)</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-secondary italic">
                              &quot;Internal patient accounting workflows allow 5 standard operating business days for authorization response before senior nurse escalation.&quot;
                            </p>
                          </div>
                        </>
                      )}

                      {activeScenario === "C" && (
                        <div className="p-4 rounded-xl bg-surface-container-low text-center text-secondary font-body-sm border border-outline-variant/10">
                          <p className="font-medium text-on-surface mb-1">No Ratified Documents Grounded</p>
                          <p className="text-label-sm">System maintains silence. Gap automatically registered in Governance Dashboard.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Notice */}
              <div className="w-full text-center py-6">
                <p className="font-label-sm text-label-sm text-secondary">
                  Demo uses synthetic data. Not clinical guidance. All Northfield Health documents, clinical policies, and patient rules shown are non-clinical computational mockups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
