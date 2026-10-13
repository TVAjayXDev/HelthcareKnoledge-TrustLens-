import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SILENCE_LINE } from "@/lib/constants";

export default function HowTrustWorksPage() {
  const stages = [
    {
      num: "STAGE 01",
      icon: "chat",
      title: "1. Plain Inquiry",
      desc: "Clinician enters unstructured question at bedside or EMR workstation.",
      detail: "Natural clinical syntax",
      detailIcon: "input",
    },
    {
      num: "STAGE 02",
      icon: "layers",
      title: "2. Vector & Retrieval",
      desc: "Fetches candidate paragraphs from Northfield Health's ratified corpus.",
      detail: "Isolated institutional index",
      detailIcon: "database",
    },
    {
      num: "STAGE 03",
      icon: "verified_user",
      title: "3. Trust Check",
      desc: "Evaluates authority hierarchy, review expiration, and cross-document conflicts.",
      detail: "5-tier arbitration",
      detailIcon: "balance",
    },
    {
      num: "STAGE 04",
      icon: "anchor",
      title: "4. Claim Grounding",
      desc: "Every synthesized sentence is strictly anchored to exact source passages.",
      detail: "Exact token span [1][2]",
      detailIcon: "link",
    },
    {
      num: "STAGE 05",
      icon: "check_circle",
      title: "5. Grounded Answer",
      desc: "Delivered with verified confidence score, full checklist, and audit trail.",
      detail: "Verifiable audit log",
      detailIcon: "lock",
      highlight: true,
    },
  ];

  const rules = [
    {
      principle: "Clear Authorship",
      icon: "badge",
      guardrail:
        "Named clinical owner, department head, and approving clinical safety committee shown on every source document.",
      status: "Attributed",
      statusIcon: "verified",
      statusColor: "bg-[#E4F2EA] text-[#2F7D5B]",
    },
    {
      principle: "Regular Updates & Recency",
      icon: "update",
      guardrail:
        "Freshness tags (<365d), automated review-due counters, and instant warnings for superseded policy releases.",
      status: "Automated",
      statusIcon: "schedule",
      statusColor: "bg-[#E4F2EA] text-[#2F7D5B]",
    },
    {
      principle: "Verifiable Citations",
      icon: "find_in_page",
      guardrail:
        "Exact paragraph-level deep links [1] [2] with similarity scores and highlighted excerpts visible in inspection view.",
      status: "100% Bound",
      statusIcon: "check_circle",
      statusColor: "bg-[#E4F2EA] text-[#2F7D5B]",
    },
    {
      principle: "Cross-Referencing & Discrepancies",
      icon: "rule",
      guardrail:
        "Automated conflict detector scans cross-department SOPs for contradictory clinical directives.",
      status: "Auto-Flagged",
      statusIcon: "priority_high",
      statusColor: "bg-[#FBF0DA] text-[#B7791F]",
    },
    {
      principle: "Red Flags & Silence Guard",
      icon: "do_not_disturb_on",
      guardrail:
        "Proactive warnings on draft or expired documents; automated system silence when below the grounding threshold.",
      status: "Safe Default",
      statusIcon: "shield",
      statusColor: "bg-[#E4F2EA] text-[#2F7D5B]",
    },
    {
      principle: "Trusted Source Hierarchy",
      icon: "military_tech",
      guardrail:
        "5-tier authority ladder automatically adjudicates policy precedence whenever overlapping documents are cited.",
      status: "Precedence Engine",
      statusIcon: "account_tree",
      statusColor: "bg-[#E4F2EA] text-[#2F7D5B]",
    },
  ];

  const tiers = [
    {
      tier: 1,
      name: "Regulatory Statutes",
      badge: "Supreme Authority",
      desc: "Federal & State Laws, CMS Guidelines, Federal Drug Scheduling, State Department of Health codes. Cannot be overridden under any condition.",
      indent: "sm:ml-0",
      highlight: true,
    },
    {
      tier: 2,
      name: "Clinical Guidelines",
      badge: "National Consensus",
      desc: "NCCN, ACC/AHA, CDC, Joint Commission Evidence Protocols. Gold-standard professional society directives.",
      indent: "sm:ml-3",
    },
    {
      tier: 3,
      name: "Payer Rules",
      badge: "Binding Reimbursement",
      desc: "Commercial & Medicare Payer Prior-Auth criteria, formulary step therapies, and coverage determination guidelines.",
      indent: "sm:ml-6",
    },
    {
      tier: 4,
      name: "Institutional SOPs",
      badge: "Northfield Health Ratified",
      desc: "Northfield Health Standard Operating Procedures, pharmacy formularies, hospital infection control manuals, and nursing bylaws.",
      indent: "sm:ml-9",
    },
    {
      tier: 5,
      name: "Department Memos / Bylaws",
      badge: "Informational Only",
      desc: "Floor memos, weekly rotation circulars, clinical shift handoffs. Explicitly superseded by all higher tiers.",
      indent: "sm:ml-12",
    },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen selection:bg-surface-container-highest selection:text-on-surface">
      <Navbar />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
        <div className="flex flex-col w-full">
          {/* Top Atmospheric Container */}
          <section className="relative w-full px-4 md:px-12 pt-12 pb-20 overflow-hidden">
            <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[720px] h-[360px] rounded-full bg-gradient-to-tr from-secondary-container/40 via-surface-container-high/60 to-surface-container/30 blur-[100px] opacity-70 -z-10" />

            <div className="max-w-[1340px] mx-auto flex flex-col gap-16">
              {/* Hero */}
              <div className="flex flex-col max-w-4xl">
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                    Architectural Provenance &amp; Clinical Governance
                  </span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-headline-lg font-bold text-on-surface tracking-tight mb-6">
                  Trust, checked automatically.
                </h1>
                <p className="font-body-lg text-body-lg text-secondary max-w-3xl leading-relaxed mb-8">
                  How TrustLens transforms hospital policy libraries into citation-anchored guidance for bedside clinicians. {SILENCE_LINE}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/demo"
                    className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-7 py-3 rounded-full shadow-sm hover:bg-neutral-800 transition-all font-medium"
                  >
                    <span>Try the Live Demo</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                  <a
                    href="#authority-matrix"
                    className="inline-flex items-center gap-2 bg-surface-container-lowest text-on-surface font-label-md text-label-md px-7 py-3 rounded-full shadow-sm border border-outline-variant/30 hover:bg-surface-container-low transition-all font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px] text-secondary">layers</span>
                    <span>Review Authority Matrix</span>
                  </a>
                  <span className="font-label-sm text-label-sm text-secondary px-2">
                    Target Deployment: <strong className="text-on-surface font-semibold">Northfield Health Clinical Core</strong>
                  </span>
                </div>
              </div>

              {/* 5-Stage Verification Engine */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-xl font-bold text-on-surface">
                      The 5-Stage Verification Engine
                    </span>
                    <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-medium">
                      Grounded Pipeline
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-secondary">Continuous grounding validation</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {stages.map((stage) => (
                    <div
                      key={stage.num}
                      className="bg-surface-container-lowest rounded-2xl p-6 flex flex-col justify-between shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <span className={`w-9 h-9 rounded-full flex items-center justify-center ${
                            stage.highlight ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface"
                          }`}>
                            <span className="material-symbols-outlined text-[20px]">{stage.icon}</span>
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary font-mono font-medium">{stage.num}</span>
                        </div>
                        <h3 className="font-headline-sm text-base font-bold text-on-surface mb-2">{stage.title}</h3>
                        <p className="font-body-sm text-body-sm text-secondary leading-relaxed">{stage.desc}</p>
                      </div>
                      <div className="mt-6 pt-4 flex items-center gap-2 text-secondary border-t border-outline-variant/20">
                        <span className="material-symbols-outlined text-[16px] text-secondary">{stage.detailIcon}</span>
                        <span className="font-label-sm text-label-sm truncate">{stage.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Comparison Matrix */}
          <section className="w-full px-4 md:px-12 py-16 bg-surface-container-low/50">
            <div className="max-w-[1340px] mx-auto flex flex-col gap-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                    Rigorous System Translation
                  </span>
                  <h2 className="font-headline-lg text-2xl md:text-headline-md font-bold text-on-surface mt-2">
                    From the checklist to the system
                  </h2>
                  <p className="font-body-md text-body-md text-secondary mt-1">
                    Human Clinical Governance Principles mapped directly into automated TrustLens guardrails.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-lowest shadow-sm border border-outline-variant/20">
                    <span className="w-2 h-2 rounded-full bg-[#2F7D5B]" />
                    <span className="font-label-sm text-label-sm text-secondary font-medium">6 Enforced Governance Rules</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-6 lg:p-10 shadow-sm border border-outline-variant/20 flex flex-col divide-y divide-surface-container">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-4 text-secondary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  <div className="md:col-span-4">Human Governance Principle</div>
                  <div className="md:col-span-6">Automated TrustLens Guardrail</div>
                  <div className="md:col-span-2 text-right hidden md:block">Real-time status</div>
                </div>

                {rules.map((rule) => (
                  <div key={rule.principle} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-5 items-center">
                    <div className="md:col-span-4 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px] text-on-surface">{rule.icon}</span>
                      </span>
                      <span className="font-headline-sm text-base font-semibold text-on-surface">{rule.principle}</span>
                    </div>
                    <div className="md:col-span-6 font-body-md text-body-md text-secondary leading-relaxed">
                      {rule.guardrail}
                    </div>
                    <div className="md:col-span-2 flex md:justify-end items-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm font-medium ${rule.statusColor}`}>
                        <span className="material-symbols-outlined text-[14px]">{rule.statusIcon}</span>
                        {rule.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Authority Ladder & Safety Constraints */}
          <section className="w-full px-4 md:px-12 py-20" id="authority-matrix">
            <div className="max-w-[1340px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: 5-Tier Authority Ladder */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                    Precedence Arbitration
                  </span>
                  <h2 className="font-headline-lg text-2xl md:text-headline-md font-bold text-on-surface mt-1">
                    The 5-Tier Authority Ladder
                  </h2>
                  <p className="font-body-md text-body-md text-secondary mt-1">
                    When policies intersect, TrustLens applies this strict linear precedence ladder to eliminate conflicting clinical directions.
                  </p>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  {tiers.map((t) => (
                    <div
                      key={t.tier}
                      className={`bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-2 transition-transform hover:-translate-y-0.5 ml-0 ${t.indent}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center font-label-sm text-label-sm font-bold ${
                            t.highlight ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"
                          }`}>
                            {t.tier}
                          </span>
                          <span className="font-headline-sm text-lg font-bold text-on-surface">Tier {t.tier}: {t.name}</span>
                        </div>
                        <span className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-surface-container text-secondary font-medium">
                          {t.badge}
                        </span>
                      </div>
                      <p className="font-body-md text-body-md text-secondary ml-11 leading-relaxed">
                        {t.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Negative Constraints */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">
                    Clinical Safeguards
                  </span>
                  <h2 className="font-headline-lg text-2xl md:text-headline-md font-bold text-on-surface mt-1">
                    What TrustLens will never do
                  </h2>
                  <p className="font-body-md text-body-md text-secondary mt-1">
                    Foundational negative constraints hardcoded into the grounded inference pipeline.
                  </p>
                </div>

                <div className="bg-primary text-on-primary rounded-2xl p-8 shadow-xl flex flex-col gap-8 relative overflow-hidden">
                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-[18px] text-on-primary">block</span>
                    </span>
                    <div className="flex flex-col">
                      <h4 className="font-headline-sm text-lg font-bold text-on-primary mb-1">
                        Never guess without a source
                      </h4>
                      <p className="font-body-sm text-body-sm text-neutral-300 leading-relaxed">
                        If authoritative corpus coverage is below the grounding threshold, TrustLens refuses to speculate and triggers an automatic Clinical Silence state.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-[18px] text-on-primary">visibility_off</span>
                    </span>
                    <div className="flex flex-col">
                      <h4 className="font-headline-sm text-lg font-bold text-on-primary mb-1">
                        Never hide a conflict
                      </h4>
                      <p className="font-body-sm text-body-sm text-neutral-300 leading-relaxed">
                        If two hospital documents provide divergent directives, the system flags the contradiction immediately rather than guessing an average.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                      <span className="material-symbols-outlined text-[18px] text-on-primary">history_toggle_off</span>
                    </span>
                    <div className="flex flex-col">
                      <h4 className="font-headline-sm text-lg font-bold text-on-primary mb-1">
                        Never cite expired drafts
                      </h4>
                      <p className="font-body-sm text-body-sm text-neutral-300 leading-relaxed">
                        Outdated documents and unapproved floor drafts are strictly quarantined from runtime inference generation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
