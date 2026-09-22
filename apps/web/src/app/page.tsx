'use client';

import React, { useState, useEffect } from 'react';
import { LedgerEvent } from '@imprint/schemas';
import { estimateImpact } from '@imprint/impact-engine';
import { generateSeedLedgerEvents } from '../lib/demo-data';
import { Header } from '../components/Header';
import { MetricCards } from '../components/MetricCards';
import { ChronologyChart } from '../components/ChronologyChart';
import { ActivityBreakdown } from '../components/ActivityBreakdown';
import { DualWaterChart } from '../components/DualWaterChart';
import { LedgerTable } from '../components/LedgerTable';
import { MethodologyExplorer } from '../components/MethodologyExplorer';
import { ImportModal } from '../components/ImportModal';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'methodologies'>('analytics');
  const [selectedMethodologyId, setSelectedMethodologyId] = useState<string>('joule-frontier-2026');
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('imprint_web_ledger');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEvents(parsed);
          return;
        }
      } catch (e) {
        console.error('Error loading saved ledger:', e);
      }
    }
    // Fallback to rich seed data
    const initialSeed = generateSeedLedgerEvents('joule-frontier-2026');
    setEvents(initialSeed);
  }, []);

  // When methodology changes, recalculate impact for all current events
  function handleMethodologyChange(newMethodologyId: string) {
    setSelectedMethodologyId(newMethodologyId);
    setEvents((prev) =>
      prev.map((ev) => {
        const calc = estimateImpact({
          inputTokens: ev.input.estimatedTokens,
          outputTokens: ev.output.estimatedTokens,
          reasoningTokens: ev.output.reasoningTokens || 0,
          modelFamily: ev.modelFamily,
          providerId: ev.provider,
          methodologyId: newMethodologyId,
          inputProvenance: ev.input.provenance,
          outputProvenance: ev.output.provenance,
          modelDetected: ev.modelRaw !== null,
        });
        return {
          ...ev,
          impact: calc.impact,
          confidence: calc.confidence,
        };
      })
    );
  }

  // Handle imported events from extension
  function handleImportEvents(newEvents: LedgerEvent[]) {
    // Re-evaluate with current methodology
    const evaluated = newEvents.map((ev) => {
      const calc = estimateImpact({
        inputTokens: ev.input.estimatedTokens,
        outputTokens: ev.output.estimatedTokens,
        reasoningTokens: ev.output.reasoningTokens || 0,
        modelFamily: ev.modelFamily,
        providerId: ev.provider,
        methodologyId: selectedMethodologyId,
        inputProvenance: ev.input.provenance,
        outputProvenance: ev.output.provenance,
        modelDetected: ev.modelRaw !== null,
      });
      return {
        ...ev,
        impact: calc.impact,
        confidence: calc.confidence,
      };
    });

    setEvents(evaluated);
    localStorage.setItem('imprint_web_ledger', JSON.stringify(evaluated));
  }

  // Export handlers
  function handleExportJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    downloadFile(dataStr, `imprint-web-ledger-${new Date().toISOString().slice(0, 10)}.json`);
  }

  function handleExportCSV() {
    const headers = [
      'id',
      'timestamp',
      'date_iso',
      'provider',
      'model_raw',
      'model_family',
      'activity',
      'input_tokens',
      'output_tokens',
      'reasoning_tokens',
      'energy_wh_expected',
      'energy_wh_min',
      'energy_wh_max',
      'water_consumption_ml_expected',
      'water_consumption_ml_min',
      'water_consumption_ml_max',
      'water_withdrawal_ml_expected',
      'carbon_g_expected',
      'mineral_depletion_mg_expected',
      'confidence_level',
    ];

    const rows = events.map((e) => [
      e.id,
      e.timestamp,
      new Date(e.timestamp).toISOString(),
      e.provider,
      `"${e.modelRaw || ''}"`,
      `"${e.modelFamily || ''}"`,
      e.activity.category,
      e.input.estimatedTokens,
      e.output.estimatedTokens,
      e.output.reasoningTokens || 0,
      e.impact.energy.total.expected,
      e.impact.energy.total.min,
      e.impact.energy.total.max,
      e.impact.water.consumption.total.expected,
      e.impact.water.consumption.total.min,
      e.impact.water.consumption.total.max,
      e.impact.water.withdrawal.total.expected,
      e.impact.carbon.total.expected,
      e.impact.minerals?.depletion.expected ?? '',
      e.confidence.level,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    downloadFile(dataStr, `imprint-web-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function downloadFile(dataUri: string, filename: string) {
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0B0D0C] flex items-center justify-center font-mono text-xs text-[#8D9690]">
        INITIALIZING SCIENTIFIC INSTRUMENT...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0D0C] text-[#F1F3F1]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMethodologyId={selectedMethodologyId}
        setSelectedMethodologyId={handleMethodologyChange}
        onOpenImport={() => setIsImportOpen(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        eventCount={events.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {activeTab === 'analytics' ? (
          <>
            {/* 1. Hero KPI Cards */}
            <MetricCards events={events} />

            {/* 2. Chronological Compute Pulse Waveform */}
            <ChronologyChart events={events} />

            {/* 3. Activity & Dual Water Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityBreakdown events={events} />
              <DualWaterChart events={events} />
            </div>

            {/* 4. Full Turn-by-Turn Ledger Table */}
            <LedgerTable events={events} />
          </>
        ) : (
          /* Methodology Atlas & Comparative Matrix */
          <MethodologyExplorer
            events={events}
            activeMethodologyId={selectedMethodologyId}
            onSelectMethodology={handleMethodologyChange}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#29302C] bg-[#0B0D0C] px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#8D9690]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A8D5BA]" />
            <span>IMPRINT · PERSONAL COMPUTATIONAL RESOURCE LEDGER</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Local & Privacy-Preserving</span>
            <span>·</span>
            <span>Zero Prompt Storage</span>
            <span>·</span>
            <span>Independent Scientific Methodologies</span>
          </div>
        </div>
      </footer>

      {/* Import Extension Ledger Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportEvents}
      />
    </div>
  );
}
