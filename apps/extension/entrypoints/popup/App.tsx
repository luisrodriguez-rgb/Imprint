import React, { useEffect, useState } from 'react';
import {
  Zap,
  Droplets,
  Cloud,
  ShieldCheck,
  Info,
  Download,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Smartphone,
  Cpu,
} from 'lucide-react';
import { LedgerEvent, LedgerSessionSummary } from '@imprint/schemas';
import {
  listMethodologies,
  getMethodology,
  estimateImpact,
} from '@imprint/impact-engine';
import {
  getLedgerEvents,
  appendLedgerEvent,
  clearLedger,
  getSettings,
  updateSettings,
  aggregateSessionSummary,
  ImprintSettings,
} from '../../src/storage/ledger-storage';

export default function App() {
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [summary, setSummary] = useState<LedgerSessionSummary | null>(null);
  const [settings, setSettings] = useState<ImprintSettings | null>(null);
  const [showInspector, setShowInspector] = useState(false);
  const [showConfidenceChecklist, setShowConfidenceChecklist] = useState(false);
  const [activeTab, setActiveTab] = useState<'ledger' | 'inspector'>('ledger');

  const methodologies = listMethodologies();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const loadedEvents = await getLedgerEvents();
    const loadedSettings = await getSettings();
    setEvents(loadedEvents);
    setSettings(loadedSettings);
    setSummary(aggregateSessionSummary(loadedEvents));
  }

  async function handleMethodologyChange(methodologyId: string) {
    if (!settings) return;
    const updated = await updateSettings({ activeMethodologyId: methodologyId });
    setSettings(updated);
  }

  async function handleClearData() {
    if (confirm('Clear all local AI footprint logs?')) {
      await clearLedger();
      await loadData();
    }
  }

  function handleExportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `imprint-ledger-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  // Quick simulation tool to test live calculation & rendering immediately
  async function handleAddSimulatedTurn() {
    const calculation = estimateImpact({
      inputTokens: 140,
      outputTokens: 380,
      reasoningTokens: 0,
      modelFamily: 'gpt-4o',
      providerId: 'chatgpt',
      methodologyId: settings?.activeMethodologyId || 'joule-frontier-2026',
      inputProvenance: 'local_estimation',
      outputProvenance: 'browser_observation',
      modelDetected: true,
    });

    const newEvent: LedgerEvent = {
      id: `evt-sim-${Date.now()}`,
      timestamp: Date.now(),
      provider: 'chatgpt',
      modelRaw: 'GPT-4o',
      modelFamily: 'gpt-4o',
      sessionId: 'demo-session',
      interactionIndex: events.length + 1,
      input: {
        charCount: 520,
        wordCount: 88,
        estimatedTokens: 140,
        modality: 'text',
        provenance: 'local_estimation',
      },
      output: {
        charCount: 1450,
        wordCount: 240,
        estimatedTokens: 380,
        reasoningTokens: 0,
        modality: 'text',
        provenance: 'browser_observation',
      },
      activity: {
        category: 'study',
        source: 'heuristic',
      },
      impact: calculation.impact,
      confidence: calculation.confidence,
    };

    await appendLedgerEvent(newEvent);
    await loadData();
  }

  const activeMethodology = getMethodology(settings?.activeMethodologyId || 'joule-frontier-2026');
  const latestEvent = events[0] || null;

  return (
    <div className="flex flex-col min-h-[540px] bg-[#090a0f] text-slate-100 p-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e2230]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-cyan-500 flex items-center justify-center font-black text-xs text-black shadow-md shadow-amber-500/20">
            IM
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              Imprint
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#161a26] text-amber-400 border border-amber-500/30">
                v0.1
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Personal AI Resource Ledger</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 bg-[#121520] px-2 py-0.5 rounded-full border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Local-Only
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-1 mt-3 bg-[#12141c] p-0.5 rounded-lg border border-[#1e2230]">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'ledger' ? 'bg-[#1e2230] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Session Ledger
        </button>
        <button
          onClick={() => setActiveTab('inspector')}
          className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${
            activeTab === 'inspector' ? 'bg-[#1e2230] text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Methodology Inspector
        </button>
      </div>

      {activeTab === 'ledger' ? (
        <div className="flex flex-col gap-3 mt-3">
          {/* Active Session Overview */}
          <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>ChatGPT Session</span>
                <span className="text-[10px] text-slate-500">
                  ({summary ? `${summary.interactionCount} turns` : '0 turns'})
                </span>
              </div>

              {/* Confidence Badge */}
              {latestEvent && (
                <button
                  onClick={() => setShowConfidenceChecklist(!showConfidenceChecklist)}
                  className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a1828] text-violet-300 border border-violet-500/30 hover:bg-[#221f38] transition-colors"
                >
                  <ShieldCheck className="w-3 h-3 text-violet-400" />
                  <span>{latestEvent.confidence.level} CONFIDENCE</span>
                  {showConfidenceChecklist ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Expandable Confidence Checklist */}
            {showConfidenceChecklist && latestEvent && (
              <div className="mt-1 p-2 bg-[#090a0f] rounded-lg border border-violet-500/20 text-[11px] flex flex-col gap-1.5">
                <div className="text-[10px] text-slate-400">{latestEvent.confidence.summary}</div>
                <div className="flex flex-col gap-1">
                  {latestEvent.confidence.checklist.map((c) => (
                    <div key={c.id} className="flex items-start gap-1.5">
                      <span className={c.passed ? 'text-emerald-400' : 'text-amber-400'}>
                        {c.passed ? '✓' : '△'}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{c.title}</span>
                        <span className="text-[9px] text-slate-500">{c.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Core Resource Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              {/* Energy Card */}
              <div className="bg-[#161a26] border border-amber-500/20 rounded-lg p-2 flex flex-col">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-[10px] font-medium tracking-wide">ENERGY</span>
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="text-base font-bold text-white mt-1">
                  {summary ? summary.totalEnergyWh.expected : '0.00'}{' '}
                  <span className="text-[10px] font-normal text-slate-400">Wh</span>
                </div>
                <div className="text-[9px] font-mono text-amber-300/70 mt-0.5">
                  [{summary ? `${summary.totalEnergyWh.min}–${summary.totalEnergyWh.max}` : '0–0'}]
                </div>
              </div>

              {/* Water Consumed Card */}
              <div className="bg-[#161a26] border border-cyan-500/20 rounded-lg p-2 flex flex-col">
                <div className="flex items-center justify-between text-cyan-400">
                  <span className="text-[10px] font-medium tracking-wide">WATER</span>
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <div className="text-base font-bold text-white mt-1">
                  {summary ? summary.totalWaterConsumptionMl.expected : '0.00'}{' '}
                  <span className="text-[10px] font-normal text-slate-400">mL</span>
                </div>
                <div className="text-[9px] font-mono text-cyan-300/70 mt-0.5">
                  [{summary ? `${summary.totalWaterConsumptionMl.min}–${summary.totalWaterConsumptionMl.max}` : '0–0'}]
                </div>
              </div>

              {/* Carbon Card */}
              <div className="bg-[#161a26] border border-emerald-500/20 rounded-lg p-2 flex flex-col">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[10px] font-medium tracking-wide">CARBON</span>
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <div className="text-base font-bold text-white mt-1">
                  {summary ? summary.totalCarbonG.expected : '0.00'}{' '}
                  <span className="text-[10px] font-normal text-slate-400">g</span>
                </div>
                <div className="text-[9px] font-mono text-emerald-300/70 mt-0.5">
                  [{summary ? `${summary.totalCarbonG.min}–${summary.totalCarbonG.max}` : '0–0'}]
                </div>
              </div>
            </div>

            {/* Honest Equivalence contextual note */}
            {summary && summary.totalEnergyWh.expected > 0 && (
              <div className="mt-1 flex items-center gap-1.5 p-1.5 bg-[#090a0f] rounded-lg border border-[#1e2230] text-[10px] text-slate-300">
                <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  ≈{' '}
                  <strong className="text-white">
                    {Math.max(1, Math.round((summary.totalEnergyWh.expected / 15) * 100))}–
                    {Math.max(1, Math.round((summary.totalEnergyWh.expected / 12) * 100))}%
                  </strong>{' '}
                  of a smartphone battery (12–15 Wh)
                </span>
              </div>
            )}
          </div>

          {/* Privacy Guarantee callout */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0d121c] border border-cyan-500/20 text-[11px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Zero Prompt Storage</strong>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                Your prompt words never leave this browser. Only turn counts and character lengths are measured locally.
              </p>
            </div>
          </div>

          {/* Demo quick simulation button (helpful for immediate manual testing) */}
          <button
            onClick={handleAddSimulatedTurn}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#161a26] hover:bg-[#1f2436] border border-[#1e2230] text-xs text-amber-300 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Interaction (+1 Turn)</span>
          </button>
        </div>
      ) : (
        /* Methodology Inspector View */
        <div className="flex flex-col gap-3 mt-3 overflow-y-auto max-h-[380px] pr-1">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Active Methodology
            </label>
            <select
              value={settings?.activeMethodologyId}
              onChange={(e) => handleMethodologyChange(e.target.value)}
              className="bg-[#12141c] border border-[#1e2230] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {methodologies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Methodology Details Card */}
          <div className="bg-[#12141c] border border-[#1e2230] rounded-xl p-3 flex flex-col gap-2.5 text-xs">
            <div>
              <div className="font-semibold text-white">{activeMethodology.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{activeMethodology.description}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#161a26] text-cyan-400 border border-cyan-500/20">
                Boundary: {activeMethodology.boundary}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#161a26] text-amber-400 border border-amber-500/20">
                Scope: {activeMethodology.primaryScope}
              </span>
            </div>

            {/* Calculation Walkthrough steps */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-[#1e2230]">
              <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Calculation Walkthrough
              </div>

              <div className="flex flex-col gap-1 text-[11px] text-slate-400">
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-cyan-400">01</span>
                  <span>
                    <strong>Observation:</strong> Assistant turn completions & DOM character lengths.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-cyan-400">02</span>
                  <span>
                    <strong>Tokens:</strong> Heuristically estimated at ~3.8 chars/token client-side.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-cyan-400">03</span>
                  <span>
                    <strong>Energy:</strong> Prefill, decode, and reasoning power curves applied.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-cyan-400">04</span>
                  <span>
                    <strong>Water:</strong> Onsite evaporative cooling + upstream thermoelectric loss.
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-mono text-cyan-400">05</span>
                  <span>
                    <strong>Uncertainty:</strong> ±{activeMethodology.uncertaintyModel.energyVariancePct}% energy, ±{activeMethodology.uncertaintyModel.waterVariancePct}% water range.
                  </span>
                </div>
              </div>
            </div>

            {/* Sources list */}
            <div className="flex flex-col gap-1 pt-2 border-t border-[#1e2230]">
              <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Sources & Citations
              </div>
              {activeMethodology.sources.map((s) => (
                <div key={s.id} className="text-[10px] text-slate-400">
                  <span className="text-slate-200 font-medium">{s.title}</span> ({s.year})
                  {s.publisher && <span className="text-slate-500"> — {s.publisher}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="mt-auto pt-3 border-t border-[#1e2230] flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={handleExportJSON}
          disabled={events.length === 0}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </button>

        <button
          onClick={handleClearData}
          disabled={events.length === 0}
          className="flex items-center gap-1 hover:text-red-400 transition-colors disabled:opacity-40"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Data</span>
        </button>
      </div>
    </div>
  );
}
