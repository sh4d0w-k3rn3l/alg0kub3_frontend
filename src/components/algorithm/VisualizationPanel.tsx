'use client';
import { 
  TreeVisualization as _TreeVisualization, 
  LinkedListVisualization as _LinkedListVisualization, 
  StackVisualization as _StackVisualization, 
  QueueVisualization as _QueueVisualization, 
  MatrixVisualization as _MatrixVisualization, 
  GraphVisualization as _GraphVisualization,
  IslandGridVisualization as _IslandGridVisualization 
} from '../AlgorithmVisualizations';
import type React from 'react';

interface AnimationStep {
  [key: string]: any;
  variables?: Record<string, any>;
  algorithmType?: string;
  readPos?: number;
  writePos?: number;
  currentIndex?: number;
  i?: number;
  start?: number;
  end?: number;
  prevI?: number;
  profitAdded?: boolean;
  isZero?: boolean;
  updateType?: string;
  foundTriplet?: boolean;
  phase?: string;
  correctPositions?: number[];
  isXorStep?: boolean;
  isComplete?: boolean;
  array?: number[];
  res?: number[];
  pow?: number;
  x?: number;
  highlightedIndex?: number;
  referenceIndex?: number;
  isPowerOfTwo?: boolean;
  justUpdated?: boolean;
  xor?: number;
  diff?: number;
  result?: number[];
  group?: number;
  inputArray?: number[];
  outputArray?: number[];
  right?: number;
  sorted?: number[];
  s?: string;
  t?: string;
  sPointer?: number;
  tPointer?: number;
  matchedS?: number[];
  matchedIndices?: number[];
  isMatch?: boolean;
  mismatch?: boolean;
  left?: number;
  rightPtr?: number;
  strings?: string[];
  currentChar?: number;
  prefix?: string;
  mismatchString?: number;
  words?: string[];
  reversed?: string[];
  currentWord?: number;
}

const TreeVisualization = _TreeVisualization as React.ComponentType<{ step?: AnimationStep; highlightedIndices?: number[] }>;
const LinkedListVisualization = _LinkedListVisualization as React.ComponentType<{ array?: number[]; highlightedIndices?: number[]; step?: AnimationStep }>;
const StackVisualization = _StackVisualization as React.ComponentType<{ step?: AnimationStep; highlightedIndices?: number[] }>;
const QueueVisualization = _QueueVisualization as React.ComponentType<{ step?: AnimationStep; highlightedIndices?: number[] }>;
const MatrixVisualization = _MatrixVisualization as React.ComponentType<{ step?: AnimationStep; highlightedIndices?: number[] }>;
const GraphVisualization = _GraphVisualization as React.ComponentType<{ step?: AnimationStep; highlightedIndices?: number[] }>;
const IslandGridVisualization = _IslandGridVisualization as React.ComponentType<{ step?: AnimationStep }>;

// Algorithms that use box visualization instead of bar chart
const BOX_VISUALIZATION_ALGORITHMS = [
  'majority-element', 'move-zeroes', 'remove-duplicates', 
  'two-sum-ii', 'valid-palindrome', 'single-number',
  'best-time-to-buy-and-sell-stock', 'best-time-to-buy-and-sell-stock-2',
  'rotate-array', 'product-except-self', 'zero-filled-subarrays',
  'increasing-triplet-subsequence', 'first-missing-positive'
];

interface ArrayBoxVisualizationProps {
  array: number[];
  highlightedIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  variables?: Record<string, any>;
  algorithmId: string;
  animationStep?: AnimationStep;
}

