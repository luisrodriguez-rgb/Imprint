'use client';

import React from 'react';

export type LogoFidelity = 'HIGH' | 'MEDIUM' | 'LOW' | 'DIRECT' | 'INFERRED' | 'MODELED';

interface ImprintLogoProps {
  size?: number;
  fidelity?: LogoFidelity;
  showWordmark?: boolean;
  showGlyphs?: boolean;
  showFidelityLabel?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
}

/**
 * Imprint Biometric Circuit Telemetry Mark.
 * Exact mathematical reproduction of the biometric fingerprint / silicon PCB hybrid identity.
 * - Left & Top: Organic human dermal papillae (concentric whorl ridges with terminal vias)
 * - Center: Inverted U arch probe trace with circular sensor node and adjacent SMD pad
 * - Base: Nested topographic triangular chevrons pointing to the computational core
 * - Right: Parallel vertical integrated circuit traces with circular contact nodes
 * - Base Apex: Real-time telemetry fidelity indicator (High: Mineral Green, Medium: Amber, Low: Crimson Ping)
 */
export function ImprintLogo({
  size = 48,
  fidelity = 'HIGH',
  showWordmark = false,
  showGlyphs = false,
  showFidelityLabel = false,
  className = '',
  theme = 'auto',
}: ImprintLogoProps) {
  const isHigh = fidelity === 'HIGH' || fidelity === 'DIRECT';
  const isMedium = fidelity === 'MEDIUM' || fidelity === 'INFERRED';
  const isLow = fidelity === 'LOW' || fidelity === 'MODELED';

  // Mineral green primary (Sage #95C5A8 / #A8D5BA)
  const primaryColor = '#95C5A8';
  // Warm amber for epistemically uncertain ridges
  const amberColor = '#D8B878';
  // Fidelity indicator dot color at the base
  const dotColor = isHigh ? '#95C5A8' : isMedium ? '#D8B878' : '#EF4444';

  // Dynamic ridge colors depending on fidelity
  const coreArchColor = isLow ? amberColor : isMedium ? amberColor : primaryColor;
  const chevronColor = isLow ? amberColor : primaryColor;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Biometric Circuit Mark */}
      <svg
        width={size}
        height={size * 1.18}
        viewBox="0 0 130 152"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-colors duration-300 overflow-visible"
        aria-label="Imprint Biometric Telemetry Mark"
      >
        <g strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          {/* === 1. TOP & LEFT DERMAL ARCHES (ORGANIC BIOMETRIC RIDGES) === */}
          {/* Outer Layer 1 (Apex segments with ridge breaks) */}
          <path d="M 52 14 C 40 15 28 26 24 44 C 22 54 23 68 28 82" stroke={primaryColor} />
          <path d="M 64 14 C 74 15 84 22 90 32" stroke={primaryColor} />
          <circle cx="28" cy="82" r="2.2" fill={primaryColor} />

          {/* Outer Layer 2 */}
          <path d="M 44 24 C 34 27 28 38 29 52 C 30 64 34 76 40 88" stroke={primaryColor} />
          <path d="M 58 22 C 68 23 76 29 82 38" stroke={primaryColor} />
          <circle cx="29" cy="52" r="2.2" fill={primaryColor} />

          {/* Layer 3 (Mid Whorl) */}
          <path d="M 46 36 C 38 40 37 50 37 62 C 37 74 42 86 48 94" stroke={chevronColor} />
          <path d="M 54 32 C 62 33 70 38 74 46" stroke={primaryColor} />
          <circle cx="48" cy="94" r="2" fill={chevronColor} />

          {/* === 2. CENTER ARCH & SENSOR PROBE === */}
          {/* Inverted U arch core */}
          <path
            d="M 51 78 L 51 52 C 51 43 69 43 69 52 L 69 78"
            stroke={coreArchColor}
            strokeWidth="3.4"
          />
          {/* Central vertical probe trace */}
          <path d="M 60 76 L 60 56" stroke={coreArchColor} strokeWidth="3.2" />
          <circle cx="60" cy="53" r="2.6" fill={coreArchColor} />

          {/* Adjacent vertical SMD component / silicon pad */}
          <rect
            x="64.2"
            y="64"
            width="3.2"
            height="8.5"
            rx="1"
            fill={coreArchColor}
          />

          {/* Left isolated via / dermal node */}
          <circle cx="44" cy="68" r="2.2" fill={primaryColor} />

          {/* === 3. RIGHT INTEGRATED CIRCUIT TRACES (VERTICAL SILICON PCB) === */}
          {/* Trace 1 (Inner vertical trace) */}
          <path d="M 75 50 L 75 80" stroke={primaryColor} />
          <circle cx="75" cy="82" r="2" fill={primaryColor} />

          {/* Trace 2 (Mid-Inner trace) */}
          <path d="M 81 44 L 81 92" stroke={primaryColor} />

          {/* Trace 3 (Mid-Outer trace with break) */}
          <path d="M 88 38 L 88 74" stroke={primaryColor} />
          <path d="M 88 80 L 88 94" stroke={primaryColor} />
          <circle cx="88" cy="74" r="2" fill={primaryColor} />

          {/* Trace 4 (Outer vertical line) */}
          <path d="M 95 32 L 95 86" stroke={primaryColor} />
          <circle cx="95" cy="88" r="2.2" fill={primaryColor} />

          {/* Trace 5 (Far outer short line with top node) */}
          <path d="M 102 46 L 102 68" stroke={primaryColor} />
          <circle cx="102" cy="44" r="2" fill={primaryColor} />

          {/* === 4. BASAL TOPOGRAPHIC CHEVRONS (NESTED TRIANGLES) === */}
          {/* Chevron 1 (Top) */}
          <path d="M 48 94 L 60 80 L 72 94" stroke={chevronColor} strokeWidth="3.4" />
          {/* Chevron 2 (Middle) */}
          <path d="M 42 104 L 60 89 L 78 104" stroke={chevronColor} strokeWidth="3.2" />
          {/* Chevron 3 (Bottom) */}
          <path d="M 36 114 L 60 98 L 84 114" stroke={chevronColor} strokeWidth="3" />
        </g>

        {/* === 5. LOWER FIDELITY STATUS INDICATOR DOT === */}
        <circle
          cx="60"
          cy="128"
          r={isHigh ? 2.5 : 3.5}
          fill={dotColor}
          className="transition-all duration-300"
        />
        {!isHigh && (
          <circle
            cx="60"
            cy="128"
            r="7"
            stroke={dotColor}
            strokeWidth="1.2"
            opacity="0.5"
            className="animate-ping"
          />
        )}
      </svg>

      {/* Optional Fidelity Label */}
      {showFidelityLabel && (
        <span
          className="text-[10px] font-mono tracking-wider mt-1.5 transition-colors uppercase font-medium"
          style={{ color: dotColor }}
        >
          {isHigh ? 'High-Fidelity' : isMedium ? 'Medium-Fidelity' : 'Low-Observability'}
        </span>
      )}

      {/* Wordmark (Matches Image 1: Modern geometric bold "Imprint") */}
      {showWordmark && (
        <div className="flex flex-col items-center mt-3">
          <span
            className="font-sans font-bold tracking-tight text-[#95C5A8] dark:text-[#A8D5BA]"
            style={{ fontSize: `${Math.max(18, size * 0.44)}px`, lineHeight: 1 }}
          >
            Imprint
          </span>
          <span
            className="font-mono text-[#8D9690] dark:text-[#8D9690] tracking-widest mt-1.5 uppercase font-medium"
            style={{ fontSize: `${Math.max(9, size * 0.16)}px` }}
          >
            Personal Resource Ledger
          </span>
        </div>
      )}

      {/* Scientific Physical Glyphs (Energy, Water, Carbon) */}
      {showGlyphs && (
        <div className="flex flex-col items-center mt-4 w-full pt-3 border-t border-[#29302C]/60 dark:border-[#1F2421]">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#95C5A8] uppercase mb-2">
            IMPRINT
          </span>
          <div className="grid grid-cols-3 gap-6 text-center font-mono text-[10px]">
            {/* Energy: Oscilloscope Pulse */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#8D9690]">Energy</span>
              <svg width="38" height="18" viewBox="0 0 38 18" fill="none">
                <path
                  d="M 2 9 L 10 9 L 13 3 L 18 15 L 22 5 L 26 9 L 36 9"
                  stroke="#95C5A8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Water: Fluid Circuit Node */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#8D9690]">Water</span>
              <svg width="38" height="18" viewBox="0 0 38 18" fill="none">
                <line x1="2" y1="9" x2="13" y2="9" stroke="#95C5A8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="19" cy="9" r="4.5" stroke="#95C5A8" strokeWidth="2" />
                <line x1="25" y1="9" x2="36" y2="9" stroke="#95C5A8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {/* Carbon: Chemical Vector */}
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#8D9690]">Carbon</span>
              <div className="flex items-center gap-1 text-[#95C5A8] font-bold text-xs h-[18px]">
                <span>→</span>
                <span>CO₂</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
