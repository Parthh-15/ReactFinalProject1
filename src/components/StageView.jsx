import React from 'react';
import { useStorageStore } from '../store/presentationStore';

export const StageView = () => {
  const {
    slides,
    currentSlideIndex,
    currentBuildIndex,
    laserPointer
  } = useStorageStore();

  const currentSlide = slides[currentSlideIndex];

  if (!currentSlide) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-zinc-500 font-mono">
        <div className="animate-pulse times-12">WAITING FOR PRESENTATION STATE...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative flex select-none">
      
      {/* Target Stage Canvas Viewport */}
      <div className="flex-1 flex flex-col justify-between p-12 relative">
        
        {/* Top Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-zinc-500 uppercase tracking-widest text-xs font-mono times-12">
              Audience View // Stage Mode
            </h1>
            <h2 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
              {currentSlide.title}
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              {currentSlide.subtitle}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1 text-right">
            <span className="text-zinc-500 text-[10px] uppercase font-mono block times-12">Slide Index</span>
            <span className="text-emerald-400 font-bold text-sm times-12">
              {currentSlideIndex + 1} / {slides.length}
            </span>
          </div>
        </div>

        {/* Center Presentation Layer */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-0 py-6">
          
          {/* Progressive List Builds */}
          <div className="flex flex-col justify-center space-y-4">
            <ul className="space-y-3">
              {currentSlide.bullets.map((bullet, idx) => {
                const isVisible = idx < currentBuildIndex;
                return (
                  <li 
                    key={idx}
                    className="flex items-start gap-3 transition-all duration-500 ease-in-out"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                      pointerEvents: isVisible ? 'auto' : 'none'
                    }}
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2.5 shrink-0" />
                    <span className="text-zinc-200 text-lg leading-relaxed font-medium">
                      {bullet}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* SVG Vector Drawing Layer */}
          <div className="w-full h-full min-h-[300px] border border-zinc-900 bg-zinc-950/40 rounded-lg flex items-center justify-center p-4 relative overflow-hidden">
            <SlideAssetViewport vectors={currentSlide.vectors} />
          </div>

        </div>

        {/* Bottom footer bar */}
        <div className="flex justify-between items-center text-zinc-600 text-xs font-mono border-t border-zinc-950 pt-4">
          <span className="times-12">Dual-Screen Sync Engine // Secure Sandbox</span>
          <span className="times-12">No Server Latency</span>
        </div>

        {/* Virtual laser pointer rendering */}
        {laserPointer && (
          <div 
            className="absolute rounded-full pointer-events-none bg-rose-500 shadow-[0_0_15px_10px_rgba(239,68,68,0.6)]"
            style={{
              width: '16px',
              height: '16px',
              left: `calc(12px + ${(laserPointer.x / 800) * (window.innerWidth - 24)}px)`,
              top: `calc(12px + ${(laserPointer.y / 600) * (window.innerHeight - 24)}px)`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.05s ease-out, top 0.05s ease-out',
              zIndex: 9999
            }}
          />
        )}

      </div>
    </div>
  );
};

/* --- SLIDE ASSET VIEWPORT CANVAS --- */
const SlideAssetViewport = ({ vectors = [] }) => {
  return (
    <svg 
      viewBox="0 0 800 600" 
      className="w-full h-full max-h-[500px]"
    >
      <defs>
        <radialGradient id="greenGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="purpleGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer bounds */}
      <rect width="800" height="600" rx="12" fill="#09090b" stroke="#18181b" strokeWidth="2" />

      {/* Grid Lines */}
      <path d="M 0 100 H 800 M 0 200 H 800 M 0 300 H 800 M 0 400 H 800 M 0 500 H 800" stroke="#18181b" strokeWidth="1" />
      <path d="M 100 0 V 600 M 200 0 V 600 M 300 0 V 600 M 400 0 V 600 M 500 0 V 600 M 600 0 V 600 M 700 0 V 600" stroke="#18181b" strokeWidth="1" />

      {/* Render Dynamic Shapes */}
      {vectors.map((vec, i) => {
        if (vec.type === 'rect') {
          return (
            <g key={i}>
              <rect 
                x={vec.x - 10} 
                y={vec.y - 10} 
                width={vec.width + 20} 
                height={vec.height + 20} 
                fill={vec.stroke === '#34d399' ? 'url(#greenGlow)' : 'url(#purpleGlow)'} 
                opacity="0.5"
              />
              <rect 
                x={vec.x} 
                y={vec.y} 
                width={vec.width} 
                height={vec.height} 
                fill={vec.fill} 
                stroke={vec.stroke} 
                strokeWidth="2" 
                rx={vec.rx} 
                className="transition-all duration-300"
              />
            </g>
          );
        } else if (vec.type === 'circle') {
          return (
            <circle 
              key={i} 
              cx={vec.cx} 
              cy={vec.cy} 
              r={vec.r} 
              fill={vec.fill} 
              stroke={vec.stroke} 
              strokeWidth="2" 
              className="transition-all duration-300"
            />
          );
        } else if (vec.type === 'line') {
          return (
            <line 
              key={i} 
              x1={vec.x1} 
              y1={vec.y1} 
              x2={vec.x2} 
              y2={vec.y2} 
              stroke={vec.stroke} 
              strokeWidth={vec.strokeWidth} 
              strokeDasharray={vec.strokeDasharray} 
              className="transition-all duration-300"
            />
          );
        } else if (vec.type === 'polygon') {
          return (
            <polygon 
              key={i} 
              points={vec.points} 
              fill={vec.fill} 
              stroke={vec.stroke} 
              strokeWidth="2" 
              className="transition-all duration-300"
            />
          );
        } else if (vec.type === 'path') {
          return (
            <path 
              key={i} 
              d={vec.d} 
              fill="none" 
              stroke={vec.stroke} 
              strokeWidth={vec.strokeWidth} 
              className="transition-all duration-300"
            />
          );
        }
        return null;
      })}
    </svg>
  );
};
