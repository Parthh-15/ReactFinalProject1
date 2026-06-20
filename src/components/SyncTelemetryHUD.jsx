import React, { useState } from 'react';
import { useStorageStore } from '../store/presentationStore';
import { Terminal, Download, Upload, Cpu, Activity, LayoutGrid, HardDrive } from 'lucide-react';

export const SyncTelemetryHUD = () => {
  const {
    slides,
    messageThroughput,
    broadcastLatency,
    nodeCount,
    assetMemoryWeight,
    telemetryLogs,
    setSlides
  } = useStorageStore();

  const [importText, setImportText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle slide JSON export
  const exportPresentation = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(slides, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "presentation_deck_script.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle slide JSON import
  const importPresentation = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        setErrorMsg('Invalid JSON format: Deck must be an array of slide objects.');
        return;
      }
      // Basic check
      for (const slide of parsed) {
        if (!slide.title || !Array.isArray(slide.bullets) || !Array.isArray(slide.vectors)) {
          setErrorMsg('Invalid JSON structure: Each slide needs a title, bullets array, and vectors array.');
          return;
        }
      }
      setSlides(parsed);
      localStorage.setItem('deck_sync_slides', JSON.stringify(parsed));
      setImportText('');
      setErrorMsg('');
    } catch (e) {
      setErrorMsg(`JSON Parse Error: ${e.message}`);
    }
  };

  return (
    <div className="bg-app-terminal border-t border-zinc-800 p-4 font-mono shrink-0 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-emerald-400 animate-pulse" />
            <span className="text-zinc-400 font-bold times-12">System Telemetry &amp; Cross-Window Diagnostics HUD</span>
          </div>
          <span className="text-[10px] text-zinc-600">SANDBOX BUS // DECK_SYNC_BUS</span>
        </div>

        {/* 4-Column Diagnostic Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          <div className="bg-black/40 border border-zinc-900 p-3 rounded flex items-center gap-3">
            <Activity className="text-emerald-400 shrink-0" size={20} />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase times-12">Message Throughput</span>
              <span className="text-sm font-bold text-zinc-200 times-12">{messageThroughput} txs</span>
            </div>
          </div>

          <div className="bg-black/40 border border-zinc-900 p-3 rounded flex items-center gap-3">
            <Cpu className="text-rose-500 shrink-0" size={20} />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase times-12">Sync Latency</span>
              <span className="text-sm font-bold text-zinc-200 times-12">{broadcastLatency.toFixed(2)} ms</span>
            </div>
          </div>

          <div className="bg-black/40 border border-zinc-900 p-3 rounded flex items-center gap-3">
            <LayoutGrid className="text-blue-400 shrink-0" size={20} />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase times-12">Calculated Slide Nodes</span>
              <span className="text-sm font-bold text-zinc-200 times-12">{nodeCount} active</span>
            </div>
          </div>

          <div className="bg-black/40 border border-zinc-900 p-3 rounded flex items-center gap-3">
            <HardDrive className="text-violet-400 shrink-0" size={20} />
            <div>
              <span className="text-[10px] text-zinc-500 block uppercase times-12">Memory Footprint Weight</span>
              <span className="text-sm font-bold text-zinc-200 times-12">{assetMemoryWeight} bytes</span>
            </div>
          </div>

        </div>

        {/* Lower Row: Telemetry Log & Script configuration controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Telemetry scrolling event log */}
          <div className="bg-black/60 border border-zinc-900 rounded p-3 flex flex-col h-32">
            <span className="text-[10px] text-zinc-500 mb-1 border-b border-zinc-900 pb-1 times-12">Live Bus Transmit Logs</span>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] text-zinc-400">
              {telemetryLogs.length === 0 && (
                <div className="text-zinc-600 italic">No events broadcasted yet...</div>
              )}
              {telemetryLogs.map((log, idx) => (
                <div key={idx} className="flex justify-between hover:bg-zinc-900 px-1 py-0.5 rounded">
                  <span className="text-emerald-500">[{log.time}] {log.type}</span>
                  <span className="text-zinc-600">Latency: {log.latency}ms | Size: {log.size}B</span>
                </div>
              ))}
            </div>
          </div>

          {/* Import / Export JSON deck scripts */}
          <div className="bg-black/60 border border-zinc-900 rounded p-3 flex flex-col h-32 justify-between">
            <span className="text-[10px] text-zinc-500 border-b border-zinc-900 pb-1 times-12">Deck Configuration Scripting Manager</span>
            
            <div className="flex gap-2 items-center flex-1 my-2">
              <textarea 
                placeholder="Paste deck script JSON configuration here to import..."
                className="flex-1 h-full bg-black border border-zinc-800 rounded p-1.5 text-[10px] text-zinc-300 font-mono resize-none focus:outline-none focus:border-zinc-700"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
              />
              <div className="flex flex-col gap-2 shrink-0">
                <button 
                  onClick={importPresentation}
                  className="times-12 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1 rounded transition"
                >
                  <Upload size={12} />
                  Import Script
                </button>
                
                <button 
                  onClick={exportPresentation}
                  className="times-12 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1 rounded transition"
                >
                  <Download size={12} />
                  Export Script
                </button>
              </div>
            </div>

            {errorMsg && (
              <span className="text-[10px] text-rose-500 font-mono truncate">{errorMsg}</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
