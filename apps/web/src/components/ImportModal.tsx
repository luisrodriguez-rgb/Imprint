'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Cpu, Layers } from 'lucide-react';
import { LedgerEvent } from '@imprint/schemas';
import { normalizeLedgerImport, ImportStats } from '../lib/import-normalizer';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedEvents: LedgerEvent[], mode: 'replace' | 'append') => void;
  activeMethodologyId: string;
}

export function ImportModal({
  isOpen,
  onClose,
  onImport,
  activeMethodologyId,
}: ImportModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewStats, setPreviewStats] = useState<ImportStats | null>(null);
  const [parsedEvents, setParsedEvents] = useState<LedgerEvent[] | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('append');

  if (!isOpen) return null;

  function handleProcessInput(text: string) {
    try {
      setError(null);
      if (!text.trim()) {
        setError('Please paste or upload JSON telemetry content.');
        return;
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (err: any) {
        throw new Error(`Invalid JSON syntax: ${err.message}`);
      }

      const { events, stats } = normalizeLedgerImport(parsed, activeMethodologyId);
      setParsedEvents(events);
      setPreviewStats(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to parse and normalize ledger data.');
      setParsedEvents(null);
      setPreviewStats(null);
    }
  }

  function handleConfirmImport() {
    if (!parsedEvents || parsedEvents.length === 0) return;
    onImport(parsedEvents, importMode);
    handleClose();
  }

  function handleClose() {
    setJsonText('');
    setError(null);
    setPreviewStats(null);
    setParsedEvents(null);
    onClose();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
        handleProcessInput(content);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-sans text-xs">
      <div className="bg-[#FFFFFF] dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] text-[#111815] dark:text-[#F1F3F1] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E2E8E4] dark:border-[#29302C] flex items-center justify-between bg-[#F8FAF9] dark:bg-[#171B19]">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#059669] dark:text-[#A8D5BA]" />
            <h3 className="font-semibold text-sm tracking-tight">
              Import Interaction Ledger
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <p className="text-[#64748B] dark:text-[#8D9690] leading-relaxed text-xs">
            Upload or paste an Imprint telemetry JSON file (from the browser extension, database backup, or custom logs). All missing fields will be safely reconstructed and evaluated against the active methodology.
          </p>

          {/* File Upload Drop Area */}
          <label className="border border-dashed border-[#E2E8E4] dark:border-[#29302C] hover:border-[#059669] dark:hover:border-[#A8D5BA] rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#F8FAF9] dark:bg-[#0B0D0C] hover:bg-[#F1F5F3] dark:hover:bg-[#141816] transition-colors">
            <FileText className="w-7 h-7 text-[#059669]/70 dark:text-[#A8D5BA]/70" />
            <span className="font-medium text-xs">Choose JSON ledger file</span>
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#8D9690]">imprint-ledger-*.json</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Or Paste Raw JSON */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-[#64748B] dark:text-[#8D9690] uppercase tracking-wider">
                Or Paste JSON Content:
              </label>
              {jsonText && (
                <button
                  type="button"
                  onClick={() => handleProcessInput(jsonText)}
                  className="text-[10px] text-[#059669] dark:text-[#A8D5BA] hover:underline"
                >
                  Re-parse
                </button>
              )}
            </div>
            <textarea
              rows={4}
              placeholder='[ { "provider": "chatgpt", "modelRaw": "GPT-4o", "inputTokens": 200, "outputTokens": 450 } ]'
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                if (e.target.value.trim().startsWith('[') || e.target.value.trim().startsWith('{')) {
                  handleProcessInput(e.target.value);
                }
              }}
              className="w-full bg-[#F8FAF9] dark:bg-[#0B0D0C] border border-[#E2E8E4] dark:border-[#29302C] focus:border-[#059669] dark:focus:border-[#A8D5BA] rounded p-2.5 text-[11px] focus:outline-none placeholder:text-[#94A3B8] dark:placeholder:text-[#4E5752] resize-none"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-2.5 rounded bg-red-50 dark:bg-[#2B1B1B] border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 flex items-center gap-2 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Parsed Telemetry Verification & Preview */}
          {previewStats && (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-[#17231C] border border-emerald-200 dark:border-[#284D39] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#059669] dark:text-[#A8D5BA] font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified & Normalized: {previewStats.totalEvents} Interactions</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#111513] border border-emerald-300 dark:border-[#284D39] text-[#059669] dark:text-[#A8D5BA]">
                  {previewStats.appliedMethodology}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#475550] dark:text-[#B0B8B2] pt-1 border-t border-emerald-200/60 dark:border-[#284D39]/60">
                <div>
                  <span className="text-[#64748B] dark:text-[#8D9690]">Total Tokens: </span>
                  <span className="font-bold text-[#111815] dark:text-[#F1F3F1]">
                    {previewStats.totalTokens.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-[#8D9690]">Providers: </span>
                  <span className="font-bold text-[#111815] dark:text-[#F1F3F1]">
                    {Object.entries(previewStats.providerCounts)
                      .map(([p, count]) => `${p}: ${count}`)
                      .join(', ')}
                  </span>
                </div>
              </div>

              {/* Import Mode: Append or Replace */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-[#284D39]/60">
                <span className="text-[10px] text-[#64748B] dark:text-[#8D9690]">Import Action:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                      importMode === 'append'
                        ? 'bg-[#059669] text-white dark:bg-[#A8D5BA] dark:text-[#0B0D0C] font-bold'
                        : 'bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] text-[#64748B] dark:text-[#8D9690]'
                    }`}
                  >
                    Append to Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                      importMode === 'replace'
                        ? 'bg-[#059669] text-white dark:bg-[#A8D5BA] dark:text-[#0B0D0C] font-bold'
                        : 'bg-white dark:bg-[#111513] border border-[#E2E8E4] dark:border-[#29302C] text-[#64748B] dark:text-[#8D9690]'
                    }`}
                  >
                    Replace Ledger
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E2E8E4] dark:border-[#29302C] bg-[#F8FAF9] dark:bg-[#171B19] flex items-center justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded border border-[#E2E8E4] dark:border-[#29302C] text-[#64748B] dark:text-[#8D9690] hover:text-[#111815] dark:hover:text-[#F1F3F1] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!parsedEvents || parsedEvents.length === 0}
            className="px-4 py-1.5 rounded bg-[#059669] dark:bg-[#284D39] hover:bg-[#047857] dark:hover:bg-[#3D5A47] text-white dark:text-[#A8D5BA] border border-[#059669] dark:border-[#A8D5BA]/40 font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Confirm Import ({parsedEvents?.length || 0} Turns)
          </button>
        </div>
      </div>
    </div>
  );
}