const ArrayBoxVisualization = ({ 
  array, 
  highlightedIndices, 
  swappingIndices, 
  sortedIndices,
  variables,
  algorithmId,
  animationStep
}: ArrayBoxVisualizationProps) => {
  // Extract pointers from animation step
  const readPos = animationStep?.readPos ?? animationStep?.variables?.readPos ?? -1;
  const writePos = animationStep?.writePos ?? animationStep?.variables?.writePos ?? -1;
  const currentI = animationStep?.currentIndex ?? animationStep?.i ?? highlightedIndices[0] ?? -1;
  const startPos = animationStep?.start ?? -1;
  const endPos = animationStep?.end ?? -1;
  
  const isMoveZeroes = algorithmId === 'move-zeroes';
  const isMajorityElement = algorithmId === 'majority-element';
  const isRemoveDuplicates = algorithmId === 'remove-duplicates';
  const isBuySellStock = algorithmId === 'best-time-to-buy-and-sell-stock';
  const isBuySellStock2 = algorithmId === 'best-time-to-buy-and-sell-stock-2';
  const isRotateArray = algorithmId === 'rotate-array';
  const isZeroFilledSubarrays = algorithmId === 'zero-filled-subarrays';
  const isIncreasingTriplet = algorithmId === 'increasing-triplet-subsequence';
  const isFirstMissingPositive = algorithmId === 'first-missing-positive';
  const isSingleNumber = algorithmId === 'single-number';
  
  // Stock II specific data
  const stock2I = animationStep?.i ?? -1;
  const stock2PrevI = animationStep?.prevI ?? -1;
  const stock2ProfitAdded = animationStep?.profitAdded ?? false;
  
  // Zero-filled subarrays specific data
  const zeroSubI = animationStep?.i ?? -1;
  const isCurrentZero = animationStep?.isZero ?? false;
  
  // Increasing triplet specific data
  const tripletI = animationStep?.i ?? -1;
  const tripletUpdateType = animationStep?.updateType ?? 'none';
  const tripletFound = animationStep?.foundTriplet ?? false;
  
  // First missing positive specific data
  const fmpI = animationStep?.i ?? -1;
  const fmpPhase = animationStep?.phase ?? 'init';
  const fmpCorrectPositions = animationStep?.correctPositions ?? [];
  
  // Single number specific data
  const singleNumI = animationStep?.i ?? -1;
  const isXorStep = animationStep?.isXorStep ?? false;
  const isComplete = animationStep?.isComplete ?? false;
  
  const usesCyanBoxes = isMoveZeroes || isMajorityElement || isRemoveDuplicates || isBuySellStock || isBuySellStock2 || isRotateArray || isZeroFilledSubarrays || isIncreasingTriplet || isFirstMissingPositive || isSingleNumber;
  const usesDualPointers = isMoveZeroes || isRemoveDuplicates;
  const usesStartEndPointers = isRotateArray;
  const usesIPointer = isMajorityElement || isBuySellStock || isZeroFilledSubarrays || isIncreasingTriplet || isFirstMissingPositive || isSingleNumber;
  const usesStock2Pointers = isBuySellStock2;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full" data-testid="array-box-visualization">
      {/* Pointer labels - ABOVE boxes */}
      {usesCyanBoxes && (
        <div className="flex mb-1" style={{ width: `${array.length * 52}px` }}>
          {array.map((_, index) => (
            <div key={`pointer-${index}`} className="w-[52px] flex justify-center">
              {usesDualPointers && readPos === index && (
                <span className="text-[#22c55e] text-sm font-semibold">readPos</span>
              )}
              {usesIPointer && currentI === index && (
                <span className="text-[#22c55e] text-sm font-semibold">i</span>
              )}
              {usesStartEndPointers && startPos === index && (
                <span className="text-[#22c55e] text-sm font-semibold">start</span>
              )}
              {usesStock2Pointers && stock2I === index && (
                <span className="text-[#22c55e] text-sm font-semibold">i</span>
              )}
              {usesStock2Pointers && stock2PrevI === index && (
                <span className="text-[#f59e0b] text-sm font-semibold">i-1</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Array indices */}
      <div className="flex">
        {array.map((_, index) => (
          <div key={`idx-${index}`} className="w-[52px] flex justify-center">
            <span className="text-xs text-gray-500">{index}</span>
          </div>
        ))}
      </div>
      
      {/* Array boxes */}
      <div className="flex">
        {array.map((value, index) => {
          const isReadPos = usesDualPointers && readPos === index;
          const isCurrentI = usesIPointer && currentI === index;
          const isStartPos = usesStartEndPointers && startPos === index;
          const isEndPos = usesStartEndPointers && endPos === index;
          
          // Stock II specific highlighting
          const isStock2Current = usesStock2Pointers && stock2I === index;
          const isStock2Prev = usesStock2Pointers && stock2PrevI === index;
          const isStock2ProfitPair = usesStock2Pointers && stock2ProfitAdded && (stock2I === index || stock2PrevI === index);
          
          // Zero-filled subarrays specific highlighting
          const isZeroSubCurrent = isZeroFilledSubarrays && zeroSubI === index;
          const isZeroHighlight = isZeroFilledSubarrays && isCurrentZero && zeroSubI === index;
          
          // Increasing triplet specific highlighting
          const isTripletCurrent = isIncreasingTriplet && tripletI === index;
          const isTripletFound = isIncreasingTriplet && tripletFound && tripletI === index;
          const isTripletUpdate = isIncreasingTriplet && (tripletUpdateType === 'first' || tripletUpdateType === 'second') && tripletI === index;
          
          // First missing positive specific highlighting
          const isFmpCurrent = isFirstMissingPositive && fmpI === index;
          const isFmpCorrect = isFirstMissingPositive && fmpCorrectPositions.includes(index);
          const isFmpFound = isFirstMissingPositive && fmpPhase === 'found' && fmpI === index;
          
          // Single number specific highlighting
          const isSingleNumCurrent = isSingleNumber && singleNumI === index;
          const isSingleNumXor = isSingleNumber && isXorStep && singleNumI === index;
          const isSingleNumComplete = isSingleNumber && isComplete && sortedIndices.includes(index);
          
          const isCurrentPointer = isReadPos || isCurrentI || isStartPos || isEndPos || isStock2Current || isZeroSubCurrent || isTripletCurrent || isFmpCurrent || isSingleNumCurrent;
          const isSwapping = swappingIndices.includes(index);
          const isSorted = sortedIndices.includes(index);
          const isComparing = !usesCyanBoxes && highlightedIndices.includes(index);
          
          // For cyan box algorithms
          let boxClasses = '';
          if (usesCyanBoxes) {
            if (isSingleNumComplete) {
              // Blue highlight for the single number at the end
              boxClasses = 'bg-[#3b82f6] border-[#3b82f6] border-2 text-white';
            } else if (isSingleNumXor) {
              // Green highlight during XOR operation
              boxClasses = 'bg-[#22c55e] border-[#22c55e] border-2 text-black';
            } else if (isFmpFound) {
              // Green highlight when first missing positive is found
              boxClasses = 'bg-[#22c55e] border-[#22c55e] border-2 text-black';
            } else if (isFmpCorrect && !isSwapping && !isFmpCurrent) {
              // Blue highlight for elements in correct position
              boxClasses = 'bg-[#3b82f6] border-[#3b82f6] border-2 text-white';
            } else if (isTripletFound) {
              // Green highlight when triplet is found
              boxClasses = 'bg-[#22c55e] border-[#22c55e] border-2 text-black';
            } else if (isTripletUpdate) {
              // Orange highlight when first or second is updated
              boxClasses = 'bg-[#f59e0b] border-[#f59e0b] border-2 text-black';
            } else if (isZeroHighlight) {
              // Green highlight when current element is zero
              boxClasses = 'bg-[#22c55e] border-[#22c55e] border-2 text-black';
            } else if (isStock2ProfitPair) {
              // Green highlight when profit is added for Stock II
              boxClasses = 'bg-[#22c55e] border-[#22c55e] border-2 text-black';
            } else if (isSwapping) {
              boxClasses = 'bg-[#f59e0b] border-[#f59e0b] border-2 text-black';
            } else if (isSorted) {
              boxClasses = 'bg-[#3b82f6] border-[#3b82f6] border-2 text-white';
            } else if (isStock2Current || isStock2Prev) {
              boxClasses = 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black'; // Cyan with yellow border for comparison
            } else if (isCurrentPointer) {
              boxClasses = 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black'; // Cyan with yellow border
            } else {
              boxClasses = 'bg-[#22d3ee] border-[#22d3ee] border-2 text-black'; // Cyan boxes
            }
          } else {
            if (isSwapping) {
              boxClasses = 'bg-[#f59e0b] border-[#f59e0b] border-2 text-black';
            } else if (isComparing) {
              boxClasses = 'bg-[#22c55e] border-[#22c55e] border-2 text-black';
            } else if (isSorted) {
              boxClasses = 'bg-[#3b82f6] border-[#3b82f6] border-2 text-white';
            } else {
              boxClasses = 'bg-[#1f1f23] border-[#2f2f35] border-2 text-white';
            }
          }
          
          return (
            <div key={index} className="w-[52px] flex justify-center">
              <div
                className={`w-11 h-11 flex items-center justify-center text-lg font-bold transition-all duration-300 ${boxClasses}`}
                data-testid={`array-box-${index}`}
              >
                {value}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pointer labels - BELOW boxes */}
      {(usesDualPointers || usesStartEndPointers) && (
        <div className="flex mt-1" style={{ width: `${array.length * 52}px` }}>
          {array.map((_, index) => (
            <div key={`bottom-pointer-${index}`} className="w-[52px] flex justify-center">
              {usesDualPointers && writePos === index && (
                <span className="text-[#22c55e] text-sm font-semibold">writePos</span>
              )}
              {usesStartEndPointers && endPos === index && (
                <span className="text-[#22c55e] text-sm font-semibold">end</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Variables display for majority-element */}
      {isMajorityElement && variables && (
        <div className="flex gap-6 mt-6" data-testid="algorithm-variables">
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">candidate =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.candidate}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">count =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.count}</span>
          </div>
        </div>
      )}
      
      {/* Variables display for buy-sell-stock */}
      {isBuySellStock && variables && (
        <div className="flex gap-6 mt-6" data-testid="buysell-variables">
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">maxProfit =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.maxProfit}</span>
          </div>
        </div>
      )}
      
      {/* Variables display for buy-sell-stock-2 */}
      {isBuySellStock2 && variables && (
        <div className="flex gap-6 mt-6" data-testid="buysell2-variables">
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">maxProfit =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.maxProfit}</span>
          </div>
        </div>
      )}
      
      {/* Variables display for zero-filled-subarrays */}
      {isZeroFilledSubarrays && variables && (
        <div className="flex gap-6 mt-6" data-testid="zerofilled-variables">
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">zeroCount =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.zeroCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">result =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.result}</span>
          </div>
        </div>
      )}
      
      {/* Variables display for increasing-triplet-subsequence */}
      {isIncreasingTriplet && variables && (
        <div className="flex gap-6 mt-6" data-testid="triplet-variables">
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">first =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.first}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">second =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.second}</span>
          </div>
        </div>
      )}
      
      {/* Variables display for single-number */}
      {isSingleNumber && variables && (
        <div className="flex gap-6 mt-6" data-testid="singlenumber-variables">
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">result =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.result}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Special visualization for Product of Array Except Self - shows Input and Output rows
interface ProductExceptSelfVisualizationProps {
  animationStep?: AnimationStep;
}

const ProductExceptSelfVisualization = ({ animationStep }: ProductExceptSelfVisualizationProps) => {
  const inputArray = animationStep?.inputArray || [];
  const outputArray = animationStep?.outputArray || [];
  const currentI = animationStep?.i ?? -1;
  const rightValue = animationStep?.right ?? -1;
  const phase = animationStep?.phase || 'init';
  const sortedIndices = animationStep?.sorted || [];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full" data-testid="product-except-self-visualization">
      {/* i pointer label - ABOVE the arrays */}
      <div className="flex mb-1" style={{ width: `${inputArray.length * 52}px` }}>
        {inputArray.map((_, index) => (
          <div key={`i-pointer-${index}`} className="w-[52px] flex justify-center">
            {currentI === index && (
              <span className="text-[#22c55e] text-sm font-semibold">i</span>
            )}
          </div>
        ))}
      </div>

      {/* Array indices */}
      <div className="flex">
        {inputArray.map((_, index) => (
          <div key={`idx-${index}`} className="w-[52px] flex justify-center">
            <span className="text-xs text-gray-500">{index}</span>
          </div>
        ))}
      </div>

      {/* Input (nums) row */}
      <div className="flex items-center gap-4 mb-3">
        <span className="text-gray-400 text-sm w-24 text-right">Input (nums)</span>
        <div className="flex">
          {inputArray.map((value, index) => {
            const isCurrentI = currentI === index;
            
            return (
              <div key={`input-${index}`} className="w-[52px] flex justify-center">
                <div
                  className={`w-11 h-11 flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    isCurrentI
                      ? 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black'
                      : 'bg-[#22d3ee] border-[#22d3ee] border-2 text-black'
                  }`}
                  data-testid={`input-box-${index}`}
                >
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output row */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm w-24 text-right">Output</span>
        <div className="flex">
          {outputArray.map((value, index) => {
            const isCurrentI = currentI === index;
            const isSorted = sortedIndices.includes(index);
            const isComplete = phase === 'complete';
            
            return (
              <div key={`output-${index}`} className="w-[52px] flex justify-center">
                <div
                  className={`w-11 h-11 flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    isComplete || isSorted
                      ? 'bg-[#3b82f6] border-[#3b82f6] border-2 text-white'
                      : isCurrentI
                      ? 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black'
                      : 'bg-[#22d3ee] border-[#22d3ee] border-2 text-black'
                  }`}
                  data-testid={`output-box-${index}`}
                >
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right variable display during right pass */}
      {(phase === 'right-init' || phase === 'right-pass' || phase === 'right-update') && rightValue !== -1 && (
        <div className="flex gap-6 mt-6" data-testid="product-variables">
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">right =</span>
            <span className="text-[#22c55e] font-bold text-xl">{rightValue}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// String visualization for Is Subsequence
interface IsSubsequenceVisualizationProps {
  animationStep?: AnimationStep;
}

const IsSubsequenceVisualization = ({ animationStep }: IsSubsequenceVisualizationProps) => {
  const s = animationStep?.s || "";
  const t = animationStep?.t || "";
  const sPointer = animationStep?.sPointer ?? -1;
  const tPointer = animationStep?.tPointer ?? -1;
  const matchedS = animationStep?.matchedS || [];
  const isMatch = animationStep?.isMatch ?? false;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6" data-testid="is-subsequence-visualization">
      {/* String s row */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm w-8 text-right">s:</span>
        <div className="flex flex-col">
          {/* i pointer above */}
          <div className="flex">
            {s.split('').map((_, index) => (
              <div key={`s-ptr-${index}`} className="w-[44px] flex justify-center">
                {sPointer === index && (
                  <span className="text-[#22c55e] text-sm font-semibold">i</span>
                )}
              </div>
            ))}
          </div>
          {/* Characters */}
          <div className="flex">
            {s.split('').map((char, index) => (
              <div key={`s-${index}`} className="w-[44px] flex justify-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
                    matchedS.includes(index)
                      ? 'bg-[#22c55e] border-[#22c55e] text-black'
                      : sPointer === index
                      ? 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black'
                      : 'bg-[#22d3ee] border-[#22d3ee] text-black'
                  }`}
                >
                  {char}
                </div>
              </div>
            ))}
          </div>
          {/* Indices */}
          <div className="flex">
            {s.split('').map((_, index) => (
              <div key={`s-idx-${index}`} className="w-[44px] flex justify-center">
                <span className="text-xs text-gray-500">{index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* String t row */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm w-8 text-right">t:</span>
        <div className="flex flex-col">
          {/* j pointer above */}
          <div className="flex">
            {t.split('').map((_, index) => (
              <div key={`t-ptr-${index}`} className="w-[44px] flex justify-center">
                {tPointer === index && (
                  <span className="text-[#f59e0b] text-sm font-semibold">j</span>
                )}
              </div>
            ))}
          </div>
          {/* Characters */}
          <div className="flex">
            {t.split('').map((char, index) => (
              <div key={`t-${index}`} className="w-[44px] flex justify-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
                    tPointer === index && isMatch
                      ? 'bg-[#22c55e] border-[#22c55e] text-black'
                      : tPointer === index
                      ? 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black'
                      : 'bg-[#22d3ee] border-[#22d3ee] text-black'
                  }`}
                >
                  {char}
                </div>
              </div>
            ))}
          </div>
          {/* Indices */}
          <div className="flex">
            {t.split('').map((_, index) => (
              <div key={`t-idx-${index}`} className="w-[44px] flex justify-center">
                <span className="text-xs text-gray-500">{index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// String visualization for Valid Palindrome
interface ValidPalindromeVisualizationProps {
  animationStep?: AnimationStep;
}

const ValidPalindromeVisualization = ({ animationStep }: ValidPalindromeVisualizationProps) => {
  const s = animationStep?.s || "";
  const left = animationStep?.left ?? -1;
  const right = animationStep?.right ?? -1;
  const matchedIndices = animationStep?.matchedIndices || [];
  const isMatch = animationStep?.isMatch ?? false;
  const mismatch = animationStep?.mismatch ?? false;

  // Calculate the total width needed for the visualization
  const totalWidth = s.length * 44;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-2" data-testid="valid-palindrome-visualization">
      {/* Scrollable container that holds all rows in sync */}
      <div className="overflow-x-auto max-w-full px-4" style={{ scrollbarWidth: 'thin' }}>
        <div style={{ width: `${totalWidth}px`, minWidth: 'fit-content' }}>
          {/* Pointers above */}
          <div className="flex">
            {s.split('').map((_, index) => (
              <div key={`ptr-${index}`} className="w-[44px] flex-shrink-0 flex flex-col items-center justify-end h-10">
                {left === index && left === right ? (
                  // When both pointers are at same position, stack them
                  <>
                    <span className="text-[#22c55e] text-xs font-semibold leading-tight">left</span>
                    <span className="text-[#f59e0b] text-xs font-semibold leading-tight">right</span>
                  </>
                ) : (
                  <>
                    {left === index && (
                      <span className="text-[#22c55e] text-sm font-semibold">left</span>
                    )}
                    {right === index && (
                      <span className="text-[#f59e0b] text-sm font-semibold">right</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Characters */}
          <div className="flex">
            {s.split('').map((char, index) => (
              <div key={`char-${index}`} className="w-[44px] flex-shrink-0 flex justify-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
                    mismatch && (left === index || right === index)
                      ? 'bg-red-500 border-red-500 text-white'
                      : matchedIndices.includes(index) || (isMatch && (left === index || right === index))
                      ? 'bg-[#22c55e] border-[#22c55e] text-black'
                      : left === index || right === index
                      ? 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black'
                      : 'bg-[#22d3ee] border-[#22d3ee] text-black'
                  }`}
                >
                  {char}
                </div>
              </div>
            ))}
          </div>
          
          {/* Indices */}
          <div className="flex">
            {s.split('').map((_, index) => (
              <div key={`idx-${index}`} className="w-[44px] flex-shrink-0 flex justify-center">
                <span className="text-xs text-gray-500">{index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// String visualization for Longest Common Prefix
interface LongestCommonPrefixVisualizationProps {
  animationStep?: AnimationStep;
}

const LongestCommonPrefixVisualization = ({ animationStep }: LongestCommonPrefixVisualizationProps) => {
  const strings = animationStep?.strings || [];
  const currentChar = animationStep?.currentChar ?? -1;
  const prefix = animationStep?.prefix || "";
  const mismatchString = animationStep?.mismatchString ?? -1;
  const isMatch = animationStep?.isMatch ?? false;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4" data-testid="lcp-visualization">
      {/* Column pointer */}
      {strings.length > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm w-16 text-right"></span>
          <div className="flex">
            {strings[0].split('').map((_, index) => (
              <div key={`ptr-${index}`} className="w-[44px] flex justify-center">
                {currentChar === index && (
                  <span className="text-[#22c55e] text-sm font-semibold">↓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* String rows */}
      {strings.map((str, strIdx) => (
        <div key={`str-${strIdx}`} className="flex items-center gap-4">
          <span className="text-gray-400 text-sm w-16 text-right">str[{strIdx}]:</span>
          <div className="flex">
            {str.split('').map((char, charIdx) => (
              <div key={`char-${strIdx}-${charIdx}`} className="w-[44px] flex justify-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center text-lg font-bold border-2 transition-all duration-300 ${
                    mismatchString === strIdx && currentChar === charIdx
                      ? 'bg-red-500 border-red-500 text-white'
                      : charIdx < prefix.length
                      ? 'bg-[#22c55e] border-[#22c55e] text-black'
                      : currentChar === charIdx && isMatch
                      ? 'bg-[#22c55e] border-[#22c55e] text-black'
                      : currentChar === charIdx
                      ? 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black'
                      : 'bg-[#22d3ee] border-[#22d3ee] text-black'
                  }`}
                >
                  {char}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Prefix display */}
      <div className="mt-4 flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
        <span className="text-gray-400 text-sm">prefix =</span>
        <span className="text-[#22c55e] font-bold text-xl">"{prefix}"</span>
      </div>
    </div>
  );
};

// String visualization for Reverse Words
interface ReverseWordsVisualizationProps {
  animationStep?: AnimationStep;
}

const ReverseWordsVisualization = ({ animationStep }: ReverseWordsVisualizationProps) => {
  const words = animationStep?.words || [];
  const reversed = animationStep?.reversed || [];
  const currentWord = animationStep?.currentWord ?? -1;
  const result = animationStep?.result;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-6" data-testid="reverse-words-visualization">
      {/* Original words */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm w-20 text-right">Original:</span>
        <div className="flex gap-2">
          {words.map((word, index) => (
            <div
              key={`orig-${index}`}
              className={`px-3 py-2 flex items-center justify-center text-lg font-bold border-2 rounded transition-all duration-300 ${
                currentWord === index
                  ? 'bg-[#f59e0b] border-[#f59e0b] text-black'
                  : 'bg-[#22d3ee] border-[#22d3ee] text-black'
              }`}
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      {/* Reversed words */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm w-20 text-right">Reversed:</span>
        <div className="flex gap-2 min-h-[44px]">
          {reversed.map((word, index) => (
            <div
              key={`rev-${index}`}
              className="px-3 py-2 flex items-center justify-center text-lg font-bold border-2 rounded bg-[#22c55e] border-[#22c55e] text-black transition-all duration-300"
            >
              {word}
            </div>
          ))}
        </div>
      </div>

      {/* Result display */}
      {result && (
        <div className="mt-4 flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
          <span className="text-gray-400 text-sm">result =</span>
          <span className="text-[#22c55e] font-bold text-lg">"{result}"</span>
        </div>
      )}
    </div>
  );
};

// Counting Bits visualization
interface CountingBitsVisualizationProps {
  animationStep?: AnimationStep;
}

const CountingBitsVisualization = ({ animationStep }: CountingBitsVisualizationProps) => {
  const res = animationStep?.res || [];
  const i = animationStep?.i ?? -1;
  const pow = animationStep?.pow ?? 1;
  const x = animationStep?.x ?? 1;
  const highlightedIndex = animationStep?.highlightedIndex ?? -1;
  const referenceIndex = animationStep?.referenceIndex ?? -1;
  const isPowerOfTwo = animationStep?.isPowerOfTwo ?? false;
  const justUpdated = animationStep?.justUpdated ?? false;
  const isComplete = animationStep?.isComplete ?? false;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4" data-testid="counting-bits-visualization">
      {/* i pointer above */}
      <div className="flex">
        {res.map((_, index) => (
          <div key={`ptr-${index}`} className="w-[52px] flex justify-center">
            {i === index && (
              <span className="text-[#22c55e] text-sm font-semibold">i</span>
            )}
          </div>
        ))}
      </div>

      {/* Array boxes showing the result values */}
      <div className="flex">
        {res.map((value, index) => {
          const isCurrentI = highlightedIndex === index;
          const isReference = referenceIndex === index;
          const isUpdated = justUpdated && highlightedIndex === index;
          
          let boxClasses = '';
          if (isComplete) {
            boxClasses = 'bg-[#3b82f6] border-[#3b82f6] border-2 text-white';
          } else if (isUpdated) {
            boxClasses = 'bg-[#22c55e] border-[#22c55e] border-2 text-black';
          } else if (isPowerOfTwo && isCurrentI) {
            boxClasses = 'bg-[#f59e0b] border-[#f59e0b] border-2 text-black';
          } else if (isCurrentI) {
            boxClasses = 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black';
          } else if (isReference) {
            boxClasses = 'bg-[#a855f7] border-[#a855f7] border-2 text-white';
          } else {
            boxClasses = 'bg-[#22d3ee] border-[#22d3ee] border-2 text-black';
          }

          return (
            <div key={index} className="w-[52px] flex justify-center">
              <div
                className={`w-11 h-11 flex items-center justify-center text-lg font-bold transition-all duration-300 ${boxClasses}`}
                data-testid={`res-box-${index}`}
              >
                {value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Array indices */}
      <div className="flex">
        {res.map((_, index) => (
          <div key={`idx-${index}`} className="w-[52px] flex justify-center">
            <span className="text-xs text-gray-500">{index}</span>
          </div>
        ))}
      </div>

      {/* Variables display */}
      <div className="flex gap-4 mt-4" data-testid="counting-bits-variables">
        <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
          <span className="text-gray-400 text-sm">pow =</span>
          <span className="text-[#22c55e] font-bold text-xl">{pow}</span>
        </div>
        <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
          <span className="text-gray-400 text-sm">x =</span>
          <span className="text-[#22c55e] font-bold text-xl">{x}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#22d3ee] rounded" />
          <span className="text-gray-400">Current (i)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#a855f7] rounded" />
          <span className="text-gray-400">Reference (i-x)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#f59e0b] rounded" />
          <span className="text-gray-400">Power of 2</span>
        </div>
      </div>
    </div>
  );
};

// Single Number III visualization
interface SingleNumberIIIVisualizationProps {
  animationStep?: AnimationStep;
}

const SingleNumberIIIVisualization = ({ animationStep }: SingleNumberIIIVisualizationProps) => {
  const array = animationStep?.array || [];
  const i = animationStep?.i ?? -1;
  const phase = animationStep?.phase || 'init';
  const xor = animationStep?.xor ?? 0;
  const diff = animationStep?.diff ?? 0;
  const result = animationStep?.result || [0, 0];
  const highlightedIndex = animationStep?.highlightedIndex ?? -1;
  const group = animationStep?.group;
  const isComplete = animationStep?.isComplete ?? false;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4" data-testid="single-number-iii-visualization">
      {/* i pointer above */}
      <div className="flex">
        {array.map((_, index) => (
          <div key={`ptr-${index}`} className="w-[52px] flex justify-center">
            {i === index && (
              <span className="text-[#22c55e] text-sm font-semibold">i</span>
            )}
          </div>
        ))}
      </div>

      {/* Array boxes */}
      <div className="flex">
        {array.map((value, index) => {
          const isCurrentI = highlightedIndex === index;
          const isGroup0 = isCurrentI && group === 0;
          const isGroup1 = isCurrentI && group === 1;
          
          let boxClasses = '';
          if (isComplete) {
            // Highlight the two unique numbers in the final result
            if (value === result[0] || value === result[1]) {
              boxClasses = 'bg-[#22c55e] border-[#22c55e] border-2 text-black';
            } else {
              boxClasses = 'bg-[#3b82f6] border-[#3b82f6] border-2 text-white';
            }
          } else if (isGroup0) {
            boxClasses = 'bg-[#a855f7] border-[#a855f7] border-2 text-white'; // Purple for Group 0
          } else if (isGroup1) {
            boxClasses = 'bg-[#f59e0b] border-[#f59e0b] border-2 text-black'; // Orange for Group 1
          } else if (isCurrentI) {
            boxClasses = 'bg-[#22d3ee] border-yellow-400 border-[3px] text-black';
          } else {
            boxClasses = 'bg-[#22d3ee] border-[#22d3ee] border-2 text-black';
          }

          return (
            <div key={index} className="w-[52px] flex justify-center">
              <div
                className={`w-11 h-11 flex items-center justify-center text-lg font-bold transition-all duration-300 ${boxClasses}`}
                data-testid={`array-box-${index}`}
              >
                {value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Array indices */}
      <div className="flex">
        {array.map((_, index) => (
          <div key={`idx-${index}`} className="w-[52px] flex justify-center">
            <span className="text-xs text-gray-500">{index}</span>
          </div>
        ))}
      </div>

      {/* Variables display */}
      <div className="flex flex-wrap gap-3 mt-4 justify-center" data-testid="single-number-iii-variables">
        <div className="flex items-center gap-2 bg-[#1f1f23] px-3 py-2 rounded-lg">
          <span className="text-gray-400 text-sm">xor =</span>
          <span className="text-[#22c55e] font-bold text-lg">{xor}</span>
        </div>
        {(phase === 'phase2' || phase === 'phase3-start' || phase === 'phase3' || phase === 'complete') && (
          <div className="flex items-center gap-2 bg-[#1f1f23] px-3 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">diff =</span>
            <span className="text-[#22c55e] font-bold text-lg">{diff}</span>
          </div>
        )}
        {(phase === 'phase3-start' || phase === 'phase3' || phase === 'complete') && (
          <>
            <div className="flex items-center gap-2 bg-[#a855f7]/20 border border-[#a855f7] px-3 py-2 rounded-lg">
              <span className="text-gray-400 text-sm">result[0] =</span>
              <span className="text-[#a855f7] font-bold text-lg">{result[0]}</span>
            </div>
            <div className="flex items-center gap-2 bg-[#f59e0b]/20 border border-[#f59e0b] px-3 py-2 rounded-lg">
              <span className="text-gray-400 text-sm">result[1] =</span>
              <span className="text-[#f59e0b] font-bold text-lg">{result[1]}</span>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#22d3ee] rounded" />
          <span className="text-gray-400">Current</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#a855f7] rounded" />
          <span className="text-gray-400">Group 0</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#f59e0b] rounded" />
          <span className="text-gray-400">Group 1</span>
        </div>
      </div>
    </div>
  );
};

interface BarChartVisualizationProps {
  array: number[];
  highlightedIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  maxValue: number;
  animationStep?: AnimationStep;
  algorithmId: string;
}

const BarChartVisualization = ({ 
  array, 
  highlightedIndices, 
  swappingIndices, 
  sortedIndices,
  maxValue,
  animationStep,
  algorithmId
}: BarChartVisualizationProps) => {
  // Calculate dynamic gap based on array length
  const gapClass = array.length > 15 ? 'gap-1' : array.length > 10 ? 'gap-2' : 'gap-3';
  const barWidth = array.length > 15 ? 'w-5 md:w-6' : array.length > 10 ? 'w-6 md:w-8' : 'w-8 md:w-10';
  
  // Extract current index and variables for buy-sell-stock
  const isBuySellStock = algorithmId === 'best-time-to-buy-and-sell-stock';
  const currentIndex = animationStep?.currentIndex ?? -1;
  const variables = animationStep?.variables;
  
  return (
    <div className="flex flex-col items-center justify-center h-full" data-testid="bar-chart-visualization">
      {/* i pointer label - ABOVE bars */}
      {isBuySellStock && (
        <div className="flex justify-center mb-2" style={{ width: `${array.length * 52}px` }}>
          {array.map((_, index) => (
            <div key={`pointer-${index}`} className="w-[52px] flex justify-center">
              {currentIndex === index && (
                <span className="text-[#22c55e] text-sm font-semibold">i</span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Bar chart */}
      <div className={`flex items-end justify-center ${gapClass} px-4 overflow-x-auto`}>
        {array.map((value, index) => {
          const isCurrentIndex = isBuySellStock && currentIndex === index;
          const isComparing = highlightedIndices.includes(index);
          const isSwapping = swappingIndices.includes(index);
          const isSorted = sortedIndices.includes(index);
          const absValue = Math.abs(value);
          const heightPercent = (absValue / maxValue) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center gap-1 flex-shrink-0">
              <span className={`text-xs font-medium whitespace-nowrap ${isCurrentIndex || isComparing || isSwapping ? 'text-white' : 'text-gray-400'}`}>
                {value}
              </span>
              <div
                className={`${barWidth} rounded-t transition-all duration-300 ${
                  isSwapping 
                    ? 'bg-[#f59e0b]' 
                    : isCurrentIndex || isComparing 
                    ? 'bg-[#22c55e]' 
                    : isSorted 
                    ? 'bg-[#3b82f6]' 
                    : 'bg-[#06b6d4]'
                }`}
                style={{ 
                  height: `${Math.max(heightPercent * 1.5, 20)}px`,
                  minHeight: '20px'
                }}
                data-testid={`bar-${index}`}
              />
              <span className="text-xs text-gray-500">{index}</span>
            </div>
          );
        })}
      </div>
      
      {/* Variables display for buy-sell-stock */}
      {isBuySellStock && variables && (
        <div className="flex gap-6 mt-6" data-testid="buysell-variables">
          <div className="flex items-center gap-2 bg-[#1f1f23] px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">maxProfit =</span>
            <span className="text-[#22c55e] font-bold text-xl">{variables.maxProfit}</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface VisualizationPanelProps {
  algorithmId: string;
  category?: string;
  currentArray: number[];
  highlightedIndices: number[];
  swappingIndices: number[];
  sortedIndices: number[];
  animationStep?: AnimationStep;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

const VisualizationPanel = ({ 
  algorithmId,
  category,
  currentArray,
  highlightedIndices,
  swappingIndices,
  sortedIndices,
  animationStep,
  onTouchStart,
  onTouchEnd
}: VisualizationPanelProps) => {
  const maxValue = Math.max(...currentArray.map(v => Math.abs(v)), 1);
  const variables = animationStep?.variables;
  
  // Determine which visualization to use based on category
  const isTreeAlgorithm = category === 'Tree' || category === 'BST';
  const isLinkedListAlgorithm = category === 'Linked List';
  const isStackAlgorithm = category === 'Stack';
  const isQueueAlgorithm = category === 'Queue';
  const isMatrixAlgorithm = category === 'Matrix';
  const isGraphAlgorithm = category === 'Graph';
  const isIslandAlgorithm = algorithmId === 'number-of-islands' || algorithmId === 'max-area-of-island';
  const isBoxVisualization = BOX_VISUALIZATION_ALGORITHMS.includes(algorithmId);

  return (
    <div 
      className="flex-1 flex items-center justify-center p-4 min-h-[200px]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      data-testid="visualization-panel"
    >
      {/* Legend */}
      <div className="absolute top-4 right-4 flex items-center gap-4 text-xs" data-testid="visualization-legend">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#06b6d4]" />
          <span className="text-gray-400">Unsorted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#22c55e]" />
          <span className="text-gray-400">Comparing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#f59e0b]" />
          <span className="text-gray-400">Swapping</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#3b82f6]" />
          <span className="text-gray-400">Sorted/Result</span>
        </div>
      </div>
      
      {/* Visualization content */}
      {isTreeAlgorithm ? (
        <TreeVisualization 
          step={animationStep}
          highlightedIndices={highlightedIndices}
        />
      ) : isLinkedListAlgorithm ? (
        <LinkedListVisualization 
          array={currentArray}
          highlightedIndices={highlightedIndices}
          step={animationStep}
        />
      ) : isStackAlgorithm ? (
        <StackVisualization 
          step={animationStep}
          highlightedIndices={highlightedIndices}
        />
      ) : isQueueAlgorithm ? (
        <QueueVisualization 
          step={animationStep}
          highlightedIndices={highlightedIndices}
        />
      ) : isMatrixAlgorithm ? (
        <MatrixVisualization 
          step={animationStep}
          highlightedIndices={highlightedIndices}
        />
      ) : isIslandAlgorithm ? (
        <IslandGridVisualization 
          step={animationStep}
        />
      ) : isGraphAlgorithm ? (
        <GraphVisualization 
          step={animationStep}
          highlightedIndices={highlightedIndices}
        />
      ) : algorithmId === 'product-except-self' ? (
        <ProductExceptSelfVisualization
          animationStep={animationStep}
        />
      ) : animationStep?.algorithmType === 'is-subsequence' ? (
        <IsSubsequenceVisualization
          animationStep={animationStep}
        />
      ) : animationStep?.algorithmType === 'valid-palindrome' ? (
        <ValidPalindromeVisualization
          animationStep={animationStep}
        />
      ) : animationStep?.algorithmType === 'longest-common-prefix' ? (
        <LongestCommonPrefixVisualization
          animationStep={animationStep}
        />
      ) : animationStep?.algorithmType === 'reverse-words' ? (
        <ReverseWordsVisualization
          animationStep={animationStep}
        />
      ) : animationStep?.algorithmType === 'counting-bits' ? (
        <CountingBitsVisualization
          animationStep={animationStep}
        />
      ) : animationStep?.algorithmType === 'single-number-iii' ? (
        <SingleNumberIIIVisualization
          animationStep={animationStep}
        />
      ) : isBoxVisualization ? (
        <ArrayBoxVisualization
          array={currentArray}
          highlightedIndices={highlightedIndices}
          swappingIndices={swappingIndices}
          sortedIndices={sortedIndices}
          variables={variables}
          algorithmId={algorithmId}
          animationStep={animationStep}
        />
      ) : (
        <BarChartVisualization
          array={currentArray}
          highlightedIndices={highlightedIndices}
          swappingIndices={swappingIndices}
          sortedIndices={sortedIndices}
          maxValue={maxValue}
          animationStep={animationStep}
          algorithmId={algorithmId}
        />
      )}
    </div>
  );
};

export default VisualizationPanel;
