'use client';

import React, { useState } from 'react';
import { ALL_METHODOLOGIES, estimateImpact } from '@imprint/impact-engine';
import { LedgerEvent } from '@imprint/schemas';
import { ExternalLink, Scale } from 'lucide-react';

interface MethodologyExplorerProps {
  events: LedgerEvent[];
  activeMethodologyId: string;
  onSelectMethodology: (id: string) => void;
}

export function MethodologyExplorer({
  events,
  activeMethodologyId,
  onSelectMethodology,
}: MethodologyExplorerProps) {
  const [inspectedId, setInspectedId] = useState(activeMethodologyId);
  const inspectedMethodology = ALL_METHODOLOGIES.find((m) => m.id === inspectedId) || ALL_METHODOLOGIES[0];

  // Calculate totals across the entire ledger for comparison
  let totalInTokens = 0;
  let totalOutTokens = 0;
  let totalReasoningTokens = 0;

  for (const ev of events) {
    totalInTokens += ev.input.estimatedTokens;
    totalOutTokens += ev.output.estimatedTokens;
    totalReasoningTokens += ev.output.reasoningTokens || 0;
  }

  // Calculate comparative impacts across all 4 methodologies for the user's ledger
  const comparisons = ALL_METHODOLOGIES.map((m) => {
    const calc = estimateImpact({
      inputTokens: totalInTokens,
      outputTokens: totalOutTokens,
      reasoningTokens: totalReasoningTokens,
      methodologyId: m.id,
      inputProvenance: 'local_estimation',
      outputProvenance: 'browser_observation',
      modelDetected: true,
    });

    return {
      methodology: m,
      energyWh: calc.impact.energy.total.expected,
      waterMl: calc.impact.water.consumption.total.expected,
      carbonG: calc.impact.carbon.total.expected,
      mineralsMg: calc.impact.minerals?.depletion.expected ?? null,
    };
  });

  return (
    <div className="flex flex-col gap-6 font-mono">
      {/* 1. Scientific Principles & System Boundaries Banner */}
      <div className="bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors shadow-xs dark:shadow-none">
        <div className="flex flex-col gap-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#059669] dark:text-[#A8D5BA]" />
            <h2 className="text-sm font-bold text-[#111815] dark:text-[#F1F3F1] uppercase tracking-wider">
              Independent Scientific Methodologies
            </h2>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#8D9690] leading-relaxed">
            Imprint adheres to strict methodological sovereignty: we never synthesize or mash disparate sources into an arbitrary average. Each published framework possesses distinct thermodynamic and life-cycle system boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B] dark:text-[#8D9690]">ACTIVE BASELINE:</span>
          <span className="text-xs font-bold text-[#059669] dark:text-[#A8D5BA] px-2.5 py-1 rounded bg-emerald-50 dark:bg-[#171B19] border border-emerald-200 dark:border-[#284D39]">
            {ALL_METHODOLOGIES.find((m) => m.id === activeMethodologyId)?.name}
          </span>
        </div>
      </div>

      {/* 2. Side-by-Side Comparative Matrix */}
      <div className="bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-xl p-5 flex flex-col gap-4 shadow-xs dark:shadow-none transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D97706] dark:bg-[#D8B878]" />
            <h3 className="text-xs font-bold text-[#111815] dark:text-[#F1F3F1] uppercase tracking-wider">
              Comparative Ledger Evaluation ({(totalInTokens + totalOutTokens + totalReasoningTokens).toLocaleString()} Cumulative Tokens)
            </h3>
          </div>
          <span className="text-[10px] text-[#64748B] dark:text-[#8D9690]">
            DYNAMIC RE-EVALUATION ACROSS SYSTEM BOUNDARIES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {comparisons.map((c) => {
            const isSelected = c.methodology.id === activeMethodologyId;
            return (
              <div
                key={c.methodology.id}
                onClick={() => onSelectMethodology(c.methodology.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/60 dark:bg-[#171B19] border-[#059669] dark:border-[#A8D5BA] shadow-xs'
                    : 'bg-[#F8FAF9] dark:bg-[#0B0D0C] border-[#E2E8E4] dark:border-[#29302C] hover:border-[#CBD5E1] dark:hover:border-[#3A443F]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#111815] dark:text-[#F1F3F1]">{c.methodology.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] text-[#059669] dark:text-[#A8D5BA] uppercase font-bold">
                      {c.methodology.boundary}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 my-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] dark:text-[#8D9690]">Energy:</span>
                      <span className="text-[#111815] dark:text-[#F1F3F1] font-bold">{c.energyWh} Wh</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] dark:text-[#8D9690]">Water:</span>
                      <span className="text-[#2563EB] dark:text-[#3B82F6] font-bold">{c.waterMl} mL</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B] dark:text-[#8D9690]">Carbon:</span>
                      <span className="text-[#D97706] dark:text-[#D8B878] font-bold">{c.carbonG} g</span>
                    </div>
                    {c.mineralsMg !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B] dark:text-[#8D9690]">Minerals:</span>
                        <span className="text-[#059669] dark:text-[#A8D5BA] font-bold">{c.mineralsMg} mg</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8E4] dark:border-[#1F2421] flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-[#059669] dark:text-[#A8D5BA] font-bold' : 'text-[#64748B] dark:text-[#8D9690]'}>
                    {isSelected ? '✓ ACTIVE BASELINE' : 'SELECT BASELINE'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectedId(c.methodology.id);
                    }}
                    className="text-[#64748B] dark:text-[#8D9690] hover:underline"
                  >
                    Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Methodology Datasheet */}
      <div className="bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-xl p-5 flex flex-col gap-4 shadow-xs dark:shadow-none transition-colors">
        <div className="flex items-center justify-between border-b border-[#E2E8E4] dark:border-[#29302C] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#111815] dark:text-[#F1F3F1]">
              {inspectedMethodology.name} ({inspectedMethodology.version})
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#8D9690]">
              System Boundary: <strong className="text-[#059669] dark:text-[#A8D5BA]">{inspectedMethodology.boundary.toUpperCase()}</strong>
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {ALL_METHODOLOGIES.map((m) => (
              <button
                key={m.id}
                onClick={() => setInspectedId(m.id)}
                className={`px-2.5 py-1 rounded border text-[10px] transition-colors ${
                  inspectedId === m.id
                    ? 'bg-emerald-50 dark:bg-[#171B19] border-[#059669] dark:border-[#A8D5BA] text-[#059669] dark:text-[#A8D5BA] font-bold'
                    : 'bg-[#F8FAF9] dark:bg-[#0B0D0C] border-[#E2E8E4] dark:border-[#29302C] text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1]'
                }`}
              >
                {m.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Key Assumptions */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#059669] dark:text-[#A8D5BA] font-bold uppercase tracking-wider">
              Core Methodological Assumptions
            </span>
            <ul className="flex flex-col gap-2 text-[#475550] dark:text-[#B0B8B2] text-[11px]">
              {inspectedMethodology.assumptions.map((assump, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#F8FAF9] dark:bg-[#0B0D0C] p-2.5 rounded border border-[#E2E8E4] dark:border-[#1F2421]">
                  <span className="text-[#059669] dark:text-[#A8D5BA] mt-0.5">•</span>
                  <span>{assump}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Uncertainty Tolerances & Sources */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-[#D97706] dark:text-[#D8B878] font-bold uppercase tracking-wider">
                Uncertainty Error Tolerances
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="p-2 rounded bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#1F2421]">
                  <div className="text-[#64748B] dark:text-[#8D9690]">Energy Variance</div>
                  <div className="text-[#111815] dark:text-[#F1F3F1] font-bold text-xs mt-0.5">
                    ±{inspectedMethodology.uncertaintyModel.energyVariancePct}%
                  </div>
                </div>
                <div className="p-2 rounded bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#1F2421]">
                  <div className="text-[#64748B] dark:text-[#8D9690]">Water Variance</div>
                  <div className="text-[#111815] dark:text-[#F1F3F1] font-bold text-xs mt-0.5">
                    ±{inspectedMethodology.uncertaintyModel.waterVariancePct}%
                  </div>
                </div>
                <div className="p-2 rounded bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#1F2421]">
                  <div className="text-[#64748B] dark:text-[#8D9690]">Carbon Variance</div>
                  <div className="text-[#111815] dark:text-[#F1F3F1] font-bold text-xs mt-0.5">
                    ±{inspectedMethodology.uncertaintyModel.carbonVariancePct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Scientific Sources */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-[#111815] dark:text-[#F1F3F1] font-bold uppercase tracking-wider">
                Scientific References & Citations
              </span>
              <div className="flex flex-col gap-1.5">
                {inspectedMethodology.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#1F2421] flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <div className="text-[#111815] dark:text-[#F1F3F1] font-semibold">{src.title}</div>
                      <div className="text-[#64748B] dark:text-[#8D9690] text-[10px]">
                        {src.authors ? `${src.authors} · ` : ''}{src.year}
                      </div>
                    </div>
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#059669] dark:text-[#A8D5BA] hover:underline flex items-center gap-1 text-[10px]"
                      >
                        <span>Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
