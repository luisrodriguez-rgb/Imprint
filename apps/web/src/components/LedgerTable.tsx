'use client';

import React, { useState } from 'react';
import { LedgerEvent, ProviderId, ActivityCategory } from '@imprint/schemas';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

interface LedgerTableProps {
  events: LedgerEvent[];
}

export function LedgerTable({ events }: LedgerTableProps) {
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
    <div className="bg-[#111513] border border-[#29302C] rounded-xl overflow-hidden flex flex-col">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#29302C] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111513]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A8D5BA]" />
          <h2 className="text-xs font-mono font-bold text-[#F1F3F1] uppercase tracking-wider">
            Interaction Ledger Records
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0B0D0C] border border-[#29302C] text-[#8D9690]">
            {filteredEvents.length} OF {events.length}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Search box */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0B0D0C] border border-[#29302C] text-[#8D9690] focus-within:border-[#A8D5BA] transition-colors">
            <Search className="w-3 h-3 text-[#8D9690]" />
            <input
              type="text"
              placeholder="Filter by model, session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#F1F3F1] focus:outline-none w-36 placeholder:text-[#4E5752]"
            />
          </div>

          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-2 py-1 rounded bg-[#0B0D0C] border border-[#29302C] text-[#8D9690] text-xs cursor-pointer focus:outline-none"
          >
            <option value="all">ALL PROVIDERS</option>
            <option value="chatgpt">CHATGPT</option>
            <option value="claude">CLAUDE</option>
            <option value="gemini">GEMINI</option>
            <option value="grok">GROK</option>
          </select>

          {/* Activity Filter */}
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="px-2 py-1 rounded bg-[#0B0D0C] border border-[#29302C] text-[#8D9690] text-xs cursor-pointer focus:outline-none"
          >
            <option value="all">ALL ACTIVITIES</option>
            <option value="coding">CODING</option>
            <option value="research">RESEARCH</option>
            <option value="study">STUDY</option>
            <option value="writing">WRITING</option>
            <option value="work">WORK</option>
            <option value="entertainment">ENTERTAINMENT</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-[#1F2421] text-[#8D9690] text-[10px] bg-[#0E1110]">
              <th className="py-2.5 px-4 font-semibold uppercase">Turn & Time</th>
              <th className="py-2.5 px-3 font-semibold uppercase">Provider / Model</th>
              <th className="py-2.5 px-3 font-semibold uppercase">Intent</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-right">Tokens (In / Out / Reason)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-right">Energy (Wh)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-right">Water (mL)</th>
              <th className="py-2.5 px-3 font-semibold uppercase text-right">Carbon (g)</th>
              <th className="py-2.5 px-4 font-semibold uppercase text-center">Fidelity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#171B19]">
            {filteredEvents.map((ev) => {
              const d = new Date(ev.timestamp);
              const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
              const isExpanded = expandedTurnId === ev.id;

              return (
                <React.Fragment key={ev.id}>
                  <tr
                    onClick={() => setExpandedTurnId(isExpanded ? null : ev.id)}
                    className={`hover:bg-[#171B19] cursor-pointer transition-colors ${
                      isExpanded ? 'bg-[#171B19]' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 text-[#8D9690] whitespace-nowrap">
                      <div className="text-[#F1F3F1] font-semibold">#{ev.interactionIndex}</div>
                      <div className="text-[9px] text-[#4E5752]">{dateStr} {timeStr}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] px-1 py-0.2 rounded border border-[#29302C] bg-[#0B0D0C] text-[#A8D5BA] uppercase font-bold">
                          {ev.provider}
                        </span>
                        <span className="text-[#F1F3F1]">{ev.modelRaw || ev.modelFamily || 'Generic'}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-[#29302C] bg-[#0B0D0C] text-[#8D9690] uppercase">
                        {ev.activity.category}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#8D9690] whitespace-nowrap">
                      <span className="text-[#F1F3F1]">{ev.input.estimatedTokens}</span>
                      <span className="text-[#4E5752]"> / </span>
                      <span className="text-[#A8D5BA]">{ev.output.estimatedTokens}</span>
                      {ev.output.reasoningTokens ? (
                        <span className="text-[#D8B878] text-[9px] ml-1">
                          (+{ev.output.reasoningTokens} r)
                        </span>
                      ) : null}
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#A8D5BA] font-bold whitespace-nowrap">
                      {ev.impact.energy.total.expected}
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#3B82F6] font-bold whitespace-nowrap">
                      {ev.impact.water.consumption.total.expected}
                    </td>

                    <td className="py-2.5 px-3 text-right text-[#D8B878] whitespace-nowrap">
                      {ev.impact.carbon.total.expected}
                    </td>

                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          ev.confidence.level === 'HIGH'
                            ? 'bg-[#1E2E24] text-[#A8D5BA] border border-[#284D39]'
                            : ev.confidence.level === 'MEDIUM'
                            ? 'bg-[#2E2818] text-[#D8B878] border border-[#4A3B1C]'
                            : 'bg-[#2B1B1B] text-red-300 border border-red-900/40'
                        }`}
                      >
                        {ev.confidence.level}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Calculation Details */}
                  {isExpanded && (
                    <tr className="bg-[#0E1110] border-y border-[#29302C]">
                      <td colSpan={8} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                          {/* 1. Input & DOM Telemetry */}
                          <div className="p-3 rounded bg-[#111513] border border-[#29302C] flex flex-col gap-1.5">
                            <div className="text-[10px] text-[#A8D5BA] uppercase font-bold">
                              DOM Statistical Counters
                            </div>
                            <div className="text-[#8D9690] text-[11px] leading-relaxed">
                              <div>Prompt Length: {ev.input.charCount} chars (~{ev.input.wordCount} words)</div>
                              <div>Assistant Length: {ev.output.charCount} chars (~{ev.output.wordCount} words)</div>
                              <div>Input Provenance: <span className="text-[#F1F3F1]">{ev.input.provenance}</span></div>
                              <div>Output Provenance: <span className="text-[#F1F3F1]">{ev.output.provenance}</span></div>
                              <div className="text-[9px] text-[#A8D5BA] mt-1">🔒 Zero text persisted</div>
                            </div>
                          </div>

                          {/* 2. Impact Breakdown */}
                          <div className="p-3 rounded bg-[#111513] border border-[#29302C] flex flex-col gap-1.5">
                            <div className="text-[10px] text-[#3B82F6] uppercase font-bold">
                              Calculated Impact Detail
                            </div>
                            <div className="text-[#8D9690] text-[11px] leading-relaxed">
                              <div>Operational Energy: {ev.impact.energy.operational.expected} Wh</div>
                              <div>Datacenter PUE Overhead: {ev.impact.energy.datacenterPueOverhead.expected} Wh</div>
                              <div>Water Onsite: {ev.impact.water.consumption.onsite.expected} mL</div>
                              <div>Water Grid Upstream: {ev.impact.water.consumption.upstream.expected} mL</div>
                              <div>Mineral Embodiment: {ev.impact.minerals?.depletion.expected || 0} mg Sb-eq</div>
                            </div>
                          </div>

                          {/* 3. Audit Checklist */}
                          <div className="p-3 rounded bg-[#111513] border border-[#29302C] flex flex-col gap-1.5">
                            <div className="text-[10px] text-[#D8B878] uppercase font-bold">
                              Confidence Audit Checklist
                            </div>
                            <div className="flex flex-col gap-1 text-[10px]">
                              {ev.confidence.checklist.map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                  <span className={item.passed ? 'text-[#A8D5BA]' : 'text-[#D8B878]'}>
                                    {item.passed ? '✓' : '△'}
                                  </span>
                                  <span className={item.passed ? 'text-[#F1F3F1]' : 'text-[#8D9690]'}>
                                    {item.title}
                                  </span>
                                </div>
                              ))}
                            </div>
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
