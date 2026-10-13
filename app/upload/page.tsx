"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DocumentRecord, ExtractedMetadata } from "@/lib/contract";

export default function UploadPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedMetadata | null>(null);
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // Form edit states
  const [title, setTitle] = useState("SOP-CARD-312: Adult Inpatient Heparin Anticoagulation Bridging & Reversal");
  const [tier, setTier] = useState<number>(4);
  const [owner, setOwner] = useState("Dr. Sarah Lin, MD (Chief of Cardiology)");
  const [approver, setApprover] = useState("Hospital Pharmacy & Therapeutics Committee");
  const [department, setDepartment] = useState("Cardiology & Critical Care Services");
  const [payer, setPayer] = useState("Regional Health Plans Council");

  // Load existing catalog from /api/documents
  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((docs: DocumentRecord[]) => setDocuments(docs))
      .catch((err) => console.error("Error loading documents:", err));
  }, []);

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploading(true);
    setSavedSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setDocumentRecord(data.document);
        setExtracted(data.extracted);
        if (data.document?.title) setTitle(data.document.title);
        if (data.document?.tier) setTier(data.document.tier);
        if (data.document?.owner) setOwner(data.document.owner);
        if (data.document?.approver) setApprover(data.document.approver);
        if (data.document?.department) setDepartment(data.document.department);
      }
    } catch (e) {
      console.error("Upload error:", e);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveToCorpus = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen selection:bg-surface-container-highest selection:text-on-surface">
      <Navbar />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-6 pb-20 flex flex-col gap-8">
          {/* Header */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant font-medium">
              <span>Documents &amp; Repo</span>
              <span className="text-outline-variant">/</span>
              <span>Intake &amp; Ingestion</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold bg-surface-container-low px-2.5 py-0.5 rounded-full text-label-sm">
                Batch #ING-2024-88
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex flex-col max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Provenance Engine v4.8
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5B]" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Bedside Graph Online</span>
                </div>
                <h1 className="font-headline-lg text-3xl sm:text-headline-lg font-bold text-on-surface tracking-tight">
                  Document Intake &amp; Automated Provenance Indexing
                </h1>
                <p className="font-body-md text-body-md text-secondary mt-2 max-w-2xl leading-relaxed">
                  Upload institutional protocols, payer directives, or clinical guidelines. TrustLens parses entity hierarchies, detects authority tiers, and flags cross-document discrepancies before bedside ingestion.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleSaveToCorpus}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-neutral-800 transition-all shadow-sm font-medium"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>{savedSuccess ? "Committed to Corpus!" : "Commit to Corpus"}</span>
                </button>
              </div>
            </div>
          </section>

          {/* Intake Workspace */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Drag & Drop Zone (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Dropzone Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                <div className="flex flex-col items-center text-center p-8 rounded-xl bg-surface-container-low/70 border border-dashed border-outline-variant/50">
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface mb-4">
                    <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                  </div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Drag and drop clinical documents
                  </h3>
                  <label className="mt-2 inline-block cursor-pointer">
                    <span className="text-primary font-semibold underline underline-offset-4 hover:text-neutral-700 transition-colors">
                      or browse local workstation storage
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.xlsx"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                      }}
                    />
                  </label>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                    {["PDF (Optical OCR ready)", "DOCX / Word", "XLSX Payer Schedules"].map((format) => (
                      <span
                        key={format}
                        className="px-2.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm shadow-sm border border-outline-variant/10"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant/20">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-on-surface">shield</span>
                    Secure demo environment
                  </span>
                  <span>Max 150MB / doc</span>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#E4F2EA] text-[#2F7D5B] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">task_alt</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        {file ? file.name : "SOP-CARD-2024-Anticoagulation-Heparin-Bridging.pdf"}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary">
                        {uploading ? "Parsing document..." : "Parsed by TrustLens"}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-label-sm text-label-sm shrink-0 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                    {uploading ? "Extracting..." : "100% Extracted"}
                  </span>
                </div>

                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: "100%" }} />
                </div>

                <div className="flex items-center justify-between font-label-sm text-label-sm text-secondary pt-1">
                  <span className="flex items-center gap-1 text-[#2F7D5B] font-medium">
                    <span className="material-symbols-outlined text-[14px]">speed</span>
                    AI Extraction Completed in 1.4s
                  </span>
                  <span className="text-on-surface">63 tokens/sec</span>
                </div>
              </div>

              {/* Provenance Assertion */}
              <div className="bg-surface-container-low rounded-2xl p-4 flex items-start gap-3 border border-outline-variant/10">
                <span className="material-symbols-outlined text-on-surface text-[20px] shrink-0 mt-0.5">verified_user</span>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Strict Provenance Assertion</span>
                  <span className="font-body-sm text-body-sm text-secondary leading-snug">
                    Every extracted claim links directly to verified token spans in the source PDF. Grounded answer verified before clinical review.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Metadata Form (7 Cols) */}
            <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant/20">
                  <div className="flex flex-col">
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                      Auto-Extracted Governance Metadata
                    </h3>
                    <span className="font-body-sm text-body-sm text-secondary mt-0.5">
                      Synthesized by TrustLens LLM Entity Parser. Review &amp; calibrate authority weights.
                    </span>
                  </div>
                  <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-on-surface font-label-sm text-label-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#2F7D5B]" />
                    9 Fields Extracted
                  </span>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                  {/* Field 1: Title */}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Institutional Document Title
                    </label>
                    <input
                      className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl py-2.5 px-3.5 focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/20"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Field 2: Tier */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Authority Tier &amp; Class
                    </label>
                    <select
                      value={tier}
                      onChange={(e) => setTier(Number(e.target.value))}
                      className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20 cursor-pointer"
                    >
                      <option value={1}>Tier 1 Regulatory Statutes</option>
                      <option value={2}>Tier 2 Clinical Guidelines</option>
                      <option value={3}>Tier 3 Payer Rules</option>
                      <option value={4}>Tier 4 Institutional SOPs</option>
                      <option value={5}>Tier 5 Department Memos / Bylaws</option>
                    </select>
                  </div>

                  {/* Field 3: Clinical Owner */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Primary Clinical Owner
                    </label>
                    <input
                      className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                      type="text"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                    />
                  </div>

                  {/* Field 4: Approving Body */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Approving Body
                    </label>
                    <input
                      className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                      type="text"
                      value={approver}
                      onChange={(e) => setApprover(e.target.value)}
                    />
                  </div>

                  {/* Field 5: Department Scope */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Department Service Line
                    </label>
                    <input
                      className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>

                  {/* Field 6: Payer Alignment */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Payer Alignment
                    </label>
                    <input
                      className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                      type="text"
                      value={payer}
                      onChange={(e) => setPayer(e.target.value)}
                    />
                  </div>

                  {/* Field 7: Checksum */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Version &amp; Verification Checksum
                    </label>
                    <input
                      className="w-full bg-surface-container-low text-on-surface font-mono text-[13px] rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                      type="text"
                      readOnly
                      value={documentRecord?.checksum ?? "v3.2 • SHA-256: 7f8a...9c4e"}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setExtracted(null);
                    setDocumentRecord(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-secondary hover:text-error transition-colors px-2 py-1 font-label-md text-label-md"
                >
                  <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  <span>Reset Extraction</span>
                </button>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveToCorpus}
                    className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-neutral-800 transition-all font-medium"
                  >
                    {savedSuccess ? "Saved Successfully ✓" : "Commit Changes"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Existing Document Library Table */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
              <div>
                <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                  Active Corpus Library (10 Canonical Documents)
                </h2>
                <p className="font-body-sm text-body-sm text-secondary mt-1">
                  All documents indexed in Northfield Health runtime corpus with verified tier weightings.
                </p>
              </div>
              <span className="font-label-sm text-label-sm px-3 py-1 rounded-full bg-surface-container text-secondary font-medium">
                10 Indexed Documents
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-secondary font-label-sm uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Document ID</th>
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Tier</th>
                    <th className="pb-3 font-semibold">Owner / Approver</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 font-body-sm">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3 font-mono font-bold text-on-surface">{doc.id}</td>
                      <td className="py-3 text-on-surface font-medium">{doc.title}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-sm font-medium">
                          Tier {doc.tier}
                        </span>
                      </td>
                      <td className="py-3 text-secondary">{doc.owner}</td>
                      <td className="py-3">
                        {doc.freshness === "current" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span> Current
                          </span>
                        )}
                        {doc.freshness === "review_overdue" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FBF0DA] text-[#B7791F] font-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[12px]">warning</span> Overdue ({doc.daysOverdue}d)
                          </span>
                        )}
                        {doc.freshness === "draft" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-secondary font-label-sm font-semibold">
                            <span className="material-symbols-outlined text-[12px]">draft</span> Draft
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
