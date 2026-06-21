'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import Header from '@/components/DSAHeader';
import { algorithms } from '@/data/mockData';
import { generateAnimationSteps } from '@/utils/animationEngine';

interface AlgorithmData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  timeComplexity: string;
  spaceComplexity: string;
}

interface AnimationStep {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  highlightedLines: number[];
  description?: string;
}

const getAlgorithmsByCategory = () => {
  const grouped: Record<string, AlgorithmData[]> = {};
  algorithms.forEach(algo => {
    if (!grouped[algo.category]) {
      grouped[algo.category] = [];
    }
    grouped[algo.category].push(algo);
  });
  return grouped;
};

const MiniVisualization = ({ array, highlightedIndices, swappingIndices, sortedIndices, isComplete }: { array: number[]; highlightedIndices: number[]; swappingIndices: number[]; sortedIndices: number[]; isComplete: boolean }) => {
  const maxValue = Math.max(...array.map(v => Math.abs(v)), 1);

  return (
    <div className="flex items-end justify-center gap-0.5 h-24 px-2">
      {array.map((value, index) => {
        const isComparing = highlightedIndices.includes(index);
        const isSwapping = swappingIndices.includes(index);
        const isSorted = sortedIndices.includes(index);
        const heightPercent = (Math.abs(value) / maxValue) * 100;

        return (
          <div
            key={index}
            className={`w-2 rounded-t transition-all duration-200 ${
              isComplete ? 'bg-[#22c55e]' :
              isSwapping ? 'bg-[#f59e0b]' :
              isComparing ? 'bg-[#22c55e]' :
              isSorted ? 'bg-[#3b82f6]' :
              'bg-[#06b6d4]'
            }`}
            style={{ height: `${Math.max(heightPercent, 5)}%` }}
          />
        );
      })}
    </div>
  );
};

