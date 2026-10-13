import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SILENCE_LINE } from "@/lib/constants";

export default function LandingPage() {
  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen selection:bg-surface-container-highest selection:text-on-surface">
      <Navbar />

      <main className="w-full pt-20 bg-surface">
        <div className="flex flex-col w-full">
          {/* Top Background & Atmosphere */}
          <div className="relative w-full overflow-hidden">
            {/* HERO SECTION */}
            <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 lg:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Column: Editorial Value Narrative */}
                <div className="lg:col-span-7 flex flex-col items-start pr-0 lg:pr-6">
                  {/* Eyebrow Pill */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md mb-6 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-ping" />
                    <span>Built by team “Cache Me Outside”</span>
                    <span className="text-outline-variant">•</span>
                    <span className="font-semibold text-on-surface">Verified Healthcare Intelligence</span>
                  </div>

                  {/* Headline */}
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-display tracking-tight text-primary leading-[1.05] mb-6">
                    Find the right answer.<br />
                    <span className="text-on-secondary-container">Know why you can trust it.</span>
                  </h1>

                  {/* Body Description */}
                  <p className="font-body-lg text-body-lg text-secondary leading-relaxed max-w-2xl mb-8">
                    TrustLens cross-references internal hospital SOPs, clinical protocols, and payer rules in real time. Every claim is cited, grounded, and checked for conflicts before reaching bedside staff.
                  </p>

                  {/* Interactive Action Controls */}
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <Link
                      href="/demo"
                      className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-lg hover:bg-neutral-800 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <span>Try Live Demo</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-surface-container-lowest text-primary font-label-md text-label-md shadow-sm border border-outline-variant/30 hover:bg-surface-container-low transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">verified_user</span>
                      <span>See How Trust Works</span>
                    </Link>
                  </div>

                  {/* Trust Micro-Indicators Row */}
                  <div className="pt-2 flex flex-wrap items-center gap-y-3 gap-x-6 text-on-surface-variant font-label-sm text-label-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">task_alt</span>
                      <span className="tracking-wide">{SILENCE_LINE}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">rule</span>
                      <span className="tracking-wide">Automatic Conflict Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">history_edu</span>
                      <span className="tracking-wide">Full Provenance Audit Trail</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Interactive Synthesis Preview */}
                <div className="lg:col-span-5 relative mt-8 lg:mt-0">
                  {/* Ambient Soft Spectral Gradient Orb */}
                  <div className="absolute -top-12 -left-12 -right-8 -bottom-12 rounded-full pointer-events-none filter blur-3xl opacity-35 bg-gradient-to-tr from-[#8B5CF6] via-[#3B82F6] to-[#14B8A6] -z-10" />

                  {/* White Product Preview Card */}
                  <div className="relative bg-surface-container-lowest rounded-xl p-6 lg:p-8 shadow-[0_12px_36px_rgba(0,0,0,0.06)] border border-outline-variant/20 transition-all">
                    {/* Simulated Search Bar Query Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between pb-2 mb-2">
                        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest font-medium">
                          Active Bedside Inquiry
                        </span>
                        <span className="font-label-sm text-label-sm text-secondary flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" /> ED Unit 3
                        </span>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
                        <span className="material-symbols-outlined text-on-surface mt-0.5 text-[20px]">search</span>
                        <p className="font-headline-sm text-base sm:text-headline-sm font-semibold text-on-surface leading-snug">
                          “Can nursing staff initiate IV potassium without attending physician co-signature?”
                        </p>
                      </div>
                    </div>

                    {/* Synthesized Response Block */}
                    <div className="space-y-4">
                      {/* Confidence Status Pill Badge */}
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-label-md text-label-md">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span className="font-semibold">High Confidence • Grounded in 3 Sources</span>
                        </div>
                      </div>

                      {/* Answer Statement with Interactive Superscripts */}
                      <div className="p-4 bg-surface rounded-xl border border-outline-variant/20 leading-relaxed">
                        <p className="font-body-md text-body-md text-on-surface">
                          IV potassium replacement (<span className="font-semibold text-primary">≤20 mEq/hr</span>) may be initiated under Emergency Department Standing Protocol 4.2
                          <sup className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm mx-0.5 shadow-sm font-semibold cursor-pointer">[1]</sup>,
                          provided a serum creatinine &lt;1.8 mg/dL was drawn within 4 hours
                          <sup className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm mx-0.5 shadow-sm font-semibold cursor-pointer">[2]</sup>.
                          Floor transfers and pediatric cases require direct attending verification
                          <sup className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm mx-0.5 shadow-sm font-semibold cursor-pointer">[3]</sup>.
                        </p>
                      </div>

                      {/* Citations Audit Dossier */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-secondary font-label-sm text-label-sm mb-1 px-1">
                          <span className="font-semibold tracking-wider">GROUNDED CLINICAL PROVENANCE</span>
                          <span className="font-semibold tracking-wider">HIERARCHY WEIGHT</span>
                        </div>

                        {/* Source 1 */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm shrink-0 font-bold">1</span>
                            <div className="truncate">
                              <div className="font-label-md text-label-md font-semibold text-on-surface truncate group-hover:text-primary">
                                SOP-ED-402: Emergency Potassium Protocols
                              </div>
                              <div className="font-label-sm text-label-sm text-secondary">
                                Tier 4 Institutional SOPs • Rev. Nov 2024
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-label-sm text-label-sm shrink-0 font-medium ml-2">
                            Current
                          </span>
                        </div>

                        {/* Source 2 */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm shrink-0 font-bold">2</span>
                            <div className="truncate">
                              <div className="font-label-md text-label-md font-semibold text-on-surface truncate group-hover:text-primary">
                                LAB-REF-109: Renal Function Thresholds
                              </div>
                              <div className="font-label-sm text-label-sm text-secondary">
                                Tier 2 Clinical Guidelines • Nephrology Div
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-label-sm text-label-sm shrink-0 font-medium ml-2">
                            Current
                          </span>
                        </div>

                        {/* Source 3 */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-secondary text-surface flex items-center justify-center font-label-sm text-label-sm shrink-0 font-bold">3</span>
                            <div className="truncate">
                              <div className="font-label-md text-label-md font-semibold text-on-surface truncate group-hover:text-primary">
                                HOSP-BYLAW-88: Inpatient Medication Sign-off
                              </div>
                              <div className="font-label-sm text-label-sm text-secondary">
                                Tier 5 Department Memos / Bylaws • Clause 4.1
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FBF0DA] text-[#B7791F] font-label-sm text-label-sm shrink-0 font-medium ml-2">
                            Review Due
                          </span>
                        </div>
                      </div>

                      {/* Evidence Card Footer Action */}
                      <div className="flex items-center justify-between pt-2 text-secondary font-label-sm text-label-sm border-t border-outline-variant/20">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#2F7D5B]">lock</span>
                          Secure demo environment
                        </span>
                        <Link
                          href="/demo"
                          className="hover:text-primary transition-colors inline-flex items-center gap-1 font-label-md text-label-md font-medium text-on-surface"
                        >
                          <span>Explore in Live Demo</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* CLINICAL PHOTO INSIGHT BREAK */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 w-full">
            <div className="relative w-full rounded-2xl overflow-hidden bg-surface-container-high shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[260px] items-stretch">
                <div className="md:col-span-8 p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 text-secondary font-label-sm text-label-sm tracking-wider uppercase mb-2">
                    <span className="material-symbols-outlined text-[16px]">local_hospital</span>
                    Northfield Health Emergency &amp; Critical Care (demo scenario)
                  </div>
                  <h2 className="font-headline-md text-2xl md:text-headline-md font-bold text-primary max-w-xl mb-3">
                    Grounded in institutional documents. Built for bedside clinicians.
                  </h2>
                  <p className="font-body-md text-body-md text-secondary max-w-lg">
                    Frontline doctors and triage nurses cross-reference multi-departmental policies in seconds, eliminating fatal misinterpretation of expired guidelines.
                  </p>
                </div>
                <div className="md:col-span-4 relative min-h-[220px]">
                  <img
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Clinical hospital ward nursing station with clinicians"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2fXVvfdfAL5pxxDQ64r9ROUlzoqOJIkOLxLS_As_NO3tOmDFe3Egg4NC3XSSMMECHh02HmEYUKbBsRYvVtPRnQa2aA8cLuVSLzzbCsOBNijdYRSBLaPMrO1WPsA2y3aLoxv3tZBeud_RtD0-4XYbc3qxQFhXHP5a7_QwWqeuCfG0CYpxZALQU4CJJ_XIPKfTWgbyYCLk1F4d2FEZwmILxzHxTVx3FYbgFnUWaXKJayX5xYduZ_QN3"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-surface-container-high/60 via-transparent to-transparent hidden md:block" />
                </div>
              </div>
            </div>
          </section>

          {/* PROBLEM & IMPACT STATS ROW */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 w-full">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block mb-1">
                  Empirical Benchmark
                </span>
                <h2 className="font-headline-md text-2xl md:text-headline-md font-bold text-primary tracking-tight">
                  The Friction of Unverified Clinical Guidance
                </h2>
              </div>
              <p className="font-body-sm text-body-sm text-secondary max-w-md mt-2 md:mt-0">
                Clinical ambiguity slows decision-making, leads to billing rejections, and compromises care protocols.
              </p>
            </div>

            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between text-secondary mb-4">
                    <span className="font-label-sm text-label-sm uppercase tracking-wide font-medium">
                      Time Deficit <span className="normal-case opacity-75">(Illustrative)</span>
                    </span>
                    <span className="material-symbols-outlined text-[20px]">timer</span>
                  </div>
                  <div className="font-display text-4xl font-bold text-primary tracking-tight leading-none mb-2">22 min</div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Average clinician time lost per 12-hour shift hunting unverified PDFs, outdated intranet intranets, and orphaned memos.
                  </p>
                </div>
                <div className="pt-4 mt-4">
                  <svg className="w-full h-8 text-on-surface" fill="none" viewBox="0 0 100 24">
                    <path d="M0 20 L20 18 L40 14 L60 17 L80 8 L100 3" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                    <path d="M0 20 L20 18 L40 14 L60 17 L80 8 L100 3 L100 24 L0 24 Z" fill="currentColor" fillOpacity="0.05" />
                  </svg>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between text-secondary mb-4">
                    <span className="font-label-sm text-label-sm uppercase tracking-wide font-medium">
                      Policy Rot <span className="normal-case opacity-75">(Illustrative)</span>
                    </span>
                    <span className="material-symbols-outlined text-[20px]">pending_actions</span>
                  </div>
                  <div className="font-display text-4xl font-bold text-primary tracking-tight leading-none mb-2">34%</div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Active hospital policies in enterprise circulation that are past scheduled biennial clinical review deadlines.
                  </p>
                </div>
                <div className="pt-4 mt-4 flex gap-1">
                  <div className="h-2 flex-[34] bg-primary rounded-full" />
                  <div className="h-2 flex-[66] bg-surface-container-high rounded-full" />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between text-secondary mb-4">
                    <span className="font-label-sm text-label-sm uppercase tracking-wide font-medium">
                      Conflict Rate
                    </span>
                    <span className="material-symbols-outlined text-[20px]">call_split</span>
                  </div>
                  <div className="font-display text-4xl font-bold text-primary tracking-tight leading-none mb-2">1 in 7</div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Clinical queries presenting direct contradictions between departmental SOPs, surgical protocols, and commercial payer criteria.
                  </p>
                </div>
                <div className="pt-4 mt-4 flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  <span className="w-3 h-3 rounded-full bg-surface-container-high" />
                  <span className="w-3 h-3 rounded-full bg-surface-container-high" />
                  <span className="w-3 h-3 rounded-full bg-surface-container-high" />
                  <span className="w-3 h-3 rounded-full bg-surface-container-high" />
                  <span className="w-3 h-3 rounded-full bg-surface-container-high" />
                  <span className="w-3 h-3 rounded-full bg-surface-container-high" />
                </div>
              </div>

              {/* Stat 4 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between text-secondary mb-4">
                    <span className="font-label-sm text-label-sm uppercase tracking-wide font-medium">
                      Provenance Check
                    </span>
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                  </div>
                  <div className="font-display text-4xl font-bold text-primary tracking-tight leading-none mb-2">100%</div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    TrustLens answers verified with paragraph-level document citations, audit histories, and verifiable provenance.
                  </p>
                </div>
                <div className="pt-4 mt-4">
                  <div className="w-full h-2 rounded-full bg-[#2F7D5B]" />
                </div>
              </div>
            </div>
          </section>

          {/* BEFORE vs AFTER COMPARISON */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 w-full">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block mb-1">
                Architectural Shift
              </span>
              <h2 className="font-headline-md text-2xl md:text-headline-md font-bold text-primary tracking-tight">
                The Paradigm: Guesswork vs. Authoritative Provenance
              </h2>
              <p className="font-body-md text-body-md text-secondary mt-2">
                See how TrustLens transforms chaotic clinical documentation silos into an autonomous, authoritative evidence layer.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* Card: Before TrustLens */}
              <div className="bg-surface-container-high rounded-2xl p-6 lg:p-8 shadow-inner border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FBE6E4] text-[#B4403A] font-label-md text-label-md font-semibold">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      <span>Before TrustLens</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-secondary font-medium">High Cognitive Risk</span>
                  </div>

                  <h3 className="font-headline-md text-xl md:text-2xl font-bold text-primary mb-2">
                    Manual Intranet Fragmentation
                  </h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed mb-6">
                    Siloed SharePoint drives, contradictory old vs current PDFs, staff guessing or paging on-call fellows, 20+ minutes lost per query, and zero auditability during clinical audits.
                  </p>

                  <div className="bg-surface-container rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface text-secondary text-body-sm shadow-sm opacity-70">
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-error text-[18px]">folder_off</span>
                        <span className="line-through truncate">SharePoint / Pharmacy / Policies_v2_Final.pdf</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-error bg-error-container px-2 py-0.5 rounded-full shrink-0 font-medium">
                        Expired 2021
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface text-secondary text-body-sm shadow-sm opacity-80">
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-error text-[18px]">difference</span>
                        <span className="truncate">ED Potassium Protocol (Differs from ICU Order 14)</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-[#B7791F] bg-[#FBF0DA] px-2 py-0.5 rounded-full shrink-0 font-medium">
                        Conflict
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface text-secondary text-body-sm shadow-sm opacity-60">
                      <div className="flex items-center gap-2 truncate">
                        <span className="material-symbols-outlined text-secondary text-[18px]">drafts</span>
                        <span className="truncate">Oral Order Transcriptions: Unverified Verbal Approval</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary bg-surface-container-high px-2 py-0.5 rounded-full shrink-0 font-medium">
                        No Trail
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 flex items-center gap-2 text-secondary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <span>Result: Prolonged bedside delays and compliance exposure.</span>
                </div>
              </div>

              {/* Card: After with TrustLens */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-xl border border-outline-variant/20 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-label-md text-label-md font-semibold">
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>After TrustLens</span>
                    </div>
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#2F7D5B] animate-pulse" /> Northfield Health Production
                    </span>
                  </div>

                  <h3 className="font-headline-md text-xl md:text-2xl font-bold text-primary mb-2">
                    Autonomous Clinical Trust Engine
                  </h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed mb-6">
                    One natural language prompt, instant grounded synthesis, exact passage citations, automated freshness &amp; conflict warnings, generated evidence summaries in 3 seconds.
                  </p>

                  <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm shadow-sm border border-outline-variant/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[#2F7D5B] text-[20px]">check_circle</span>
                        <span className="font-medium truncate">ED Standing Protocol 4.2 • Active &amp; Verified</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-[#2F7D5B] bg-[#E4F2EA] px-2.5 py-0.5 rounded-full shrink-0 font-semibold">
                        Grounded
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm shadow-sm border border-outline-variant/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-[#2F7D5B] text-[20px]">fact_check</span>
                        <span className="font-medium truncate">Cross-Checked: Renal Thresholds ≤1.8 mg/dL</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-[#2F7D5B] bg-[#E4F2EA] px-2.5 py-0.5 rounded-full shrink-0 font-semibold">
                        No Conflict
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm shadow-sm border border-outline-variant/20">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
                        <span className="font-medium truncate">SHA-256 Document Fingerprint Generated</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary bg-surface-container-high px-2.5 py-0.5 rounded-full shrink-0 font-semibold">
                        Audited
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#2F7D5B] font-label-sm text-label-sm font-medium">
                    <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                    <span>Result: Bedside certainty in seconds with complete governance backing.</span>
                  </div>
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary font-label-sm text-label-sm shadow-sm hover:bg-neutral-800 transition-all font-medium"
                  >
                    <span>Try Demo</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 3-STAGE HOW IT WORKS STRIP */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 w-full">
            <div className="mb-8">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block mb-1">
                Architecture Pipeline
              </span>
              <h2 className="font-headline-md text-2xl md:text-headline-md font-bold text-primary tracking-tight">
                Three Stages to Clinical Certitude
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stage 01 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-label-sm text-label-sm font-bold text-secondary uppercase tracking-widest">Stage 01</span>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-primary mb-2">Ask in Plain English</h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed">
                    Hospital staff queries complex billing codes, triage escalation paths, contraindications, or multi-departmental nursing SOPs with zero prompt engineering.
                  </p>
                </div>
                <div className="mt-6 pt-4 text-secondary font-label-sm text-label-sm flex items-center gap-2 border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[18px]">mic_none</span>
                  <span>Direct Clinical Prompts</span>
                </div>
              </div>

              {/* Stage 02 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-label-sm text-label-sm font-bold text-secondary uppercase tracking-widest">Stage 02</span>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">account_tree</span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-primary mb-2">Autonomous Trust Verification</h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed">
                    TrustLens checks document authority (Regulatory Statutes &gt; Hospital SOP &gt; Departmental Memo), verifies revision dates, and scans for contradictory stipulations.
                  </p>
                </div>
                <div className="mt-6 pt-4 text-secondary font-label-sm text-label-sm flex items-center gap-2 border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[18px]">balance</span>
                  <span>Automated Hierarchy Weighting</span>
                </div>
              </div>

              {/* Stage 03 */}
              <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-label-sm text-label-sm font-bold text-secondary uppercase tracking-widest">Stage 03</span>
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">policy</span>
                    </div>
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-primary mb-2">Actionable Grounded Answer</h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed">
                    Receive direct paragraph-level citations, color-coded freshness badges, and an instant verifiable dossier ready for clinical audit defense.
                  </p>
                </div>
                <div className="mt-6 pt-4 text-secondary font-label-sm text-label-sm flex items-center gap-2 border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                  <span>Traceable Provenance</span>
                </div>
              </div>
            </div>
          </section>

          {/* WHY DOCUMENT-BASED AI? COMPACT COMPARISON */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-8 w-full">
            <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/15">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block mb-1">
                    Retrieval Paradigms
                  </span>
                  <h2 className="font-headline-md text-2xl md:text-headline-md font-bold text-primary tracking-tight">
                    Why Document-Based AI?
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-secondary max-w-md">
                  How purpose-built document retrieval compares to open search for clinical policy navigation.
                </p>
              </div>

              {/* 3-Column Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                {/* 1. Direct Search */}
                <div className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/15 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[18px]">search</span>
                      </div>
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                        Direct Search
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface mb-1.5">
                      Direct Search
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                      Broad information, but results may be outdated or unrelated to internal policies.
                    </p>
                  </div>
                </div>

                {/* 2. Document-Based AI (RAG) */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-primary/25 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">find_in_page</span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-semibold">
                        <span className="material-symbols-outlined text-[12px]">verified</span> TrustLens Core
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-base font-bold text-primary mb-1.5">
                      Document-Based AI (RAG)
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                      Searches uploaded healthcare documents and provides source citations for verification.
                    </p>
                  </div>
                </div>

                {/* 3. Hybrid Search */}
                <div className="p-4 rounded-xl bg-surface-container-low/50 border border-outline-variant/15 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[18px]">hub</span>
                      </div>
                      <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                        Hybrid Approach
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface mb-1.5">
                      Hybrid Search
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                      Combines internal documents with trusted external sources when needed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer / Note Footer */}
              <div className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/15 flex items-start sm:items-center gap-2.5 text-secondary">
                <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5 sm:mt-0">info</span>
                <p className="font-body-sm text-xs leading-normal">
                  Accuracy depends on document quality, retrieval performance, and source verification. No fixed accuracy is guaranteed.
                </p>
              </div>
            </div>
          </section>

          {/* AI WITH DOCUMENTS VS. AI WITHOUT DOCUMENTS */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 pb-8 w-full">
            <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm border border-outline-variant/20">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-outline-variant/15">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary block mb-1">
                    Comparative Evaluation
                  </span>
                  <h2 className="font-headline-md text-2xl md:text-headline-md font-bold text-primary tracking-tight">
                    AI With Documents vs. AI Without Documents
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-secondary max-w-lg">
                  Document-based AI can improve factual accuracy and traceability, but performance depends on document quality and retrieval.
                </p>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                {/* 1. AI Without Documents */}
                <div className="p-5 rounded-xl bg-surface-container-low/50 border border-outline-variant/15 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[18px]">psychology_alt</span>
                      </div>
                      <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                        Pretrained Only
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface mb-2">
                      AI Without Documents
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                      Relies on its pretrained knowledge and may produce unsupported answers or hallucinations.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-outline-variant/15 flex items-center justify-between">
                    <span className="font-label-sm text-xs text-secondary font-medium">Accuracy Benchmark:</span>
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-container text-secondary">
                      Without Documents: 70%
                    </span>
                  </div>
                </div>

                {/* 2. AI With Documents (RAG) */}
                <div className="p-5 rounded-xl bg-surface-container-low border border-primary/25 shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                      </div>
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-semibold">
                        <span className="material-symbols-outlined text-[12px]">verified</span> Grounded RAG
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-lg font-bold text-primary mb-2">
                      AI With Documents (RAG)
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
                      Retrieves relevant information from uploaded healthcare documents and provides source citations for verification.
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-outline-variant/15 flex items-center justify-between">
                    <span className="font-label-sm text-xs text-secondary font-medium">Accuracy Benchmark:</span>
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-[#E4F2EA] text-[#2F7D5B]">
                      With Documents: 80%
                    </span>
                  </div>
                </div>
              </div>

              {/* Disclaimer / Note Footer */}
              <div className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/15 flex items-start sm:items-center gap-2.5 text-secondary">
                <span className="material-symbols-outlined text-[18px] text-secondary shrink-0 mt-0.5 sm:mt-0">fact_check</span>
                <p className="font-body-sm text-xs leading-normal">
                  Measured across 10 verified Northfield Health clinical questions (70% without docs vs. 80% with docs, with 100% citation grounding adherence). Document-based AI improves factual accuracy and traceability, but performance depends on document quality and retrieval. No fixed accuracy is guaranteed.
                </p>
              </div>
            </div>
          </section>

          {/* CTA BANNER */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 w-full">
            <div className="relative bg-primary text-on-primary rounded-2xl p-8 md:p-12 overflow-hidden shadow-2xl">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:block">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 400 400">
                  <circle cx="200" cy="200" r="180" strokeWidth="2" />
                  <circle cx="200" cy="200" r="120" strokeDasharray="8 8" strokeWidth="2" />
                  <circle cx="200" cy="200" r="60" strokeWidth="2" />
                </svg>
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800 text-on-primary font-label-sm text-label-sm mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#2F7D5B]" /> Live Deployment Ready
                </div>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-headline-lg font-bold text-on-primary tracking-tight leading-tight mb-4">
                  Eliminate ambiguity from bedside care.
                </h2>
                <p className="font-body-lg text-body-lg text-neutral-300 mb-8 leading-relaxed">
                  Test TrustLens using real Northfield Health hospital guidelines, mock drug interactions, and conflicting departmental SOPs in our interactive sandboxed demo.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/demo"
                    className="px-8 py-4 rounded-full bg-surface text-primary font-label-md text-label-md hover:bg-neutral-100 transition-all font-semibold shadow-md transform hover:-translate-y-0.5"
                  >
                    Launch Interactive Demo →
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 rounded-full bg-neutral-800 text-on-primary font-label-md text-label-md hover:bg-neutral-700 transition-all"
                  >
                    Review Knowledge Gap Audits
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* EDITORIAL FOOTER CALLOUT */}
          <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-6 w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4 text-secondary font-label-sm text-label-sm border-t border-outline-variant/20">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F7D5B]" />
                <span>Connected to Northfield Health Synthetic Corpus (Demo Mode • Release 2.4.1)</span>
              </div>
              <div>
                <span>Engineered by team <strong className="text-on-surface">Cache Me Outside</strong> for frontline healthcare workers.</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
