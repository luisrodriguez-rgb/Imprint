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

  const primaryColor = '#A8D5BA';
  const amberColor = '#D8B878';
  const dotColor = isHigh ? '#A8D5BA' : isMedium ? '#D8B878' : '#EF4444';

  const loopColor1 = isLow ? amberColor : isMedium ? amberColor : primaryColor;
  const loopColor2 = isLow ? amberColor : primaryColor;
  const chevronColor = isLow ? amberColor : primaryColor;

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={size}
        height={size * 1.15}
        viewBox="0 0 120 138"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-colors duration-300"
      >
        <g strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Outer Layer 1 (Top & Left Arc) */}
          <path
            d="M 60 14 C 40 14 26 28 26 50 C 26 65 31 78 38 90"
            stroke={primaryColor}
          />
          <path
            d="M 66 14.5 C 78 17 90 28 92 42"
            stroke={primaryColor}
          />
          <circle cx="26" cy="50" r="2.2" fill={primaryColor} />
          <circle cx="92" cy="42" r="2.2" fill={primaryColor} />

          {/* Layer 2 (Outer-Mid Left & Top) */}
          <path
            d="M 52 23 C 38 25 33 38 33 55 C 33 72 40 85 46 95"
            stroke={primaryColor}
          />
          <path
            d="M 62 22 C 75 23 85 33 86 48"
            stroke={loopColor2}
          />
          <circle cx="33" cy="74" r="2" fill={primaryColor} />

          {/* Layer 3 (Mid Whorl) */}
          <path
            d="M 58 31 C 45 32 40 43 40 58 C 40 70 45 80 50 88"
            stroke={loopColor2}
          />
          <path
            d="M 66 31 C 74 34 78 42 78 52"
            stroke={loopColor1}
          />
          <circle cx="40" cy="44" r="2" fill={loopColor2} />

          {/* Inner Loop (Core Arch & Central Terminal) */}
          <path
            d="M 48 64 C 48 48 53 40 60 40 C 67 40 71 47 71 58 L 71 78"
            stroke={loopColor1}
          />
          <path d="M 60 52 L 60 68" stroke={loopColor1} strokeWidth="3" />
          <circle cx="60" cy="50" r="2.4" fill={loopColor1} />

          {/* Right Circuit Bars (Vertical Telemetry Traces) */}
          <path d="M 78 60 L 78 84" stroke={primaryColor} />
          <path d="M 85 54 L 85 92" stroke={primaryColor} />
          <path d="M 92 50 L 92 82" stroke={primaryColor} />
          <circle cx="78" cy="86" r="2" fill={primaryColor} />
          <circle cx="85" cy="94" r="2" fill={primaryColor} />
          <circle cx="92" cy="84" r="2" fill={primaryColor} />

          {/* Bottom Inverted Chevrons (Topographic Basal Arch) */}
          <path
            d="M 42 98 L 60 79 L 78 98"
            stroke={chevronColor}
            strokeWidth="3.2"
          />
          <path
            d="M 49 106 L 60 93 L 71 106"
            stroke={chevronColor}
            strokeWidth="3"
          />
          <path
            d="M 55 112 L 60 105 L 65 112"
            stroke={chevronColor}
            strokeWidth="2.8"
          />
        </g>

        {/* Lower Fidelity Status Indicator Dot */}
        <circle
          cx="60"
          cy="124"
          r={isHigh ? 2.5 : 3.5}
          fill={dotColor}
          className="transition-all duration-300"
        />
      </svg>

      {showFidelityLabel && (
        <span
          className="text-[9px] font-mono tracking-wider mt-0.5 transition-colors uppercase font-medium"
          style={{ color: dotColor }}
        >
          {isHigh ? 'High-Fidelity' : isMedium ? 'Medium-Fidelity' : 'Low-Observability'}
        </span>
      )}

      {showWordmark && (
        <div className="flex flex-col items-center mt-1.5">
          <span
            className="font-sans font-bold tracking-tight text-[#A8D5BA]"
            style={{ fontSize: `${Math.max(14, size * 0.4)}px`, lineHeight: 1 }}
          >
            Imprint
          </span>
          <span
            className="font-mono text-[#8D9690] tracking-wider mt-0.5 uppercase"
            style={{ fontSize: `${Math.max(8, size * 0.16)}px` }}
          >
            Personal Resource Ledger
          </span>
        </div>
      )}
    </div>
  );
}
