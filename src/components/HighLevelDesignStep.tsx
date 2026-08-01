'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize2, Minimize2, Layers, ZoomIn, ZoomOut, Mic, Square, Loader2, LayoutGrid } from 'lucide-react';
import { api } from '@/lib/api';
import { showError } from '@/lib/toast';
import TemplateLibrary from './TemplateLibrary';

interface ExcalidrawElement {
  id?: string;
  [key: string]: unknown;
}

interface ExcalidrawAppState {
  theme?: string;
  viewBackgroundColor?: string;
  currentItemStrokeWidth?: number;
  currentItemStrokeColor?: string;
  currentItemRoughness?: number;
  currentItemFontSize?: number;
  zoom?: { value?: number };
}

interface ExcalidrawAPI {
  getAppState?: () => Partial<ExcalidrawAppState> | undefined;
  updateScene: (data: { appState?: Partial<ExcalidrawAppState>; elements?: ExcalidrawElement[] }) => void;
  getSceneElements?: () => ExcalidrawElement[];
  scrollToContent?: (element?: unknown, opts?: { fitToViewport?: boolean; viewportZoomFactor?: number }) => void;
}

interface ExcalidrawInitialData {
  appState: Partial<ExcalidrawAppState>;
  elements?: ExcalidrawElement[];
}

interface ExcalidrawCanvasProps {
  excalidrawAPI?: (api: ExcalidrawAPI) => void;
  theme?: string;
  onChange?: (elements: readonly ExcalidrawElement[], appState: ExcalidrawAppState) => void;
  initialData?: ExcalidrawInitialData;
  UIOptions?: { canvasActions?: { loadScene?: boolean; saveToActiveFile?: boolean; export?: boolean } };
}

interface TemplateLibraryElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  strokeColor: string;
  backgroundColor: string;
  fillStyle: string;
  strokeWidth: number;
  roughness: number;
  opacity: number;
  groupIds: string[];
  frameId: string | null;
  index: string;
  roundness: { type: number } | null;
  isDeleted: boolean;
  boundElements: { id: string; type: string }[] | null;
  locked: boolean;
  link: string | null;
  updated: number;
  seed: number;
  version: number;
  versionNonce: number;
  [key: string]: unknown;
}

interface TemplateLibraryExcalidrawAPI {
  getAppState?: () => { scrollX: number; scrollY: number; zoom: { value: number } } | undefined;
  getSceneElements?: () => TemplateLibraryElement[];
  updateScene?: (data: { elements: TemplateLibraryElement[] }) => void;
}

type ExcalidrawComponentType = React.ComponentType<ExcalidrawCanvasProps>;

let ExcalidrawComponent: ExcalidrawComponentType | null = null;
let excalidrawLoaded = false;

interface SessionData {
  answers?: {
    'high-level'?: {
      content?: string;
      elements?: string;
    };
  };
}

interface HighLevelDesignStepProps {
  session: SessionData;
  onSave: (data: { content: string; elements: string }) => void;
}

