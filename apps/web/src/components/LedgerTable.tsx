'use client';

import React, { useState } from 'react';
import { LedgerEvent } from '@imprint/schemas';
import { Search, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface LedgerTableProps {
  events: LedgerEvent[];
  onOpenTrace?: (event: LedgerEvent) => void;
}

export function LedgerTable({ events, onOpenTrace }: LedgerTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [expandedTurnId, setExpandedTurnId] = useState<string | null>(null);

  const filteredEvents = events.filter((e) => {
    if (providerFilter !== 'all' && e.provider !== providerFilter) return false;
    if (activityFilter !== 'all' && e.activity.category !== activityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const model = (e.modelRaw || e.modelFamily || '').toLowerCase();
      const session = e.sessionId.toLowerCase();
      return model.includes(q) || session.includes(q) || e.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-xl overflow-hidden flex flex-col shadow-xs dark:shadow-none transition-colors">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#E2E8E4] dark:border-[#29302C] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F8FAF9] dark:bg-[#111513]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#059669] dark:bg-[#A8D5BA]" />
          <h2 className="text-sm font-sans font-semibold text-[#111815] dark:text-[#F1F3F1] tracking-tight">
            Interaction Ledger Records
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#29302C] text-[#64748B] dark:text-[#8D9690]">
            {filteredEvents.length} of {events.length}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
          {/* Search box */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#29302C] text-[#64748B] dark:text-[#8D9690] focus-within:border-[#059669] dark:focus-within:border-[#A8D5BA] transition-colors">
            <Search className="w-3.5 h-3.5 text-[#64748B] dark:text-[#8D9690]" />
            <input
              type="text"
              placeholder="Filter model, session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs font-sans text-[#111815] dark:text-[#F1F3F1] focus:outline-none w-36 placeholder:text-[#94A3B8] dark:placeholder:text-[#4E5752]"
            />
          </div>

          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-2.5 py-1 rounded bg-white dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#29302C] text-[#111815] dark:text-[#8D9690] text-xs cursor-pointer focus:outline-none font-sans"
          >
            <option value="all">All Providers</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="grok">Grok</option>
          </select>

          {/* Activity Filter */}
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-2.5 py-1 rounded bg-white dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#29302C] text-[#111815] dark:text-[#8D9690] text-xs cursor-pointer focus:outline-none font-sans"
          >
            <option value="all">All Activities</option>
            <option value="coding">Coding</option>
            <option value="research">Research</option>
            <option value="study">Study</option>
            <option value="writing">Writing</option>
            <option value="work">Work</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-[#E2E8E4] dark:border-[#1F2421] text-[#64748B] dark:text-[#8D9690] text-[10px] font-sans bg-[#F8FAF9] dark:bg-[#0E1110]">
              <th className="py-2.5 px-4 font-semibold uppercase">Turn & Time</th>
              <th className="py-2.5 px-3 font-semibold uppercase">Provider / Model</th>
              <th className="py-2.5 px-3 font-semibold uppercase">Intent</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-right">Tokens (In / Out)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-right">Energy (Wh)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-right">Water (mL)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-right">Carbon (g)</th>
              <th className="py-2.5 px-4 font-semibold uppercase text-center">Confidence</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-center">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8E4] dark:divide-[#171B19] font-mono">
            {filteredEvents.map((ev) => {
              const d = new Date(ev.timestamp);
              const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
              const isExpanded = expandedTurnId === ev.id;

              return (
                <React.Fragment key={ev.id}>
                  <tr
                    onClick={() => setExpandedTurnId(isExpanded ? null : ev.id)}
                    className={`hover:bg-[#F1F5F3] dark:hover:bg-[#171B19] cursor-pointer transition-colors ${
                      isExpanded ? 'bg-[#F1F5F3] dark:bg-[#171B19]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 text-[#64748B] dark:text-[#8D9690] whitespace-nowrap">
                      <div className="text-[#111815] dark:text-[#F1F3F1] font-semibold">#{ev.interactionIndex}</div>
                      <div className="text-[9px] text-[#94A3B8] dark:text-[#4E5752]">{dateStr} {timeStr}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#E2E8E4] dark:border-[#29302C] bg-white dark:bg-[#0B0D0C] text-[#059669] dark:text-[#A8D5BA] uppercase font-bold">
                          {ev.provider}
                        </span>
                        <span className="text-[#111815] dark:text-[#F1F3F1] font-medium text-xs">
                          {ev.modelRaw || ev.modelFamily || 'Generic'}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                      <span className="text-[10px] px-2 py-0.5 rounded border border-[#E2E8E4] dark:border-[#29302C] bg-white dark:bg-[#0B0D0C] text-[#64748B] dark:text-[#8D9690] capitalize font-medium">
                        {ev.activity.category}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#64748B] dark:text-[#8D9690] whitespace-nowrap">
                      <span className="text-[#111815] dark:text-[#F1F3F1]">{ev.input.estimatedTokens.toLocaleString()}</span>
                      <span className="text-[#94A3B8] dark:text-[#4E5752]"> / </span>
                      <span className="text-[#059669] dark:text-[#A8D5BA]">{ev.output.estimatedTokens.toLocaleString()}</span>
                      {ev.output.reasoningTokens ? (
                        <span className="text-[#D97706] dark:text-[#D8B878] text-[9px] ml-1">
                          (+{ev.output.reasoningTokens})
                        </span>
                      ) : null}
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#059669] dark:text-[#A8D5BA] font-bold whitespace-nowrap">
                      {ev.impact.energy.total.expected}
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#2563EB] dark:text-[#3B82F6] font-bold whitespace-nowrap">
                      {ev.impact.water.consumption.total.expected}
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#D97706] dark:text-[#D8B878] whitespace-nowrap">
                      {ev.impact.carbon.total.expected}
                    </td>

                    <td className="py-2.5 px-4 text-center whitespace-nowrap font-sans">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                          ev.confidence.level === 'HIGH'
                            ? 'bg-emerald-50 dark:bg-[#1E2E24] text-[#059669] dark:text-[#A8D5BA] border border-emerald-200 dark:border-[#284D39]'
                            : ev.confidence.level === 'MEDIUM'
                            ? 'bg-amber-50 dark:bg-[#2E2818] text-[#D97706] dark:text-[#D8B878] border border-amber-200 dark:border-[#4A3B1C]'
                            : 'bg-red-50 dark:bg-[#2B1B1B] text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900/40'
                        }`}
                      >
                        {ev.confidence.level}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenTrace) onOpenTrace(ev);
                        }}
                        className="px-2 py-1 rounded bg-[#F1F5F3] dark:bg-[#171B19] hover:bg-emerald-50 dark:hover:bg-[#17231C] text-[#64748B] hover:text-[#059669] dark:text-[#8D9690] dark:hover:text-[#A8D5BA] border border-[#E2E8E4] dark:border-[#29302C] transition-colors text-[10px] font-sans font-medium"
                        title="Open Calculation Trace for this turn"
                      >
                        Trace →
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Calculation Details */}
                  {isExpanded && (
                    <tr className="bg-[#F8FAF9] dark:bg-[#0E1110] border-y border-[#E2E8E4] dark:border-[#29302C]">
                      <td colSpan={9} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                          {/* 1. Input & DOM Telemetry */}
                          <div className="p-3 rounded-xl bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] flex flex-col gap-1.5">
                            <div className="text-[11px] font-semibold text-[#059669] dark:text-[#A8D5BA] uppercase">
                              DOM Statistical Observation
                            </div>
                            <div className="text-[#64748B] dark:text-[#8D9690] text-[11px] space-y-1 font-mono">
                              <div>Prompt: {ev.input.charCount} chars (~{ev.input.wordCount} words)</div>
                              <div>Response: {ev.output.charCount} chars (~{ev.output.wordCount} words)</div>
                              <div>Input Provenance: <span className="text-[#111815] dark:text-[#F1F3F1]">{ev.input.provenance}</span></div>
                              <div>Output Provenance: <span className="text-[#111815] dark:text-[#F1F3F1]">{ev.output.provenance}</span></div>
                            </div>
                            <div className="text-[10px] text-[#059669] dark:text-[#A8D5BA] mt-1 font-sans flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Zero prompt text persisted</span>
                            </div>
                          </div>

                          {/* 2. Impact Breakdown */}
                          <div className="p-3 rounded-xl bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] flex flex-col gap-1.5">
                            <div className="text-[11px] font-semibold text-[#2563EB] dark:text-[#3B82F6] uppercase">
                              Calculated Impact Detail
                            </div>
                            <div className="text-[#64748B] dark:text-[#8D9690] text-[11px] space-y-1 font-mono">
                              <div>Operational Silicon: {ev.impact.energy.operational.expected} Wh</div>
                              <div>Datacenter PUE Overhead: {ev.impact.energy.datacenterPueOverhead.expected} Wh</div>
                              <div>Water Onsite Chilling: {ev.impact.water.consumption.onsite.expected} mL</div>
                              <div>Water Grid Thermoelectric: {ev.impact.water.consumption.upstream.expected} mL</div>
                            </div>
                          </div>

                          {/* 3. Audit Checklist */}
                          <div className="p-3 rounded-xl bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] flex flex-col justify-between gap-2">
                            <div>
                              <div className="text-[11px] font-semibold text-[#D97706] dark:text-[#D8B878] uppercase mb-1">
                                Confidence Checklist
                              </div>
                              <div className="flex flex-col gap-1 text-[11px]">
                                {ev.confidence.checklist.map((item, i) => (
                                  <div key={i} className="flex items-center gap-1.5">
                                    <span className={item.passed ? 'text-[#059669] dark:text-[#A8D5BA]' : 'text-[#D97706] dark:text-[#D8B878]'}>
                                      {item.passed ? '✓' : '△'}
                                    </span>
                                    <span className={item.passed ? 'text-[#111815] dark:text-[#F1F3F1]' : 'text-[#64748B] dark:text-[#8D9690]'}>
                                      {item.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                if (onOpenTrace) onOpenTrace(ev);
                              }}
                              className="mt-2 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#059669] dark:bg-[#A8D5BA] text-white dark:text-[#0B0D0C] text-xs font-semibold hover:bg-[#047857] dark:hover:bg-[#8EC5A2] transition-colors"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Audit Calculation Trace</span>
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
