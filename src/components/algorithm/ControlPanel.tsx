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
    <div className="bg-[#0c0c0e] border-t border-[#1f1f23] p-4">
      {/* Step Description */}
      <div className="flex items-start gap-3 mb-4 bg-[#141416] rounded-lg p-3" data-testid="step-description">
        <div className="flex-shrink-0 w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center text-black font-bold text-sm">
          {currentStep}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[#22c55e] text-xs font-semibold uppercase tracking-wider mb-1">What&apos;s happening:</div>
          <p className="text-white text-sm">{currentDescription}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3" data-testid="animation-controls">
        <button
          onClick={onPlay}
          className="p-2 bg-[#22c55e] rounded-lg hover:bg-[#16a34a] transition-colors text-black"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          data-testid="play-pause-btn"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="p-2 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Step (←)"
          data-testid="prev-step-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          className="p-2 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Step (→)"
          data-testid="next-step-btn"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        {/* Slider */}
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min="0"
            max={Math.max(totalSteps - 1, 0)}
            value={currentStep}
            onChange={onSliderChange}
            className="flex-1 h-1.5 bg-[#1f1f23] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#22c55e] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
            data-testid="step-slider"
          />
          <span className="text-gray-400 text-sm whitespace-nowrap" data-testid="step-counter">
            {currentStep} / {Math.max(totalSteps - 1, 0)}
          </span>
        </div>
        
        {/* Speed Control */}
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="bg-[#1f1f23] text-white text-sm px-3 py-2 rounded-lg border-none outline-none cursor-pointer"
          data-testid="speed-selector"
        >
          <option value="0.5">Slow</option>
          <option value="1">Normal</option>
          <option value="1.5">Fast</option>
          <option value="2">Very Fast</option>
        </select>

        {/* Fullscreen button */}
        <button
          onClick={onFullScreen}
          className="p-2 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white"
          title="Full Screen (F)"
          data-testid="fullscreen-btn"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Keyboard shortcuts hint */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500" data-testid="keyboard-hints">
        <span>Keyboard:</span>
        <span className="bg-[#1f1f23] px-2 py-0.5 rounded">Space</span>
        <span>Play/Pause</span>
        <span className="bg-[#1f1f23] px-2 py-0.5 rounded">← →</span>
        <span>Prev/Next</span>
        <span className="bg-[#1f1f23] px-2 py-0.5 rounded">R</span>
        <span>Reset</span>
        <span className="bg-[#1f1f23] px-2 py-0.5 rounded">F</span>
        <span>Fullscreen</span>
      </div>
    </div>
  );
};

export default ControlPanel;
