'use client';

import React from 'react';
import { Download, Upload, FileSpreadsheet, Layers, BarChart3, BookOpen } from 'lucide-react';
import { ALL_METHODOLOGIES } from '@imprint/impact-engine';
import { ImprintLogo } from './ImprintLogo';

interface HeaderProps {
  activeTab: 'analytics' | 'methodologies';
  setActiveTab: (tab: 'analytics' | 'methodologies') => void;
  selectedMethodologyId: string;
  setSelectedMethodologyId: (id: string) => void;
  onOpenImport: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  eventCount: number;
}

export function Header({
  activeTab,
  setActiveTab,
  selectedMethodologyId,
  setSelectedMethodologyId,
  onOpenImport,
  onExportCSV,
  onExportJSON,
  eventCount,
}: HeaderProps) {
  return (
    <header className="border-b border-[#29302C] bg-[#0B0D0C]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-3">
        <ImprintLogo size={32} fidelity="HIGH" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-widest text-[#F1F3F1] uppercase">
              IMPRINT
            </h1>
            <span className="text-[10px] font-mono text-[#8D9690] px-1.5 py-0.5 border border-[#29302C] rounded bg-[#111513]">
              WEB LEDGER 0.1
            </span>
            <span className="text-[10px] font-mono text-[#A8D5BA] px-1.5 py-0.5 border border-[#284D39] rounded bg-[#171B19]">
              {eventCount} RECORDED TURNS
            </span>
          </div>
          <p className="text-xs text-[#8D9690] tracking-tight">
            Personal Computational Resource Ledger · Environmental Inference
          </p>
        </div>
      </div>

      {/* Center Navigation Tabs */}
      <div className="flex items-center p-1 bg-[#111513] border border-[#29302C] rounded-lg">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
            activeTab === 'analytics'
              ? 'bg-[#171B19] text-[#F1F3F1] border border-[#29302C]'
              : 'text-[#8D9690] hover:text-[#F1F3F1]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-[#A8D5BA]" />
          <span>Ledger & Analytics</span>
        </button>
        <button
          onClick={() => setActiveTab('methodologies')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-colors ${
            activeTab === 'methodologies'
              ? 'bg-[#171B19] text-[#F1F3F1] border border-[#29302C]'
              : 'text-[#8D9690] hover:text-[#F1F3F1]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#D8B878]" />
          <span>Methodology Atlas</span>
        </button>
      </div>

      {/* Right Controls: Methodology Selector & Import/Export */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-[#111513] border border-[#29302C] px-2.5 py-1 rounded-lg">
          <Layers className="w-3 h-3 text-[#A8D5BA]" />
          <select
            value={selectedMethodologyId}
            onChange={(e) => setSelectedMethodologyId(e.target.value)}
            className="bg-transparent text-xs font-mono text-[#F1F3F1] focus:outline-none cursor-pointer"
          >
            {ALL_METHODOLOGIES.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#111513] text-[#F1F3F1]">
                {m.name} ({m.boundary.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#111513] hover:bg-[#171B19] border border-[#29302C] text-[#8D9690] hover:text-[#F1F3F1] rounded-lg transition-colors"
          title="Import JSON or CSV ledger from browser extension"
        >
          <Upload className="w-3 h-3 text-[#D8B878]" />
          <span>IMPORT</span>
        </button>

        <div className="flex items-center border border-[#29302C] rounded-lg overflow-hidden bg-[#111513]">
          <button
            onClick={onExportCSV}
            className="px-2 py-1 text-xs font-mono text-[#8D9690] hover:text-[#A8D5BA] hover:bg-[#171B19] border-r border-[#29302C] transition-colors flex items-center gap-1"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>.CSV</span>
          </button>
          <button
            onClick={onExportJSON}
            className="px-2 py-1 text-xs font-mono text-[#8D9690] hover:text-[#A8D5BA] hover:bg-[#171B19] transition-colors flex items-center gap-1"
            title="Download JSON"
          >
            <Download className="w-3 h-3" />
            <span>.JSON</span>
          </button>
        </div>
      </div>
    </header>
  );
}
