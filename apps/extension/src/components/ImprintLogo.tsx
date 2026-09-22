import React from 'react';

export type LogoFidelity = 'HIGH' | 'MEDIUM' | 'LOW' | 'DIRECT' | 'INFERRED' | 'MODELED';

interface ImprintLogoProps {
  size?: number;
  fidelity?: LogoFidelity;
  showWordmark?: boolean;
  showGlyphs?: boolean;
  showFidelityLabel?: boolean;
  className?: string;
}

export function ImprintLogo({
  size = 48,
  fidelity = 'HIGH',
  showWordmark = false,
  showGlyphs = false,
  showFidelityLabel = false,
  className = '',
}: ImprintLogoProps) {
  const isHigh = fidelity === 'HIGH' || fidelity === 'DIRECT';
  const isMedium = fidelity === 'MEDIUM' || fidelity === 'INFERRED';
  const isLow = fidelity === 'LOW' || fidelity === 'MODELED';

  const primaryColor = '#95C5A8';
  const amberColor = '#D8B878';
  const dotColor = isHigh ? '#95C5A8' : isMedium ? '#D8B878' : '#EF4444';

  const coreArchColor = isLow ? amberColor : isMedium ? amberColor : primaryColor;
  const chevronColor = isLow ? amberColor : primaryColor;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
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
          {/* Outer Layer 1 */}
          <path d="M 52 14 C 40 15 28 26 24 44 C 22 54 23 68 28 82" stroke={primaryColor} />
          <path d="M 64 14 C 74 15 84 22 90 32" stroke={primaryColor} />
          <circle cx="28" cy="82" r="2.2" fill={primaryColor} />

          {/* Outer Layer 2 */}
          <path d="M 44 24 C 34 27 28 38 29 52 C 30 64 34 76 40 88" stroke={primaryColor} />
          <path d="M 58 22 C 68 23 76 29 82 38" stroke={primaryColor} />
          <circle cx="29" cy="52" r="2.2" fill={primaryColor} />

          {/* Layer 3 */}
          <path d="M 46 36 C 38 40 37 50 37 62 C 37 74 42 86 48 94" stroke={chevronColor} />
          <path d="M 54 32 C 62 33 70 38 74 46" stroke={primaryColor} />
          <circle cx="48" cy="94" r="2" fill={chevronColor} />

          {/* Core Arch */}
          <path
            d="M 51 78 L 51 52 C 51 43 69 43 69 52 L 69 78"
            stroke={coreArchColor}
            strokeWidth="3.4"
          />
          <path d="M 60 76 L 60 56" stroke={coreArchColor} strokeWidth="3.2" />
          <circle cx="60" cy="53" r="2.6" fill={coreArchColor} />

          {/* SMD Component */}
          <rect x="64.2" y="64" width="3.2" height="8.5" rx="1" fill={coreArchColor} />
          <circle cx="44" cy="68" r="2.2" fill={primaryColor} />

          {/* Vertical PCB Traces */}
          <path d="M 75 50 L 75 80" stroke={primaryColor} />
          <circle cx="75" cy="82" r="2" fill={primaryColor} />

          <path d="M 81 44 L 81 92" stroke={primaryColor} />

          <path d="M 88 38 L 88 74" stroke={primaryColor} />
          <path d="M 88 80 L 88 94" stroke={primaryColor} />
          <circle cx="88" cy="74" r="2" fill={primaryColor} />

          <path d="M 95 32 L 95 86" stroke={primaryColor} />
          <circle cx="95" cy="88" r="2.2" fill={primaryColor} />

          <path d="M 102 46 L 102 68" stroke={primaryColor} />
          <circle cx="102" cy="44" r="2" fill={primaryColor} />

          {/* Chevrons */}
          <path d="M 48 94 L 60 80 L 72 94" stroke={chevronColor} strokeWidth="3.4" />
          <path d="M 42 104 L 60 89 L 78 104" stroke={chevronColor} strokeWidth="3.2" />
          <path d="M 36 114 L 60 98 L 84 114" stroke={chevronColor} strokeWidth="3" />
        </g>

        {/* Status Dot */}
        <circle cx="60" cy="128" r={isHigh ? 2.5 : 3.5} fill={dotColor} className="transition-all duration-300" />
        {!isHigh && (
          <circle cx="60" cy="128" r="7" stroke={dotColor} strokeWidth="1.2" opacity="0.5" className="animate-ping" />
        )}
      </svg>

      {showFidelityLabel && (
        <span
          className="text-[10px] font-mono tracking-wider mt-1.5 transition-colors uppercase font-medium"
          style={{ color: dotColor }}
        >
          {isHigh ? 'High-Fidelity' : isMedium ? 'Medium-Fidelity' : 'Low-Observability'}
        </span>
      )}

      {showWordmark && (
        <div className="flex flex-col items-center mt-3">
          <span
            className="font-sans font-bold tracking-tight text-[#95C5A8]"
            style={{ fontSize: `${Math.max(16, size * 0.44)}px`, lineHeight: 1 }}
          >
            Imprint
          </span>
          <span
            className="font-mono text-[#8D9690] tracking-widest mt-1.5 uppercase font-medium"
            style={{ fontSize: `${Math.max(9, size * 0.16)}px` }}
          >
            Personal Resource Ledger
          </span>
        </div>
      )}
    </div>
  );
}
