import Link from "next/link";
import TrustLensLogo from "./TrustLensLogo";

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low mt-12 border-t border-outline-variant/30">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-on-surface-variant">
          <div className="flex items-center gap-3">
            <TrustLensLogo size={22} />
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              TrustLens
            </span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-sm text-label-sm">
              Engineered by team <strong className="text-on-surface">Cache Me Outside</strong>
            </span>
          </div>
          <div className="flex items-center gap-6 font-label-md text-label-md">
            <Link href="/how-it-works" className="hover:text-on-surface transition-colors">
              How Trust Works
            </Link>
            <Link href="/demo" className="hover:text-on-surface transition-colors">
              Live Demo
            </Link>
            <Link href="/dashboard" className="hover:text-on-surface transition-colors">
              Governance Dashboard
            </Link>
            <Link href="/team" className="hover:text-on-surface transition-colors">
              Team
            </Link>
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant">
            © 2025 Cache Me Outside. Synthetic demo data. Not clinical guidance.
          </div>
        </div>
      </div>
    </footer>
  );
}
