import { create } from 'zustand';

// Pre-seeded slides with rich content: text, progressive bullet points, visual SVG vectors, and markdown speaker notes
const INITIAL_SLIDES = [
  {
    id: 1,
    title: 'Dual-Screen Presentation Engine',
    subtitle: 'Zero latency client-side state replication',
    bullets: [
      'High-speed message-passing pipeline over BroadcastChannel API',
      'In-memory chronological pacing feedback loop',
      'Progressive bullet animation compiler for sequential builds',
      'No server, zero network latency, 100% data privacy'
    ],
    vectors: [
      { type: 'rect', x: 200, y: 150, width: 220, height: 120, fill: '#064e3b', stroke: '#34d399', rx: 8 },
      { type: 'rect', x: 500, y: 150, width: 220, height: 120, fill: '#1e1b4b', stroke: '#818cf8', rx: 8 },
      { type: 'line', x1: 420, y1: 210, x2: 500, y2: 210, stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '5,5' },
      { type: 'circle', cx: 460, cy: 210, r: 12, fill: '#fbbf24' }
    ],
    notes: `### Slide 1: Welcome & Overview
- Introduce the core architectural concept of the Dual-Screen Sync Engine.
- Emphasize the **BroadcastChannel API** which operates entirely in the browser context.
- Mention the local pacing calculator. Keep this introduction under **90 seconds**.`
  },
  {
    id: 2,
    title: 'State Replication Architecture',
    subtitle: 'Mesh Topology without WebSocket Servers',
    bullets: [
      'Transactional event replication via browser-mesh design',
      'Avoids network stack overhead to achieve sub-millisecond dispatch',
      'LocalStorage backup keeps decks, themes and timings safe',
      'Optimized 60fps render matrix handles vector shapes and coordinates'
    ],
    vectors: [
      { type: 'circle', cx: 250, cy: 200, r: 40, fill: '#18181b', stroke: '#a1a1aa' },
      { type: 'circle', cx: 460, cy: 200, r: 45, fill: '#022c22', stroke: '#34d399' },
      { type: 'circle', cx: 670, cy: 200, r: 40, fill: '#18181b', stroke: '#a1a1aa' },
      { type: 'path', d: 'M 290 200 L 415 200 M 505 200 L 630 200', stroke: '#f43f5e', strokeWidth: 2 }
    ],
    notes: `### Slide 2: Tech Stack Details
- Discuss why we bypass WebSockets: zero server cost, works offline, infinite scale.
- Explain the **BroadcastChannel** event pipeline.
- Detail state replication using **Zustand** stores across independent browser viewports.`
  },
  {
    id: 3,
    title: 'Chronological Telemetry & Pacing',
    subtitle: 'Algorithmic Progress tracking vs T_max allocation',
    bullets: [
      'Real-time pacing indicator based on current progression curve',
      'Target Progress Ratio (PR) = Current Index / Total Slides',
      'Pacing Delta = Elapsed Seconds - (T_max * PR)',
      'Subtle warning warnings alert speakers of timeline overruns'
    ],
    vectors: [
      { type: 'rect', x: 200, y: 160, width: 500, height: 30, fill: '#27272a', rx: 6 },
      { type: 'rect', x: 200, y: 160, width: 320, height: 30, fill: '#10b981', rx: 6 },
      { type: 'line', x1: 450, y1: 140, x2: 450, y2: 210, stroke: '#fbbf24', strokeWidth: 3 }
    ],
    notes: `### Slide 3: Telemetry & Algorithms
- Explain the pacing delta formula: $Delta = Elapsed - (T_{max} \\times PR)$.
- Positive delta means you are *behind* schedule (elapsed exceeds allocated budget).
- Negative delta means you are *ahead* or exactly on schedule.`
  },
  {
    id: 4,
    title: 'Live Interactive Canvas Rendering',
    subtitle: 'Vector shape drawing and Laser Pointer sync',
    bullets: [
      'High-definition SVG node layout render matrix',
      'Laser pointer coordinates synced instantly across display windows',
      'Interactive control features built straight into Presenter Dashboard',
      'Extensible design allows direct slide asset customization'
    ],
    vectors: [
      { type: 'polygon', points: '450,130 500,230 400,230', fill: '#1e3a8a', stroke: '#3b82f6' },
      { type: 'circle', cx: 450, cy: 190, r: 25, fill: '#7f1d1d', stroke: '#ef4444' }
    ],
    notes: `### Slide 4: Drawing & Pointer
- Demo the laser pointer movement on the Presenter Console.
- Show how the pointer coordinates are broadcasted instantly to the Stage View canvas.
- Encourage users to load their own JSON deck script.`
  }
];

// Initialize Broadcast Channel
const syncChannel = new BroadcastChannel('deck_sync_bus');

