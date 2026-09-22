'use client';

import React from 'react';
import { Zap, Droplets, Cloud, Sparkles, BatteryCharging, Lightbulb, Clock } from 'lucide-react';
import { LedgerEvent } from '@imprint/schemas';
import { getEquivalences } from '@imprint/impact-engine';

interface MetricCardsProps {
  events: LedgerEvent[];
}

export function MetricCards({ events }: MetricCardsProps) {
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

  let totalMineralsExpected = 0;

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

    if (ev.impact.minerals) {
      totalMineralsExpected += ev.impact.minerals.depletion.expected;
    }
  }

  const round = (n: number, d = 2) => Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
  const equivalences = getEquivalences(totalEnergyExpected, totalWaterExpected, totalCarbonExpected);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. ENERGY */}
      <div className="bg-[#111513] border border-[#29302C] rounded-xl p-4 flex flex-col justify-between hover:border-[#3A443F] transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#A8D5BA]/5 rounded-bl-full pointer-events-none" />
        <div>
          <div className="flex items-center justify-between text-[#8D9690] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 text-[#A8D5BA]">
              <Zap className="w-3.5 h-3.5" />
              <span>TOTAL ENERGY</span>
            </span>
            <span className="text-[10px] font-mono text-[#8D9690]">
              {(totalInTokens + totalOutTokens + totalReasoningTokens).toLocaleString()} TOKENS
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-[#F1F3F1] tracking-tight">
              {round(totalEnergyExpected)}
            </span>
            <span className="text-xs font-mono text-[#A8D5BA] font-semibold">Wh</span>
          </div>

          <div className="text-[10px] font-mono text-[#8D9690] mt-1">
            Interval: [{round(totalEnergyMin)} – {round(totalEnergyMax)} Wh]
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-[#1F2421] text-[10px] font-mono text-[#8D9690] flex items-center justify-between">
          <span>Inference + Datacenter PUE</span>
          <span className="text-[#F1F3F1]">{round(totalEnergyExpected / 1000, 4)} kWh</span>
        </div>
      </div>

      {/* 2. WATER CONSUMPTION & DUAL ACCOUNTING */}
      <div className="bg-[#111513] border border-[#29302C] rounded-xl p-4 flex flex-col justify-between hover:border-[#3A443F] transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 rounded-bl-full pointer-events-none" />
        <div>
          <div className="flex items-center justify-between text-[#8D9690] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 text-[#3B82F6]">
              <Droplets className="w-3.5 h-3.5" />
              <span>WATER CONSUMED</span>
            </span>
            <span className="text-[10px] font-mono text-[#8D9690]">DUAL ACCOUNTING</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-[#F1F3F1] tracking-tight">
              {round(totalWaterExpected)}
            </span>
            <span className="text-xs font-mono text-[#3B82F6] font-semibold">mL</span>
          </div>

          <div className="text-[10px] font-mono text-[#8D9690] mt-1">
            Interval: [{round(totalWaterMin)} – {round(totalWaterMax)} mL]
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-[#1F2421] text-[10px] font-mono text-[#8D9690] flex items-center justify-between">
          <span>Onsite: {round(onsiteWaterExpected)} mL</span>
          <span>Grid Thermoelectric: {round(upstreamWaterExpected)} mL</span>
        </div>
      </div>

      {/* 3. CARBON EMISSIONS */}
      <div className="bg-[#111513] border border-[#29302C] rounded-xl p-4 flex flex-col justify-between hover:border-[#3A443F] transition-colors relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#D8B878]/5 rounded-bl-full pointer-events-none" />
        <div>
          <div className="flex items-center justify-between text-[#8D9690] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 text-[#D8B878]">
              <Cloud className="w-3.5 h-3.5" />
              <span>CARBON FOOTPRINT</span>
            </span>
            <span className="text-[10px] font-mono text-[#8D9690]">GRID INTENSITY</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-[#F1F3F1] tracking-tight">
              {round(totalCarbonExpected)}
            </span>
            <span className="text-xs font-mono text-[#D8B878] font-semibold">g CO₂e</span>
          </div>

          <div className="text-[10px] font-mono text-[#8D9690] mt-1">
            Interval: [{round(totalCarbonMin)} – {round(totalCarbonMax)} g]
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-[#1F2421] text-[10px] font-mono text-[#8D9690] flex items-center justify-between">
          <span>Baseline: 380 g/kWh</span>
          <span className="text-[#F1F3F1]">{round(totalCarbonExpected / 1000, 3)} kg</span>
        </div>
      </div>

      {/* 4. PHYSICAL CONTEXT & EMBODIMENT */}
      <div className="bg-[#111513] border border-[#29302C] rounded-xl p-4 flex flex-col justify-between hover:border-[#3A443F] transition-colors">
        <div>
          <div className="flex items-center justify-between text-[#8D9690] mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 text-[#F1F3F1]">
              <Sparkles className="w-3.5 h-3.5 text-[#A8D5BA]" />
              <span>HONEST EQUIVALENCES</span>
            </span>
            <span className="text-[9px] font-mono px-1 rounded bg-[#171B19] border border-[#29302C] text-[#8D9690]">
              PHYSICAL REALITY
            </span>
          </div>

          <div className="flex flex-col gap-1.5 text-[11px] text-[#B0B8B2] mt-1">
            <div className="flex items-center gap-2">
              <BatteryCharging className="w-3.5 h-3.5 text-[#A8D5BA] shrink-0" />
              <span className="leading-snug">{equivalences[0]?.displayText || '≈ 12% smartphone charge'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#D8B878] shrink-0" />
              <span className="leading-snug">{equivalences[1]?.displayText || '≈ 25 mins of LED lighting'}</span>
            </div>
          </div>
        </div>

        <div className="pt-3 mt-3 border-t border-[#1F2421] text-[10px] font-mono text-[#8D9690] flex items-center justify-between">
          <span>LCA Mineral Depletion</span>
          <span className="text-[#A8D5BA]">{round(totalMineralsExpected, 3)} mg Sb-eq</span>
        </div>
      </div>
    </section>
  );
}
