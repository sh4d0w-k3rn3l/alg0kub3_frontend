'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bookmark, Loader2 } from 'lucide-react';
import Header from '@/components/DSAHeader';
import { getAlgorithmCode, algorithmCode } from '@/data/codeImplementations/index';
import { generateAnimationSteps } from '@/utils/animationEngine';
import { algorithmInfo } from '@/data/algorithmInfo';
import { useAnimationDetail } from '@/hooks/useAnimations';
import {
  ControlPanel,
  CodePanel,
  VisualizationPanel,
  InfoPanels,
  FullScreenModal,
  StepExplanationPanel,
  getInputPresets
} from '@/components/algorithm';

interface AnimationStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  highlightedLines: number[];
  description?: string;
}

const computeAnimationInput = (
  algorithmId: string,
  presets: Record<string, number[] | Record<string, unknown>>,
  selectedPreset: string,
  isCustomMode: boolean,
  customInput: string
): { currentArray: number[]; steps: AnimationStep[] } => {
  const STRING_ALGORITHMS = ['is-subsequence', 'valid-palindrome', 'longest-common-prefix', 'reverse-words'];
  const isStringAlgorithm = STRING_ALGORITHMS.includes(algorithmId);
  const SINGLE_VALUE_ALGORITHMS = ['counting-bits'];
  const isSingleValueAlgorithm = SINGLE_VALUE_ALGORITHMS.includes(algorithmId);

  let initialInput: number[] | Record<string, unknown> = [];
  if (isCustomMode && customInput) {
    if (isStringAlgorithm) {
      if (customInput.includes('=')) {
        const parts = customInput.split(',').map(p => p.trim());
        const obj: Record<string, unknown> = {};
        parts.forEach(part => {
          const [key, value] = part.split('=').map(s => s.trim());
          if (key === 'strs') {
            obj[key] = value.replace(/[\[\]"']/g, '').split(';').map(s => s.trim());
          } else {
            obj[key] = value;
          }
        });
        initialInput = obj;
      } else {
        initialInput = { s: customInput };
      }
    } else if (isSingleValueAlgorithm) {
      if (customInput.includes('=')) {
        const [, value] = customInput.split('=').map(s => s.trim());
        initialInput = { n: parseInt(value) || 5 };
      } else {
        initialInput = { n: parseInt(customInput.trim()) || 5 };
      }
    } else {
      initialInput = customInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    }
  } else {
    initialInput = presets[selectedPreset] || presets[Object.keys(presets)[0]];
    if (!initialInput) {
      if (isStringAlgorithm) {
        initialInput = { s: "example" };
      } else if (isSingleValueAlgorithm) {
        initialInput = { n: 5 };
      } else {
        initialInput = [64, 34, 25, 12, 22, 11, 90];
      }
    }
  }

  if (!isStringAlgorithm && !isSingleValueAlgorithm && (!Array.isArray(initialInput) || initialInput.length === 0)) {
    initialInput = [64, 34, 25, 12, 22, 11, 90];
  }

  let currentArray: number[] = [];
  if (Array.isArray(initialInput)) {
    currentArray = [...initialInput];
  } else if (isSingleValueAlgorithm) {
    const n = (initialInput as Record<string, number>).n || 5;
    currentArray = new Array(n + 1).fill(0);
  }
  const steps = generateAnimationSteps(algorithmId, (isStringAlgorithm || isSingleValueAlgorithm) ? initialInput : [...(initialInput as unknown[])]) as AnimationStep[];
  return { currentArray, steps };
};

const AlgorithmDetail = () => {
  const params = useParams();
  const algorithmId = (params?.algorithmId as string) || '';
  const { algorithm, loading, error } = useAnimationDetail(algorithmId);

  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [selectedPreset, setSelectedPreset] = useState('Array 1');
  const [customInput, setCustomInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  const presets = useMemo(() => getInputPresets(algorithmId, algorithm?.category), [algorithmId, algorithm?.category]);
  const presetNames = Object.keys(presets);
  const code = useMemo(
    () => {
      if (algorithmId in algorithmCode) {
        return getAlgorithmCode(algorithmId, algorithm?.title || 'Algorithm');
      }
      return algorithm?.code && Object.keys(algorithm.code).length > 0
        ? algorithm.code
        : getAlgorithmCode(algorithmId, algorithm?.title || 'Algorithm');
    },
    [algorithm, algorithmId]
  );

  // Reset preset selection and playback when the algorithm changes
  const [prevAlgorithmId, setPrevAlgorithmId] = useState(algorithmId);
  if (algorithmId !== prevAlgorithmId) {
    setPrevAlgorithmId(algorithmId);
    const firstPresetName = Object.keys(getInputPresets(algorithmId))[0];
    setSelectedPreset(firstPresetName);
    setIsCustomMode(false);
    setCurrentStep(0);
    setIsPlaying(false);
  }

  // Reset playback whenever the animation inputs change
  const inputKey = `${algorithmId}|${selectedPreset}|${isCustomMode}|${customInput}`;
  const [prevInputKey, setPrevInputKey] = useState(inputKey);
  if (inputKey !== prevInputKey) {
    setPrevInputKey(inputKey);
    setCurrentStep(0);
    setIsPlaying(false);
  }

  const animationResult = useMemo(
    () => computeAnimationInput(algorithmId, presets, selectedPreset, isCustomMode, customInput),
    [algorithmId, presets, selectedPreset, isCustomMode, customInput]
  );
  const animationSteps = animationResult.steps;

  const stepData = animationSteps[currentStep];
  const currentArray = stepData?.array ?? animationResult.currentArray;
  const highlightedIndices = stepData?.comparing || [];
  const swappingIndices = stepData?.swapping || [];
  const sortedIndices = stepData?.sorted || [];
  const highlightedLines = stepData?.highlightedLines || [];

  useEffect(() => {
    if (isPlaying && currentStep < animationSteps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 800 / speed);
    } else if (currentStep >= animationSteps.length - 1) {
      animationRef.current = setTimeout(() => setIsPlaying(false), 0);
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, currentStep, animationSteps.length, speed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentStep(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentStep(prev => Math.min(animationSteps.length - 1, prev + 1));
          break;
        case 'KeyR':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentStep(0);
          break;
        case 'KeyF':
          e.preventDefault();
          setIsFullScreen(prev => !prev);
          break;
        case 'Escape':
          if (isFullScreen) {
            e.preventDefault();
            setIsFullScreen(false);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [animationSteps.length, isFullScreen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setIsPlaying(false);
        setCurrentStep(prev => Math.min(animationSteps.length - 1, prev + 1));
      } else {
        setIsPlaying(false);
        setCurrentStep(prev => Math.max(0, prev - 1));
      }
    }

    touchStartX.current = null;
  };

  const handlePlay = () => {
    if (currentStep >= animationSteps.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep(prev => Math.min(animationSteps.length - 1, prev + 1));
  };
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentStep(parseInt(e.target.value));
  };
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const maxValue = Math.max(...currentArray.map(v => Math.abs(v)), 1);
  const currentDescription = animationSteps[currentStep]?.description || 'Ready';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b]">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" />
            <p className="text-gray-500 text-sm">Loading algorithm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!algorithm || error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Algorithm not found</h1>
          {error && <p className="text-gray-500 text-sm mb-4">{error}</p>}
          <Link href="/animations/dsa" className="text-[#22c55e] hover:underline">
            Back to all animations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]" data-testid="algorithm-detail-page">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/animations/dsa"
              className="p-2 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white" data-testid="algorithm-title">{algorithm.title}</h1>
              <p className="text-gray-400 text-sm mt-1">{algorithm.description}</p>
              {(algorithm.topics?.length > 0 || algorithm.companies?.length > 0) && (
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {algorithm.topics?.filter(Boolean).map((topic: string) => (
                    <span
                      key={`topic-${topic}`}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                    >
                      {topic}
                    </span>
                  ))}
                  {algorithm.companies?.filter(Boolean).map((company: string) => (
                    <span
                      key={`company-${company}`}
                      className="px-2 py-0.5 rounded-full text-[10px] bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {algorithm.timeComplexity && (
              <div className="flex items-center gap-2" data-testid="time-complexity">
                <span className="text-gray-500 text-xs">Time:</span>
                <code className="text-[#22c55e] font-mono text-sm bg-[#22c55e]/10 px-2 py-0.5 rounded">
                  {algorithm.timeComplexity}
                </code>
              </div>
            )}
            {algorithm.spaceComplexity && (
              <div className="flex items-center gap-2" data-testid="space-complexity">
                <span className="text-gray-500 text-xs">Space:</span>
                <code className="text-[#3b82f6] font-mono text-sm bg-[#3b82f6]/10 px-2 py-0.5 rounded">
                  {algorithm.spaceComplexity}
                </code>
              </div>
            )}
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked ? 'bg-[#22c55e] text-black' : 'bg-[#1f1f23] text-white hover:bg-[#2a2a2e]'
              }`}
              data-testid="bookmark-btn"
            >
              <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6" data-testid="input-controls">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Input:</span>
            <div className="flex gap-2">
              {presetNames.map(name => (
                <button
                  key={name}
                  onClick={() => {
                    setSelectedPreset(name);
                    setIsCustomMode(false);
                  }}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedPreset === name && !isCustomMode
                      ? 'bg-[#22c55e] text-black'
                      : 'bg-[#1f1f23] text-white hover:bg-[#2a2a2e]'
                  }`}
                  data-testid={`preset-btn-${name.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              placeholder={
                algorithmId === 'counting-bits' ? 'Custom input (e.g., n=10)' :
                ['is-subsequence', 'valid-palindrome', 'longest-common-prefix', 'reverse-words'].includes(algorithmId)
                  ? 'Custom input (e.g., s=abc)'
                  : 'Custom input (e.g., 5,3,8,1,9)'
              }
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onFocus={() => setIsCustomMode(true)}
              className="flex-1 bg-[#1f1f23] text-white px-3 py-1.5 rounded-lg text-sm border border-[#2f2f35] focus:border-[#22c55e] outline-none"
              data-testid="custom-input"
            />
            <button
              onClick={() => {
                setIsCustomMode(true);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                isCustomMode
                  ? 'bg-[#22c55e] text-black'
                  : 'bg-[#1f1f23] text-white hover:bg-[#2a2a2e]'
              }`}
              data-testid="apply-custom-btn"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[560px]">
            <CodePanel
              code={code}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              highlightedLines={highlightedLines}
            />
          </div>

          <div className="bg-[#141416] border border-[#1f1f23] rounded-lg flex flex-col h-[560px]">
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              <VisualizationPanel
                algorithmId={algorithmId}
                category={algorithm.category}
                currentArray={currentArray}
                highlightedIndices={highlightedIndices}
                swappingIndices={swappingIndices}
                sortedIndices={sortedIndices}
                animationStep={animationSteps[currentStep]}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            </div>

            <ControlPanel
              isPlaying={isPlaying}
              currentStep={currentStep}
              totalSteps={animationSteps.length}
              speed={speed}
              onPlay={handlePlay}
              onPrev={handlePrev}
              onNext={handleNext}
              onSliderChange={handleSliderChange}
              onReset={handleReset}
              onSpeedChange={setSpeed}
              onFullScreen={() => setIsFullScreen(true)}
              currentDescription={currentDescription}
            />
          </div>
        </div>

        <div className="mt-6">
          <StepExplanationPanel
            algorithmId={algorithmId}
            currentDescription={currentDescription}
            highlightedLines={highlightedLines}
          />
        </div>

        {Boolean((algorithmInfo as Record<string, unknown>)[algorithmId]) && (
          <InfoPanels algorithmId={algorithmId} algorithm={algorithm} />
        )}
      </main>

      {isFullScreen && (
        <FullScreenModal
          algorithm={algorithm}
          algorithmId={algorithmId}
          currentArray={currentArray}
          highlightedIndices={highlightedIndices}
          swappingIndices={swappingIndices}
          sortedIndices={sortedIndices}
          animationStep={animationSteps[currentStep]}
          currentStep={currentStep}
          totalSteps={animationSteps.length}
          isPlaying={isPlaying}
          speed={speed}
          currentDescription={currentDescription}
          maxValue={maxValue}
          onClose={() => setIsFullScreen(false)}
          onPlay={handlePlay}
          onPrev={handlePrev}
          onNext={handleNext}
          onSpeedChange={setSpeed}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </div>
  );
};

export default AlgorithmDetail;
