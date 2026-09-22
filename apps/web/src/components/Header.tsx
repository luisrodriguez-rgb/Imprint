'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Layers,
  BarChart3,
  BookOpen,
  Sun,
  Moon,
  User,
  ShieldCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { ALL_METHODOLOGIES } from '@imprint/impact-engine';
import { ImprintLogo } from './ImprintLogo';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeMethodology =
    ALL_METHODOLOGIES.find((m) => m.id === selectedMethodologyId) || ALL_METHODOLOGIES[0];

  return (
    <header className="border-b border-[#E2E8E4] dark:border-[#29302C] bg-[#FFFFFF]/90 dark:bg-[#0B0D0C]/90 backdrop-blur-md sticky top-0 z-40 px-5 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* 1. Left: Prominent Identity & Brand */}
        <div className="flex items-center gap-3.5">
          <ImprintLogo size={36} fidelity="HIGH" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2.5">
              <span className="text-lg font-bold tracking-tight text-[#111815] dark:text-[#F1F3F1]">
                Imprint
              </span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-[#17231C] text-[#059669] dark:text-[#A8D5BA] border border-emerald-200 dark:border-[#284D39]">
                {eventCount} Turns Recorded
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-wider text-[#64748B] dark:text-[#8D9690] uppercase">
              Personal Resource Ledger · Environmental Inference
            </span>
          </div>
        </div>

        {/* 2. Center: Clean Navigation Tabs */}
        <div className="flex items-center self-start lg:self-center p-1 bg-[#F1F5F3] dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] rounded-lg">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'analytics'
                ? 'bg-white dark:bg-[#171B19] text-[#111815] dark:text-[#F1F3F1] shadow-sm dark:shadow-none border border-[#E2E8E4] dark:border-[#29302C]'
                : 'text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#059669] dark:text-[#A8D5BA]" />
            <span>Ledger & Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('methodologies')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'methodologies'
                ? 'bg-white dark:bg-[#171B19] text-[#111815] dark:text-[#F1F3F1] shadow-sm dark:shadow-none border border-[#E2E8E4] dark:border-[#29302C]'
                : 'text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D97706] dark:text-[#D8B878]" />
            <span>Methodology Atlas</span>
          </button>
        </div>

        {/* 3. Right: Methodology Selector, Actions, Theme Toggle, and User Profile */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Methodology Selector */}
          <div className="flex items-center gap-1.5 bg-[#F8FAF9] dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] px-2.5 py-1 rounded-lg text-xs font-mono">
            <Layers className="w-3 h-3 text-[#059669] dark:text-[#A8D5BA] shrink-0" />
            <span className="text-[10px] text-[#64748B] dark:text-[#8D9690] uppercase hidden sm:inline">
              Method:
            </span>
            <select
              value={selectedMethodologyId}
              onChange={(e) => setSelectedMethodologyId(e.target.value)}
              className="bg-transparent text-xs font-medium text-[#111815] dark:text-[#F1F3F1] focus:outline-none cursor-pointer pr-1"
            >
              {ALL_METHODOLOGIES.map((m) => (
                <option
                  key={m.id}
                  value={m.id}
                  className="bg-white dark:bg-[#111513] text-[#111815] dark:text-[#F1F3F1]"
                >
                  {m.name} ({m.boundary.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Import Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-[#F8FAF9] dark:bg-[#111513] hover:bg-[#F1F5F3] dark:hover:bg-[#171B19] border border-[#E2E8E4] dark:border-[#29302C] text-[#111815] dark:text-[#F1F3F1] rounded-lg transition-colors"
            title="Import JSON ledger from browser extension or database"
          >
            <Upload className="w-3.5 h-3.5 text-[#D97706] dark:text-[#D8B878]" />
            <span className="font-semibold text-[11px]">IMPORT</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center border border-[#E2E8E4] dark:border-[#29302C] rounded-lg overflow-hidden bg-[#F8FAF9] dark:bg-[#111513]">
            <button
              onClick={onExportCSV}
              className="px-2 py-1 text-xs font-mono text-[#64748B] dark:text-[#8D9690] hover:text-[#059669] dark:hover:text-[#A8D5BA] hover:bg-[#F1F5F3] dark:hover:bg-[#171B19] border-r border-[#E2E8E4] dark:border-[#29302C] transition-colors flex items-center gap-1"
              title="Download CSV"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span className="text-[11px]">.CSV</span>
            </button>
            <button
              onClick={onExportJSON}
              className="px-2 py-1 text-xs font-mono text-[#64748B] dark:text-[#8D9690] hover:text-[#059669] dark:hover:text-[#A8D5BA] hover:bg-[#F1F5F3] dark:hover:bg-[#171B19] transition-colors flex items-center gap-1"
              title="Download JSON"
            >
              <Download className="w-3 h-3" />
              <span className="text-[11px]">.JSON</span>
            </button>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-[#F8FAF9] dark:bg-[#111513] hover:bg-[#F1F5F3] dark:hover:bg-[#171B19] border border-[#E2E8E4] dark:border-[#29302C] text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1] transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#D8B878]" />
            ) : (
              <Moon className="w-4 h-4 text-[#059669]" />
            )}
          </button>

          {/* User Profile / Session Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 pl-1.5 pr-2 rounded-lg bg-[#F8FAF9] dark:bg-[#111513] hover:bg-[#F1F5F3] dark:hover:bg-[#171B19] border border-[#E2E8E4] dark:border-[#29302C] transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-[#284D39] text-[#059669] dark:text-[#A8D5BA] flex items-center justify-center font-bold text-[10px]">
                LR
              </div>
              <span className="text-xs font-medium hidden sm:inline text-[#111815] dark:text-[#F1F3F1]">
                Luis
              </span>
              <ChevronDown className="w-3 h-3 text-[#64748B] dark:text-[#8D9690]" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] shadow-xl z-50 p-3 text-xs font-mono flex flex-col gap-2.5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-[#E2E8E4] dark:border-[#29302C]">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-[#284D39] text-[#059669] dark:text-[#A8D5BA] flex items-center justify-center font-bold text-xs">
                    LR
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[#111815] dark:text-[#F1F3F1]">
                      Dr. Luis Rodríguez
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#8D9690]">
                      Local Research Session
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-[#059669] dark:text-[#A8D5BA]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Zero-Prompt Privacy Active</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] dark:text-[#8D9690] leading-tight">
                    All token telemetry is evaluated locally. Prompts are never transmitted or stored.
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8E4] dark:border-[#29302C] flex items-center justify-between text-[11px]">
                  <span className="text-[#64748B] dark:text-[#8D9690]">Cloud Sync (Phase 6):</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F1F5F3] dark:bg-[#171B19] text-[#64748B] dark:text-[#8D9690] text-[10px]">
                    OFFLINE
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (confirm('Reset current local ledger? Seed data will be restored.')) {
                      localStorage.removeItem('imprint_web_ledger');
                      window.location.reload();
                    }
                  }}
                  className="mt-1 flex items-center gap-1.5 px-2 py-1.5 rounded bg-red-50 dark:bg-[#2B1B1B] text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-[#3D2525] transition-colors text-[10px] font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Reset Session & Clear Ledger</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
