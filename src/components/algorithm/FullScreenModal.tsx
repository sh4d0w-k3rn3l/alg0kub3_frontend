'use client';
import { Play, Pause, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Algorithms that use box visualization
const BOX_VISUALIZATION_ALGORITHMS = [
  'majority-element', 'move-zeroes', 'remove-duplicates', 
  'two-sum-ii', 'valid-palindrome', 'single-number'
];

interface AlgorithmInfo {
  title: string;
  [key: string]: any;
}

interface FullScreenModalProps {
  algorithm: AlgorithmInfo;
  algorithmId: string;
  currentArray: number[];
  highlightedIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  animationStep: { variables?: Record<string, any>; [key: string]: any } | undefined;
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  currentDescription: string;
  maxValue: number;
  onClose: () => void;
  onPlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSpeedChange: (speed: number) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

const FullScreenModal = ({
  algorithm,
  algorithmId,
  currentArray,
  highlightedIndices,
  swappingIndices,
  sortedIndices,
  animationStep,
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  currentDescription,
  maxValue,
  onClose,
  onPlay,
  onPrev,
  onNext,
  onSpeedChange,
  onTouchStart,
  onTouchEnd
}: FullScreenModalProps) => {
  const isBoxVisualization = BOX_VISUALIZATION_ALGORITHMS.includes(algorithmId);

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0b] flex flex-col" data-testid="fullscreen-modal">
      {/* Full-screen header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f23]">
        <div>
          <h2 className="text-xl font-bold text-white">{algorithm.title}</h2>
          <p className="text-sm text-gray-400 mt-1">{currentDescription}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white"
          data-testid="close-fullscreen-btn"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Full-screen visualization */}
      <div 
        className="flex-1 flex items-center justify-center p-8"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {isBoxVisualization ? (
          <div className="flex flex-col items-center justify-center">
            {/* Large array boxes */}
            <div className="flex gap-2">
              {currentArray.map((value, index) => {
                const isComparing = highlightedIndices.includes(index);
                const isSwapping = swappingIndices.includes(index);
                const isSorted = sortedIndices.includes(index);
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    {/* Pointer arrow */}
                    <div className="h-10 flex items-center justify-center">
                      {isComparing && (
                        <div className="flex flex-col items-center animate-bounce">
                          <span className="text-[#22c55e] text-lg font-bold">i</span>
                          <svg className="w-5 h-5 text-[#22c55e]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 16l-6-6h12z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 mb-2">{index}</span>
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-3xl font-bold rounded-lg border-2 transition-all duration-300 ${
                        isSwapping
                          ? 'bg-[#f59e0b] border-[#f59e0b] text-black'
                          : isComparing
                          ? 'bg-[#22c55e] border-[#22c55e] text-black'
                          : isSorted
                          ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                          : 'bg-[#1f1f23] border-[#2f2f35] text-white'
                      }`}
                    >
                      {value}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Variables in full-screen */}
            {algorithmId === 'majority-element' && animationStep?.variables && (
              <div className="flex gap-8 mt-12">
                <div className="flex items-center gap-3 bg-[#1f1f23] px-6 py-4 rounded-lg">
                  <span className="text-gray-400 text-lg">candidate =</span>
                  <span className="text-[#22c55e] font-bold text-3xl">{animationStep.variables.candidate}</span>
                </div>
                <div className="flex items-center gap-3 bg-[#1f1f23] px-6 py-4 rounded-lg">
                  <span className="text-gray-400 text-lg">count =</span>
                  <span className="text-[#22c55e] font-bold text-3xl">{animationStep.variables.count}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Bar chart in full-screen */
          <div className="flex items-end justify-center gap-2 h-[60vh]">
            {currentArray.map((value, index) => {
              const isComparing = highlightedIndices.includes(index);
              const isSwapping = swappingIndices.includes(index);
              const isSorted = sortedIndices.includes(index);
              const absValue = Math.abs(value);
              const heightPercent = (absValue / maxValue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <span className={`text-lg font-medium ${isComparing || isSwapping ? 'text-white' : 'text-gray-400'}`}>
                    {value}
                  </span>
                  <div
                    className={`w-12 md:w-16 rounded-t transition-all duration-300 ${
                      isSwapping ? 'bg-[#f59e0b]' : isComparing ? 'bg-[#22c55e]' : isSorted ? 'bg-[#3b82f6]' : 'bg-[#06b6d4]'
                    }`}
                    style={{ height: `${Math.max(heightPercent * 4, 30)}px` }}
                  />
                  <span className="text-sm text-gray-500">{index}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-screen controls */}
      <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-[#1f1f23]">
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="p-3 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white disabled:opacity-50"
          data-testid="fs-prev-btn"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={onPlay}
          className="p-4 bg-[#22c55e] rounded-full hover:bg-[#16a34a] transition-colors text-black"
          data-testid="fs-play-btn"
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
        <button
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          className="p-3 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white disabled:opacity-50"
          data-testid="fs-next-btn"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        <div className="mx-4 text-gray-400">
          {currentStep} / {Math.max(totalSteps - 1, 0)}
        </div>
        
        <select
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="bg-[#1f1f23] text-white px-4 py-2 rounded-lg border-none outline-none cursor-pointer"
          data-testid="fs-speed-selector"
        >
          <option value="0.5">Slow</option>
          <option value="1">Normal</option>
          <option value="1.5">Fast</option>
          <option value="2">Very Fast</option>
        </select>
      </div>
    </div>
  );
};

export default FullScreenModal;
