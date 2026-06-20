import { useEffect, useState } from 'react';
import { useStorageStore } from './store/presentationStore';
import { PresenterConsole } from './components/PresenterConsole';
import { StageView } from './components/StageView';
import { SyncTelemetryHUD } from './components/SyncTelemetryHUD';
import { Database, ShieldAlert, Cpu } from 'lucide-react';

function App() {
  const { refreshSchemaStructure } = useStorageStore();
  const [viewMode, setViewMode] = useState('presenter'); // 'presenter' or 'stage'

  useEffect(() => {
    // Check url search parameters to determine view mode
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'stage') {
      setViewMode('stage');
    } else {
      setViewMode('presenter');
    }

    // Refresh store from localStorage on mount
    refreshSchemaStructure();
  }, [refreshSchemaStructure]);

  if (viewMode === 'stage') {
    return <StageView />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-app-dark select-none">
      {/* Presentation Studio Header */}
      <header className="bg-app-header border-b px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div style={{ padding: '0.375rem', backgroundColor: 'rgba(6,78,59,0.6)', borderRadius: '0.25rem', border: '1px solid rgba(6,78,59,0.4)' }}>
            <Database style={{ width: '1.25rem', height: '1.25rem', color: '#34d399' }} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">
              Dual-Screen Presentation Sync Engine
            </h1>
            <p style={{ fontSize: '10px', color: '#71717a', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.025em' }}>
              Native Browser Broadcast Channel &amp; Chronological Telemetry Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400 bg-app-bar px-2.5 py-1 rounded border border-app-panel">
            <Cpu style={{ width: '0.875rem', height: '0.875rem', color: '#a78bfa', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
            <span>Driver status:</span>
            <span className="text-emerald-400 font-bold">ONLINE (100% Client-Side)</span>
          </div>

          <div className="flex items-center gap-1 text-zinc-500">
            <ShieldAlert style={{ width: '0.875rem', height: '0.875rem', color: '#f59e0b' }} />
            <span>Zero Server Overhead / Secure Sandbox</span>
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Presenter Control View */}
        <PresenterConsole />

        {/* Diagnostic Telemetry HUD */}
        <SyncTelemetryHUD />
      </main>
    </div>
  );
}

export default App;
