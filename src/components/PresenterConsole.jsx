import React, { useEffect, useRef } from 'react';
import { useStorageStore } from '../store/presentationStore';
import { Play, RotateCcw, Monitor, Trash2, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react';

export const PresenterConsole = () => {
  const {
    slides,
    currentSlideIndex,
    currentBuildIndex,
    elapsedSeconds,
    timerMax,
    tickTimer,
    setLaserPointer,
    laserPointer
  } = useStorageStore();

  const previewCanvasRef = useRef(null);

  // Tick timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  const currentSlide = slides[currentSlideIndex];

  // Handle local laser pointer movements on the presenter preview dashboard
  const handleMouseMove = (e) => {
    if (!previewCanvasRef.current) return;
    const rect = previewCanvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800; // Normalizing coordinate space to 800x600
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    setLaserPointer({ x, y });
  };

  const handleMouseLeave = () => {
    setLaserPointer(null);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-app-base p-4 gap-4 overflow-y-auto">
      {/* Header and Action Strip */}
      <PresenterActionStrip />

      {/* Main Console Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        
        {/* Left Column: Pacing telemetry and Next slide preview map */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <ChronologicalTelemetryForm />

          {/* Laser Pointer controller canvas */}
          <div className="bg-app-panel border rounded p-3 flex flex-col">
            <span className="text-zinc-400 font-bold mb-2 times-12">Virtual Laser Pointer Canvas</span>
            <div 
              ref={previewCanvasRef}
              className="relative aspect-[4/3] bg-black rounded border border-zinc-700 cursor-crosshair overflow-hidden"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Slide preview inside pointer control */}
              {currentSlide && (
                <svg viewBox="0 0 800 600" className="w-full h-full opacity-60">
                  <rect width="800" height="600" fill="#18181b" />
                  <text x="50" y="80" fill="#ffffff" fontSize="32" fontWeight="bold">
                    {currentSlide.title}
                  </text>
                  {currentSlide.vectors.map((vec, i) => {
                    if (vec.type === 'rect') {
                      return <rect key={i} x={vec.x} y={vec.y} width={vec.width} height={vec.height} fill={vec.fill} stroke={vec.stroke} rx={vec.rx} />;
                    } else if (vec.type === 'circle') {
                      return <circle key={i} cx={vec.cx} cy={vec.cy} r={vec.r} fill={vec.fill} stroke={vec.stroke} />;
                    } else if (vec.type === 'line') {
                      return <line key={i} x1={vec.x1} y1={vec.y1} x2={vec.x2} y2={vec.y2} stroke={vec.stroke} strokeWidth={vec.strokeWidth} strokeDasharray={vec.strokeDasharray} />;
                    } else if (vec.type === 'polygon') {
                      return <polygon key={i} points={vec.points} fill={vec.fill} stroke={vec.stroke} />;
                    } else if (vec.type === 'path') {
                      return <path key={i} d={vec.d} fill="none" stroke={vec.stroke} strokeWidth={vec.strokeWidth} />;
                    }
                    return null;
                  })}
                </svg>
              )}
              {laserPointer && (
                <div 
                  className="absolute rounded-full pointer-events-none bg-rose-500 shadow-[0_0_10px_#ef4444] animate-pulse"
                  style={{
                    width: '12px',
                    height: '12px',
                    left: `${(laserPointer.x / 800) * 100}%`,
                    top: `${(laserPointer.y / 600) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
              <div className="absolute bottom-2 right-2 text-[10px] text-zinc-400 font-mono bg-black/60 px-1 rounded">
                Move mouse here to project laser pointer to audience screen
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Columns: Current view / speaker notes / upcoming slides */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <SpeakerNotesMatrixPanel />
        </div>

      </div>
    </div>
  );
};

/* --- PRESENTER ACTION STRIP --- */
const PresenterActionStrip = () => {
  const {
    resetTimer,
    layoutPreview,
    toggleLayoutPreview,
    flushCache
  } = useStorageStore();

  const launchAudienceView = () => {
    // Open new tab or window pointing to the same page but with view=stage
    const stageUrl = `${window.location.origin}${window.location.pathname}?view=stage`;
    window.open(stageUrl, 'audience_stage_view', 'width=1024,height=768,menubar=no,toolbar=no,location=no');
  };

  return (
    <div className="bg-app-panel border rounded p-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-emerald-400 font-bold times-12">Console Quick Actions:</span>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={launchAudienceView}
          className="times-12 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1-5 rounded font-semibold transition"
        >
          <Monitor size={14} />
          Launch Audience View Window
        </button>

        <button 
          onClick={resetTimer}
          className="times-12 flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1-5 rounded font-semibold transition"
        >
          <RotateCcw size={14} />
          Reset Session Timers
        </button>

        <button 
          onClick={toggleLayoutPreview}
          className="times-12 flex items-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1-5 rounded font-semibold transition"
        >
          {layoutPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          Toggle Layout Previews
        </button>

        <button 
          onClick={flushCache}
          className="times-12 flex items-center gap-2 bg-rose-700 hover:bg-rose-600 text-white px-3 py-1-5 rounded font-semibold transition"
        >
          <Trash2 size={14} />
          Flush Presentation Asset Cache
        </button>
      </div>
    </div>
  );
};

/* --- CHRONOLOGICAL TELEMETRY FORM --- */
const ChronologicalTelemetryForm = () => {
  const {
    slides,
    currentSlideIndex,
    currentBuildIndex,
    elapsedSeconds,
    timerMax,
    setTimerMax,
    next,
    prev
  } = useStorageStore();

  const currentSlide = slides[currentSlideIndex];
  const totalSlides = slides.length;

  // Format Elapsed & Countdown Time
  const formatTime = (totalSecs) => {
    const mins = Math.floor(Math.abs(totalSecs) / 60);
    const secs = Math.abs(totalSecs) % 60;
    const sign = totalSecs < 0 ? '-' : '';
    return `${sign}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingSeconds = timerMax - elapsedSeconds;

  // Dynamic Pacing Velocity Engine calculations:
  // PR = currentSlideIndex / totalSlides
  // Pacing Delta Seconds = Elapsed Seconds - (T_max * PR)
  const targetProgressRatio = totalSlides > 0 ? currentSlideIndex / totalSlides : 0;
  const pacingDelta = Math.round(elapsedSeconds - (timerMax * targetProgressRatio));

  let pacingStatus = 'ON TRACK';
  let pacingColor = 'text-green-500';
  let pacingBg = 'rgba(16,185,129,0.1)';
  let pacingBorder = 'rgba(16,185,129,0.3)';

  if (pacingDelta > 30) {
    pacingStatus = 'RUNNING SLOW (LAGGING)';
    pacingColor = 'text-rose-500';
    pacingBg = 'rgba(244,63,94,0.1)';
    pacingBorder = 'rgba(244,63,94,0.3)';
  } else if (pacingDelta < -30) {
    pacingStatus = 'RUNNING FAST (AHEAD)';
    pacingColor = 'text-blue-500';
    pacingBg = 'rgba(59,130,246,0.1)';
    pacingBorder = 'rgba(59,130,246,0.3)';
  }

  const handleTMaxChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setTimerMax(val * 60);
      localStorage.setItem('deck_sync_tmax', (val * 60).toString());
    }
  };

  return (
    <div className="bg-app-panel border rounded p-4 flex flex-col gap-4">
      {/* Slide Navigation and Counts */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
        <span className="text-zinc-400 font-bold times-12">Navigation Deck Controls</span>
        <span className="text-emerald-400 font-semibold times-12">
          Slide {currentSlideIndex + 1} of {totalSlides}
        </span>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={prev}
          disabled={currentSlideIndex === 0 && currentBuildIndex === 0}
          className="times-12 flex-1 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded disabled:opacity-40 transition"
        >
          <ChevronLeft size={16} />
          Prev
        </button>
        <button 
          onClick={next}
          disabled={currentSlideIndex === totalSlides - 1 && currentBuildIndex === (currentSlide?.bullets?.length || 0)}
          className="times-12 flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded disabled:opacity-40 font-bold transition"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Build step telemetry */}
      {currentSlide && (
        <div className="bg-app-dark p-2 border border-zinc-800 rounded flex justify-between items-center text-xs">
          <span className="text-zinc-500 times-12">Sub-step Build Progress:</span>
          <span className="text-zinc-300 font-mono times-12">
            Reveal {currentBuildIndex} of {currentSlide.bullets.length} bullets
          </span>
        </div>
      )}

      {/* Countdown and Timer HUD */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="bg-app-dark p-3 border rounded text-center">
          <span className="text-zinc-400 block mb-1 times-12">Session Elapsed</span>
          <span className="text-xl font-mono text-zinc-300 font-semibold block times-12">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        <div className="bg-app-dark p-3 border rounded text-center">
          <span className="text-zinc-400 block mb-1 times-12">Target Countdown</span>
          <span className={`text-xl font-mono font-semibold block times-12 ${remainingSeconds < 60 ? 'text-rose-500 animate-pulse' : 'text-zinc-300'}`}>
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      {/* Dynamic pacing warning bar */}
      <div 
        style={{
          backgroundColor: pacingBg,
          border: `1px solid ${pacingBorder}`,
          borderRadius: '4px',
          padding: '12px'
        }}
        className="flex flex-col gap-2"
      >
        <div className="flex justify-between items-center">
          <span className="text-zinc-400 times-12">Chronological Pacing Delta:</span>
          <span className={`font-mono font-bold times-12 ${pacingColor}`}>
            {pacingDelta > 0 ? `+${pacingDelta}` : pacingDelta}s
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-zinc-400 times-12">Pacing Status:</span>
          <span className={`font-bold times-12 ${pacingColor}`}>
            {pacingStatus}
          </span>
        </div>

        {/* Progress Bar visual indicator */}
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-1 relative">
          <div 
            className="h-full bg-emerald-600 transition" 
            style={{ width: `${Math.min(100, Math.max(0, targetProgressRatio * 100))}%` }}
          />
          {/* Timeline marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500" 
            style={{ left: `${Math.min(100, Math.max(0, (elapsedSeconds / timerMax) * 100))}%` }}
          />
        </div>
      </div>

      {/* Time Allocation Config */}
      <div className="flex items-center justify-between pt-1">
        <label className="text-zinc-400 times-12">T_max Allocation:</label>
        <div className="flex items-center gap-1.5">
          <input 
            type="number" 
            className="bg-app-dark border border-zinc-700 rounded px-2 py-1 text-right text-zinc-300 w-16 times-12"
            value={Math.round(timerMax / 60)} 
            onChange={handleTMaxChange}
            min="1"
            max="120"
          />
          <span className="text-zinc-500 times-12">mins</span>
        </div>
      </div>
    </div>
  );
};

/* --- SPEAKER NOTES MATRIX PANEL & NEXT PREVIEW --- */
const SpeakerNotesMatrixPanel = () => {
  const {
    slides,
    currentSlideIndex,
    layoutPreview
  } = useStorageStore();

  const currentSlide = slides[currentSlideIndex];
  const nextSlide = slides[currentSlideIndex + 1];

  // Markdown parsing helper for Speaker Notes (support bold and lists)
  const renderMarkdownNotes = (markdown = '') => {
    return markdown.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-zinc-200 mt-2 mb-1">{trimmed.substring(4)}</h3>;
      }
      if (trimmed.startsWith('- ')) {
        // support bold matching **text**
        const rawContent = trimmed.substring(2);
        const parts = rawContent.split(/\*\*(.*?)\*\*/g);
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-zinc-300 py-0.5 times-12">
            {parts.map((p, i) => (i % 2 === 1 ? <strong key={i} className="text-emerald-400 font-semibold">{p}</strong> : p))}
          </li>
        );
      }
      if (trimmed) {
        return <p key={idx} className="text-sm text-zinc-400 my-1 times-12">{trimmed}</p>;
      }
      return <div key={idx} className="h-2" />;
    });
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      
      {/* Speaker Notes */}
      <div className="flex-1 bg-app-panel border rounded p-4 flex flex-col min-h-0">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
          <span className="text-zinc-400 font-bold times-12">Active Slide Speaker Notes</span>
          <span className="text-zinc-500 text-xs times-12">Markdown Parser Engine</span>
        </div>
        <div className="flex-1 overflow-y-auto bg-app-dark p-3 rounded border border-zinc-900 select-text">
          {currentSlide ? renderMarkdownNotes(currentSlide.notes) : <p className="text-zinc-500 italic times-12">No slides found</p>}
        </div>
      </div>

      {/* Flanked upcoming slide preview map */}
      {layoutPreview && (
        <div className="w-full lg:w-80 bg-app-panel border rounded p-4 flex flex-col shrink-0 min-h-0">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-3">
            <span className="text-zinc-400 font-bold times-12">Upcoming Deck Map</span>
            <span className="text-zinc-500 text-xs times-12">Rehearsal Scan</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {nextSlide ? (
              <div className="bg-app-dark border border-zinc-800 rounded p-3 opacity-80 hover:opacity-100 transition relative">
                <span className="absolute top-2 right-2 bg-zinc-800 text-zinc-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Slide {currentSlideIndex + 2}
                </span>
                <span className="text-xs text-zinc-500 uppercase block mb-1 times-12">Next Slide</span>
                <h4 className="text-sm font-bold text-zinc-200 truncate mb-1">{nextSlide.title}</h4>
                <p className="text-xs text-zinc-400 truncate mb-2">{nextSlide.subtitle}</p>

                {/* Sub list indicators */}
                <div className="space-y-1">
                  {nextSlide.bullets.slice(0, 2).map((b, i) => (
                    <div key={i} className="flex items-start gap-1 text-[11px] text-zinc-500">
                      <span className="text-emerald-500">•</span>
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                  {nextSlide.bullets.length > 2 && (
                    <div className="text-[10px] text-zinc-600 pl-3">
                      + {nextSlide.bullets.length - 2} more bullet items...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-app-dark/40 border border-dashed border-zinc-850 rounded p-6 text-center">
                <p className="text-zinc-600 italic text-xs times-12">End of presentation deck</p>
              </div>
            )}

            {/* Rest of slides loop */}
            {slides.slice(currentSlideIndex + 2).map((slide, idx) => (
              <div key={slide.id} className="bg-app-dark/60 border border-zinc-900 rounded p-3 opacity-60">
                <span className="text-[10px] text-zinc-600 font-bold block mb-0.5">
                  Slide {currentSlideIndex + idx + 3}
                </span>
                <h4 className="text-xs font-semibold text-zinc-400 truncate">{slide.title}</h4>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
