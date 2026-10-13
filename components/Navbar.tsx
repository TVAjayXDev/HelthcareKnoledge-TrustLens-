"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import TrustLensLogo from "./TrustLensLogo";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; department?: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("trustlens_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch {
      // Fallback
    }
  }, []);

  const handleSignOut = async () => {
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.auth.signOut();
    } catch {
      // Ignore if offline
    }
    document.cookie = "trustlens_auth=; path=/; max-age=0";
    document.cookie = "trustlens_user=; path=/; max-age=0";
    document.cookie = "trustlens_token=; path=/; max-age=0";
    localStorage.removeItem("trustlens_user");
    router.push("/login");
    router.refresh();
  };

  const [adminErrorBanner, setAdminErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "admins_only" || params.get("msg") === "Admins only") {
        setAdminErrorBanner("Admins only: Administrator privileges are required to access that area.");
        const timer = setTimeout(() => setAdminErrorBanner(null), 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(!!data.isAdmin);
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, [pathname]);

  const navLinks = [
    { name: "How Trust Works", href: "/how-it-works" },
    { name: "Live Demo", href: "/demo" },
    { name: "Knowledge Gaps", href: "/dashboard" },
    { name: "Team", href: "/team" },
    ...(isAdmin ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {adminErrorBanner && (
        <div className="bg-[#FBE6E4] border-b border-[#B4403A]/30 py-2.5 px-6 flex items-center justify-between text-[#B4403A] text-body-sm font-medium">
          <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">lock</span>
              <span>{adminErrorBanner}</span>
            </div>
            <button onClick={() => setAdminErrorBanner(null)} className="hover:opacity-80">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
      <div className="h-20 max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between gap-6">
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

        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-surface-container-low/50">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-label-md transition-colors ${
                  isActive
                    ? "text-on-surface font-semibold bg-surface-container-lowest shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 py-1 px-3 rounded-full bg-surface-container-low shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D5B] animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wide">
              {currentUser?.name ? `${currentUser.name} • ${currentUser.department || "Clinical Enclave"}` : "Hospital Portal • Northfield Health"}
            </span>
          </div>

          <Link
            href="/demo"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-neutral-800 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none shadow-sm font-medium"
          >
            Try Demo
          </Link>

          <button
            onClick={handleSignOut}
            title="Sign out of hospital enclave"
            className="w-9 h-9 rounded-full bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface flex items-center justify-center transition-colors border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
