'use client';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSliderChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onFullScreen: () => void;
  currentDescription: string;
}

const ControlPanel = ({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPrev,
  onNext,
  onSliderChange,
  onReset,
  onSpeedChange,
  onFullScreen,
  currentDescription
}: ControlPanelProps) => {
  return (
    <div className="bg-[#0c0c0e] border-t border-[#1f1f23] px-4 py-3" data-testid="control-panel">
      {/* Step Description */}
      <div className="flex items-start gap-2.5 mb-3 bg-[#141416] rounded-lg px-3 py-2" data-testid="step-description">
        <div className="flex-shrink-0 w-7 h-7 bg-[#22c55e] rounded-full flex items-center justify-center text-black font-bold text-xs">
          {currentStep}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#22c55e] text-[10px] font-semibold uppercase tracking-wider mb-0.5">What&apos;s happening:</div>
          <p className="text-white text-xs leading-relaxed line-clamp-2">{currentDescription}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2" data-testid="animation-controls">
        <button
          onClick={onPlay}
          className="p-1.5 bg-[#22c55e] rounded-lg hover:bg-[#16a34a] transition-colors text-black"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          data-testid="play-pause-btn"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="p-1.5 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Step (←)"
          data-testid="prev-step-btn"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          className="p-1.5 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Step (→)"
          data-testid="next-step-btn"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        {/* Slider */}
        <div className="flex-1 flex items-center gap-2">
          <input
            type="range"
            min="0"
            max={Math.max(totalSteps - 1, 0)}
            value={currentStep}
            onChange={onSliderChange}
            className="flex-1 h-1.5 bg-[#1f1f23] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#22c55e] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            data-testid="step-slider"
          />
          <span className="text-gray-400 text-xs whitespace-nowrap" data-testid="step-counter">
            {currentStep}/{Math.max(totalSteps - 1, 0)}
          </span>
        </div>
        
        {/* Speed Control */}
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="bg-[#1f1f23] text-white text-xs px-2 py-1.5 rounded-lg border-none outline-none cursor-pointer"
          data-testid="speed-selector"
        >
          <option value="0.5">0.5x</option>
          <option value="1">1x</option>
          <option value="1.5">1.5x</option>
          <option value="2">2x</option>
        </select>

        <button
          onClick={onReset}
          className="p-1.5 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white"
          title="Reset (R)"
          data-testid="reset-btn"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 4v6h6M23 20v-6h-6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          onClick={onFullScreen}
          className="p-1.5 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white"
          title="Full Screen (F)"
          data-testid="fullscreen-btn"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard shortcuts hint - single compact line */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600" data-testid="keyboard-hints">
        <span className="bg-[#1f1f23] px-1.5 py-px rounded text-gray-500">Space</span><span>Play</span>
        <span className="bg-[#1f1f23] px-1.5 py-px rounded text-gray-500">←→</span><span>Step</span>
        <span className="bg-[#1f1f23] px-1.5 py-px rounded text-gray-500">R</span><span>Reset</span>
        <span className="bg-[#1f1f23] px-1.5 py-px rounded text-gray-500">F</span><span>Fullscreen</span>
      </div>
    </div>
  );
};

export default ControlPanel;
