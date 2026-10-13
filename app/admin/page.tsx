"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DocumentRecord, ExtractedMetadata, AskResponse, TierNumber } from "@/lib/contract";

type AdminTab = "documents" | "gaps" | "users" | "activity";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  department: string;
  credentialRole: string;
  role: "user" | "admin";
  createdAt: string;
  lastSignIn: string | null;
}

interface KnowledgeGapItem {
  id: string;
  question: string;
  askCount: number;
  lastAsked: string;
  gapStatus: "open" | "resolved";
  resolvedAt: string | null;
  closestDocuments: { documentId: string; relevance: number; note: string }[];
}

interface ConflictItem {
  id: string;
  question: string;
  conflict: {
    documentA: string;
    documentB: string;
    passageA: string;
    passageB: string;
    mismatch: string;
    winnerId?: string;
  };
  warnings: { message: string }[];
  created_at: string;
}

interface AuditActivity {
  id: string;
  actorId: string | null;
  actorEmail: string;
  actorName: string;
  action: string;
  target: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>("documents");

  // Notifications
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5000);
  };

  // ==========================================
  // TAB 1: DOCUMENTS STATE
  // ==========================================
  type AdminDocItem = DocumentRecord & { chunkCount?: number };
  const [documents, setDocuments] = useState<AdminDocItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [stagedToken, setStagedToken] = useState<string | null>(null);
  const [stagedExtracted, setStagedExtracted] = useState<ExtractedMetadata | null>(null);

  // Staged Form Edit Fields
  const [formId, setFormId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formVersion, setFormVersion] = useState("1.0");
  const [formTier, setFormTier] = useState<number>(4);
  const [formDocType, setFormDocType] = useState("Institutional SOP");
  const [formOwner, setFormOwner] = useState("");
  const [formApprover, setFormApprover] = useState("");
  const [formDepartment, setFormDepartment] = useState("Emergency Medicine");
  const [formPayer, setFormPayer] = useState("");
  const [formEffectiveDate, setFormEffectiveDate] = useState("");
  const [formLastReviewed, setFormLastReviewed] = useState("");
  const [formNextReview, setFormNextReview] = useState("");

  // Edit Existing Document Modal State
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation Modal State
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Fetch Documents
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/admin/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      } else if (res.status === 401 || res.status === 403) {
        showError("Administrative authorization required.");
      }
    } catch {
      showError("Failed to fetch documents catalog.");
    } finally {
      setLoadingDocs(false);
    }
  };

  // Handle Drag & Drop / File Upload -> Preview (Stores NOTHING yet)
  const handleFilePreview = async (file: File) => {
    setUploadFile(file);
    setPreviewing(true);
    setStagedToken(null);
    setStagedExtracted(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/documents/preview", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Failed to parse document preview.");
        setPreviewing(false);
        return;
      }

      const data = await res.json();
      setStagedToken(data.token);
      setStagedExtracted(data.extracted);

      // Pre-fill editable review form
      const f = data.extracted?.fields || {};
      setFormId(f.id || file.name.replace(/\.[^/.]+$/, ""));
      setFormTitle(f.title || file.name.replace(/\.[^/.]+$/, ""));
      setFormVersion(f.version || "1.0");
      setFormTier(f.tier || 4);
      setFormDocType(f.docType || "Institutional SOP");
      setFormOwner(f.owner || "Clinical Operations");
      setFormApprover(f.approver || "Medical Executive Committee");
      setFormDepartment(f.department || "Emergency Medicine");
      setFormPayer(f.payer || "");
      setFormEffectiveDate(f.effectiveDate ? f.effectiveDate.slice(0, 10) : "");
      setFormLastReviewed(f.lastReviewed ? f.lastReviewed.slice(0, 10) : "");
      setFormNextReview(f.nextReview ? f.nextReview.slice(0, 10) : "");

      showSuccess("PDF successfully parsed. Review extracted metadata before publishing.");
    } catch (e: any) {
      showError(e?.message || "Error analyzing document preview.");
    } finally {
      setPreviewing(false);
    }
  };

  // Commit Staged Document -> Store File, Chunks & Embeddings
  const handleCommitStaged = async () => {
    if (!stagedToken) return;
    setCommitting(true);

    try {
      const payload = {
        token: stagedToken,
        metadata: {
          id: formId.trim(),
          title: formTitle.trim(),
          version: formVersion.trim(),
          tier: Number(formTier),
          docType: formDocType.trim(),
          owner: formOwner.trim(),
          approver: formApprover.trim(),
          department: formDepartment.trim(),
          payer: formPayer.trim() || undefined,
          effectiveDate: formEffectiveDate || undefined,
          lastReviewed: formLastReviewed || undefined,
          nextReview: formNextReview || undefined,
        },
      };

      const res = await fetch("/api/admin/documents/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Failed to commit document.");
        setCommitting(false);
        return;
      }

      const result = await res.json();
      if (result.skipped) {
        showSuccess(result.message || "Document already indexed (identical checksum).");
      } else {
        showSuccess(
          `Successfully published "${result.document?.title}" with ${result.chunkCount} vector chunks!`
        );
      }

      // Reset staging state & refresh library
      setStagedToken(null);
      setStagedExtracted(null);
      setUploadFile(null);
      fetchDocuments();
    } catch (e: any) {
      showError(e?.message || "Failed to commit document to corpus.");
    } finally {
      setCommitting(false);
    }
  };

  // Save Document Metadata Edits (PATCH)
  const handleSaveEdit = async () => {
    if (!editingDoc) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/admin/documents/${encodeURIComponent(editingDoc.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingDoc.title,
          tier: editingDoc.tier,
          owner: editingDoc.owner,
          approver: editingDoc.approver,
          department: editingDoc.department,
          payer: editingDoc.payer,
          version: editingDoc.version,
          nextReview: editingDoc.nextReview,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Failed to update document.");
        return;
      }

      showSuccess(`Metadata updated for ${editingDoc.id}.`);
      setEditingDoc(null);
      fetchDocuments();
    } catch {
      showError("Failed to update document metadata.");
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Document Confirmation Handler (DELETE)
  const handleConfirmDelete = async () => {
    if (!deletingDocId) return;
    setDeletingLoading(true);

    try {
      const res = await fetch(`/api/admin/documents/${encodeURIComponent(deletingDocId)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        showError(err.error || "Failed to delete document.");
        return;
      }

      showSuccess(`Document ${deletingDocId} and associated chunks deleted.`);
      setDeletingDocId(null);
      fetchDocuments();
    } catch {
      showError("Failed to execute document deletion.");
    } finally {
      setDeletingLoading(false);
    }
  };

  // ==========================================
  // TAB 2: KNOWLEDGE GAPS & CONFLICTS
  // ==========================================
  const [gaps, setGaps] = useState<KnowledgeGapItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [loadingGaps, setLoadingGaps] = useState(false);

  const fetchGaps = async () => {
    setLoadingGaps(true);
    try {
      const res = await fetch("/api/admin/gaps");
      if (res.ok) {
        const data = await res.json();
        setGaps(data.gaps || []);
        setConflicts(data.conflicts || []);
      }
    } catch {
      showError("Failed to fetch knowledge gaps.");
    } finally {
      setLoadingGaps(false);
    }
  };

  const handleToggleGapStatus = async (question: string, currentStatus: "open" | "resolved") => {
    const newStatus = currentStatus === "open" ? "resolved" : "open";
    try {
      const res = await fetch("/api/admin/gaps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, gapStatus: newStatus }),
      });

      if (!res.ok) {
        showError("Failed to update gap status.");
        return;
      }

      showSuccess(`Gap marked as ${newStatus}.`);
      fetchGaps();
    } catch {
      showError("Error updating gap status.");
    }
  };

  // ==========================================
  // TAB 3: USERS & ROLE PERMISSIONS
  // ==========================================
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userRoleConfirm, setUserRoleConfirm] = useState<{
    user: AdminUser;
    newRole: "user" | "admin";
  } | null>(null);
  const [roleChanging, setRoleChanging] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      showError("Failed to fetch users list.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleExecuteRoleChange = async () => {
    if (!userRoleConfirm) return;
    setRoleChanging(true);

    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userRoleConfirm.user.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: userRoleConfirm.newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        showError(data.error || "Failed to change user role.");
        setUserRoleConfirm(null);
        return;
      }

      showSuccess(`User ${userRoleConfirm.user.email} is now an ${userRoleConfirm.newRole}.`);
      setUserRoleConfirm(null);
      fetchUsers();
    } catch (e: any) {
      showError(e?.message || "Failed to update user role.");
    } finally {
      setRoleChanging(false);
    }
  };

  // ==========================================
  // TAB 4: ACTIVITY AUDIT LOG
  // ==========================================
  const [activities, setActivities] = useState<AuditActivity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const fetchActivity = async () => {
    setLoadingActivity(true);
    try {
      const res = await fetch("/api/admin/activity");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch {
      showError("Failed to load audit activity log.");
    } finally {
      setLoadingActivity(false);
    }
  };

  // ==========================================
  // INLINE "TEST A QUESTION" SANDBOX BOX
  // ==========================================
  const [testQuery, setTestQuery] = useState("");
  const [testingQuery, setTestingQuery] = useState(false);
  const [testResult, setTestResult] = useState<AskResponse | null>(null);

  const handleRunTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setTestingQuery(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: testQuery }),
      });

      if (res.ok) {
        const data: AskResponse = await res.json();
        setTestResult(data);
      } else {
        showError("Failed to synthesize test query.");
      }
    } catch {
      showError("Error executing test query.");
    } finally {
      setTestingQuery(false);
    }
  };

  // Initial load based on active tab
  useEffect(() => {
    if (activeTab === "documents") fetchDocuments();
    else if (activeTab === "gaps") fetchGaps();
    else if (activeTab === "users") fetchUsers();
    else if (activeTab === "activity") fetchActivity();
  }, [activeTab]);

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen selection:bg-surface-container-highest selection:text-on-surface">
      <Navbar />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12 pt-6 pb-20 flex flex-col gap-8">
          {/* Toast Notification Container */}
          {successToast && (
            <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-[#E4F2EA] text-[#2F7D5B] font-label-md text-label-md flex items-center gap-2 border border-[#2F7D5B]/30 shadow-lg animate-in fade-in">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>{successToast}</span>
            </div>
          )}
          {errorToast && (
            <div className="fixed top-24 right-6 z-50 p-4 rounded-xl bg-[#FBE6E4] text-[#B4403A] font-label-md text-label-md flex items-center gap-2 border border-[#B4403A]/30 shadow-lg animate-in fade-in">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{errorToast}</span>
            </div>
          )}

          {/* Header & Enclave Badge */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface-variant font-medium">
              <span>TrustLens Governance</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold bg-surface-container-low px-2.5 py-0.5 rounded-full text-label-sm">
                Administrative Control Panel
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex flex-col max-w-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                    Admin Enclave
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5B] animate-pulse" />
                  <span className="font-label-sm text-label-sm text-secondary">
                    Server-Side Authorization Enforced
                  </span>
                </div>
                <h1 className="font-headline-lg text-3xl sm:text-headline-lg font-bold text-on-surface tracking-tight">
                  Hospital AI Corpus &amp; Governance Center
                </h1>
                <p className="font-body-md text-body-md text-secondary mt-1 max-w-2xl leading-relaxed">
                  Manage clinical policies, calibrate hierarchy weights, resolve documented knowledge gaps, and audit governance telemetry.
                </p>
              </div>

              {/* 4 Tabs Selector */}
              <div className="flex rounded-full bg-surface-container-low p-1 border border-outline-variant/20 shrink-0 self-start lg:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("documents")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-label-md font-semibold transition-all ${
                    activeTab === "documents"
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  <span>Documents</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("gaps")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-label-md font-semibold transition-all ${
                    activeTab === "gaps"
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">gpp_maybe</span>
                  <span>Knowledge Gaps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-label-md font-semibold transition-all ${
                    activeTab === "users"
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">group</span>
                  <span>Users</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("activity")}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full font-label-md text-label-md font-semibold transition-all ${
                    activeTab === "activity"
                      ? "bg-surface-container-lowest text-on-surface shadow-sm"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>Activity</span>
                </button>
              </div>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* TAB 1: DOCUMENTS (UPLOAD, REVIEW & PUBLISH, LIBRARY TABLE, EDIT/DELETE)   */}
          {/* ========================================================================= */}
          {activeTab === "documents" && (
            <div className="flex flex-col gap-8">
              {/* Intake & Review Split */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Drag & Drop Dropzone (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                    <div className="flex flex-col items-center text-center p-8 rounded-xl bg-surface-container-low/70 border border-dashed border-outline-variant/50">
                      <div className="w-16 h-16 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-on-surface mb-4">
                        <span className="material-symbols-outlined text-[32px]">
                          {previewing ? "hourglass_empty" : "cloud_upload"}
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                        {previewing ? "Analyzing & Parsing PDF..." : "Upload Policy Document"}
                      </h3>
                      <label className="mt-2 inline-block cursor-pointer">
                        <span className="text-primary font-semibold underline underline-offset-4 hover:text-neutral-700 transition-colors">
                          or browse local workstation storage
                        </span>
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFilePreview(e.target.files[0]);
                          }}
                        />
                      </label>
                      <span className="text-[12px] text-secondary mt-3">
                        Strict verification: PDF magic bytes validated (%PDF-) • Max 15 MB
                      </span>
                    </div>

                    {uploadFile && (
                      <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
                          <span className="font-label-md text-label-md text-on-surface truncate font-medium">
                            {uploadFile.name}
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-semibold">
                          {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stage Notice */}
                  <div className="bg-surface-container-low rounded-2xl p-4 flex items-start gap-3 border border-outline-variant/10">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
                      security
                    </span>
                    <div className="flex flex-col text-body-sm text-secondary leading-snug">
                      <strong className="text-on-surface font-semibold">Two-Phase Admin Gate:</strong>
                      Uploading parses text and assesses entity confidence in staging. No records or vectors are written until you click &quot;Verify &amp; Publish&quot;.
                    </div>
                  </div>
                </div>

                {/* Right Column: Review & Calibrate Form (7 cols) */}
                <div className="lg:col-span-7 bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-outline-variant/20">
                      <div>
                        <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                          Staged Metadata Review &amp; Calibration
                        </h3>
                        <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                          Review detected values and calibrated confidence before committing to corpus.
                        </p>
                      </div>
                      {stagedToken ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-label-sm text-label-sm font-semibold shrink-0">
                          <span className="w-2 h-2 rounded-full bg-[#2F7D5B]" />
                          Staged in Memory
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-secondary font-label-sm text-label-sm font-medium shrink-0">
                          Waiting for PDF
                        </span>
                      )}
                    </div>

                    {/* Review Form Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-5">
                      {/* Document ID */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                            Document ID
                          </label>
                          {stagedExtracted?.fieldConfidence.id && (
                            <span className="text-[11px] text-[#2F7D5B] font-mono font-bold">
                              {Math.round(stagedExtracted.fieldConfidence.id * 100)}% Conf
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formId}
                          onChange={(e) => setFormId(e.target.value)}
                          placeholder="e.g. CARD-GUIDE-2024"
                          className="w-full bg-surface-container-low font-mono text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/20 font-bold"
                        />
                      </div>

                      {/* Version */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                            Version
                          </label>
                          {stagedExtracted?.fieldConfidence.version && (
                            <span className="text-[11px] text-[#2F7D5B] font-mono font-bold">
                              {Math.round(stagedExtracted.fieldConfidence.version * 100)}% Conf
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={formVersion}
                          onChange={(e) => setFormVersion(e.target.value)}
                          placeholder="e.g. 1.0 or RevB"
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                        />
                      </div>

                      {/* Title */}
                      <div className="md:col-span-2 flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          Institutional Document Title
                        </label>
                        <input
                          type="text"
                          value={formTitle}
                          onChange={(e) => setFormTitle(e.target.value)}
                          placeholder="e.g. Inpatient Potassium Repletion Guideline"
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/20"
                        />
                      </div>

                      {/* Authority Tier */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                            Authority Tier
                          </label>
                          {stagedExtracted?.fieldConfidence.tier && (
                            <span className="text-[11px] text-[#2F7D5B] font-mono font-bold">
                              {Math.round(stagedExtracted.fieldConfidence.tier * 100)}% Conf
                            </span>
                          )}
                        </div>
                        <select
                          value={formTier}
                          onChange={(e) => setFormTier(Number(e.target.value))}
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20 cursor-pointer"
                        >
                          <option value={1}>Tier 1 • Regulatory Statutes</option>
                          <option value={2}>Tier 2 • Clinical Guidelines</option>
                          <option value={3}>Tier 3 • Payer Rules</option>
                          <option value={4}>Tier 4 • Institutional SOPs</option>
                          <option value={5}>Tier 5 • Department Memos / Bylaws</option>
                        </select>
                      </div>

                      {/* Document Type */}
                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          Document Type
                        </label>
                        <input
                          type="text"
                          value={formDocType}
                          onChange={(e) => setFormDocType(e.target.value)}
                          placeholder="e.g. Clinical Guideline, Standing Order"
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                        />
                      </div>

                      {/* Clinical Owner */}
                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          Clinical Owner
                        </label>
                        <input
                          type="text"
                          value={formOwner}
                          onChange={(e) => setFormOwner(e.target.value)}
                          placeholder="e.g. Dr. Lin, Chief of Cardiology"
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                        />
                      </div>

                      {/* Approver */}
                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          Approving Committee
                        </label>
                        <input
                          type="text"
                          value={formApprover}
                          onChange={(e) => setFormApprover(e.target.value)}
                          placeholder="e.g. Pharmacy & Therapeutics Committee"
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                        />
                      </div>

                      {/* Department */}
                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          Department
                        </label>
                        <input
                          type="text"
                          value={formDepartment}
                          onChange={(e) => setFormDepartment(e.target.value)}
                          placeholder="e.g. Emergency Medicine"
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                        />
                      </div>

                      {/* Payer Alignment */}
                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          Payer Alignment (Optional)
                        </label>
                        <input
                          type="text"
                          value={formPayer}
                          onChange={(e) => setFormPayer(e.target.value)}
                          placeholder="e.g. Regional Health Plans Council"
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                        />
                      </div>

                      {/* Dates */}
                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          Effective Date
                        </label>
                        <input
                          type="date"
                          value={formEffectiveDate}
                          onChange={(e) => setFormEffectiveDate(e.target.value)}
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                          Next Scheduled Review
                        </label>
                        <input
                          type="date"
                          value={formNextReview}
                          onChange={(e) => setFormNextReview(e.target.value)}
                          className="w-full bg-surface-container-low text-body-sm text-on-surface rounded-xl py-2.5 px-3.5 focus:outline-none border border-outline-variant/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-6 mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant/20">
                    <button
                      type="button"
                      disabled={!stagedToken}
                      onClick={() => {
                        setStagedToken(null);
                        setStagedExtracted(null);
                        setUploadFile(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-secondary hover:text-[#B4403A] transition-colors font-label-md text-label-md disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                      <span>Discard Staged Draft</span>
                    </button>

                    <button
                      type="button"
                      disabled={!stagedToken || committing}
                      onClick={handleCommitStaged}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-neutral-800 transition-all font-semibold shadow-md disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {committing ? "hourglass_empty" : "publish"}
                      </span>
                      <span>{committing ? "Chunking & Publishing..." : "Verify & Publish to Corpus"}</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* Active Document Library Table */}
              <section className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
                  <div>
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                      Active Corpus Library ({documents.length} Indexed Policies)
                    </h2>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">
                      Live policies embedded with 768-dim vectors. Chunks are strictly consulted during synthesis.
                    </p>
                  </div>
                  <button
                    onClick={fetchDocuments}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface text-label-sm font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Refresh Library</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-secondary font-label-sm uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Document ID</th>
                        <th className="pb-3 font-semibold">Title</th>
                        <th className="pb-3 font-semibold">Tier</th>
                        <th className="pb-3 font-semibold">Status / Freshness</th>
                        <th className="pb-3 font-semibold">Version</th>
                        <th className="pb-3 font-semibold">Chunks</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-sm">
                      {loadingDocs && documents.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-secondary">
                            Loading catalog documents...
                          </td>
                        </tr>
                      ) : (
                        documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="py-3.5 font-mono font-bold text-on-surface">
                              {doc.id}
                              {doc.newerVersionId && (
                                <span className="block text-[11px] font-normal text-secondary font-sans">
                                  Superseded by {doc.newerVersionId}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 max-w-[260px] truncate">
                              <span className="font-semibold text-on-surface block truncate" title={doc.title}>
                                {doc.title}
                              </span>
                              <span className="text-[12px] text-secondary truncate block">
                                {doc.department} • {doc.owner}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">
                                Tier {doc.tier}
                              </span>
                            </td>
                            <td className="py-3.5">
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
                              {doc.freshness === "superseded" && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FBE6E4] text-[#B4403A] font-label-sm font-semibold">
                                  <span className="material-symbols-outlined text-[12px]">history</span> Superseded
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 font-mono text-secondary">{doc.version}</td>
                            <td className="py-3.5 font-mono text-on-surface font-semibold">
                              {doc.chunkCount ?? "-"}
                            </td>
                            <td className="py-3.5 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setEditingDoc({ ...doc })}
                                  className="p-1.5 rounded-lg hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
                                  title="Edit Document Metadata"
                                >
                                  <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormId(doc.id);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-surface-container text-secondary hover:text-on-surface transition-colors"
                                  title="Replace with new revision"
                                >
                                  <span className="material-symbols-outlined text-[18px]">sync</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingDocId(doc.id)}
                                  className="p-1.5 rounded-lg hover:bg-[#FBE6E4] text-secondary hover:text-[#B4403A] transition-colors"
                                  title="Delete Document & Chunks"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: KNOWLEDGE GAPS (UNANSWERED QUESTIONS, CONFLICTS & RESOLUTIONS)     */}
          {/* ========================================================================= */}
          {activeTab === "gaps" && (
            <div className="flex flex-col gap-8">
              {/* Unanswered Queries Table */}
              <section className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
                  <div>
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface flex items-center gap-2">
                      <span>Unanswered Inquiries &amp; Policy Gaps</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FBE6E4] text-[#B4403A] text-label-sm font-semibold">
                        {gaps.filter((g) => g.gapStatus === "open").length} Open
                      </span>
                    </h2>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">
                      Inquiries where TrustLens deliberately silenced itself due to lack of ratified hospital documents.
                    </p>
                  </div>
                  <button
                    onClick={fetchGaps}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary text-label-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Refresh Gaps</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  {loadingGaps && gaps.length === 0 ? (
                    <div className="py-8 text-center text-secondary">Loading telemetry gaps...</div>
                  ) : gaps.length === 0 ? (
                    <div className="py-8 text-center text-secondary">
                      Zero knowledge gaps logged! All clinical inquiries have grounded coverage.
                    </div>
                  ) : (
                    gaps.map((gap, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          gap.gapStatus === "resolved"
                            ? "bg-surface-container-low/50 border-outline-variant/10 opacity-70"
                            : "bg-surface-container-low border-outline-variant/20 shadow-sm"
                        }`}
                      >
                        <div className="space-y-1.5 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-bold uppercase ${
                                gap.gapStatus === "resolved"
                                  ? "bg-[#E4F2EA] text-[#2F7D5B]"
                                  : "bg-[#FBE6E4] text-[#B4403A]"
                              }`}
                            >
                              {gap.gapStatus === "resolved" ? "Resolved" : "Open Gap"}
                            </span>
                            <span className="font-label-sm text-label-sm text-secondary">
                              Asked <strong>{gap.askCount}</strong> {gap.askCount === 1 ? "time" : "times"} • Last asked:{" "}
                              {new Date(gap.lastAsked).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-body-md text-base font-semibold text-on-surface">
                            &ldquo;{gap.question}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("documents");
                              setFormTitle(gap.question.slice(0, 60));
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md border border-outline-variant/20 hover:bg-surface-container shadow-sm transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">upload_file</span>
                            <span>Upload document for this</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleGapStatus(gap.question, gap.gapStatus)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md transition-all font-semibold ${
                              gap.gapStatus === "resolved"
                                ? "bg-surface-container text-secondary hover:text-on-surface"
                                : "bg-[#2F7D5B] text-surface hover:bg-[#256348]"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {gap.gapStatus === "resolved" ? "undo" : "check"}
                            </span>
                            <span>{gap.gapStatus === "resolved" ? "Reopen" : "Mark Resolved"}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Detected Conflicts Section */}
              <section className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 space-y-4">
                <div className="pb-2 border-b border-outline-variant/20">
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#B4403A] text-[20px]">rule</span>
                    <span>Cross-Policy Conflicts Telemetry</span>
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary mt-0.5">
                    Recent inquiries that triggered automated hierarchical precedence resolution.
                  </p>
                </div>

                {conflicts.length === 0 ? (
                  <p className="text-secondary text-body-sm py-4">No recent conflict events recorded.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conflicts.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 flex flex-col justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <span className="font-label-sm text-label-sm text-[#B4403A] font-semibold uppercase">
                            Precedence Conflict Detected
                          </span>
                          <p className="font-body-sm font-semibold text-on-surface">&ldquo;{c.question}&rdquo;</p>
                          {c.conflict && (
                            <p className="text-secondary text-[13px] pt-1 leading-snug">
                              <strong>Mismatch:</strong> {c.conflict.mismatch} ({c.conflict.documentA} vs{" "}
                              {c.conflict.documentB})
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] text-secondary">
                          Logged: {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: USERS & ROLE PERMISSION MANAGEMENT                                 */}
          {/* ========================================================================= */}
          {activeTab === "users" && (
            <div className="flex flex-col gap-8">
              <section className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
                  <div>
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                      Hospital Clinicians &amp; User Access Control
                    </h2>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">
                      Enforce administrative privileges. Admins can upload and delete; standard clinicians have ask-only access.
                    </p>
                  </div>
                  <button
                    onClick={fetchUsers}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary text-label-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Refresh Users</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-secondary font-label-sm uppercase tracking-wider">
                        <th className="pb-3 font-semibold">User</th>
                        <th className="pb-3 font-semibold">Department &amp; Credential</th>
                        <th className="pb-3 font-semibold">Role</th>
                        <th className="pb-3 font-semibold">Registered</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-sm">
                      {loadingUsers && users.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-secondary">
                            Loading user directory...
                          </td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="py-3.5">
                              <div className="flex flex-col">
                                <span className="font-semibold text-on-surface">{u.fullName}</span>
                                <span className="text-[12px] font-mono text-secondary">{u.email}</span>
                              </div>
                            </td>
                            <td className="py-3.5 text-secondary">
                              <span className="block text-on-surface font-medium">{u.department}</span>
                              <span className="text-[12px] text-secondary">{u.credentialRole}</span>
                            </td>
                            <td className="py-3.5">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full font-label-sm text-label-sm font-semibold uppercase ${
                                  u.role === "admin"
                                    ? "bg-primary text-on-primary"
                                    : "bg-surface-container text-secondary"
                                }`}
                              >
                                {u.role === "admin" && (
                                  <span className="material-symbols-outlined text-[14px]">shield</span>
                                )}
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3.5 text-secondary text-label-sm">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 text-right">
                              {u.role === "admin" ? (
                                <button
                                  type="button"
                                  onClick={() => setUserRoleConfirm({ user: u, newRole: "user" })}
                                  className="px-3.5 py-1.5 rounded-full border border-outline-variant/30 text-[#B4403A] hover:bg-[#FBE6E4] text-label-sm font-medium transition-colors"
                                >
                                  Demote to User
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setUserRoleConfirm({ user: u, newRole: "admin" })}
                                  className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary hover:bg-neutral-800 text-label-sm font-medium transition-colors shadow-sm"
                                >
                                  Promote to Admin
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ACTIVITY AUDIT LOG (LATEST 100 GOVERNANCE EVENTS)                  */}
          {/* ========================================================================= */}
          {activeTab === "activity" && (
            <div className="flex flex-col gap-8">
              <section className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-outline-variant/20">
                  <div>
                    <h2 className="font-headline-sm text-xl font-bold text-on-surface">
                      Administrative Audit Trail (Latest 100 Actions)
                    </h2>
                    <p className="font-body-sm text-body-sm text-secondary mt-1">
                      Tamper-evident governance telemetry recorded exclusively via server-side service role execution.
                    </p>
                  </div>
                  <button
                    onClick={fetchActivity}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary text-label-sm font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                    <span>Refresh Activity</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-body-sm">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-secondary font-label-sm uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Timestamp</th>
                        <th className="pb-3 font-semibold">Actor</th>
                        <th className="pb-3 font-semibold">Action</th>
                        <th className="pb-3 font-semibold">Target</th>
                        <th className="pb-3 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-sm">
                      {loadingActivity && activities.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-secondary">
                            Loading audit log...
                          </td>
                        </tr>
                      ) : activities.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-secondary">
                            Zero audit events logged yet.
                          </td>
                        </tr>
                      ) : (
                        activities.map((a) => (
                          <tr key={a.id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="py-3 font-mono text-[12px] text-secondary">
                              {new Date(a.createdAt).toLocaleString()}
                            </td>
                            <td className="py-3">
                              <span className="font-medium text-on-surface block">{a.actorName}</span>
                              <span className="text-[12px] text-secondary font-mono">{a.actorEmail}</span>
                            </td>
                            <td className="py-3">
                              <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-mono text-[11px] font-bold text-on-surface">
                                {a.action}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-on-surface font-semibold">{a.target}</td>
                            <td className="py-3 font-mono text-[11px] text-secondary max-w-[280px] truncate">
                              {JSON.stringify(a.details)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PERSISTENT "TEST A QUESTION" SANDBOX BOX (VERIFY RIGHT AFTER PUBLISHING)  */}
          {/* ========================================================================= */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm border border-outline-variant/20 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">psychology</span>
                </span>
                <div>
                  <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                    Test Live Synthesis Sandbox
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Verify retrieval &amp; grounding against the newly published or updated documents immediately.
                  </p>
                </div>
              </div>
              <span className="font-label-sm text-label-sm px-2.5 py-0.5 rounded-full bg-[#E4F2EA] text-[#2F7D5B] font-semibold">
                Live Gemini Pipeline
              </span>
            </div>

            <form onSubmit={handleRunTestQuery} className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="Ask any policy inquiry to test against live hospital corpus..."
                className="flex-1 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-full py-3 px-5 focus:outline-none focus:bg-surface-container-lowest border border-outline-variant/20"
              />
              <button
                type="submit"
                disabled={testingQuery || !testQuery.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-neutral-800 transition-all font-semibold shrink-0 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {testingQuery ? "hourglass_empty" : "send"}
                </span>
                <span>{testingQuery ? "Synthesizing..." : "Test Answer"}</span>
              </button>
            </form>

            {testResult && (
              <div className="mt-4 p-5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-bold uppercase ${
                      testResult.status === "answered"
                        ? "bg-[#E4F2EA] text-[#2F7D5B]"
                        : testResult.status === "conflict"
                        ? "bg-[#FBE6E4] text-[#B4403A]"
                        : "bg-[#FBF0DA] text-[#B7791F]"
                    }`}
                  >
                    Status: {testResult.status} • Conf: {testResult.confidence.level}
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary">
                    Audit ID: {testResult.id}
                  </span>
                </div>

                <div className="space-y-2">
                  {testResult.claims.length > 0 ? (
                    testResult.claims.map((claim, idx) => (
                      <p key={idx} className="font-body-sm text-on-surface">
                        • {claim.text}{" "}
                        <span className="text-secondary font-mono text-xs">
                          [citations: {claim.citations.join(", ")}]
                        </span>
                      </p>
                    ))
                  ) : (
                    <p className="font-body-sm text-secondary italic">
                      &quot;I do not have sufficient ratified hospital guidance to answer this question.&quot;
                    </p>
                  )}
                </div>

                {testResult.citations.length > 0 && (
                  <div className="pt-2 border-t border-outline-variant/20 flex flex-wrap gap-2 text-xs">
                    <span className="font-semibold text-secondary">Citations:</span>
                    {testResult.citations.map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono">
                        [{c.n}] {c.documentId} ({c.section})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT DOCUMENT METADATA MODAL                                     */}
      {/* ========================================================================= */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant/20 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                Edit Metadata: {editingDoc.id}
              </h3>
              <button
                onClick={() => setEditingDoc(null)}
                className="p-1 rounded-full hover:bg-surface-container text-secondary"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-sm max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-label-sm font-semibold uppercase text-secondary">Document Title</label>
                <input
                  type="text"
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl mt-1 text-on-surface border border-outline-variant/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold uppercase text-secondary">Authority Tier</label>
                  <select
                    value={editingDoc.tier}
                    onChange={(e) =>
                      setEditingDoc({ ...editingDoc, tier: Number(e.target.value) as TierNumber })
                    }
                    className="w-full bg-surface-container-low px-3 py-2 rounded-xl mt-1 text-on-surface border border-outline-variant/20"
                  >
                    <option value={1}>Tier 1 Regulatory Statutes</option>
                    <option value={2}>Tier 2 Clinical Guidelines</option>
                    <option value={3}>Tier 3 Payer Rules</option>
                    <option value={4}>Tier 4 Institutional SOPs</option>
                    <option value={5}>Tier 5 Department Memos / Bylaws</option>
                  </select>
                </div>
                <div>
                  <label className="text-label-sm font-semibold uppercase text-secondary">Version</label>
                  <input
                    type="text"
                    value={editingDoc.version}
                    onChange={(e) => setEditingDoc({ ...editingDoc, version: e.target.value })}
                    className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl mt-1 text-on-surface border border-outline-variant/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-label-sm font-semibold uppercase text-secondary">Clinical Owner</label>
                <input
                  type="text"
                  value={editingDoc.owner}
                  onChange={(e) => setEditingDoc({ ...editingDoc, owner: e.target.value })}
                  className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl mt-1 text-on-surface border border-outline-variant/20"
                />
              </div>

              <div>
                <label className="text-label-sm font-semibold uppercase text-secondary">Approving Body</label>
                <input
                  type="text"
                  value={editingDoc.approver}
                  onChange={(e) => setEditingDoc({ ...editingDoc, approver: e.target.value })}
                  className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl mt-1 text-on-surface border border-outline-variant/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-sm font-semibold uppercase text-secondary">Department</label>
                  <input
                    type="text"
                    value={editingDoc.department}
                    onChange={(e) => setEditingDoc({ ...editingDoc, department: e.target.value })}
                    className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl mt-1 text-on-surface border border-outline-variant/20"
                  />
                </div>
                <div>
                  <label className="text-label-sm font-semibold uppercase text-secondary">Next Review Date</label>
                  <input
                    type="date"
                    value={editingDoc.nextReview ? editingDoc.nextReview.slice(0, 10) : ""}
                    onChange={(e) => setEditingDoc({ ...editingDoc, nextReview: e.target.value })}
                    className="w-full bg-surface-container-low px-3.5 py-2 rounded-xl mt-1 text-on-surface border border-outline-variant/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/20">
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="px-4 py-2 rounded-full text-secondary hover:text-on-surface font-label-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-md font-semibold hover:bg-neutral-800 disabled:opacity-50"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DELETE CONFIRMATION MODAL                                        */}
      {/* ========================================================================= */}
      {deletingDocId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-3 text-[#B4403A]">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                Delete Policy Document?
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              Are you sure you want to delete <strong className="text-on-surface">{deletingDocId}</strong>? This will permanently delete the document record, its embedded vector chunks, and the stored PDF file.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDocId(null)}
                className="px-4 py-2 rounded-full text-secondary hover:text-on-surface font-label-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingLoading}
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-full bg-[#B4403A] text-surface font-label-md font-semibold hover:bg-[#96302B] disabled:opacity-50"
              >
                {deletingLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ROLE CHANGE CONFIRMATION MODAL                                   */}
      {/* ========================================================================= */}
      {userRoleConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/20 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[28px]">shield</span>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                Confirm Role Change
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-secondary leading-relaxed">
              Are you sure you want to change role for{" "}
              <strong className="text-on-surface">{userRoleConfirm.user.fullName}</strong> (
              <span className="font-mono text-xs">{userRoleConfirm.user.email}</span>) to{" "}
              <strong className="text-on-surface uppercase">{userRoleConfirm.newRole}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserRoleConfirm(null)}
                className="px-4 py-2 rounded-full text-secondary hover:text-on-surface font-label-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={roleChanging}
                onClick={handleExecuteRoleChange}
                className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md font-semibold hover:bg-neutral-800 disabled:opacity-50"
              >
                {roleChanging ? "Updating..." : `Confirm ${userRoleConfirm.newRole === "admin" ? "Promote" : "Demote"}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