const AlgorithmLane = ({
  algorithm,
  animationSteps,
  currentStep,
  isComplete,
  stepCount,
  onRemove
}: {
  algorithm: AlgorithmData;
  animationSteps: AnimationStep[];
  currentStep: number;
  isComplete: boolean;
  stepCount: number;
  onRemove: () => void;
}) => {
  const step = animationSteps[currentStep] || {};
  const progress = animationSteps.length > 0 ? ((currentStep + 1) / animationSteps.length) * 100 : 0;

  return (
    <div className={`bg-[#141416] border rounded-lg overflow-hidden transition-all ${
      isComplete ? 'border-[#22c55e]' : 'border-[#1f1f23]'
    }`}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f11] border-b border-[#1f1f23]">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">{algorithm.title}</span>
          {isComplete && <Trophy className="w-4 h-4 text-[#22c55e]" />}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded ${
            algorithm.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
            algorithm.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {algorithm.difficulty}
          </span>
          <code className="text-[#22c55e] text-xs bg-[#22c55e]/10 px-2 py-0.5 rounded">
            {algorithm.timeComplexity}
          </code>
          <button
            onClick={onRemove}
            className="text-gray-500 hover:text-red-400 text-sm transition-colors"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-2">
        <MiniVisualization
          array={step.array || []}
          highlightedIndices={step.comparing || []}
          swappingIndices={step.swapping || []}
          sortedIndices={step.sorted || []}
          isComplete={isComplete}
        />
      </div>

      <div className="px-4 pb-2">
        <div className="h-1 bg-[#1f1f23] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${isComplete ? 'bg-[#22c55e]' : 'bg-[#3b82f6]'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Step {currentStep + 1} / {animationSteps.length}</span>
          <span>{stepCount} operations</span>
        </div>
      </div>
    </div>
  );
};

const ComparisonView = () => {
  const algorithmsByCategory = getAlgorithmsByCategory();

  const [selectedCategory, setSelectedCategory] = useState('Sorting');
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
  const [inputArray, setInputArray] = useState([64, 34, 25, 12, 22, 11, 90, 45, 33, 18]);
  const [customInput, setCustomInput] = useState('64, 34, 25, 12, 22, 11, 90, 45, 33, 18');
  const [isRacing, setIsRacing] = useState(false);
  const [raceSpeed, setRaceSpeed] = useState(1);
  const [animationData, setAnimationData] = useState<Record<string, AnimationStep[]>>({});
  const [currentSteps, setCurrentSteps] = useState<Record<string, number>>({});
  const [finishOrder, setFinishOrder] = useState<string[]>([]);

  const raceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sortingAlgos = algorithmsByCategory['Sorting'] || [];
    if (sortingAlgos.length >= 3) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedAlgorithms(sortingAlgos.slice(0, 3).map((a: AlgorithmData) => a.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newAnimationData: Record<string, AnimationStep[]> = {};
    const newCurrentSteps: Record<string, number> = {};

    selectedAlgorithms.forEach(algoId => {
      const steps = generateAnimationSteps(algoId, [...inputArray], selectedCategory);
      newAnimationData[algoId] = steps;
      newCurrentSteps[algoId] = 0;
    });

    /* eslint-disable react-hooks/set-state-in-effect */
    setAnimationData(newAnimationData);
    setCurrentSteps(newCurrentSteps);
    setFinishOrder([]);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [selectedAlgorithms, inputArray, selectedCategory]);

  useEffect(() => {
    if (isRacing) {
      raceIntervalRef.current = setInterval(() => {
        setCurrentSteps(prev => {
          const newSteps = { ...prev };
          let allComplete = true;

          selectedAlgorithms.forEach(algoId => {
            const maxStep = (animationData[algoId]?.length || 1) - 1;
            if (newSteps[algoId] < maxStep) {
              newSteps[algoId]++;
              allComplete = false;

              if (newSteps[algoId] >= maxStep) {
                setFinishOrder(order => {
                  if (!order.includes(algoId)) {
                    return [...order, algoId];
                  }
                  return order;
                });
              }
            }
          });

          if (allComplete) {
            setIsRacing(false);
          }

          return newSteps;
        });
      }, 300 / raceSpeed);
    }

    return () => {
      if (raceIntervalRef.current) {
        clearInterval(raceIntervalRef.current);
      }
    };
  }, [isRacing, raceSpeed, selectedAlgorithms, animationData]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedAlgorithms([]);
    setFinishOrder([]);
  };

  const handleAlgorithmToggle = (algoId: string) => {
    if (selectedAlgorithms.includes(algoId)) {
      setSelectedAlgorithms(prev => prev.filter(id => id !== algoId));
    } else if (selectedAlgorithms.length < 3) {
      setSelectedAlgorithms(prev => [...prev, algoId]);
    }
    setFinishOrder([]);
  };

  const handleApplyInput = () => {
    const parsed = customInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0) {
      setInputArray(parsed);
      setFinishOrder([]);
    }
  };

  const handleReset = () => {
    setIsRacing(false);
    const newCurrentSteps: Record<string, number> = {};
    selectedAlgorithms.forEach(algoId => {
      newCurrentSteps[algoId] = 0;
    });
    setCurrentSteps(newCurrentSteps);
    setFinishOrder([]);
  };

  const handleStartRace = () => {
    if (selectedAlgorithms.length < 2) return;
    handleReset();
    setTimeout(() => setIsRacing(true), 100);
  };

  const categories = Object.keys(algorithmsByCategory);
  const availableAlgorithms = algorithmsByCategory[selectedCategory] || [];

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header />

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/animations/dsa"
            className="p-2 bg-[#1f1f23] rounded-lg hover:bg-[#2a2a2e] transition-colors text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Algorithm Comparison Race</h1>
        </div>

        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">Select Category:</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#22c55e] text-black'
                    : 'bg-[#1f1f23] text-white hover:bg-[#2a2a2e]'
                }`}
              >
                {category} ({algorithmsByCategory[category]?.length || 0})
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="text-gray-400 text-sm mb-2 block">
            Select up to 3 algorithms to compare:
          </label>
          <div className="flex flex-wrap gap-2">
            {availableAlgorithms.map((algo: AlgorithmData) => (
              <button
                key={algo.id}
                onClick={() => handleAlgorithmToggle(algo.id)}
                disabled={!selectedAlgorithms.includes(algo.id) && selectedAlgorithms.length >= 3}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedAlgorithms.includes(algo.id)
                    ? 'bg-[#3b82f6] text-white'
                    : selectedAlgorithms.length >= 3
                    ? 'bg-[#1f1f23] text-gray-500 cursor-not-allowed'
                    : 'bg-[#1f1f23] text-white hover:bg-[#2a2a2e]'
                }`}
              >
                {algo.title}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <label className="text-gray-400 text-sm">Input Array:</label>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="flex-1 max-w-md bg-[#1f1f23] text-white px-3 py-2 rounded-lg text-sm border border-[#2f2f35] focus:border-[#22c55e] outline-none"
            placeholder="Enter comma-separated numbers"
          />
          <button
            onClick={handleApplyInput}
            className="px-4 py-2 bg-[#1f1f23] text-white rounded-lg hover:bg-[#2a2a2e] text-sm"
          >
            Apply
          </button>
          <select
            value={raceSpeed}
            onChange={(e) => setRaceSpeed(parseFloat(e.target.value))}
            className="bg-[#1f1f23] text-white text-sm px-3 py-2 rounded-lg"
          >
            <option value="0.5">Slow</option>
            <option value="1">Normal</option>
            <option value="2">Fast</option>
            <option value="4">Very Fast</option>
          </select>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleStartRace}
            disabled={selectedAlgorithms.length < 2 || isRacing}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors ${
              selectedAlgorithms.length < 2 || isRacing
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[#22c55e] text-black hover:bg-[#16a34a]'
            }`}
          >
            <Play className="w-5 h-5" />
            Start Race
          </button>
          <button
            onClick={() => setIsRacing(!isRacing)}
            disabled={selectedAlgorithms.length < 2}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f1f23] text-white rounded-lg hover:bg-[#2a2a2e]"
          >
            {isRacing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRacing ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-[#1f1f23] text-white rounded-lg hover:bg-[#2a2a2e]"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>

        {selectedAlgorithms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {selectedAlgorithms.map((algoId) => {
              const algo = algorithms.find(a => a.id === algoId);
              const steps = animationData[algoId] || [];
              const currentStep = currentSteps[algoId] || 0;
              const isComplete = currentStep >= steps.length - 1 && steps.length > 0;
              const finishPosition = finishOrder.indexOf(algoId);

              return (
                <div key={algoId} className="relative">
                  {finishPosition !== -1 && (
                    <div className={`absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      finishPosition === 0 ? 'bg-yellow-500 text-black' :
                      finishPosition === 1 ? 'bg-gray-400 text-black' :
                      'bg-orange-700 text-white'
                    }`}>
                      {finishPosition + 1}
                    </div>
                  )}
                  <AlgorithmLane
                    algorithm={algo}
                    animationSteps={steps}
                    currentStep={currentStep}
                    isComplete={isComplete}
                    stepCount={steps.length}
                    onRemove={() => handleAlgorithmToggle(algoId)}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Select at least 2 algorithms to start a comparison race
          </div>
        )}

        {finishOrder.length > 0 && (
          <div className="mt-8 bg-[#141416] border border-[#1f1f23] rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Race Results
            </h3>
            <div className="space-y-2">
              {finishOrder.map((algoId, index) => {
                const algo = algorithms.find(a => a.id === algoId);
                const steps = animationData[algoId] || [];
                return (
                  <div key={algoId} className="flex items-center gap-4 text-sm">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      'bg-orange-700 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-white font-medium">{algo?.title}</span>
                    <span className="text-gray-500">—</span>
                    <span className="text-gray-400">{steps.length} steps</span>
                    <code className="text-[#22c55e] text-xs bg-[#22c55e]/10 px-2 py-0.5 rounded">
                      {algo?.timeComplexity}
                    </code>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComparisonView;
