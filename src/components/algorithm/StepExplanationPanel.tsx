'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Code, Zap } from 'lucide-react';

interface StepExplanation {
  why: string;
  concept: string;
  codeHint: string;
}

interface StepExplanationPattern extends StepExplanation {
  keywords: string[];
}

// Detailed step explanations for algorithms
const stepExplanations: Record<string, { pattern: StepExplanationPattern[] }> = {
  // Sorting algorithms
  'bubble-sort': {
    pattern: [
      { 
        keywords: ['Initialize', 'Start'],
        why: "We start by examining the entire array. Bubble sort works by repeatedly stepping through the list and comparing adjacent elements.",
        concept: "The outer loop will run n-1 times, where n is the array length. Each pass 'bubbles' the largest unsorted element to its correct position.",
        codeHint: "Lines 1-2 set up our nested loop structure."
      },
      {
        keywords: ['Compare', 'Comparing'],
        why: "We compare adjacent elements to determine if they're in the wrong order. If the left element is greater than the right, they need to be swapped.",
        concept: "This comparison is the core of bubble sort - we're checking if arr[j] > arr[j+1].",
        codeHint: "The if condition checks whether adjacent elements are out of order."
      },
      {
        keywords: ['Swap', 'Swapping'],
        why: "When we find two adjacent elements in the wrong order, we swap them. This gradually moves larger elements toward the end of the array.",
        concept: "Each swap brings us one step closer to a sorted array. The largest unsorted element 'bubbles up' to its correct position.",
        codeHint: "The swap operation uses a temporary variable to exchange values."
      },
      {
        keywords: ['sorted', 'Sorted', 'position', 'complete'],
        why: "After each complete pass through the array, the largest unsorted element is guaranteed to be in its final position.",
        concept: "This is why bubble sort is called 'bubble' sort - elements bubble up to their correct positions like air bubbles rising in water.",
        codeHint: "The sorted portion grows from the end of the array."
      }
    ]
  },
  'selection-sort': {
    pattern: [
      {
        keywords: ['Initialize', 'Start', 'minimum'],
        why: "We assume the current position holds the minimum value. Then we'll scan the rest of the array to find if there's a smaller element.",
        concept: "Selection sort divides the array into sorted (left) and unsorted (right) portions. We always find the minimum from the unsorted portion.",
        codeHint: "minIdx stores the index of the smallest element found so far."
      },
      {
        keywords: ['Compare', 'Comparing', 'check'],
        why: "We're scanning through the unsorted portion to find the actual minimum element.",
        concept: "By comparing each element with our current minimum, we ensure we find the smallest value in the unsorted region.",
        codeHint: "If we find a smaller element, we update minIdx."
      },
      {
        keywords: ['Swap', 'swap', 'place'],
        why: "Once we've found the minimum, we swap it to the beginning of the unsorted portion, extending our sorted region by one.",
        concept: "This swap operation is what makes selection sort efficient in terms of swaps - we only do one swap per pass.",
        codeHint: "The swap places the minimum element in its final sorted position."
      }
    ]
  },
  'insertion-sort': {
    pattern: [
      {
        keywords: ['key', 'current', 'examining'],
        why: "We pick an element (the 'key') and will insert it into its correct position among the already-sorted elements to its left.",
        concept: "Think of sorting playing cards - you pick a card and insert it in the right spot among the cards you're already holding.",
        codeHint: "The key is stored separately so we can shift elements without losing it."
      },
      {
        keywords: ['shift', 'Shift', 'moving'],
        why: "We shift larger elements one position to the right to make room for the key at its correct position.",
        concept: "Instead of swapping, we shift - this is more efficient as we only write the key once at the end.",
        codeHint: "Elements greater than key move right, creating a gap for insertion."
      },
      {
        keywords: ['insert', 'Insert', 'place'],
        why: "We've found the correct position and now insert the key, maintaining the sorted order of the left portion.",
        concept: "The key is now in its correct position relative to all elements before it.",
        codeHint: "The key is placed in the gap created by the shifts."
      }
    ]
  },
  // Two pointers
  'two-sum-ii': {
    pattern: [
      {
        keywords: ['Initialize', 'pointers'],
        why: "We use two pointers - one at the start (smallest) and one at the end (largest) of the sorted array.",
        concept: "Since the array is sorted, we can use the two-pointer technique to find the target sum efficiently in O(n) time.",
        codeHint: "left = 0, right = length - 1"
      },
      {
        keywords: ['sum', 'Sum', 'add'],
        why: "We calculate the sum of elements at our two pointers and compare it with the target.",
        concept: "If sum equals target, we found our answer. If sum is too small, move left pointer right. If too large, move right pointer left.",
        codeHint: "The sorted property lets us know which pointer to move."
      }
    ]
  },
  // Bit manipulation
  'single-number': {
    pattern: [
      {
        keywords: ['Initialize', 'result'],
        why: "We start with result = 0 because XOR with 0 gives us the original number (x XOR 0 = x).",
        concept: "XOR has a special property: a XOR a = 0 (any number XOR itself is 0). We'll use this to cancel out duplicates.",
        codeHint: "result = 0 is our starting point."
      },
      {
        keywords: ['XOR', 'xor'],
        why: "XORing all numbers together cancels out the duplicates (they appear twice), leaving only the single number.",
        concept: "XOR is associative and commutative, so the order doesn't matter. Pairs cancel to 0, and 0 XOR single = single.",
        codeHint: "result ^= nums[i] accumulates the XOR of all elements."
      }
    ]
  },
  'single-number-iii': {
    pattern: [
      {
        keywords: ['XOR all', 'Phase 1'],
        why: "XORing all numbers gives us xor = a XOR b, where a and b are the two unique numbers. Duplicates cancel out.",
        concept: "Since every other number appears twice, they cancel to 0. We're left with the XOR of the two numbers we're looking for.",
        codeHint: "First pass: xor ^= num for all numbers."
      },
      {
        keywords: ['rightmost', 'diff', 'Phase 2'],
        why: "The rightmost set bit in xor tells us a bit position where a and b differ. We use this to separate them into two groups.",
        concept: "diff = xor & (-xor) isolates the rightmost set bit. This bit is 1 in one unique number and 0 in the other.",
        codeHint: "This is a clever bit manipulation trick using two's complement."
      },
      {
        keywords: ['Group', 'group', 'Phase 3', 'Separate'],
        why: "We split all numbers into two groups based on the diff bit. Each group will contain one unique number plus some duplicates.",
        concept: "Numbers with diff bit = 0 go to group 0, others to group 1. Duplicates go to the same group and cancel out via XOR.",
        codeHint: "(num & diff) == 0 determines the group."
      }
    ]
  },
  'counting-bits': {
    pattern: [
      {
        keywords: ['Initialize', 'zeros'],
        why: "We create an array of size n+1 initialized with zeros. res[i] will store the count of 1-bits in the binary representation of i.",
        concept: "This is a dynamic programming approach - we'll use previously computed results to find new ones efficiently.",
        codeHint: "res[0] = 0 is our base case (0 has no 1-bits)."
      },
      {
        keywords: ['power of two', 'pow'],
        why: "Powers of two (1, 2, 4, 8...) have exactly one 1-bit. When i reaches a power of two, we update our reference point.",
        concept: "Numbers between consecutive powers of two follow a pattern: their bit counts equal 1 + bit count of (i - last power of two).",
        codeHint: "pow tracks the current power of two, x tracks the offset."
      },
      {
        keywords: ['res[i]', 'i - x'],
        why: "For any number i, its bit count equals 1 (for the leading bit) plus the bit count of (i - last power of two).",
        concept: "Example: bits(5) = bits(4) + bits(1) = 1 + 1 = 2. This DP relation makes the solution O(n).",
        codeHint: "res[i] = res[i - x] + 1"
      }
    ]
  },
  // Array algorithms
  'move-zeroes': {
    pattern: [
      {
        keywords: ['Initialize', 'writePos', 'readPos'],
        why: "We use two pointers: readPos scans through the array, writePos tracks where to place the next non-zero element.",
        concept: "This is a partition technique - we're separating non-zeros from zeros while maintaining relative order.",
        codeHint: "writePos starts at 0, readPos moves through the array."
      },
      {
        keywords: ['non-zero', 'swap', 'move'],
        why: "When we find a non-zero, we place it at writePos and increment writePos. This collects all non-zeros at the front.",
        concept: "By the end, all non-zeros are at the front (in original order), and all zeros are at the back.",
        codeHint: "We swap arr[writePos] and arr[readPos]."
      }
    ]
  },
  'product-except-self': {
    pattern: [
      {
        keywords: ['left', 'prefix'],
        why: "First pass: calculate prefix products. output[i] = product of all elements before index i.",
        concept: "We build up products from left to right, so output[i] contains the product of elements 0 to i-1.",
        codeHint: "output[i] = output[i-1] * nums[i-1]"
      },
      {
        keywords: ['right', 'suffix', 'multiply'],
        why: "Second pass: multiply by suffix products. We traverse right to left, multiplying each output[i] by the product of elements after i.",
        concept: "After both passes, output[i] = (product of elements before i) × (product of elements after i).",
        codeHint: "We maintain a running 'right' product."
      }
    ]
  }
};

