import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TeamPage() {
  const team = [
    {
      name: "T V Ajay",
      role: "Frontend (everything people see)",
      tag: "01 // FRONTEND",
      initials: "TA",
      bio: "Leading the frontend engineering and responsive user experience. Ensuring clear clinical information architecture and zero visual fatigue.",
      github: "https://github.com/TVAjay24",
      linkedin: "https://www.linkedin.com/in/t-v-ajay-b047013a5",
      badge: "Frontend",
    },
    {
      name: "Sujan M",
      role: "Data and rules (the referee)",
      tag: "02 // DATA & RULES",
      initials: "SM",
      bio: "Governing data structures, hierarchy validation, and precedence resolution matrices. Enforcing the canonical five-tier authority ladder.",
      github: "https://github.com/sujangowdru1807",
      linkedin: "https://www.linkedin.com/in/sujan-m-78505b3b7/",
      badge: "Data & Rules",
    },
    {
      name: "Sujal U",
      role: "AI Engine (retrieval, answers, grounding)",
      tag: "03 // AI ENGINE",
      initials: "SU",
      bio: "Architecting the grounded retrieval pipeline, passage verification, and silence-guard threshold enforcement for clinical safety.",
      github: "https://github.com/sujalu7",
      linkedin: "https://www.linkedin.com/in/sujal-u-762731354/",
      badge: "AI Engine",
    },
  ];

  const tenets = [
    {
      number: "Tenet 01",
      icon: "mic_off",
      title: "Silence Over Speculation",
      description:
        "An ungrounded answer in medicine can be fatal. Silence preserves patient safety. When retrieved data fails confidence thresholds, TrustLens proactively yields to physician discretion.",
      badge: "Active Defensive Gate",
      badgeColor: "bg-[#2F7D5B]",
    },
    {
      number: "Tenet 02",
      icon: "fact_check",
      title: "Auditable Provenance",
      description:
        "Every clinical assertion must point directly to an exact line in a ratified hospital protocol, guideline, or peer-reviewed standard. No synthesis without verifiable source anchoring.",
      badge: "Grounding Trace",
      badgeColor: "bg-primary",
    },
    {
      number: "Tenet 03",
      icon: "account_tree",
      title: "Automated Hierarchy Resolution",
      description:
        "Clinicians shouldn't have to guess which departmental memo outranks an institutional SOP. Conflicting documents trigger explicit governance warnings rather than blended guesswork.",
      badge: "Conflict Taxonomy",
      badgeColor: "bg-[#B7791F]",
    },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen selection:bg-surface-container-highest selection:text-on-surface">
      <Navbar />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-12 pt-8 pb-16">
          {/* Header */}
          <header className="flex flex-col max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm tracking-wider uppercase font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Hackathon Build • Cache Me Outside
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-secondary font-label-sm text-label-sm shadow-sm border border-outline-variant/20 font-medium">
                <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                Northfield Health Deployment Dossier
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-on-surface tracking-tight">
              Team Cache Me Outside
            </h1>
            <p className="font-body-lg text-body-lg text-secondary max-w-3xl leading-relaxed">
              We believe clinical AI should never guess. In high-stakes healthcare, knowing why you can trust an answer—and when the system must admit it doesn&apos;t know—is the only foundation for bedside safety.
            </p>
          </header>

          {/* Stack Strip */}
          <section className="mt-10 w-full">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface text-[24px]">terminal</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-lg font-bold text-on-surface">
                    TrustLens Engineering &amp; Clinical Safety
                  </h2>
                  <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                    Built for Frontline Clinical Governance &amp; Bedside Safety
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mr-1 font-semibold">
                  Stack
                </span>
                {["Next.js", "Tailwind CSS", "TypeScript", "Supabase", "LLM API"].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm border border-outline-variant/10 font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Team Members Grid */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                  Collaborative Matrix
                </span>
                <h2 className="font-headline-md text-2xl font-bold text-on-surface">
                  The Multidisciplinary Unit
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-secondary font-label-sm text-label-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary" />
                3 Core Contributors
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((member) => (
                <article
                  key={member.name}
                  className="group bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center font-headline-sm text-xl font-bold text-on-surface">
                        {member.initials}
                      </div>
                      <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-secondary font-mono font-medium">
                        {member.tag}
                      </span>
                    </div>
                    <div className="mt-6">
                      <h3 className="font-headline-sm text-xl font-bold text-on-surface">{member.name}</h3>
                      <p className="font-label-md text-label-md text-secondary mt-0.5">{member.role}</p>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 leading-relaxed">
                      {member.bio}
                    </p>
                  </div>
                  <div className="mt-8 pt-4 border-t border-outline-variant/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <a
                          aria-label={`${member.name} GitHub`}
                          className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-primary hover:text-on-primary text-secondary flex items-center justify-center transition-colors border border-outline-variant/10"
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="material-symbols-outlined text-[16px]">code</span>
                        </a>
                        <a
                          aria-label={`${member.name} LinkedIn`}
                          className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-primary hover:text-on-primary text-secondary flex items-center justify-center transition-colors border border-outline-variant/10"
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="material-symbols-outlined text-[16px]">hub</span>
                        </a>
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary font-medium">{member.badge}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Principles Section */}
          <section className="mt-12">
            <div className="bg-surface-container rounded-2xl p-8 lg:p-12 border border-outline-variant/20">
              <div className="max-w-2xl mb-8">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                  Guiding Tenets
                </span>
                <h2 className="font-headline-lg text-2xl sm:text-headline-lg font-bold text-on-surface tracking-tight mt-1">
                  Why We Built TrustLens
                </h2>
                <p className="font-body-md text-body-md text-secondary mt-2">
                  Clinical AI must conform to the ethical discipline of medicine: do no harm, declare limitations openly, and provide an irrefutable audit trail for every patient-adjacent claim.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tenets.map((tenet) => (
                  <div
                    key={tenet.title}
                    className="bg-surface-container-lowest rounded-xl p-6 flex flex-col justify-between shadow-sm border border-outline-variant/20"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-on-surface text-[20px]">{tenet.icon}</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                        {tenet.number}
                      </span>
                      <h3 className="font-headline-sm text-lg font-bold text-on-surface mt-1">{tenet.title}</h3>
                      <p className="font-body-sm text-body-sm text-secondary mt-3 leading-relaxed">
                        {tenet.description}
                      </p>
                    </div>
                    <div className="mt-6 pt-3 flex items-center gap-2 border-t border-outline-variant/20">
                      <span className={`w-1.5 h-1.5 rounded-full ${tenet.badgeColor}`} />
                      <span className="font-label-sm text-label-sm text-secondary font-medium">{tenet.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Strip */}
          <section className="mt-12 flex flex-col sm:flex-row items-center justify-between p-6 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-surface">upload_file</span>
              </div>
              <div>
                <h4 className="font-headline-sm text-lg font-bold text-on-surface">
                  Experience the Grounded Inference Pipeline
                </h4>
                <p className="font-body-sm text-body-sm text-secondary">
                  Review live contradiction detection on synthetic Northfield Health stroke protocols.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container transition-all font-medium border border-outline-variant/20"
              >
                Methodology
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-neutral-800 transition-all font-medium"
              >
                Launch Live Demo
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
