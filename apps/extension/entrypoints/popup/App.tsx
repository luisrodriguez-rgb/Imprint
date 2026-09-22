import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  Trash2,
  Plus,
  Layers,
  History,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { LedgerEvent, LedgerSessionSummary, ActivityCategory } from '@imprint/schemas';
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
import { exportEventsToCsv } from '../../src/utils/csv-exporter';

const ACTIVITIES: { id: ActivityCategory; label: string; code: string }[] = [
  { id: 'study', label: 'Study', code: 'STD' },
  { id: 'coding', label: 'Code', code: 'DEV' },
  { id: 'research', label: 'Research', code: 'R&D' },
  { id: 'writing', label: 'Writing', code: 'TXT' },
  { id: 'work', label: 'Work', code: 'WRK' },
  { id: 'entertainment', label: 'Play', code: 'REC' },
];

export default function App() {
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [summary, setSummary] = useState<LedgerSessionSummary | null>(null);
  const [settings, setSettings] = useState<ImprintSettings | null>(null);
  const [showConfidenceDetails, setShowConfidenceDetails] = useState(false);
  const [showTurnHistory, setShowTurnHistory] = useState(false);
  const [showMethodologyComparison, setShowMethodologyComparison] = useState(false);
  const [activeView, setActiveView] = useState<'observatory' | 'methodology'>('observatory');
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null);

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
    if (loadedEvents.length > 0 && !selectedTurnId) {
      setSelectedTurnId(loadedEvents[0].id);
    }
  }

  async function handleMethodologyChange(methodologyId: string) {
    if (!settings) return;
    const updated = await updateSettings({ activeMethodologyId: methodologyId });
    setSettings(updated);
  }

  async function handleActivitySelect(activity: ActivityCategory) {
    if (!settings) return;
    const updated = await updateSettings({ currentActivity: activity });
    setSettings(updated);
  }

  async function handleClearData() {
    if (confirm('Reset all local telemetry records? This action cannot be undone.')) {
      await clearLedger();
      await loadData();
    }
  }

  function handleExportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    downloadFile(dataStr, `imprint-ledger-${new Date().toISOString().slice(0, 10)}.json`);
  }

  function handleExportCSV() {
    const csvContent = exportEventsToCsv(events);
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    downloadFile(dataStr, `imprint-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function downloadFile(dataUri: string, filename: string) {
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const [simulatedProvider, setSimulatedProvider] = useState<import('@imprint/schemas').ProviderId>('chatgpt');

  async function handleAddSimulatedTurn() {
    const providerSpecs: Record<
      import('@imprint/schemas').ProviderId,
      { modelRaw: string; family: string; inTok: number; outTok: number; reasonTok: number }
    > = {
      chatgpt: { modelRaw: 'GPT-4o', family: 'gpt-4o', inTok: 160, outTok: 420, reasonTok: 0 },
      claude: { modelRaw: 'Claude 3.7 Sonnet', family: 'claude-3-7-sonnet', inTok: 220, outTok: 580, reasonTok: 600 },
      gemini: { modelRaw: 'Gemini 2.0 Flash', family: 'gemini-2-flash', inTok: 350, outTok: 450, reasonTok: 0 },
      grok: { modelRaw: 'Grok 3 Think', family: 'grok-3', inTok: 180, outTok: 490, reasonTok: 800 },
      other: { modelRaw: 'Generic LLM', family: 'other', inTok: 150, outTok: 300, reasonTok: 0 },
    };

    const spec = providerSpecs[simulatedProvider] || providerSpecs.chatgpt;

    const calculation = estimateImpact({
      inputTokens: spec.inTok,
      outputTokens: spec.outTok,
      reasoningTokens: spec.reasonTok,
      modelFamily: spec.family,
      providerId: simulatedProvider,
      methodologyId: settings?.activeMethodologyId || 'joule-frontier-2026',
      inputProvenance: 'local_estimation',
      outputProvenance: 'browser_observation',
      modelDetected: true,
    });

    const newEvent: LedgerEvent = {
      id: `evt-${Date.now()}`,
      timestamp: Date.now(),
      provider: simulatedProvider,
      modelRaw: spec.modelRaw,
      modelFamily: spec.family,
      sessionId: `${simulatedProvider}-session-live`,
      interactionIndex: events.length + 1,
      input: {
        charCount: spec.inTok * 4,
        wordCount: Math.round(spec.inTok * 0.75),
        estimatedTokens: spec.inTok,
        modality: 'text',
        provenance: 'local_estimation',
      },
      output: {
        charCount: spec.outTok * 4,
        wordCount: Math.round(spec.outTok * 0.75),
        estimatedTokens: spec.outTok,
        reasoningTokens: spec.reasonTok,
        modality: 'text',
        provenance: 'browser_observation',
      },
      activity: {
        category: settings?.currentActivity || 'study',
        source: 'manual',
      },
      impact: calculation.impact,
      confidence: calculation.confidence,
    };

    await appendLedgerEvent(newEvent);
    await loadData();
    setSelectedTurnId(newEvent.id);
  }

  const activeMethodology = getMethodology(settings?.activeMethodologyId || 'joule-frontier-2026');
  const latestEvent = events[0] || null;

  // Comparison matrix calculations
  const totalInTokens = summary ? summary.totalInputTokens : 0;
  const totalOutTokens = summary ? summary.totalOutputTokens : 0;
  const comparisonResults = methodologies.map((m) => {
    const res = estimateImpact({
      inputTokens: Math.max(1, totalInTokens),
      outputTokens: Math.max(1, totalOutTokens),
      methodologyId: m.id,
      modelFamily: 'gpt-4o',
      providerId: 'chatgpt',
    });
    return {
      methodology: m,
      energyWh: res.impact.energy.total.expected,
      waterMl: res.impact.water.consumption.total.expected,
      carbonG: res.impact.carbon.total.expected,
      mineralsMg: res.impact.minerals?.depletion.expected,
    };
  });

  return (
    <div className="flex flex-col min-h-[580px] bg-[#0B0D0C] text-[#F1F3F1] p-4 select-none font-sans">
      {/* 1. Scientific Instrument Header */}
      <header className="flex items-center justify-between pb-3 border-b border-[#29302C]">
        <div className="flex items-center gap-2.5">
          {/* Logo Mark: Minimalist Cursor / Ledger Bar */}
          <div className="flex items-center justify-center w-6 h-6 border border-[#29302C] bg-[#111513] rounded">
            <span className="font-mono text-xs font-bold text-[#A8D5BA]">I▏</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-[#F1F3F1] uppercase">IMPRINT</span>
              <span className="text-[9px] font-mono text-[#8D9690] px-1 py-0.2 border border-[#29302C] rounded bg-[#111513]">
                INSTRUMENT 0.1
              </span>
            </div>
            <div className="text-[10px] text-[#8D9690] tracking-tight">Computational Resource Ledger</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8D9690] bg-[#111513] border border-[#29302C] px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A8D5BA]" />
          <span>LOCAL ONLY</span>
        </div>
      </header>

      {/* 2. Navigation Tabs (Scientific Observatory vs Methodology Spec) */}
      <nav className="grid grid-cols-2 gap-1 mt-3 bg-[#111513] p-1 border border-[#29302C] rounded-lg">
        <button
          onClick={() => setActiveView('observatory')}
          className={`py-1 text-xs font-medium tracking-wide transition-colors rounded ${
            activeView === 'observatory'
              ? 'bg-[#171B19] text-[#F1F3F1] border border-[#29302C]'
              : 'text-[#8D9690] hover:text-[#F1F3F1]'
          }`}
        >
          Observation Desk
        </button>
        <button
          onClick={() => setActiveView('methodology')}
          className={`py-1 text-xs font-medium tracking-wide transition-colors rounded ${
            activeView === 'methodology'
              ? 'bg-[#171B19] text-[#A8D5BA] border border-[#29302C]'
              : 'text-[#8D9690] hover:text-[#F1F3F1]'
          }`}
        >
          Methodology Spec
        </button>
      </nav>

      {activeView === 'observatory' ? (
        <main className="flex flex-col gap-3 mt-3">
          {/* A. Hero Measurement Box */}
          <section className="bg-[#111513] border border-[#29302C] rounded-xl p-3.5 flex flex-col gap-3">
            <div className="flex items-center justify-between text-[11px] text-[#8D9690]">
              <span className="font-mono tracking-wider text-[10px] uppercase">
                TELEMETRY · {summary ? summary.provider.toUpperCase() : 'ACTIVE'} SESSION
              </span>
              <span className="font-mono text-[#A8D5BA]">
                {summary ? `${summary.interactionCount} TURNS` : '0 TURNS'}
              </span>
            </div>

            {/* Main Primary Reading: Energy */}
            <div className="flex flex-col pb-2.5 border-b border-[#29302C]">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-bold tracking-tight text-[#F1F3F1]">
                  {summary ? summary.totalEnergyWh.expected : '0.00'}
                </span>
                <span className="text-xs font-mono font-medium text-[#A8D5BA] uppercase tracking-wider">
                  Wh · ENERGY
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8D9690] mt-0.5">
                <span>Operational + Datacenter PUE</span>
                <span className="text-[#A8D5BA]/80">
                  [{summary ? `${summary.totalEnergyWh.min} – ${summary.totalEnergyWh.max}` : '0.00 – 0.00'}]
                </span>
              </div>
            </div>

            {/* Secondary Readings: Water & Carbon */}
            <div className="grid grid-cols-2 gap-3">
              {/* Water */}
              <div className="flex flex-col">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xl font-semibold text-[#F1F3F1]">
                    {summary ? summary.totalWaterConsumptionMl.expected : '0.00'}
                  </span>
                  <span className="text-[10px] font-mono text-[#8D9690] uppercase">mL WATER</span>
                </div>
                <div className="text-[9px] font-mono text-[#8D9690] mt-0.5">
                  Evaporated [{summary ? `${summary.totalWaterConsumptionMl.min}–${summary.totalWaterConsumptionMl.max}` : '0–0'}]
                </div>
              </div>

              {/* Carbon */}
              <div className="flex flex-col">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xl font-semibold text-[#F1F3F1]">
                    {summary ? summary.totalCarbonG.expected : '0.00'}
                  </span>
                  <span className="text-[10px] font-mono text-[#8D9690] uppercase">g CO₂e</span>
                </div>
                <div className="text-[9px] font-mono text-[#8D9690] mt-0.5">
                  Grid emissions [{summary ? `${summary.totalCarbonG.min}–${summary.totalCarbonG.max}` : '0–0'}]
                </div>
              </div>
            </div>

            {/* Confidence Strip (Amber Accent) */}
            {latestEvent && (
              <div className="pt-2 border-t border-[#29302C]">
                <button
                  onClick={() => setShowConfidenceDetails(!showConfidenceDetails)}
                  className="w-full flex items-center justify-between text-[10px] font-mono text-[#D8B878] hover:text-[#E8CE94] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D8B878]" />
                    <span>{latestEvent.confidence.level} OBSERVATIONAL FIDELITY</span>
                    <span className="text-[#8D9690]">({latestEvent.confidence.score}/100)</span>
                  </div>
                  {showConfidenceDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {showConfidenceDetails && (
                  <div className="mt-2 p-2 bg-[#0B0D0C] border border-[#29302C] rounded text-[10px] font-mono flex flex-col gap-1.5">
                    <div className="text-[#8D9690]">{latestEvent.confidence.summary}</div>
                    <div className="flex flex-col gap-1 mt-1">
                      {latestEvent.confidence.checklist.map((c) => (
                        <div key={c.id} className="flex items-start gap-1.5">
                          {c.passed ? (
                            <span className="text-[#A8D5BA]">✓</span>
                          ) : (
                            <span className="text-[#D8B878]">△</span>
                          )}
                          <div className="flex flex-col">
                            <span className="text-[#F1F3F1]">{c.title}</span>
                            <span className="text-[9px] text-[#8D9690]">{c.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* B. The Imprint Line (Compute Timeline) */}
          <section className="bg-[#111513] border border-[#29302C] rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8D9690]">
              <span>COMPUTE CHRONOLOGY</span>
              <span>{events.length} RECORDED TURNS</span>
            </div>

            {/* Visual Imprint Waveform / Stepped Chart */}
            <div className="h-10 w-full flex items-end gap-1 px-1 py-1 bg-[#0B0D0C] border border-[#29302C] rounded">
              {events.length === 0 ? (
                <div className="w-full text-center text-[10px] font-mono text-[#4E5752] py-1">
                  Awaiting assistant inference...
                </div>
              ) : (
                events.slice(0, 24).reverse().map((ev, idx) => {
                  const maxEnergy = Math.max(...events.map((e) => e.impact.energy.total.expected), 1.0);
                  const heightPct = Math.min(100, Math.max(15, (ev.impact.energy.total.expected / maxEnergy) * 100));
                  const isSelected = selectedTurnId === ev.id;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => setSelectedTurnId(ev.id)}
                      title={`Turn #${ev.interactionIndex}: ${ev.impact.energy.total.expected} Wh`}
                      style={{ height: `${heightPct}%` }}
                      className={`flex-1 min-w-[6px] rounded-t transition-all ${
                        isSelected
                          ? 'bg-[#A8D5BA]'
                          : 'bg-[#284D39] hover:bg-[#6FB58A]'
                      }`}
                    />
                  );
                })
              )}
            </div>

            {/* Selected Turn Detail */}
            {selectedTurnId && events.find((e) => e.id === selectedTurnId) && (() => {
              const ev = events.find((e) => e.id === selectedTurnId)!;
              return (
                <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-[#8D9690]">
                  <span>
                    Turn #{ev.interactionIndex} · <strong className="text-[#F1F3F1]">{ev.modelRaw || 'GPT-4o'}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#A8D5BA]">{ev.impact.energy.total.expected} Wh</span>
                    <span>{ev.impact.water.consumption.total.expected} mL</span>
                    <span className="uppercase text-[#8D9690]">{ev.activity.category}</span>
                  </div>
                </div>
              );
            })()}
          </section>

          {/* C. Activity Intent Selector (Scientific Codes) */}
          <section className="bg-[#111513] border border-[#29302C] rounded-xl p-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8D9690]">
              <span>ACTIVE INTENT CATEGORY</span>
              <span className="text-[9px] uppercase text-[#4E5752]">Attributed to new events</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {ACTIVITIES.map((act) => {
                const isSelected = settings?.currentActivity === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleActivitySelect(act.id)}
                    className={`py-1 px-1 rounded text-center font-mono text-[10px] transition-all border ${
                      isSelected
                        ? 'bg-[#1E2421] border-[#A8D5BA] text-[#A8D5BA] font-bold'
                        : 'bg-[#0B0D0C] border-[#29302C] text-[#8D9690] hover:text-[#F1F3F1] hover:border-[#3A443F]'
                    }`}
                  >
                    {act.code}
                  </button>
                );
              })}
            </div>
          </section>

          {/* D. Data Integrity Notice */}
          <div className="p-2.5 rounded-lg bg-[#111513] border border-[#29302C] text-[10px] text-[#8D9690] flex items-start gap-2">
            <span className="text-[#A8D5BA] font-mono mt-0.5">🔒</span>
            <div className="leading-relaxed">
              <strong className="text-[#F1F3F1]">Private by Design:</strong> No prompt or assistant text is stored or transmitted. All calculations run strictly in your browser.
            </div>
          </div>

          {/* Simulated Step Controls with Multi-Provider Selector */}
          <div className="flex flex-col gap-2 p-2.5 rounded-lg border border-[#29302C] bg-[#111513]">
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8D9690]">
              <span className="uppercase tracking-wider">Simulate Live Provider Turn</span>
              <span className="text-[#A8D5BA] font-bold">{simulatedProvider.toUpperCase()}</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(['chatgpt', 'claude', 'gemini', 'grok'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSimulatedProvider(p)}
                  className={`py-1 text-[9px] font-mono rounded border uppercase transition-colors ${
                    simulatedProvider === p
                      ? 'bg-[#171B19] border-[#A8D5BA] text-[#A8D5BA] font-bold'
                      : 'bg-[#0B0D0C] border-[#29302C] text-[#8D9690] hover:text-[#F1F3F1] hover:border-[#3D4742]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddSimulatedTurn}
              className="mt-0.5 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded border border-[#284D39] bg-[#171B19] hover:bg-[#1E2421] text-xs font-mono text-[#A8D5BA] transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>LOG TEST TURN ({simulatedProvider.toUpperCase()})</span>
            </button>
          </div>
        </main>
      ) : (
        /* 3. Methodology Spec View (Paper-grade Documentation) */
        <main className="flex flex-col gap-3 mt-3 overflow-y-auto max-h-[420px] pr-1">
          {/* Methodology Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-[#8D9690] uppercase tracking-wider">
              Selected Scientific Benchmark
            </label>
            <select
              value={settings?.activeMethodologyId}
              onChange={(e) => handleMethodologyChange(e.target.value)}
              className="bg-[#111513] border border-[#29302C] rounded-lg px-2.5 py-1.5 text-xs text-[#F1F3F1] font-mono focus:outline-none focus:border-[#A8D5BA]"
            >
              {methodologies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Datasheet Document */}
          <article className="bg-[#111513] border border-[#29302C] rounded-xl p-3.5 flex flex-col gap-3 text-xs">
            <header className="pb-2 border-b border-[#29302C]">
              <div className="font-mono text-sm font-bold text-[#F1F3F1]">{activeMethodology.name}</div>
              <p className="text-[11px] text-[#8D9690] mt-1 leading-relaxed">{activeMethodology.description}</p>
              <div className="flex items-center gap-2 mt-2 font-mono text-[9px]">
                <span className="px-1.5 py-0.5 rounded bg-[#171B19] border border-[#29302C] text-[#A8D5BA]">
                  BOUNDARY: {activeMethodology.boundary.toUpperCase()}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#171B19] border border-[#29302C] text-[#D8B878]">
                  SCOPE: {activeMethodology.primaryScope.toUpperCase()}
                </span>
              </div>
            </header>

            {/* Formal Formula Sections */}
            <div className="flex flex-col gap-2.5 font-mono text-[10px]">
              {/* Section 01 */}
              <div>
                <div className="text-[#8D9690] uppercase tracking-wider">01 INPUT OBSERVATION</div>
                <div className="text-[#F1F3F1] mt-0.5">
                  T_in, T_out derived from DOM character length (ratio ~3.8 chars/token).
                </div>
              </div>

              {/* Section 02 */}
              <div className="pt-2 border-t border-[#29302C]">
                <div className="text-[#8D9690] uppercase tracking-wider">02 ENERGY MODEL</div>
                <div className="text-[#A8D5BA] font-semibold mt-0.5">
                  E_inference = E_base + (T_in · e_in) + (T_out · e_out) + (T_reason · e_reason)
                </div>
                <div className="text-[#8D9690] mt-0.5">Total E = E_inference · PUE (Datacenter fleet overhead)</div>
              </div>

              {/* Section 03 */}
              <div className="pt-2 border-t border-[#29302C]">
                <div className="text-[#8D9690] uppercase tracking-wider">03 WATER REFRIGERATION & GRID</div>
                <div className="text-[#A8D5BA] font-semibold mt-0.5">
                  W_total = W_onsite (evaporative cooling) + W_upstream (grid electricity)
                </div>
                <div className="text-[#8D9690] mt-0.5">W_onsite = E_datacenter · WUE_site (L/kWh)</div>
              </div>

              {/* Section 04 */}
              <div className="pt-2 border-t border-[#29302C]">
                <div className="text-[#8D9690] uppercase tracking-wider">04 UNCERTAINTY ERROR MARGINS</div>
                <div className="text-[#D8B878] mt-0.5">
                  Energy: ±{activeMethodology.uncertaintyModel.energyVariancePct}% · Water: ±{activeMethodology.uncertaintyModel.waterVariancePct}%
                </div>
              </div>

              {/* Section 05: Sources */}
              <div className="pt-2 border-t border-[#29302C]">
                <div className="text-[#8D9690] uppercase tracking-wider">05 CITED SCIENTIFIC LITERATURE</div>
                <div className="flex flex-col gap-1 mt-1 text-[9px] text-[#8D9690]">
                  {activeMethodology.sources.map((s) => (
                    <div key={s.id} className="p-1.5 rounded bg-[#0B0D0C] border border-[#29302C]">
                      <span className="text-[#F1F3F1] font-semibold">[{s.id.toUpperCase()}]</span> {s.title} ({s.year})
                      {s.publisher && <span className="text-[#4E5752]"> — {s.publisher}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Side-by-Side Comparative Matrix */}
          <section className="bg-[#111513] border border-[#29302C] rounded-xl p-3 flex flex-col gap-2 font-mono">
            <button
              onClick={() => setShowMethodologyComparison(!showMethodologyComparison)}
              className="flex items-center justify-between text-xs font-semibold text-[#A8D5BA] hover:text-[#6FB58A]"
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>SIDE-BY-SIDE METHODOLOGY MATRIX</span>
              </div>
              {showMethodologyComparison ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showMethodologyComparison && (
              <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-[#29302C]">
                <p className="text-[9px] text-[#8D9690]">
                  Evaluates identical session tokens across distinct system boundaries:
                </p>
                {comparisonResults.map((item) => (
                  <div
                    key={item.methodology.id}
                    className={`p-2 rounded border text-[10px] flex flex-col gap-0.5 ${
                      item.methodology.id === settings?.activeMethodologyId
                        ? 'bg-[#171B19] border-[#A8D5BA] text-[#F1F3F1]'
                        : 'bg-[#0B0D0C] border-[#29302C] text-[#8D9690]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#F1F3F1]">{item.methodology.name}</span>
                      <span className="text-[9px] px-1 rounded bg-[#111513] border border-[#29302C] text-[#A8D5BA]">
                        {item.methodology.boundary.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[9px] pt-1 text-[#8D9690]">
                      <div>⚡ {item.energyWh} Wh</div>
                      <div>💧 {item.waterMl} mL</div>
                      <div>☁️ {item.carbonG} g</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* 4. Scientific Instrument Footer Controls */}
      <footer className="mt-auto pt-3 border-t border-[#29302C] flex items-center justify-between text-xs font-mono text-[#8D9690]">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={events.length === 0}
            className="flex items-center gap-1 hover:text-[#A8D5BA] transition-colors disabled:opacity-30"
            title="Download CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>.CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            disabled={events.length === 0}
            className="flex items-center gap-1 hover:text-[#A8D5BA] transition-colors disabled:opacity-30"
            title="Download JSON ledger"
          >
            <Download className="w-3 h-3" />
            <span>.JSON</span>
          </button>
        </div>

        <button
          onClick={handleClearData}
          disabled={events.length === 0}
          className="flex items-center gap-1 hover:text-red-400 transition-colors disabled:opacity-30"
          title="Reset telemetry"
        >
          <Trash2 className="w-3 h-3" />
          <span>RESET</span>
        </button>
      </footer>
    </div>
  );
}