// Default explanation for algorithms without specific patterns
const defaultExplanation = {
  why: "This step processes the current element according to the algorithm's logic.",
  concept: "Each step brings us closer to the final solution by updating our state based on the current element.",
  codeHint: "Follow the highlighted code lines to understand the operation."
};

interface StepExplanationPanelProps {
  algorithmId: string;
  currentDescription?: string;
  highlightedLines?: number[];
}

const StepExplanationPanel = ({ algorithmId, currentDescription, highlightedLines }: StepExplanationPanelProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Find matching explanation based on keywords in description
  const getExplanation = (): StepExplanation => {
    const patterns = stepExplanations[algorithmId]?.pattern || [];
    
    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => 
        currentDescription?.toLowerCase().includes(keyword.toLowerCase())
      )) {
        return pattern;
      }
    }
    
    return defaultExplanation;
  };

  const explanation = getExplanation();

  return (
    <div className="bg-[#141416] border border-[#1f1f23] rounded-lg overflow-hidden" data-testid="step-explanation-panel">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0f0f11] hover:bg-[#1a1a1c] transition-colors"
        data-testid="explanation-toggle"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#a855f7]" />
          <h3 className="text-white font-semibold">Why This Step?</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-4 space-y-4" data-testid="explanation-content">
          {/* Why */}
          <div className="bg-[#0c0c0e] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="text-[#22c55e] font-medium text-xs uppercase tracking-wide">Why?</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {explanation.why}
            </p>
          </div>

          {/* Concept */}
          <div className="bg-[#0c0c0e] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-3.5 h-3.5 text-[#3b82f6]" />
              <span className="text-[#3b82f6] font-medium text-xs uppercase tracking-wide">Concept</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {explanation.concept}
            </p>
          </div>

          {/* Code Hint */}
          <div className="bg-gradient-to-r from-[#a855f7]/10 to-transparent border-l-2 border-[#a855f7] rounded-r-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Code className="w-3.5 h-3.5 text-[#a855f7]" />
              <span className="text-[#a855f7] font-medium text-xs uppercase tracking-wide">Code Hint</span>
            </div>
            <p className="text-gray-400 text-sm">
              {explanation.codeHint}
              {highlightedLines && highlightedLines.length > 0 && (
                <span className="text-[#a855f7] ml-1">
                  (Lines {highlightedLines.join(', ')})
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepExplanationPanel;