const HighLevelDesignStep: React.FC<HighLevelDesignStepProps> = ({ session, onSave }) => {
  const [loaded, setLoaded] = useState(excalidrawLoaded);
  const [fullscreen, setFullscreen] = useState(false);
  const saved = session?.answers?.['high-level'] || {};
  const [explanation, setExplanation] = useState(saved.content || '');
  const excalidrawRef = useRef<ExcalidrawAPI | null>(null);
  const elementsRef = useRef<ExcalidrawElement[] | null>(null);
  const appStateRef = useRef<ExcalidrawAppState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);

  const [voiceTab, setVoiceTab] = useState('text');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (excalidrawLoaded) return;
    Promise.all([
      import('@excalidraw/excalidraw'),
      import('@excalidraw/excalidraw/index.css'),
    ]).then(([mod]) => {
      ExcalidrawComponent = mod.Excalidraw as unknown as ExcalidrawComponentType;
      excalidrawLoaded = true;
      setLoaded(true);
    }).catch((err) => { console.error('Excalidraw load error:', err); });
  }, []);

  useEffect(() => {
    if (saved.elements && !elementsRef.current) {
      try { elementsRef.current = JSON.parse(saved.elements); } catch {}
    }
  }, [saved.elements]);

  const bgFixedRef = useRef(false);
  const mountRetryRef = useRef(0);

  const forceExcalidrawSettings = useCallback((api: ExcalidrawAPI) => {
    if (!api) return;
    try {
      const appState = api.getAppState?.();
      const needsBgFix = !appState || appState.viewBackgroundColor !== '#161b22';
      const needsStrokeFix = !appState || appState.currentItemStrokeColor !== '#c9d1d9';

      if (needsBgFix || needsStrokeFix) {
        api.updateScene({
          appState: {
            viewBackgroundColor: '#161b22',
            currentItemStrokeWidth: 1,
            currentItemStrokeColor: '#c9d1d9',
            currentItemRoughness: 0,
            currentItemFontSize: 16,
          },
        });
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleExcalidrawChange = useCallback((elements: readonly ExcalidrawElement[], appState: ExcalidrawAppState) => {
    elementsRef.current = elements.map((e) => ({ ...e }));
    appStateRef.current = appState;

    if (!bgFixedRef.current) {
      const api = excalidrawRef.current;
      if (api && appState?.viewBackgroundColor === '#161b22') {
        bgFixedRef.current = true;
      } else if (api) {
        forceExcalidrawSettings(api);
      }
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSave({ content: explanation, elements: JSON.stringify(elementsRef.current) });
    }, 2000);
  }, [explanation, onSave, forceExcalidrawSettings]);

  const handleExplanationChange = (val: string) => {
    setExplanation(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onSave({ content: val, elements: JSON.stringify(elementsRef.current || []) });
    }, 1000);
  };

  const snapshotState = () => {
    const api = excalidrawRef.current;
    if (!api) return;
    if (api.getSceneElements) {
      elementsRef.current = api.getSceneElements().map((e) => ({ ...e }));
    }
  };

  const toggleFullscreen = () => {
    snapshotState();
    setFullscreen(f => !f);
    setRenderKey(k => k + 1);
  };

  const handleZoom = (delta: number) => {
    const api = excalidrawRef.current;
    if (!api) return;
    const appState = api.getAppState?.();
    if (!appState) return;
    const currentZoom = appState.zoom?.value || 1;
    const newZoom = Math.max(0.1, Math.min(5, currentZoom + delta));
    api.updateScene({
      appState: { zoom: { value: newZoom } },
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      showError('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const transcribeAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'recording.webm');
      const res = await api.post<{ text: string }>('/system-design/transcribe', formData);
      const text = res.data.text || '';
      if (text) {
        const updated = explanation ? `${explanation}\n${text}` : text;
        setExplanation(updated);
        onSave({ content: updated, elements: JSON.stringify(elementsRef.current || []) });
      }
    } catch {
      showError('Transcription failed. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const getInitialData = () => {
    const data: ExcalidrawInitialData = {
      appState: {
        theme: 'dark',
        currentItemStrokeWidth: 1,
        currentItemStrokeColor: '#c9d1d9',
        currentItemFontSize: 16,
        currentItemRoughness: 0,
        viewBackgroundColor: '#161b22',
      },
    };
    if (saved.elements) {
      try {
        const parsed = JSON.parse(saved.elements);
        if (parsed?.length) data.elements = parsed;
      } catch {}
    }
    return data;
  };

  const handleExcalidrawMount = useCallback((api: ExcalidrawAPI) => {
    excalidrawRef.current = api;
    bgFixedRef.current = false;
    mountRetryRef.current = 0;

    const tryFix = () => {
      if (mountRetryRef.current > 10) return;
      mountRetryRef.current++;
      const fixed = forceExcalidrawSettings(api);
      if (!fixed) {
        setTimeout(tryFix, mountRetryRef.current * 200);
      } else {
        bgFixedRef.current = true;
        if (api.scrollToContent && elementsRef.current?.length) {
          api.scrollToContent(undefined, { fitToViewport: true, viewportZoomFactor: 0.8 });
        }
      }
    };

    setTimeout(tryFix, 100);
  }, [forceExcalidrawSettings]);

  const excalidrawCanvas = (
    <div className="flex-1 flex" style={{ minHeight: 0 }}>
      {showTemplates && (
        <div className="w-44 shrink-0 border-r border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
          <TemplateLibrary excalidrawRef={excalidrawRef as unknown as React.RefObject<TemplateLibraryExcalidrawAPI | null>} elementsRef={elementsRef as unknown as React.RefObject<TemplateLibraryElement[]>} />
        </div>
      )}
      <div className="flex-1" style={{ minHeight: 0 }}>
        {loaded && ExcalidrawComponent ? (
          <ExcalidrawComponent
            key={renderKey}
            excalidrawAPI={handleExcalidrawMount}
            theme="dark"
            onChange={handleExcalidrawChange}
            initialData={getInitialData()}
            UIOptions={{
              canvasActions: { loadScene: false, saveToActiveFile: false, export: false },
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );

  const whiteboardHeader = (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#2d333b] shrink-0" style={{ backgroundColor: '#1c2128' }}>
      <div className="flex items-center gap-2">
        <Layers size={14} className="text-[#f97316]" />
        <span className="text-sm font-semibold text-white">High-Level Design Whiteboard</span>
      </div>
      <div className="flex items-center gap-1">
        <button data-testid="hld-templates-toggle" onClick={() => setShowTemplates(s => !s)}
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors ${showTemplates ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'text-[#8b949e] hover:text-white hover:bg-[#2d333b]'}`}>
          <LayoutGrid size={12} />
          <span className="hidden sm:inline">Templates</span>
        </button>
        <div className="w-px h-4 bg-[#2d333b] mx-0.5" />
        <button data-testid="hld-zoom-out" onClick={() => handleZoom(-0.15)}
          className="text-[#8b949e] hover:text-white transition-colors p-1 rounded hover:bg-[#2d333b]">
          <ZoomOut size={14} />
        </button>
        <button data-testid="hld-zoom-in" onClick={() => handleZoom(0.15)}
          className="text-[#8b949e] hover:text-white transition-colors p-1 rounded hover:bg-[#2d333b]">
          <ZoomIn size={14} />
        </button>
        <div className="w-px h-4 bg-[#2d333b] mx-0.5" />
        <button data-testid="hld-fullscreen" onClick={toggleFullscreen}
          className="text-[#8b949e] hover:text-white transition-colors p-1 rounded hover:bg-[#2d333b]">
          {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#161b22' }}>
        {whiteboardHeader}
        {excalidrawCanvas}
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0">
        <div className="rounded-xl border border-[#2d333b] overflow-hidden flex flex-col" style={{ backgroundColor: '#161b22', height: '520px' }}>
          {whiteboardHeader}
          {excalidrawCanvas}
        </div>
      </div>

      <div className="w-72 shrink-0">
        <div className="rounded-xl border border-[#2d333b] flex flex-col" style={{ backgroundColor: '#161b22', height: '520px' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#2d333b]" style={{ backgroundColor: '#1c2128' }}>
            <div className="w-4 h-4 rounded-full bg-[#f97316] flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">!</span>
            </div>
            <span className="text-sm font-semibold text-white">Explain Your Architecture</span>
          </div>

          <div className="px-3 pt-2 pb-1 flex gap-1">
            <button data-testid="hld-tab-text" onClick={() => setVoiceTab('text')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${voiceTab === 'text' ? 'bg-[#22c55e] text-white' : 'text-[#8b949e] bg-[#0d1117] border border-[#2d333b]'}`}>
              Text
            </button>
            <button data-testid="hld-tab-voice" onClick={() => setVoiceTab('voice')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${voiceTab === 'voice' ? 'bg-[#22c55e] text-white' : 'text-[#8b949e] bg-[#0d1117] border border-[#2d333b]'}`}>
              Voice
            </button>
          </div>

          <div className="flex-1 p-3 min-h-0 flex flex-col">
            {voiceTab === 'text' ? (
              <textarea
                data-testid="hld-explanation"
                value={explanation}
                onChange={e => handleExplanationChange(e.target.value)}
                placeholder={"Explain your architecture design...\nExample: 'I'm using a load balancer to distribute traffic across multiple web servers...'"}
                className="w-full flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58] resize-none leading-relaxed"
              />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 gap-4">
                {transcribing ? (
                  <>
                    <Loader2 size={28} className="text-[#22c55e] animate-spin" />
                    <p className="text-xs text-[#8b949e]">Transcribing...</p>
                  </>
                ) : recording ? (
                  <>
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
                    </div>
                    <p className="text-xs text-red-400 font-medium">Recording...</p>
                    <button data-testid="hld-stop-record" onClick={stopRecording}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">
                      <Square size={10} /> Stop Recording
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border-2 border-dashed border-[#22c55e]/30 flex items-center justify-center">
                      <Mic size={24} className="text-[#22c55e]" />
                    </div>
                    <p className="text-xs text-[#8b949e] text-center px-2">
                      Click to start recording your architecture explanation
                    </p>
                    <button data-testid="hld-start-record" onClick={startRecording}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors">
                      <Mic size={12} /> Start Recording
                    </button>
                  </>
                )}

                {explanation && (
                  <div className="w-full mt-2 max-h-32 overflow-y-auto">
                    <p className="text-[10px] text-[#484f58] mb-1">Transcribed text:</p>
                    <p className="text-xs text-[#c9d1d9] bg-[#0d1117] rounded-lg p-2 border border-[#2d333b] leading-relaxed">{explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighLevelDesignStep;