export const useStorageStore = create((set, get) => {
  // Listen for broadcast sync messages (used primarily by the Audience/Stage window)
  syncChannel.onmessage = (event) => {
    const { type, payload, timestamp } = event.data;
    const now = performance.now();
    const latency = now - timestamp;

    if (type === 'SYNC_STATE') {
      set({
        currentSlideIndex: payload.currentSlideIndex,
        currentBuildIndex: payload.currentBuildIndex,
        laserPointer: payload.laserPointer,
        elapsedSeconds: payload.elapsedSeconds,
        timerMax: payload.timerMax,
        slides: payload.slides,
        broadcastLatency: Math.max(0, Math.min(100, latency))
      });
      get().logTelemetry('RECEIVE_SYNC', latency);
    } else if (type === 'LASER_MOVE') {
      set({
        laserPointer: payload.laserPointer,
        broadcastLatency: Math.max(0, Math.min(100, latency))
      });
      get().logTelemetry('LASER_UPDATE', latency);
    }
  };

  return {
    // Presentation State
    slides: INITIAL_SLIDES,
    currentSlideIndex: 0,
    currentBuildIndex: 0,
    elapsedSeconds: 0,
    timerMax: 600, // 10 minutes default
    laserPointer: null,
    isPlaying: false,
    layoutPreview: true,

    // Performance Metrics
    messageThroughput: 0,
    broadcastLatency: 0.8, // initial mock latency in ms
    nodeCount: 14,
    assetMemoryWeight: 1850, // in bytes
    telemetryLogs: [],

    // Helpers
    logTelemetry: (type, latency = 0.5) => {
      const logs = [...get().telemetryLogs];
      const newLog = {
        time: new Date().toLocaleTimeString(),
        type,
        latency: parseFloat(latency.toFixed(2)),
        size: JSON.stringify(get().slides).length
      };
      if (logs.length > 30) logs.shift();
      logs.push(newLog);

      // Estimate nodes and memory footprint
      const currentSlide = get().slides[get().currentSlideIndex];
      const activeNodes = (currentSlide?.bullets?.length || 0) + (currentSlide?.vectors?.length || 0) + 10;

      set({
        telemetryLogs: logs,
        messageThroughput: get().messageThroughput + 1,
        nodeCount: activeNodes,
        assetMemoryWeight: JSON.stringify(get().slides).length
      });
    },

    broadcastState: () => {
      const state = {
        currentSlideIndex: get().currentSlideIndex,
        currentBuildIndex: get().currentBuildIndex,
        laserPointer: get().laserPointer,
        elapsedSeconds: get().elapsedSeconds,
        timerMax: get().timerMax,
        slides: get().slides
      };
      syncChannel.postMessage({
        type: 'SYNC_STATE',
        payload: state,
        timestamp: performance.now()
      });
    },

    broadcastLaser: (coords) => {
      syncChannel.postMessage({
        type: 'LASER_MOVE',
        payload: { laserPointer: coords },
        timestamp: performance.now()
      });
    },

    // Actions
    setSlides: (newSlides) => {
      set({ slides: newSlides, currentSlideIndex: 0, currentBuildIndex: 0 });
      get().broadcastState();
      get().logTelemetry('SET_SLIDES');
    },

    next: () => {
      const { slides, currentSlideIndex, currentBuildIndex } = get();
      const slide = slides[currentSlideIndex];
      if (!slide) return;

      if (currentBuildIndex < slide.bullets.length) {
        set({ currentBuildIndex: currentBuildIndex + 1 });
      } else if (currentSlideIndex < slides.length - 1) {
        set({ currentSlideIndex: currentSlideIndex + 1, currentBuildIndex: 0 });
      }
      get().broadcastState();
      get().logTelemetry('NAVIGATE_NEXT');
    },

    prev: () => {
      const { slides, currentSlideIndex, currentBuildIndex } = get();
      if (currentBuildIndex > 0) {
        set({ currentBuildIndex: currentBuildIndex - 1 });
      } else if (currentSlideIndex > 0) {
        const prevSlide = slides[currentSlideIndex - 1];
        set({ currentSlideIndex: currentSlideIndex - 1, currentBuildIndex: prevSlide.bullets.length });
      }
      get().broadcastState();
      get().logTelemetry('NAVIGATE_PREV');
    },

    setLaserPointer: (coords) => {
      set({ laserPointer: coords });
      get().broadcastLaser(coords);
    },

    resetTimer: () => {
      set({ elapsedSeconds: 0 });
      get().broadcastState();
      get().logTelemetry('RESET_TIMER');
    },

    tickTimer: () => {
      set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
      // Tick does not need to broadcast at 1fps unless we want absolute sync. Let's broadcast state on tick.
      get().broadcastState();
    },

    setTimerMax: (max) => {
      set({ timerMax: max });
      get().broadcastState();
      get().logTelemetry('SET_TMAX');
    },

    toggleLayoutPreview: () => {
      set((state) => ({ layoutPreview: !state.layoutPreview }));
      get().logTelemetry('TOGGLE_LAYOUT');
    },

    flushCache: () => {
      localStorage.clear();
      set({ slides: INITIAL_SLIDES, currentSlideIndex: 0, currentBuildIndex: 0, elapsedSeconds: 0 });
      get().broadcastState();
      get().logTelemetry('FLUSH_CACHE');
    },

    refreshSchemaStructure: async () => {
      // LocalStorage Deck sync
      const savedSlides = localStorage.getItem('deck_sync_slides');
      const savedTMax = localStorage.getItem('deck_sync_tmax');
      if (savedSlides) {
        try {
          set({ slides: JSON.parse(savedSlides) });
        } catch (e) {
          console.error(e);
        }
      }
      if (savedTMax) {
        set({ timerMax: parseInt(savedTMax, 10) });
      }
      get().broadcastState();
    }
  };
});
