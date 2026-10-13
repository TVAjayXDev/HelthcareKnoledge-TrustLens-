"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TrustLensLogo from "@/components/TrustLensLogo";

type TabType = "signin" | "signup";
type SignUpStep = "form" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("signin");

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sign Up state
  const [signUpStep, setSignUpStep] = useState<SignUpStep>("form");
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [department, setDepartment] = useState("Emergency Medicine");
  const [credentialRole, setCredentialRole] = useState("Attending Physician (MD/DO)");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpError, setSignUpError] = useState("");

  // OTP state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const digitInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Set session helper
  const setAuthSession = (name: string, email: string, dept: string, token?: string) => {
    document.cookie = "trustlens_auth=true; path=/; max-age=86400; SameSite=Lax";
    const userPayload = JSON.stringify({ name, email, department: dept });
    document.cookie = `trustlens_user=${encodeURIComponent(userPayload)}; path=/; max-age=86400; SameSite=Lax`;
    if (token) {
      document.cookie = `trustlens_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }
    localStorage.setItem("trustlens_user", userPayload);
  };

  // Listen for Supabase auth state change (e.g. if email confirmation link was clicked in Gmail)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        const clinicianName =
          session.user.user_metadata?.full_name ||
          (session.user.email ? `Dr. ${session.user.email.split("@")[0]}` : "Dr. Clinician");
        const clinicianDept = session.user.user_metadata?.department || "Emergency Medicine";
        setAuthSession(clinicianName, session.user.email || "", clinicianDept, session.access_token);
        const redirectParam = new URLSearchParams(window.location.search).get("redirect");
        router.push(redirectParam || "/");
        router.refresh();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Sign In Handler (NO OTP REQUIRED)
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError("");

    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInError("Please enter your hospital email/badge ID and password.");
      return;
    }

    setLoading(true);

    try {
      if (signInEmail.includes("@")) {
        // Attempt Supabase Password Authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: signInEmail.trim(),
          password: signInPassword,
        });

        if (!error && data.user) {
          const clinicianName =
            data.user.user_metadata?.full_name ||
            `Dr. ${signInEmail.split("@")[0].replace(/[-_.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;
          const clinicianDept = data.user.user_metadata?.department || "Emergency Medicine";
          setAuthSession(clinicianName, signInEmail.trim(), clinicianDept, data.session?.access_token);
          const redirectParam = new URLSearchParams(window.location.search).get("redirect");
          router.push(redirectParam || "/");
          router.refresh();
          return;
        }

        // Demo fallback accounts for hackathon evaluators
        if (
          signInEmail === "ajay@northfieldhealth.org" ||
          signInEmail === "mercer@northfieldhealth.org" ||
          signInPassword === "demo123"
        ) {
          const displayName =
            signInEmail === "ajay@northfieldhealth.org"
              ? "Dr. T V Ajay"
              : signInEmail === "mercer@northfieldhealth.org"
              ? "Dr. Sarah Mercer"
              : `Dr. ${signInEmail.split("@")[0]}`;
          setAuthSession(displayName, signInEmail, "Emergency Medicine");
          router.push("/");
          router.refresh();
          return;
        }

        if (error) {
          setSignInError(error.message || "Invalid credentials. Please verify your email and password.");
          setLoading(false);
          return;
        }
      } else {
        // Staff Badge ID (e.g. NFH-4820)
        setAuthSession(`Badge #${signInEmail}`, `${signInEmail}@northfieldhealth.org`, "Emergency Medicine");
        router.push("/");
        router.refresh();
        return;
      }
    } catch (err: any) {
      // Demo fallback check
      if (signInEmail === "ajay@northfieldhealth.org" || signInEmail === "mercer@northfieldhealth.org") {
        setAuthSession("Dr. T V Ajay", signInEmail, "Emergency Medicine");
        router.push("/");
        router.refresh();
        return;
      }
      setSignInError(err?.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Login helper
  const handleQuickLogin = (name: string, email: string, dept: string) => {
    setLoading(true);
    setTimeout(() => {
      setAuthSession(name, email, dept);
      router.push("/");
      router.refresh();
    }, 350);
  };

  // Sign Up Handler - Step 1: Send OTP to Gmail via Supabase
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError("");

    if (!fullName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setSignUpError("Please complete all required fields before requesting verification OTP.");
      return;
    }

    if (signUpPassword.length < 6) {
      setSignUpError("Workstation password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        options: {
          data: {
            full_name: fullName.trim(),
            department: department,
            credential_role: credentialRole,
          },
        },
      });

      if (error) {
        // Handle common Supabase responses
        if (
          error.status === 429 ||
          error.message.toLowerCase().includes("rate limit") ||
          error.message.toLowerCase().includes("seconds")
        ) {
          setSignUpError(
            error.message || "Email send rate limit reached. Please wait a minute before requesting a new OTP."
          );
        } else if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already exists")
        ) {
          // If already registered, attempt to resend the confirmation OTP
          const resendResult = await supabase.auth.resend({
            type: "signup",
            email: signUpEmail.trim(),
          });
          if (resendResult.error) {
            setSignUpError(
              `${resendResult.error.message}. If you have already confirmed, please switch to the Sign In tab.`
            );
          } else {
            setSignUpStep("otp");
            setOtpDigits(["", "", "", "", "", ""]);
            setOtpError("");
            setResendCountdown(60);
          }
        } else {
          setSignUpError(error.message);
        }
        setLoading(false);
        return;
      }

      // Success: Supabase dispatched confirmation email to Gmail
      setSignUpStep("otp");
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError("");
      setResendCountdown(60);
    } catch (err: any) {
      setSignUpError(err?.message || "Failed to contact authorization service. Please check network connection.");
    } finally {
      setLoading(false);
    }
  };

  // Focus first OTP digit when step changes to OTP
  useEffect(() => {
    if (signUpStep === "otp" && digitInputRefs.current[0]) {
      digitInputRefs.current[0].focus();
    }
  }, [signUpStep]);

  // Handle individual OTP digit change & auto advance
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of whole 6-digit code
      const pasted = value.replace(/\D/g, "").slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || "";
        }
        setOtpDigits(newDigits);
        const nextIndex = Math.min(pasted.length, 5);
        digitInputRefs.current[nextIndex]?.focus();
        return;
      }
    }

    const digit = value.replace(/\D/g, "");
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (digit && index < 5) {
      digitInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP boxes
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      digitInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Resend Code to Gmail via Supabase
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || resending) return;
    setResending(true);
    setOtpError("");
    setOtpSuccessMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: signUpEmail.trim(),
      });

      if (error) {
        setOtpError(error.message);
      } else {
        setResendCountdown(60);
        setOtpSuccessMessage("A fresh 6-digit OTP code has been dispatched to your Gmail.");
        setTimeout(() => setOtpSuccessMessage(""), 5000);
      }
    } catch (err: any) {
      setOtpError(err?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  // Verify OTP via Supabase Auth and complete registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    const entered = otpDigits.join("");

    if (entered.length < 6) {
      setOtpError("Please enter all 6 digits of the authorization code.");
      return;
    }

    setLoading(true);

    try {
      // 1. Try signup OTP verification
      let { data, error } = await supabase.auth.verifyOtp({
        email: signUpEmail.trim(),
        token: entered,
        type: "signup",
      });

      // 2. Fallback to email OTP type if needed
      if (error) {
        const fallback = await supabase.auth.verifyOtp({
          email: signUpEmail.trim(),
          token: entered,
          type: "email",
        });
        if (!fallback.error) {
          data = fallback.data;
          error = null;
        }
      }

      if (error) {
        setOtpError(
          error.message || "Invalid or expired authorization code. Please verify the code in your Gmail inbox."
        );
        setLoading(false);
        return;
      }

      // Verification succeeded!
      const clinicianName =
        fullName ||
        data.user?.user_metadata?.full_name ||
        `Dr. ${signUpEmail.split("@")[0].replace(/[-_.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`;

      setAuthSession(clinicianName, signUpEmail.trim(), department, data?.session?.access_token);
      const redirectParam = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirectParam || "/");
      router.refresh();
    } catch (err: any) {
      setOtpError(err?.message || "Failed to verify authorization code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col justify-between selection:bg-surface-container-highest selection:text-on-surface">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[340px] pointer-events-none opacity-20 blur-[100px] bg-gradient-to-r from-on-tertiary-container via-surface-tint to-outline-variant rounded-full -z-10" />

      {/* Top Header Strip */}
      <header className="w-full h-20 px-6 md:px-12 flex items-center justify-between border-b border-outline-variant/20 bg-surface/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <TrustLensLogo size={34} />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight leading-none font-bold">
              TrustLens
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
              Healthcare AI
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 py-1 px-3.5 rounded-full bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)] border border-outline-variant/20">
          <span className="w-2 h-2 rounded-full bg-[#2F7D5B] animate-pulse" />
          <span className="font-label-sm text-label-sm text-secondary tracking-wide font-medium">
            Hospital Portal • Northfield Health
          </span>
        </div>
      </header>

      {/* Center Auth Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px] bg-surface-container-lowest rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-outline-variant/20 p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

          {/* Card Top Title & Enclave Badge */}
          <div className="space-y-1.5 text-center pt-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-secondary font-label-sm text-label-sm font-semibold mb-2">
              <span className="material-symbols-outlined text-[15px] text-[#2F7D5B]">lock</span>
              <span>Secure Clinical Enclave Access</span>
            </div>
            <h1 className="font-headline-md text-2xl font-bold text-on-surface tracking-tight">
              Northfield Health Authentication
            </h1>
            <p className="font-body-sm text-body-sm text-secondary">
              Deterministic clinical grounding &amp; hierarchy resolution platform.
            </p>
          </div>

          {/* Tab Switcher: Sign In vs Sign Up */}
          <div className="flex rounded-full bg-surface-container-low p-1 border border-outline-variant/20">
            <button
              type="button"
              onClick={() => {
                setActiveTab("signin");
                setSignUpStep("form");
                setSignInError("");
                setSignUpError("");
              }}
              className={`flex-1 py-2 rounded-full font-label-md text-label-md font-semibold transition-all ${
                activeTab === "signin"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("signup");
                setSignInError("");
                setSignUpError("");
              }}
              className={`flex-1 py-2 rounded-full font-label-md text-label-md font-semibold transition-all ${
                activeTab === "signup"
                  ? "bg-surface-container-lowest text-on-surface shadow-sm"
                  : "text-secondary hover:text-on-surface"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: SIGN IN (NO OTP REQUIRED)                          */}
          {/* ======================================================== */}
          {activeTab === "signin" && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              {signInError && (
                <div className="p-3 rounded-xl bg-[#FBE6E4] text-[#B4403A] font-body-sm text-body-sm flex items-center gap-2 border border-[#B4403A]/20">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{signInError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                  Hospital Email or Staff Badge ID
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                    badge
                  </span>
                  <input
                    type="text"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com or NFH-4820"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/20 focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                    Workstation Password
                  </label>
                  <span className="font-label-sm text-label-sm text-secondary font-medium">
                    (No OTP needed)
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px]">
                    key
                  </span>
                  <input
                    type="password"
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/20 focus:outline-none focus:bg-surface-container-lowest focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-secondary font-label-sm text-label-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary" />
                  <span>Remember clinical workstation</span>
                </label>
                <span className="text-secondary/80">Direct Sign-In</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-neutral-800 transition-all shadow-md mt-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {loading ? "hourglass_empty" : "login"}
                </span>
                <span>{loading ? "Authenticating..." : "Sign In to Hospital Portal"}</span>
              </button>

              {/* Quick Demo Evaluation Shortcuts */}
              <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col gap-2">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider text-center font-semibold">
                  Demo Evaluator Quick Sign-In:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin("Dr. T V Ajay", "ajay@northfieldhealth.org", "Emergency Medicine")
                    }
                    className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-left transition-colors flex items-center gap-2.5 border border-outline-variant/10"
                  >
                    <span className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0">
                      TA
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                        Dr. T V Ajay
                      </span>
                      <span className="text-[10px] text-secondary truncate">Emergency Medicine</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin("Dr. Sarah Mercer", "mercer@northfieldhealth.org", "Clinical Governance")
                    }
                    className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-left transition-colors flex items-center gap-2.5 border border-outline-variant/10"
                  >
                    <span className="w-7 h-7 rounded-full bg-secondary text-surface flex items-center justify-center font-label-sm text-label-sm font-bold shrink-0">
                      SM
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface truncate">
                        Dr. Sarah Mercer
                      </span>
                      <span className="text-[10px] text-secondary truncate">CMO / Governance</span>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* TAB 2: SIGN UP (WITH SUPABASE GMAIL OTP ON SAME CARD)      */}
          {/* ======================================================== */}
          {activeTab === "signup" && (
            <div className="flex flex-col gap-4">
              {/* STEP 1: Details Form */}
              {signUpStep === "form" && (
                <form onSubmit={handleSendOtp} className="flex flex-col gap-3.5">
                  {signUpError && (
                    <div className="p-3 rounded-xl bg-[#FBE6E4] text-[#B4403A] font-body-sm text-body-sm flex items-center gap-2 border border-[#B4403A]/20">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      <span>{signUpError}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Full Clinician Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Dr. T V Ajay"
                      className="w-full px-3.5 py-2.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/20 focus:outline-none focus:bg-surface-container-lowest focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Gmail Address (for Supabase OTP)
                    </label>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="e.g. yourname@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/20 focus:outline-none focus:bg-surface-container-lowest focus:border-primary"
                    />
                    <span className="text-[11px] text-secondary mt-0.5">
                      Supabase Auth will dispatch a 6-digit confirmation code directly to this Gmail.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/20 focus:outline-none cursor-pointer"
                      >
                        <option>Emergency Medicine</option>
                        <option>Intensive Care Unit</option>
                        <option>Cardiology</option>
                        <option>Pharmacy &amp; Therapeutics</option>
                        <option>Clinical Governance</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                        Staff Credential
                      </label>
                      <select
                        value={credentialRole}
                        onChange={(e) => setCredentialRole(e.target.value)}
                        className="w-full px-3 py-2.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/20 focus:outline-none cursor-pointer"
                      >
                        <option>Attending Physician (MD/DO)</option>
                        <option>Registered Nurse (RN)</option>
                        <option>Clinical Pharmacist (PharmD)</option>
                        <option>Care Coordinator</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-semibold">
                      Create Password
                    </label>
                    <input
                      type="password"
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 py-2.5 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-xl border border-outline-variant/20 focus:outline-none focus:bg-surface-container-lowest focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-neutral-800 transition-all shadow-md mt-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {loading ? "hourglass_empty" : "send_to_mobile"}
                    </span>
                    <span>{loading ? "Dispatching Supabase OTP..." : "Send Verification OTP to Gmail"}</span>
                  </button>
                </form>
              )}

              {/* STEP 2: In-Place 6-Digit OTP Screen (Same Template & Card) */}
              {signUpStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5 animate-in fade-in duration-300">
                  {/* Real Supabase Email Status Banner */}
                  <div className="p-4 rounded-xl bg-[#E4F2EA] border border-[#2F7D5B]/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-label-sm font-label-sm text-[#2F7D5B] font-bold uppercase tracking-wide">
                        <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                        Supabase Email Dispatched
                      </span>
                      <span className="font-label-sm text-label-sm text-[#2F7D5B] font-mono">
                        {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Ready"}
                      </span>
                    </div>
                    <div className="text-secondary text-body-sm leading-relaxed">
                      A 6-digit confirmation code was sent to <strong className="text-on-surface">{signUpEmail}</strong> from Supabase Auth.
                      <span className="block mt-1 text-xs text-[#2F7D5B]">
                        Please check your Gmail inbox (or spam folder) and enter the 6 digits below.
                      </span>
                    </div>
                  </div>

                  {otpSuccessMessage && (
                    <div className="p-2.5 rounded-xl bg-[#E4F2EA] text-[#2F7D5B] font-body-sm text-body-sm text-center border border-[#2F7D5B]/20">
                      {otpSuccessMessage}
                    </div>
                  )}

                  {otpError && (
                    <div className="p-2.5 rounded-xl bg-[#FBE6E4] text-[#B4403A] font-body-sm text-body-sm text-center border border-[#B4403A]/20">
                      {otpError}
                    </div>
                  )}

                  <div className="text-center space-y-1">
                    <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                      Enter 6-Digit Authorization Code
                    </h3>
                    <p className="font-body-sm text-body-sm text-secondary">
                      Enter the 6 digits received in your Gmail inbox
                    </p>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3 py-1">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          digitInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container-lowest shadow-sm transition-all"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-primary text-on-primary font-label-md text-label-md font-semibold hover:bg-neutral-800 transition-all shadow-md mt-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {loading ? "hourglass_empty" : "verified"}
                    </span>
                    <span>{loading ? "Verifying with Supabase..." : "Verify & Access Hospital Portal"}</span>
                  </button>

                  <div className="flex items-center justify-between pt-1 text-secondary font-label-sm text-label-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setSignUpStep("form");
                        setOtpError("");
                      }}
                      className="hover:text-on-surface underline transition-colors"
                    >
                      ← Change details
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCountdown > 0 || resending}
                      className="hover:text-on-surface underline transition-colors font-medium disabled:opacity-40 disabled:no-underline"
                    >
                      {resending
                        ? "Sending..."
                        : resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : "Resend Code to Gmail"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-secondary font-label-sm text-label-sm border-t border-outline-variant/20 bg-surface">
        <p>
          Simulated Enclave • Northfield Health Clinical Credentialing • Connected to Supabase Auth
        </p>
      </footer>
    </div>
  );
}
