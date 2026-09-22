'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import { LedgerEvent } from '@imprint/schemas';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedEvents: LedgerEvent[]) => void;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  function handleParseJSON(text: string) {
    try {
      setError(null);
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error('Imported data must be an array of LedgerEvent objects.');
      }
      if (parsed.length === 0) {
        throw new Error('Ledger export contains 0 events.');
      }

      // Check required fields on first item
      const first = parsed[0];
      if (!first.id || !first.timestamp || !first.impact || !first.input || !first.output) {
        throw new Error('Invalid Imprint ledger format: missing core telemetry properties.');
      }

      setSuccessCount(parsed.length);
      onImport(parsed as LedgerEvent[]);
      setTimeout(() => {
        onClose();
        setSuccessCount(null);
        setJsonText('');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to parse JSON file.');
      setSuccessCount(null);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
        handleParseJSON(content);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111513] border border-[#29302C] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#29302C] flex items-center justify-between bg-[#171B19]">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#A8D5BA]" />
            <h3 className="font-bold text-[#F1F3F1] uppercase tracking-wider">
              Import Extension Ledger
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8D9690] hover:text-[#F1F3F1] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          <p className="text-[#8D9690] leading-relaxed">
            Upload or paste the <code className="text-[#A8D5BA]">.json</code> ledger exported from your Imprint browser extension to visualize your real browsing telemetry.
          </p>

          {/* File Upload Drop Area */}
          <label className="border border-dashed border-[#29302C] hover:border-[#A8D5BA] rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#0B0D0C] hover:bg-[#141816] transition-colors">
            <FileText className="w-8 h-8 text-[#A8D5BA]/60" />
            <span className="text-[#F1F3F1] font-medium">Select JSON export file</span>
            <span className="text-[10px] text-[#8D9690]">imprint-ledger-YYYY-MM-DD.json</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Or Paste Raw JSON */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-[#8D9690] uppercase tracking-wider">
              Or Paste JSON Content:
            </label>
            <textarea
              rows={5}
              placeholder="[{ id: 'evt-1', timestamp: 171..., impact: { ... } }]"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-[#0B0D0C] border border-[#29302C] focus:border-[#A8D5BA] rounded p-2.5 text-[11px] text-[#F1F3F1] focus:outline-none placeholder:text-[#4E5752] font-mono resize-none"
            />
          </div>

          {/* Status Notifications */}
          {error && (
            <div className="p-2.5 rounded bg-[#2B1B1B] border border-red-900/50 text-red-300 flex items-center gap-2 text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-2.5 rounded bg-[#1E2E24] border border-[#284D39] text-[#A8D5BA] flex items-center gap-2 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Successfully imported {successCount} ledger events!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#29302C] bg-[#171B19] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-[#29302C] text-[#8D9690] hover:text-[#F1F3F1] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleParseJSON(jsonText)}
            disabled={!jsonText.trim()}
            className="px-4 py-1.5 rounded bg-[#284D39] hover:bg-[#3D5A47] text-[#A8D5BA] border border-[#A8D5BA]/40 font-bold transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Import Events
          </button>
        </div>
      </div>
    </div>
  );
}
