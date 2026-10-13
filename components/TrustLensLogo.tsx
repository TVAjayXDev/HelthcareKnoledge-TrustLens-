import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export default function TrustLensLogo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="TrustLens Logo"
    >
      {/* Black circle background */}
      <circle cx="50" cy="50" r="48" fill="#000000" />

      {/* White shield contour */}
      <path
        d="M50 22 C64 22 72 26 73 30 C73 54 50 76 50 76 C50 76 27 54 27 30 C28 26 36 22 50 22 Z"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />

      {/* White checkmark inside shield */}
      <path
        d="M40 49 L47 56 L61 41"
        stroke="#FFFFFF"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
