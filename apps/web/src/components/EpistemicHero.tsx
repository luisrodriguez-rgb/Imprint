'use client';

import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Zap,
  Droplets,
  Cloud,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle as QuestionIcon,
} from 'lucide-react';
import { LedgerEvent } from '@imprint/schemas';
import { getEquivalences } from '@imprint/impact-engine';

interface EpistemicHeroProps {
  events: LedgerEvent[];
  activeMethodologyName: string;
  activeMethodologyId: string;
  onOpenTrace: () => void;
}

export function EpistemicHero({
  events,
  activeMethodologyName,
  activeMethodologyId,
  onOpenTrace,
}: EpistemicHeroProps) {
  // Aggregate metrics
  let totalEnergyExpected = 0;
  let totalEnergyMin = 0;
  let totalEnergyMax = 0;

  let totalWaterExpected = 0;
  let totalWaterMin = 0;
  let totalWaterMax = 0;
  let onsiteWaterExpected = 0;
  let upstreamWaterExpected = 0;

  let totalCarbonExpected = 0;
  let totalCarbonMin = 0;
  let totalCarbonMax = 0;

  let totalInTokens = 0;
  let totalOutTokens = 0;
  let totalReasoningTokens = 0;

  for (const ev of events) {
    totalInTokens += ev.input.estimatedTokens;
    totalOutTokens += ev.output.estimatedTokens;
    totalReasoningTokens += ev.output.reasoningTokens || 0;

    totalEnergyExpected += ev.impact.energy.total.expected;
    totalEnergyMin += ev.impact.energy.total.min;
    totalEnergyMax += ev.impact.energy.total.max;

    totalWaterExpected += ev.impact.water.consumption.total.expected;
    totalWaterMin += ev.impact.water.consumption.total.min;
    totalWaterMax += ev.impact.water.consumption.total.max;
    onsiteWaterExpected += ev.impact.water.consumption.onsite.expected;
    upstreamWaterExpected += ev.impact.water.consumption.upstream.expected;

    totalCarbonExpected += ev.impact.carbon.total.expected;
    totalCarbonMin += ev.impact.carbon.total.min;
    totalCarbonMax += ev.impact.carbon.total.max;
  }

  const round = (n: number, d = 2) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
  const equivalences = getEquivalences(totalEnergyExpected, totalWaterExpected, totalCarbonExpected);

  // Average confidence score across events
  const avgConfidence = events.length > 0
    ? Math.round(events.reduce((acc, ev) => acc + (ev.confidence?.score ?? 72), 0) / events.length)
    : 72;

  // Confidence gauge bar (10 segments)
  const filledBlocks = Math.round(avgConfidence / 10);
  const totalBlocks = 10;

  return (
    <section className="bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-2xl p-5 sm:p-6 transition-colors shadow-sm dark:shadow-none relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#059669]/5 dark:bg-[#A8D5BA]/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header: Philosophy & Privacy Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E2E8E4] dark:border-[#1F2421]">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F1F5F3] dark:bg-[#171B19] border border-[#E2E8E4] dark:border-[#29302C] text-xs text-[#059669] dark:text-[#A8D5BA] font-medium mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] dark:bg-[#A8D5BA] animate-pulse" />
            <span>Epistemic Observability & Physical Inference</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111815] dark:text-[#F1F3F1] font-sans">
            Make your AI footprint visible.
          </h1>
          <p className="text-xs sm:text-sm text-[#475550] dark:text-[#B0B8B2] mt-1 font-sans font-normal max-w-2xl leading-relaxed">
            Measure what can be observed. Estimate what cannot. Show the difference.
          </p>
        </div>

        {/* Zero-Prompt Privacy Guarantee Badge */}
        <div className="flex items-center gap-3 self-start lg:self-center px-3.5 py-2.5 rounded-xl bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#29302C] text-xs">
          <ShieldCheck className="w-5 h-5 text-[#059669] dark:text-[#A8D5BA] shrink-0" />
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="font-mono font-semibold text-[#111815] dark:text-[#F1F3F1]">
              PROMPT CONTENT: NOT COLLECTED
            </span>
            <span className="font-mono text-[#64748B] dark:text-[#8D9690]">
              METADATA: COLLECTED LOCALLY
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Hero Grid: Primary Measurement, Confidence Cascade & Epistemic Buckets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6 border-b border-[#E2E8E4] dark:border-[#1F2421]">
        
        {/* Left Column (5 cols): Central Estimated Energy & Call-to-Action */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#64748B] dark:text-[#8D9690] mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#059669] dark:text-[#A8D5BA] flex items-center gap-1.5 font-sans">
                <Zap className="w-4 h-4" />
                <span>Your AI Footprint</span>
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#F1F5F3] dark:bg-[#171B19] border border-[#E2E8E4] dark:border-[#29302C] text-[#64748B] dark:text-[#8D9690]">
                {(totalInTokens + totalOutTokens + totalReasoningTokens).toLocaleString()} TOKENS
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-mono font-bold text-[#111815] dark:text-[#F1F3F1] tracking-tight">
                {round(totalEnergyExpected)}
              </span>
              <span className="text-lg font-mono text-[#059669] dark:text-[#A8D5BA] font-bold">Wh</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#17231C] text-[#059669] dark:text-[#A8D5BA] border border-emerald-200 dark:border-[#284D39] font-medium uppercase tracking-wider">
                estimated
              </span>
            </div>

            <div className="mt-2 text-xs font-mono text-[#64748B] dark:text-[#8D9690] flex items-center gap-2">
              <span>Uncertainty Interval:</span>
              <span className="text-[#111815] dark:text-[#F1F3F1] font-semibold">
                [{round(totalEnergyMin)} — {round(totalEnergyMax)} Wh]
              </span>
            </div>

            <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#8D9690] font-sans">
              Evaluated under <span className="font-mono font-medium text-[#111815] dark:text-[#F1F3F1]">{activeMethodologyName}</span>
            </div>
          </div>

          {/* Prominent "Why this number?" Action */}
          <div className="mt-6 pt-4 border-t border-[#E2E8E4] dark:border-[#1F2421]/60">
            <button
              onClick={onOpenTrace}
              className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-xl bg-[#059669] dark:bg-[#A8D5BA] text-white dark:text-[#0B0D0C] font-sans font-semibold text-xs hover:bg-[#047857] dark:hover:bg-[#8EC5A2] transition-all shadow-xs group"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 shrink-0" />
                <span>Why this number? (Calculation Trace)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p className="text-[11px] text-[#64748B] dark:text-[#8D9690] font-sans mt-2">
              Inspect step-by-step mathematical lineage, peer coefficients, and sensitivity bounds.
            </p>
          </div>
        </div>

        {/* Middle Column (3 cols): Scientific Reality Check & Confidence Cascade */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-[#F8FAF9] dark:bg-[#0E1210] rounded-xl p-4 border border-[#E2E8E4] dark:border-[#1F2421]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#111815] dark:text-[#F1F3F1] font-sans">
                Confidence
              </span>
              <span className="font-mono font-bold text-xs text-[#059669] dark:text-[#A8D5BA]">
                {avgConfidence}%
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="flex items-center gap-1 my-2">
              {Array.from({ length: totalBlocks }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-xs transition-colors ${
                    i < filledBlocks
                      ? 'bg-[#059669] dark:bg-[#A8D5BA]'
                      : 'bg-[#E2E8E4] dark:bg-[#29302C]'
                  }`}
                />
              ))}
            </div>

            {/* Scientific Reality Check Note */}
            <div className="text-[10px] font-sans text-[#64748B] dark:text-[#8D9690] mt-1 mb-3 leading-tight">
              Tokenizer precision (±1%) does not equate to physical impact precision.
            </div>

            {/* Cascade Breakdown */}
            <div className="flex flex-col gap-1.5 text-[11px] font-sans">
              <div className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#1F2421]">
                <span className="text-[#475550] dark:text-[#B0B8B2]">Token Count</span>
                <span className="font-mono text-[10px] text-[#059669] dark:text-[#A8D5BA] font-semibold">
                  HIGH (DOM)
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#1F2421]">
                <span className="text-[#475550] dark:text-[#B0B8B2]">Silicon Energy</span>
                <span className="font-mono text-[10px] text-[#D97706] dark:text-[#D8B878] font-semibold">
                  MEDIUM (Modeled)
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#1F2421]">
                <span className="text-[#475550] dark:text-[#B0B8B2]">Water & Carbon</span>
                <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                  LOW-MED (Scenario)
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#1F2421]">
                <span className="text-[#475550] dark:text-[#B0B8B2]">Inference Grid</span>
                <span className="font-mono text-[10px] text-[#64748B] dark:text-[#8D9690] font-semibold">
                  UNKNOWN
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): The 4 Epistemic Buckets Grid */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-[#F8FAF9] dark:bg-[#0E1210] rounded-xl p-4 border border-[#E2E8E4] dark:border-[#1F2421]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#111815] dark:text-[#F1F3F1] font-sans">
                Epistemic Classification
              </span>
              <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8D9690]">
                4 CATEGORIES
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-sans mt-2">
              {/* OBSERVED */}
              <div className="p-2 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#1F2421]">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-bold text-[#059669] dark:text-[#A8D5BA] text-[10px]">
                    OBSERVED
                  </span>
                  <span className="font-bold text-xs">4</span>
                </div>
                <div className="text-[10px] text-[#64748B] dark:text-[#8D9690] leading-tight">
                  DOM chars, stream duration, model badge, API endpoint.
                </div>
              </div>

              {/* ESTIMATED */}
              <div className="p-2 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#1F2421]">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-bold text-[#2563EB] dark:text-[#3B82F6] text-[10px]">
                    ESTIMATED
                  </span>
                  <span className="font-bold text-xs">3</span>
                </div>
                <div className="text-[10px] text-[#64748B] dark:text-[#8D9690] leading-tight">
                  Hardware active power, reasoning split, client token ratio.
                </div>
              </div>

              {/* ASSUMED */}
              <div className="p-2 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#1F2421]">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-bold text-[#D97706] dark:text-[#D8B878] text-[10px]">
                    ASSUMED
                  </span>
                  <span className="font-bold text-xs">5</span>
                </div>
                <div className="text-[10px] text-[#64748B] dark:text-[#8D9690] leading-tight">
                  Facility PUE (1.15), WUE (0.28 L/kWh), baseline grid carbon.
                </div>
              </div>

              {/* UNKNOWN */}
              <div className="p-2 rounded bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#1F2421]">
                <div className="flex items-center justify-between font-mono mb-1">
                  <span className="font-bold text-[#64748B] dark:text-[#8D9690] text-[10px]">
                    UNKNOWN
                  </span>
                  <span className="font-bold text-xs">2</span>
                </div>
                <div className="text-[10px] text-[#64748B] dark:text-[#8D9690] leading-tight">
                  Cluster concurrency, real-time cooling mode.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#E2E8E4] dark:border-[#1F2421] text-[10px] font-sans text-[#64748B] dark:text-[#8D9690] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#059669] dark:text-[#A8D5BA] shrink-0" />
            <span>Uncertainty is rendered explicitly, not hidden behind disclaimers.</span>
          </div>
        </div>
      </div>

      {/* 3. Secondary Environmental Dimensions Strip: Water, Carbon, Physical Equivalences */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
        
        {/* Water Dual Accounting */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#1F2421]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-[#121B26] text-[#2563EB] dark:text-[#3B82F6]">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-sans font-semibold text-[#111815] dark:text-[#F1F3F1]">
                Water Consumed (Dual)
              </div>
              <div className="text-[10px] font-mono text-[#64748B] dark:text-[#8D9690]">
                Onsite: {round(onsiteWaterExpected)} mL · Grid: {round(upstreamWaterExpected)} mL
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-mono font-bold text-[#111815] dark:text-[#F1F3F1]">
              {round(totalWaterExpected)}
            </span>
            <span className="text-xs font-mono text-[#2563EB] dark:text-[#3B82F6] font-bold ml-1">mL</span>
          </div>
        </div>

        {/* Carbon Footprint Scenario */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#1F2421]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-[#261E12] text-[#D97706] dark:text-[#D8B878]">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-sans font-semibold text-[#111815] dark:text-[#F1F3F1]">
                Carbon Emissions
              </div>
              <div className="text-[10px] font-mono text-[#64748B] dark:text-[#8D9690]">
                Grid Baseline: 380 g CO₂e/kWh
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-mono font-bold text-[#111815] dark:text-[#F1F3F1]">
              {round(totalCarbonExpected)}
            </span>
            <span className="text-xs font-mono text-[#D97706] dark:text-[#D8B878] font-bold ml-1">g</span>
          </div>
        </div>

        {/* Physical Equivalences */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#1F2421] sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-[#12261B] text-[#059669] dark:text-[#A8D5BA]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-sans font-semibold text-[#111815] dark:text-[#F1F3F1]">
                Physical Context
              </div>
              <div className="text-[10px] font-sans text-[#64748B] dark:text-[#8D9690]">
                {equivalences[0]?.displayText || '≈ 12% smartphone charge'}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#171B19] border border-[#E2E8E4] dark:border-[#29302C] text-[#059669] dark:text-[#A8D5BA] font-semibold">
            {round(totalEnergyExpected / 1000, 3)} kWh
          </span>
        </div>

      </div>
    </section>
  );
}
