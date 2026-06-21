// Animation engine for generating step-by-step algorithm visualizations

export const generateAnimationSteps = (algorithmId, arr) => {
  // Sorting algorithms
  if (['bubble-sort', 'selection-sort', 'insertion-sort'].includes(algorithmId)) {
    if (algorithmId === 'bubble-sort') return generateBubbleSortSteps(arr);
    if (algorithmId === 'selection-sort') return generateSelectionSortSteps(arr);
    if (algorithmId === 'insertion-sort') return generateInsertionSortSteps(arr);
  }

  // Array algorithms
  if (['move-zeroes', 'majority-element', 'remove-duplicates', 'best-time-to-buy-and-sell-stock', 
       'best-time-to-buy-and-sell-stock-2', 'rotate-array', 'product-except-self', 'first-missing-positive',
       'zero-filled-subarrays', 'increasing-triplet-subsequence'].includes(algorithmId)) {
    if (algorithmId === 'move-zeroes') return generateMoveZeroesSteps(arr);
    if (algorithmId === 'majority-element') return generateMajorityElementSteps(arr);
    if (algorithmId === 'remove-duplicates') return generateRemoveDuplicatesSteps(arr);
    if (algorithmId === 'best-time-to-buy-and-sell-stock') return generateBuySellStockSteps(arr);
    if (algorithmId === 'best-time-to-buy-and-sell-stock-2') return generateBuySellStock2Steps(arr);
    if (algorithmId === 'rotate-array') return generateRotateArraySteps(arr);
    if (algorithmId === 'product-except-self') return generateProductExceptSelfSteps(arr);
    if (algorithmId === 'zero-filled-subarrays') return generateZeroFilledSubarraysSteps(arr);
    if (algorithmId === 'increasing-triplet-subsequence') return generateIncreasingTripletSteps(arr);
    if (algorithmId === 'first-missing-positive') return generateFirstMissingPositiveSteps(arr);
  }

  // Two Pointers
  if (['two-sum-ii', 'container-with-most-water', 'three-sum', 'trapping-rain-water', 'merge-sorted-array'].includes(algorithmId)) {
    if (algorithmId === 'two-sum-ii') return generateTwoSumSteps(arr);
    if (algorithmId === 'container-with-most-water') return generateContainerWaterSteps(arr);
    if (algorithmId === 'trapping-rain-water') return generateTrappingRainWaterSteps(arr);
    if (algorithmId === 'merge-sorted-array') return generateMergeSortedArraySteps(arr);
    if (algorithmId === 'three-sum') return generateThreeSumSteps(arr);
  }

  // Binary Search
  if (['search-insert-position', 'search-rotated-array', 'find-peak-element', 'find-minimum-rotated'].includes(algorithmId)) {
    if (algorithmId === 'search-insert-position') return generateBinarySearchSteps(arr);
    if (algorithmId === 'search-rotated-array') return generateRotatedSearchSteps(arr);
    if (algorithmId === 'find-peak-element') return generateFindPeakSteps(arr);
  }

  // Sliding Window
  if (['maximum-average-subarray-i', 'longest-substring-without-repeating-characters', 'minimum-window-substring'].includes(algorithmId)) {
    if (algorithmId === 'maximum-average-subarray-i') return generateSlidingWindowAvgSteps(arr);
  }

  // Stack
  if (['valid-parentheses', 'daily-temperatures', 'largest-rectangle-histogram', 'next-greater-element-i'].includes(algorithmId)) {
    if (algorithmId === 'daily-temperatures') return generateDailyTemperaturesSteps(arr);
    if (algorithmId === 'largest-rectangle-histogram') return generateLargestRectangleSteps(arr);
    if (algorithmId === 'next-greater-element-i') return generateNextGreaterSteps(arr);
  }

  // Dynamic Programming
  if (['climbing-stairs', 'house-robber', 'coin-change', 'longest-increasing-subsequence', 'maximum-subarray'].includes(algorithmId)) {
    if (algorithmId === 'climbing-stairs') return generateClimbingStairsSteps(arr);
    if (algorithmId === 'house-robber') return generateHouseRobberSteps(arr);
    if (algorithmId === 'coin-change') return generateCoinChangeSteps(arr);
    if (algorithmId === 'longest-increasing-subsequence') return generateLISSteps(arr);
    if (algorithmId === 'maximum-subarray') return generateMaxSubarraySteps(arr);
  }

  // Linked List (visualization using array representation)
  if (['reverse-linked-list', 'middle-of-linked-list', 'merge-two-sorted-lists'].includes(algorithmId)) {
    if (algorithmId === 'reverse-linked-list') return generateReverseLinkedListSteps(arr);
    if (algorithmId === 'middle-of-linked-list') return generateMiddleLinkedListSteps(arr);
  }

  // Hash Table / Bit Manipulation
  if (['single-number', 'group-anagrams', 'counting-bits', 'single-number-iii'].includes(algorithmId)) {
    if (algorithmId === 'single-number') return generateSingleNumberSteps(arr);
    if (algorithmId === 'counting-bits') return generateCountingBitsSteps(arr);
    if (algorithmId === 'single-number-iii') return generateSingleNumberIIISteps(arr);
  }

  // String algorithms
  if (['is-subsequence', 'valid-palindrome', 'longest-common-prefix', 'reverse-words'].includes(algorithmId)) {
    if (algorithmId === 'is-subsequence') return generateIsSubsequenceSteps(arr);
    if (algorithmId === 'valid-palindrome') return generateValidPalindromeSteps(arr);
    if (algorithmId === 'longest-common-prefix') return generateLongestCommonPrefixSteps(arr);
    if (algorithmId === 'reverse-words') return generateReverseWordsSteps(arr);
  }

  // Default fallback - generic array traversal
  return generateGenericSteps(arr);
};

// ==================== SORTING ====================

const generateBubbleSortSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  const sorted = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2],
    description: 'Initialize bubble sort'
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    for (let j = 0; j < n - 1 - i; j++) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        highlightedLines: [7, 8],
        description: `Comparing arr[${j}]=${arr[j]} with arr[${j + 1}]=${arr[j + 1]}`
      });

      if (arr[j] > arr[j + 1]) {
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          highlightedLines: [9, 10, 11, 12],
          description: `Swapping ${arr[j]} and ${arr[j + 1]}`
        });

        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          sorted: [...sorted],
          highlightedLines: [13],
          description: `Swapped! Array is now [${arr.join(', ')}]`
        });
      }
    }

    sorted.push(n - 1 - i);

    if (!swapped) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: n }, (_, i) => i),
        highlightedLines: [17, 18, 19],
        description: 'No swaps - array is sorted!'
      });
      break;
    }
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [],
    description: 'Sorting complete!'
  });

  return steps;
};

const generateSelectionSortSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  const sorted = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2],
    description: 'Initialize selection sort'
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [...sorted],
      highlightedLines: [4, 5],
      description: `Looking for minimum from index ${i}`
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        array: [...arr],
        comparing: [minIdx, j],
        swapping: [],
        sorted: [...sorted],
        highlightedLines: [7, 8],
        description: `Comparing arr[${minIdx}]=${arr[minIdx]} with arr[${j}]=${arr[j]}`
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          array: [...arr],
          comparing: [minIdx],
          swapping: [],
          sorted: [...sorted],
          highlightedLines: [9],
          description: `New minimum: ${arr[minIdx]} at index ${minIdx}`
        });
      }
    }

    if (minIdx !== i) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, minIdx],
        sorted: [...sorted],
        highlightedLines: [13, 14, 15, 16],
        description: `Swapping arr[${i}]=${arr[i]} with arr[${minIdx}]=${arr[minIdx]}`
      });

      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
    }

    sorted.push(i);
  }

  sorted.push(n - 1);
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [...sorted],
    highlightedLines: [],
    description: 'Sorting complete!'
  });

  return steps;
};

const generateInsertionSortSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  const sorted = [0];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [0],
    highlightedLines: [1, 2],
    description: 'First element is sorted'
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [...sorted],
      highlightedLines: [4, 5, 6],
      description: `Inserting key=${key} from index ${i}`
    });

    while (j >= 0 && arr[j] > key) {
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        highlightedLines: [8, 9],
        description: `arr[${j}]=${arr[j]} > key=${key}, shifting`
      });

      arr[j + 1] = arr[j];

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [j, j + 1],
        sorted: [...sorted],
        highlightedLines: [9, 10],
        description: `Shifted ${arr[j]} right`
      });

      j--;
    }

    arr[j + 1] = key;
    sorted.push(i);

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [...sorted],
      highlightedLines: [12],
      description: `Inserted ${key} at index ${j + 1}`
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [],
    description: 'Sorting complete!'
  });

  return steps;
};

// ==================== ARRAY ====================

const generateMoveZeroesSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  let writePos = 0;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2],
    description: 'Initialize writePos = 0',
    readPos: -1,
    writePos: 0
  });

  for (let readPos = 0; readPos < n; readPos++) {
    steps.push({
      array: [...arr],
      comparing: [readPos],
      swapping: [],
      sorted: [],
      highlightedLines: [3, 4],
      description: `readPos=${readPos}: nums[${readPos}]=${arr[readPos]}`,
      readPos: readPos,
      writePos: writePos
    });

    if (arr[readPos] !== 0) {
      if (readPos !== writePos) {
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [writePos, readPos],
          sorted: [],
          highlightedLines: [5, 6, 7],
          description: `Non-zero! Swapping nums[${writePos}] and nums[${readPos}]`,
          readPos: readPos,
          writePos: writePos
        });

        const temp = arr[writePos];
        arr[writePos] = arr[readPos];
        arr[readPos] = temp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          sorted: [],
          highlightedLines: [5, 6, 7],
          description: `After swap: nums = [${arr.join(', ')}]`,
          readPos: readPos,
          writePos: writePos
        });
      }

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: Array.from({ length: writePos + 1 }, (_, i) => i),
        highlightedLines: [8],
        description: `writePos++ → ${writePos + 1}`,
        readPos: readPos,
        writePos: writePos + 1
      });

      writePos++;
    }
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [],
    description: 'All zeroes moved to end!',
    readPos: -1,
    writePos: writePos
  });

  return steps;
};

const generateMajorityElementSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let candidate = arr[0];
  let count = 1;

  // Step 1: Initialize with first element
  steps.push({
    array: [...arr],
    comparing: [0],
    swapping: [],
    sorted: [],
    highlightedLines: [2, 3, 4],
    description: `Initialize: candidate = ${candidate}, count = ${count}`,
    variables: { candidate, count },
    currentIndex: -1
  });

  for (let i = 1; i < arr.length; i++) {
    // Step: Looking at current element
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [7],
      description: `Iteration ${i}: Checking nums[${i}] = ${arr[i]}`,
      variables: { candidate, count },
      currentIndex: i
    });

    if (count === 0) {
      candidate = arr[i];
      count = 1;
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [i],
        highlightedLines: [8, 9, 10],
        description: `count = 0, so set candidate = ${candidate}, count = 1`,
        variables: { candidate, count },
        currentIndex: i
      });
    } else if (arr[i] === candidate) {
      count++;
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [11, 12],
        description: `nums[${i}] = ${arr[i]} equals candidate, count++ → ${count}`,
        variables: { candidate, count },
        currentIndex: i
      });
    } else {
      count--;
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [13, 14],
        description: `nums[${i}] = ${arr[i]} ≠ candidate (${candidate}), count-- → ${count}`,
        variables: { candidate, count },
        currentIndex: i
      });
    }
  }

  // Final step: Return the majority element
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: arr.map((v, i) => v === candidate ? i : -1).filter(i => i >= 0),
    highlightedLines: [18, 19],
    description: `The majority element is: ${candidate}`,
    variables: { candidate, count },
    currentIndex: -1
  });

  return steps;
};

const generateRemoveDuplicatesSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  if (arr.length === 0) return steps;

  let writePos = 0;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [0],
    highlightedLines: [1, 2, 4],
    description: 'Initialize writePos = 0',
    readPos: -1,
    writePos: 0
  });

  for (let readPos = 1; readPos < arr.length; readPos++) {
    // Step: Comparing readPos with writePos
    steps.push({
      array: [...arr],
      comparing: [readPos],
      swapping: [],
      sorted: Array.from({ length: writePos + 1 }, (_, i) => i),
      highlightedLines: [5, 6],
      description: `readPos=${readPos}: nums[${readPos}]=${arr[readPos]} vs nums[${writePos}]=${arr[writePos]}`,
      readPos: readPos,
      writePos: writePos
    });

    if (arr[readPos] !== arr[writePos]) {
      writePos++;
      arr[writePos] = arr[readPos];
      
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [writePos],
        sorted: Array.from({ length: writePos + 1 }, (_, i) => i),
        highlightedLines: [7, 8],
        description: `Different! writePos++ → ${writePos}, nums[${writePos}] = ${arr[readPos]}`,
        readPos: readPos,
        writePos: writePos
      });
    } else {
      steps.push({
        array: [...arr],
        comparing: [readPos],
        swapping: [],
        sorted: Array.from({ length: writePos + 1 }, (_, i) => i),
        highlightedLines: [6],
        description: `Same value, skip`,
        readPos: readPos,
        writePos: writePos
      });
    }
  }

  // Final step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: writePos + 1 }, (_, i) => i),
    highlightedLines: [12],
    description: `Done! Return writePos + 1 = ${writePos + 1} unique elements`,
    readPos: -1,
    writePos: writePos
  });

  return steps;
};

const generateBuySellStockSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let minPrice = arr[0];
  let maxProfit = 0;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: `Initialize: minPrice = ${minPrice}, maxProfit = 0`,
    currentIndex: -1,
    variables: { minPrice, maxProfit }
  });

  for (let i = 1; i < arr.length; i++) {
    // Step: Looking at current price
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [5],
      description: `Day ${i}: price = ${arr[i]}`,
      currentIndex: i,
      variables: { minPrice, maxProfit }
    });

    if (arr[i] < minPrice) {
      minPrice = arr[i];
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [6, 7],
        description: `prices[${i}] < minPrice → minPrice = ${minPrice}`,
        currentIndex: i,
        variables: { minPrice, maxProfit }
      });
    } else {
      const profit = arr[i] - minPrice;
      if (profit > maxProfit) {
        maxProfit = profit;
        steps.push({
          array: [...arr],
          comparing: [i],
          swapping: [],
          sorted: [],
          highlightedLines: [9, 10, 11],
          description: `profit = ${profit} > maxProfit → maxProfit = ${maxProfit}`,
          currentIndex: i,
          variables: { minPrice, maxProfit }
        });
      } else {
        steps.push({
          array: [...arr],
          comparing: [i],
          swapping: [],
          sorted: [],
          highlightedLines: [8, 9],
          description: `profit = ${profit} ≤ maxProfit (${maxProfit})`,
          currentIndex: i,
          variables: { minPrice, maxProfit }
        });
      }
    }
  }

  // Final step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    highlightedLines: [16],
    description: `Return maxProfit = ${maxProfit}`,
    currentIndex: -1,
    variables: { minPrice, maxProfit }
  });

  return steps;
};

const generateBuySellStock2Steps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  let maxProfit = 0;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2],
    description: 'Initialize maxProfit = 0',
    i: -1,
    prevI: -1,
    variables: { maxProfit },
    profitAdded: false
  });

  // Loop through prices starting from index 1
  for (let i = 1; i < n; i++) {
    const prevPrice = arr[i - 1];
    const currPrice = arr[i];
    
    // Step: Compare prices[i] with prices[i-1]
    steps.push({
      array: [...arr],
      comparing: [i - 1, i],
      swapping: [],
      sorted: [],
      highlightedLines: [4, 5],
      description: `Compare: prices[${i}]=${currPrice} vs prices[${i-1}]=${prevPrice}`,
      i: i,
      prevI: i - 1,
      variables: { maxProfit },
      profitAdded: false
    });

    if (currPrice > prevPrice) {
      const profit = currPrice - prevPrice;
      maxProfit += profit;
      
      // Step: Add profit
      steps.push({
        array: [...arr],
        comparing: [i - 1, i],
        swapping: [],
        sorted: [],
        highlightedLines: [5, 6],
        description: `prices[${i}] > prices[${i-1}] → profit += ${profit}, maxProfit = ${maxProfit}`,
        i: i,
        prevI: i - 1,
        variables: { maxProfit },
        profitAdded: true
      });
    } else {
      // Step: No profit
      steps.push({
        array: [...arr],
        comparing: [i - 1, i],
        swapping: [],
        sorted: [],
        highlightedLines: [5],
        description: `prices[${i}] ≤ prices[${i-1}] → no profit`,
        i: i,
        prevI: i - 1,
        variables: { maxProfit },
        profitAdded: false
      });
    }
  }

  // Final step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [10],
    description: `Return maxProfit = ${maxProfit}`,
    i: -1,
    prevI: -1,
    variables: { maxProfit },
    profitAdded: false
  });

  return steps;
};

const generateRotateArraySteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  const k = 3 % n; // Default k=3

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2],
    description: `Rotate by k=${k} using reversal`,
    start: -1,
    end: -1,
    phase: 'init'
  });

  // Reverse entire array
  let left = 0, right = n - 1;
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [4, 5],
    description: `Phase 1: Reverse entire array [0, ${n-1}]`,
    start: left,
    end: right,
    phase: 'reverse-all'
  });

  while (left < right) {
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [left, right],
      sorted: [],
      highlightedLines: [14, 15, 16, 17, 18],
      description: `Reverse all: swap ${left}↔${right}`,
      start: left,
      end: right,
      phase: 'reverse-all'
    });
    [arr[left], arr[right]] = [arr[right], arr[left]];
    
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
      highlightedLines: [19, 20],
      description: `After swap: start++, end--`,
      start: left + 1,
      end: right - 1,
      phase: 'reverse-all'
    });
    
    left++;
    right--;
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [7, 8],
    description: 'Entire array reversed',
    start: -1,
    end: -1,
    phase: 'done-phase1'
  });

  // Reverse first k
  left = 0; right = k - 1;
  if (left < right) {
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
      highlightedLines: [7, 8],
      description: `Phase 2: Reverse first k elements [0, ${k-1}]`,
      start: left,
      end: right,
      phase: 'reverse-first-k'
    });
  }

  while (left < right) {
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [left, right],
      sorted: [],
      highlightedLines: [14, 15, 16, 17, 18],
      description: `Reverse first ${k}: swap ${left}↔${right}`,
      start: left,
      end: right,
      phase: 'reverse-first-k'
    });
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }

  // Reverse rest
  left = k; right = n - 1;
  if (left < right) {
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
      highlightedLines: [10, 11],
      description: `Phase 3: Reverse remaining elements [${k}, ${n-1}]`,
      start: left,
      end: right,
      phase: 'reverse-rest'
    });
  }

  while (left < right) {
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [left, right],
      sorted: [],
      highlightedLines: [14, 15, 16, 17, 18],
      description: `Reverse rest: swap ${left}↔${right}`,
      start: left,
      end: right,
      phase: 'reverse-rest'
    });
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [],
    description: 'Rotation complete!',
    start: -1,
    end: -1,
    phase: 'complete'
  });

  return steps;
};

const generateProductExceptSelfSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  const output = new Array(n).fill(0);

  // Initial step
  steps.push({
    inputArray: [...arr],
    outputArray: [...output],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: 'Initialize output array',
    i: -1,
    right: -1,
    phase: 'init'
  });

  // Initialize output[0] = 1
  output[0] = 1;
  steps.push({
    inputArray: [...arr],
    outputArray: [...output],
    comparing: [0],
    swapping: [],
    sorted: [0],
    highlightedLines: [5, 6],
    description: 'output[0] = 1',
    i: 0,
    right: -1,
    phase: 'left-init'
  });

  // Left pass: output[i] = output[i-1] * nums[i-1]
  for (let i = 1; i < n; i++) {
    output[i] = output[i - 1] * arr[i - 1];
    steps.push({
      inputArray: [...arr],
      outputArray: [...output],
      comparing: [i],
      swapping: [],
      sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
      highlightedLines: [7, 8],
      description: `output[${i}] = output[${i-1}] × nums[${i-1}] = ${output[i-1]} × ${arr[i-1]} = ${output[i]}`,
      i: i,
      right: -1,
      phase: 'left-pass'
    });
  }

  // Right pass initialization
  let right = 1;
  steps.push({
    inputArray: [...arr],
    outputArray: [...output],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [11, 12],
    description: 'Initialize right = 1',
    i: -1,
    right: right,
    phase: 'right-init'
  });

  // Right pass: output[i] *= right, then right *= nums[i]
  for (let i = n - 1; i >= 0; i--) {
    const beforeMultiply = output[i];
    output[i] *= right;
    steps.push({
      inputArray: [...arr],
      outputArray: [...output],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [13, 14],
      description: `output[${i}] = ${beforeMultiply} × ${right} = ${output[i]}`,
      i: i,
      right: right,
      phase: 'right-pass'
    });
    right *= arr[i];
    
    if (i > 0) {
      steps.push({
        inputArray: [...arr],
        outputArray: [...output],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [15],
        description: `right = ${right / arr[i]} × ${arr[i]} = ${right}`,
        i: i,
        right: right,
        phase: 'right-update'
      });
    }
  }

  // Complete
  steps.push({
    inputArray: [...arr],
    outputArray: [...output],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [18],
    description: 'Product array complete!',
    i: -1,
    right: -1,
    phase: 'complete'
  });

  return steps;
};

const generateZeroFilledSubarraysSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  let zeroCount = 0;
  let result = 0;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: 'Initialize result = 0, zeroCount = 0',
    i: -1,
    variables: { zeroCount, result },
    isZero: false
  });

  // Loop through array
  for (let i = 0; i < n; i++) {
    const num = arr[i];
    
    // Step: Check current element
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [5, 6],
      description: `Check nums[${i}] = ${num}`,
      i: i,
      variables: { zeroCount, result },
      isZero: num === 0
    });

    if (num === 0) {
      zeroCount++;
      
      // Step: Found a zero, increment zeroCount
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [6, 7],
        description: `nums[${i}] == 0 → zeroCount++ = ${zeroCount}`,
        i: i,
        variables: { zeroCount, result },
        isZero: true
      });
    } else {
      if (zeroCount > 0) {
        const subArrays = zeroCount * (zeroCount + 1) / 2;
        result += subArrays;
        
        // Step: Hit non-zero, add subarrays from previous zeros
        steps.push({
          array: [...arr],
          comparing: [i],
          swapping: [],
          sorted: [],
          highlightedLines: [8, 9],
          description: `nums[${i}] ≠ 0 → result += ${zeroCount}×${zeroCount + 1}/2 = ${subArrays}, result = ${result}`,
          i: i,
          variables: { zeroCount: 0, result },
          isZero: false
        });
      } else {
        // Step: Non-zero but no zeros counted
        steps.push({
          array: [...arr],
          comparing: [i],
          swapping: [],
          sorted: [],
          highlightedLines: [8, 10],
          description: `nums[${i}] ≠ 0, zeroCount = 0 → reset`,
          i: i,
          variables: { zeroCount: 0, result },
          isZero: false
        });
      }
      zeroCount = 0;
    }
  }

  // Final calculation for trailing zeros
  if (zeroCount > 0) {
    const subArrays = zeroCount * (zeroCount + 1) / 2;
    result += subArrays;
    
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [],
      highlightedLines: [14],
      description: `End of array → result += ${zeroCount}×${zeroCount + 1}/2 = ${subArrays}, result = ${result}`,
      i: -1,
      variables: { zeroCount, result },
      isZero: false
    });
  }

  // Final step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [16],
    description: `Return result = ${result}`,
    i: -1,
    variables: { zeroCount, result },
    isZero: false
  });

  return steps;
};

const generateIncreasingTripletSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  let first = Infinity;
  let second = Infinity;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: 'Initialize first = ∞, second = ∞',
    i: -1,
    variables: { first: '∞', second: '∞' },
    updateType: 'init',
    foundTriplet: false
  });

  // Loop through array
  for (let i = 0; i < n; i++) {
    const num = arr[i];
    
    // Step: Check current element
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [5, 6],
      description: `Check nums[${i}] = ${num}`,
      i: i,
      variables: { first: first === Infinity ? '∞' : first, second: second === Infinity ? '∞' : second },
      updateType: 'check',
      foundTriplet: false
    });

    if (num <= first) {
      first = num;
      // Step: Update first
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [6, 7],
        description: `${num} ≤ first → first = ${num}`,
        i: i,
        variables: { first, second: second === Infinity ? '∞' : second },
        updateType: 'first',
        foundTriplet: false
      });
    } else if (num <= second) {
      second = num;
      // Step: Update second
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [8, 9],
        description: `first < ${num} ≤ second → second = ${num}`,
        i: i,
        variables: { first, second },
        updateType: 'second',
        foundTriplet: false
      });
    } else {
      // Found triplet!
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: Array.from({ length: n }, (_, idx) => idx),
        highlightedLines: [10, 11],
        description: `${num} > second → Triplet found! Return true`,
        i: i,
        variables: { first, second },
        updateType: 'found',
        foundTriplet: true
      });
      return steps;
    }
  }

  // No triplet found
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [15],
    description: 'No increasing triplet found. Return false',
    i: -1,
    variables: { first, second: second === Infinity ? '∞' : second },
    updateType: 'none',
    foundTriplet: false
  });

  return steps;
};

const generateFirstMissingPositiveSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: `Initialize: n = ${n}`,
    i: -1,
    phase: 'init',
    correctPositions: []
  });

  // Phase 1: Place numbers in correct positions (cyclic sort)
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [5, 6],
    description: 'Phase 1: Place numbers in correct positions',
    i: -1,
    phase: 'cyclic-sort',
    correctPositions: []
  });

  const correctPositions = [];

  for (let i = 0; i < n; i++) {
    // Check current position
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [6, 7, 8],
      description: `i=${i}: Check nums[${i}]=${arr[i]}`,
      i: i,
      phase: 'check',
      correctPositions: [...correctPositions]
    });

    // While loop for swapping
    while (arr[i] > 0 && arr[i] <= n && arr[arr[i] - 1] !== arr[i]) {
      const targetIdx = arr[i] - 1;
      
      // Show swap about to happen
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [i, targetIdx],
        sorted: [],
        highlightedLines: [8, 9, 10, 11, 12],
        description: `nums[${i}]=${arr[i]} should be at index ${targetIdx}. Swap!`,
        i: i,
        phase: 'swap',
        correctPositions: [...correctPositions]
      });

      // Perform swap
      const temp = arr[targetIdx];
      arr[targetIdx] = arr[i];
      arr[i] = temp;

      // Check if the swapped element is now in correct position
      if (arr[targetIdx] === targetIdx + 1) {
        correctPositions.push(targetIdx);
      }

      // Show after swap
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [10, 11, 12],
        description: `After swap: nums = [${arr.join(', ')}]`,
        i: i,
        phase: 'after-swap',
        correctPositions: [...correctPositions]
      });
    }

    // Check if current position is correct after all swaps
    if (arr[i] === i + 1 && !correctPositions.includes(i)) {
      correctPositions.push(i);
    }
  }

  // Phase 2: Find first missing positive
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [16, 17],
    description: 'Phase 2: Find first missing positive',
    i: -1,
    phase: 'scan',
    correctPositions: [...correctPositions]
  });

  let result = n + 1;
  for (let i = 0; i < n; i++) {
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [17, 18],
      description: `Check: nums[${i}]=${arr[i]}, expected ${i + 1}`,
      i: i,
      phase: 'scan-check',
      correctPositions: [...correctPositions]
    });

    if (arr[i] !== i + 1) {
      result = i + 1;
      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: Array.from({ length: n }, (_, idx) => idx),
        highlightedLines: [18, 19],
        description: `nums[${i}]≠${i + 1} → First missing positive is ${result}`,
        i: i,
        phase: 'found',
        correctPositions: [...correctPositions],
        result: result
      });
      return steps;
    }
  }

  // All positions correct, return n+1
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, idx) => idx),
    highlightedLines: [23],
    description: `All positions correct! First missing positive is ${n + 1}`,
    i: -1,
    phase: 'complete',
    correctPositions: [...correctPositions],
    result: n + 1
  });

  return steps;
};

// ==================== TWO POINTERS ====================

const generateTwoSumSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let left = 0;
  let right = arr.length - 1;
  const target = arr[0] + arr[arr.length - 1]; // Use sum of first and last as target

  steps.push({
    array: [...arr],
    comparing: [left, right],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: `Find two numbers that sum to ${target}`
  });

  while (left < right) {
    const sum = arr[left] + arr[right];
    
    steps.push({
      array: [...arr],
      comparing: [left, right],
      swapping: [],
      sorted: [],
      highlightedLines: [5, 6],
      description: `Sum: ${arr[left]} + ${arr[right]} = ${sum}, target=${target}`
    });

    if (sum === target) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [left, right],
        highlightedLines: [8, 9],
        description: `Found! Indices: ${left + 1}, ${right + 1}`
      });
      break;
    } else if (sum < target) {
      left++;
      steps.push({
        array: [...arr],
        comparing: [left, right],
        swapping: [],
        sorted: [],
        highlightedLines: [10, 11],
        description: `Sum too small, move left → ${left}`
      });
    } else {
      right--;
      steps.push({
        array: [...arr],
        comparing: [left, right],
        swapping: [],
        sorted: [],
        highlightedLines: [12, 13],
        description: `Sum too large, move right → ${right}`
      });
    }
  }

  return steps;
};

const generateContainerWaterSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let left = 0;
  let right = arr.length - 1;
  let maxArea = 0;

  steps.push({
    array: [...arr],
    comparing: [left, right],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3, 4],
    description: 'Initialize pointers at both ends'
  });

  while (left < right) {
    const width = right - left;
    const height = Math.min(arr[left], arr[right]);
    const area = width * height;
    maxArea = Math.max(maxArea, area);

    steps.push({
      array: [...arr],
      comparing: [left, right],
      swapping: [],
      sorted: [],
      highlightedLines: [6, 7, 8, 9],
      description: `Area: ${width}×${height}=${area}, max=${maxArea}`
    });

    if (arr[left] < arr[right]) {
      left++;
      steps.push({
        array: [...arr],
        comparing: [left, right],
        swapping: [],
        sorted: [],
        highlightedLines: [11, 12],
        description: `Left smaller, move left → ${left}`
      });
    } else {
      right--;
      steps.push({
        array: [...arr],
        comparing: [left, right],
        swapping: [],
        sorted: [],
        highlightedLines: [13, 14],
        description: `Right smaller/equal, move right → ${right}`
      });
    }
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    highlightedLines: [17],
    description: `Maximum area: ${maxArea}`
  });

  return steps;
};

const generateTrappingRainWaterSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let left = 0, right = arr.length - 1;
  let leftMax = 0, rightMax = 0;
  let water = 0;

  steps.push({
    array: [...arr],
    comparing: [left, right],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3, 4],
    description: 'Initialize two pointers'
  });

  while (left < right) {
    if (arr[left] < arr[right]) {
      if (arr[left] >= leftMax) {
        leftMax = arr[left];
        steps.push({
          array: [...arr],
          comparing: [left],
          swapping: [],
          sorted: [],
          highlightedLines: [7, 8],
          description: `New leftMax: ${leftMax}`
        });
      } else {
        water += leftMax - arr[left];
        steps.push({
          array: [...arr],
          comparing: [left],
          swapping: [],
          sorted: [left],
          highlightedLines: [9, 10],
          description: `Trap ${leftMax - arr[left]} water, total=${water}`
        });
      }
      left++;
    } else {
      if (arr[right] >= rightMax) {
        rightMax = arr[right];
        steps.push({
          array: [...arr],
          comparing: [right],
          swapping: [],
          sorted: [],
          highlightedLines: [13, 14],
          description: `New rightMax: ${rightMax}`
        });
      } else {
        water += rightMax - arr[right];
        steps.push({
          array: [...arr],
          comparing: [right],
          swapping: [],
          sorted: [right],
          highlightedLines: [15, 16],
          description: `Trap ${rightMax - arr[right]} water, total=${water}`
        });
      }
      right--;
    }
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    highlightedLines: [20],
    description: `Total water trapped: ${water}`
  });

  return steps;
};

const generateMergeSortedArraySteps = (initialArr) => {
  const steps = [];
  const m = Math.ceil(initialArr.length / 2);
  const n = initialArr.length - m;
  const arr = [...initialArr.slice(0, m), ...new Array(n).fill(0)];
  const nums2 = initialArr.slice(m);
  
  let p1 = m - 1;
  let p2 = n - 1;
  let p = m + n - 1;

  steps.push({
    array: [...arr],
    comparing: [p1, m + p2],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3, 4],
    description: `Merge from end: p1=${p1}, p2=${p2}, p=${p}`
  });

  while (p1 >= 0 && p2 >= 0) {
    if (arr[p1] > nums2[p2]) {
      arr[p] = arr[p1];
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [p],
        sorted: Array.from({ length: m + n - p }, (_, i) => p + i),
        highlightedLines: [7, 8],
        description: `arr[${p1}]=${arr[p1]} > nums2[${p2}]=${nums2[p2]}, place ${arr[p1]} at ${p}`
      });
      p1--;
    } else {
      arr[p] = nums2[p2];
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [p],
        sorted: Array.from({ length: m + n - p }, (_, i) => p + i),
        highlightedLines: [9, 10, 11],
        description: `Place nums2[${p2}]=${nums2[p2]} at ${p}`
      });
      p2--;
    }
    p--;
  }

  while (p2 >= 0) {
    arr[p] = nums2[p2];
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [p],
      sorted: Array.from({ length: m + n - p }, (_, i) => p + i),
      highlightedLines: [16, 17, 18],
      description: `Copy remaining nums2[${p2}]=${nums2[p2]}`
    });
    p2--;
    p--;
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    highlightedLines: [],
    description: 'Merge complete!'
  });

  return steps;
};

const generateThreeSumSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr].sort((a, b) => a - b);
  const n = arr.length;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2],
    description: 'Sort array first'
  });

  for (let i = 0; i < n - 2; i++) {
    if (i > 0 && arr[i] === arr[i - 1]) continue;

    let left = i + 1;
    let right = n - 1;

    steps.push({
      array: [...arr],
      comparing: [i, left, right],
      swapping: [],
      sorted: [],
      highlightedLines: [4, 5, 6, 7],
      description: `Fix i=${i} (${arr[i]}), search with two pointers`
    });

    while (left < right) {
      const sum = arr[i] + arr[left] + arr[right];

      steps.push({
        array: [...arr],
        comparing: [i, left, right],
        swapping: [],
        sorted: [],
        highlightedLines: [10, 11],
        description: `Sum: ${arr[i]}+${arr[left]}+${arr[right]}=${sum}`
      });

      if (sum === 0) {
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          sorted: [i, left, right],
          highlightedLines: [13, 14],
          description: `Found triplet: [${arr[i]}, ${arr[left]}, ${arr[right]}]`
        });
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [],
    description: '3Sum complete!'
  });

  return steps;
};

// ==================== BINARY SEARCH ====================

const generateBinarySearchSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr].sort((a, b) => a - b);
  const target = arr[Math.floor(arr.length / 2)]; // Use middle element as target
  let left = 0;
  let right = arr.length - 1;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: `Binary search for target=${target}`
  });

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);

    steps.push({
      array: [...arr],
      comparing: [mid],
      swapping: [],
      sorted: [],
      highlightedLines: [5, 6],
      description: `Check mid=${mid}, arr[mid]=${arr[mid]}`
    });

    if (arr[mid] === target) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [mid],
        highlightedLines: [8, 9],
        description: `Found at index ${mid}!`
      });
      break;
    } else if (arr[mid] < target) {
      left = mid + 1;
      steps.push({
        array: [...arr],
        comparing: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        swapping: [],
        sorted: [],
        highlightedLines: [10, 11],
        description: `Too small, search right half [${left}..${right}]`
      });
    } else {
      right = mid - 1;
      steps.push({
        array: [...arr],
        comparing: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        swapping: [],
        sorted: [],
        highlightedLines: [12, 13],
        description: `Too large, search left half [${left}..${right}]`
      });
    }
  }

  return steps;
};

const generateRotatedSearchSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const target = arr[0];
  let left = 0, right = arr.length - 1;

  steps.push({
    array: [...arr],
    comparing: [left, right],
    swapping: [],
    sorted: [],
    highlightedLines: [1],
    description: `Search rotated array for ${target}`
  });

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);

    steps.push({
      array: [...arr],
      comparing: [mid],
      swapping: [],
      sorted: [],
      highlightedLines: [4, 5],
      description: `mid=${mid}, arr[mid]=${arr[mid]}`
    });

    if (arr[mid] === target) {
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        sorted: [mid],
        highlightedLines: [7],
        description: `Found at index ${mid}!`
      });
      break;
    }

    if (arr[left] <= arr[mid]) {
      steps.push({
        array: [...arr],
        comparing: Array.from({ length: mid - left + 1 }, (_, i) => left + i),
        swapping: [],
        sorted: [],
        highlightedLines: [9, 10],
        description: 'Left half is sorted'
      });

      if (target >= arr[left] && target < arr[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      steps.push({
        array: [...arr],
        comparing: Array.from({ length: right - mid + 1 }, (_, i) => mid + i),
        swapping: [],
        sorted: [],
        highlightedLines: [15, 16],
        description: 'Right half is sorted'
      });

      if (target > arr[mid] && target <= arr[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return steps;
};

const generateFindPeakSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let left = 0, right = arr.length - 1;

  steps.push({
    array: [...arr],
    comparing: [left, right],
    swapping: [],
    sorted: [],
    highlightedLines: [1],
    description: 'Find peak element using binary search'
  });

  while (left < right) {
    const mid = Math.floor(left + (right - left) / 2);

    steps.push({
      array: [...arr],
      comparing: [mid, mid + 1],
      swapping: [],
      sorted: [],
      highlightedLines: [4, 5],
      description: `Compare arr[${mid}]=${arr[mid]} vs arr[${mid + 1}]=${arr[mid + 1]}`
    });

    if (arr[mid] > arr[mid + 1]) {
      right = mid;
      steps.push({
        array: [...arr],
        comparing: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        swapping: [],
        sorted: [],
        highlightedLines: [7, 8],
        description: `Peak is on left, search [${left}..${right}]`
      });
    } else {
      left = mid + 1;
      steps.push({
        array: [...arr],
        comparing: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        swapping: [],
        sorted: [],
        highlightedLines: [9, 10],
        description: `Peak is on right, search [${left}..${right}]`
      });
    }
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [left],
    highlightedLines: [13],
    description: `Peak found at index ${left}: ${arr[left]}`
  });

  return steps;
};

// ==================== SLIDING WINDOW ====================

const generateSlidingWindowAvgSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const k = Math.min(3, arr.length);
  let sum = 0;

  for (let i = 0; i < k; i++) {
    sum += arr[i];
  }

  steps.push({
    array: [...arr],
    comparing: Array.from({ length: k }, (_, i) => i),
    swapping: [],
    sorted: [],
    highlightedLines: [3, 4, 5],
    description: `Initial window sum: ${sum}, avg: ${(sum / k).toFixed(2)}`
  });

  let maxSum = sum;

  for (let i = k; i < arr.length; i++) {
    sum = sum + arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, sum);

    steps.push({
      array: [...arr],
      comparing: Array.from({ length: k }, (_, idx) => i - k + 1 + idx),
      swapping: [],
      sorted: [],
      highlightedLines: [10, 11],
      description: `Window [${i - k + 1}..${i}]: sum=${sum}, avg=${(sum / k).toFixed(2)}`
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    highlightedLines: [14],
    description: `Max average: ${(maxSum / k).toFixed(2)}`
  });

  return steps;
};

// ==================== STACK ====================

const generateDailyTemperaturesSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  const result = new Array(n).fill(0);
  const stack = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3, 4],
    description: 'Initialize result and stack'
  });

  for (let i = 0; i < n; i++) {
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: stack,
      highlightedLines: [6],
      description: `Day ${i}: temp=${arr[i]}, stack=${stack.map(idx => arr[idx]).join(',')}`
    });

    while (stack.length && arr[i] > arr[stack[stack.length - 1]]) {
      const prevIdx = stack.pop();
      result[prevIdx] = i - prevIdx;

      steps.push({
        array: result,
        comparing: [i, prevIdx],
        swapping: [],
        sorted: [prevIdx],
        highlightedLines: [8, 9],
        description: `Day ${prevIdx} waits ${i - prevIdx} days for warmer`
      });
    }

    stack.push(i);
  }

  steps.push({
    array: result,
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [13],
    description: `Result: [${result.join(', ')}]`
  });

  return steps;
};

const generateLargestRectangleSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const stack = [];
  let maxArea = 0;
  const n = arr.length;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: 'Find largest rectangle in histogram'
  });

  for (let i = 0; i <= n; i++) {
    const h = i === n ? 0 : arr[i];

    while (stack.length && h < arr[stack[stack.length - 1]]) {
      const height = arr[stack.pop()];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      const area = height * width;
      maxArea = Math.max(maxArea, area);

      steps.push({
        array: [...arr],
        comparing: [i],
        swapping: [],
        sorted: [],
        highlightedLines: [8, 9, 10],
        description: `Pop height=${height}, width=${width}, area=${area}, max=${maxArea}`
      });
    }

    stack.push(i);
    
    steps.push({
      array: [...arr],
      comparing: stack,
      swapping: [],
      sorted: [],
      highlightedLines: [12],
      description: `Push index ${i}, stack indices: [${stack.join(', ')}]`
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [15],
    description: `Maximum rectangle area: ${maxArea}`
  });

  return steps;
};

const generateNextGreaterSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  const result = new Array(n).fill(-1);
  const stack = [];

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: 'Find next greater element for each'
  });

  for (let i = n - 1; i >= 0; i--) {
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [5],
      description: `Process arr[${i}]=${arr[i]}`
    });

    while (stack.length && stack[stack.length - 1] <= arr[i]) {
      stack.pop();
    }

    if (stack.length) {
      result[i] = stack[stack.length - 1];
      steps.push({
        array: result,
        comparing: [i],
        swapping: [],
        sorted: [i],
        highlightedLines: [10, 11],
        description: `Next greater for ${arr[i]} is ${result[i]}`
      });
    }

    stack.push(arr[i]);
  }

  steps.push({
    array: result,
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [16],
    description: `Result: [${result.join(', ')}]`
  });

  return steps;
};

// ==================== DYNAMIC PROGRAMMING ====================

const generateClimbingStairsSteps = (initialArr) => {
  const steps = [];
  const n = Math.min(initialArr[0] || 5, 10);
  const dp = new Array(n + 1).fill(0);

  steps.push({
    array: dp,
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2],
    description: `Climb ${n} stairs, dp array initialized`
  });

  dp[1] = 1;
  dp[2] = 2;

  steps.push({
    array: [...dp],
    comparing: [1, 2],
    swapping: [],
    sorted: [1, 2],
    highlightedLines: [3, 4],
    description: 'Base cases: dp[1]=1, dp[2]=2'
  });

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];

    steps.push({
      array: [...dp],
      comparing: [i - 1, i - 2],
      swapping: [],
      sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
      highlightedLines: [6, 7],
      description: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}`
    });
  }

  steps.push({
    array: [...dp],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n + 1 }, (_, i) => i),
    highlightedLines: [10],
    description: `Ways to climb ${n} stairs: ${dp[n]}`
  });

  return steps;
};

const generateHouseRobberSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;

  if (n === 0) return steps;
  if (n === 1) {
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: [0],
      highlightedLines: [1],
      description: `Only one house, rob ${arr[0]}`
    });
    return steps;
  }

  let prev2 = 0;
  let prev1 = arr[0];

  steps.push({
    array: [...arr],
    comparing: [0],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: `Initialize: prev2=0, prev1=${arr[0]}`
  });

  for (let i = 1; i < n; i++) {
    const current = Math.max(prev1, prev2 + arr[i]);

    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [5, 6],
      description: `House ${i}: max(${prev1}, ${prev2}+${arr[i]}) = ${current}`
    });

    prev2 = prev1;
    prev1 = current;
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [10],
    description: `Maximum money: ${prev1}`
  });

  return steps;
};

const generateCoinChangeSteps = (initialArr) => {
  const steps = [];
  const coins = [...initialArr].slice(0, 3);
  const amount = Math.min(initialArr.reduce((a, b) => a + b, 0), 11);
  const dp = new Array(amount + 1).fill(amount + 1);
  dp[0] = 0;

  steps.push({
    array: [...dp],
    comparing: [],
    swapping: [],
    sorted: [0],
    highlightedLines: [1, 2, 3],
    description: `Coins: [${coins}], Amount: ${amount}`
  });

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;

        steps.push({
          array: [...dp],
          comparing: [i, i - coin],
          swapping: [],
          sorted: Array.from({ length: i + 1 }, (_, idx) => idx).filter(idx => dp[idx] < amount + 1),
          highlightedLines: [6, 7, 8],
          description: `dp[${i}] = dp[${i - coin}] + 1 = ${dp[i]} (using coin ${coin})`
        });
      }
    }
  }

  steps.push({
    array: [...dp],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: amount + 1 }, (_, i) => i),
    highlightedLines: [12],
    description: `Min coins for ${amount}: ${dp[amount] > amount ? -1 : dp[amount]}`
  });

  return steps;
};

const generateLISSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;
  const dp = new Array(n).fill(1);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: 'Initialize dp with 1s'
  });

  let maxLen = 1;

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (arr[i] > arr[j]) {
        if (dp[j] + 1 > dp[i]) {
          dp[i] = dp[j] + 1;

          steps.push({
            array: dp,
            comparing: [i, j],
            swapping: [],
            sorted: [],
            highlightedLines: [7, 8],
            description: `arr[${i}]=${arr[i]} > arr[${j}]=${arr[j]}: dp[${i}] = ${dp[i]}`
          });
        }
      }
    }
    maxLen = Math.max(maxLen, dp[i]);
  }

  steps.push({
    array: dp,
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [14],
    description: `LIS length: ${maxLen}`
  });

  return steps;
};

const generateMaxSubarraySteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let maxSum = arr[0];
  let currentSum = arr[0];

  steps.push({
    array: [...arr],
    comparing: [0],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: `Initialize: maxSum=${maxSum}, currentSum=${currentSum}`
  });

  for (let i = 1; i < arr.length; i++) {
    currentSum = Math.max(arr[i], currentSum + arr[i]);
    maxSum = Math.max(maxSum, currentSum);

    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: currentSum === maxSum ? [i] : [],
      highlightedLines: [5, 6, 7],
      description: `i=${i}: currentSum=max(${arr[i]}, ${currentSum - arr[i]}+${arr[i]})=${currentSum}, maxSum=${maxSum}`
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: arr.length }, (_, i) => i),
    highlightedLines: [10],
    description: `Maximum subarray sum: ${maxSum}`
  });

  return steps;
};

// ==================== LINKED LIST (Array Visualization) ====================

const generateReverseLinkedListSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: 'Initialize prev=null, curr=head'
  });

  for (let i = 0; i < Math.floor(n / 2); i++) {
    steps.push({
      array: [...arr],
      comparing: [i, n - 1 - i],
      swapping: [],
      sorted: [],
      highlightedLines: [5, 6],
      description: `Reverse pointers at positions ${i} and ${n - 1 - i}`
    });

    [arr[i], arr[n - 1 - i]] = [arr[n - 1 - i], arr[i]];

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [i, n - 1 - i],
      sorted: [i, n - 1 - i],
      highlightedLines: [7, 8],
      description: 'Swapped!'
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [11],
    description: 'Linked list reversed!'
  });

  return steps;
};

const generateMiddleLinkedListSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let slow = 0;
  let fast = 0;

  steps.push({
    array: [...arr],
    comparing: [slow, fast],
    swapping: [],
    sorted: [],
    highlightedLines: [1, 2, 3],
    description: 'Initialize slow=0, fast=0'
  });

  while (fast < arr.length - 1 && fast + 1 < arr.length) {
    slow++;
    fast += 2;

    steps.push({
      array: [...arr],
      comparing: [slow, Math.min(fast, arr.length - 1)],
      swapping: [],
      sorted: [],
      highlightedLines: [5, 6],
      description: `Move: slow=${slow}, fast=${fast}`
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [slow],
    highlightedLines: [9],
    description: `Middle node at index ${slow}: ${arr[slow]}`
  });

  return steps;
};

// ==================== HASH/BIT ====================

const generateSingleNumberSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let result = 0;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [2, 3],
    description: 'Initialize result = 0',
    i: -1,
    variables: { result: 0 }
  });

  for (let i = 0; i < arr.length; i++) {
    // Step: Check current element
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [5, 6],
      description: `i=${i}: Check nums[${i}] = ${arr[i]}`,
      i: i,
      variables: { result }
    });

    const prevResult = result;
    result ^= arr[i];

    // Step: Perform XOR
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: [],
      highlightedLines: [7],
      description: `result = ${prevResult} XOR ${arr[i]} = ${result}`,
      i: i,
      variables: { result },
      isXorStep: true
    });
  }

  // Final step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: arr.map((v, idx) => v === result ? idx : -1).filter(idx => idx >= 0),
    highlightedLines: [10],
    description: `Return result = ${result} (the single number)`,
    i: -1,
    variables: { result },
    isComplete: true
  });

  return steps;
};

// ==================== COUNTING BITS ====================

const generateCountingBitsSteps = (input) => {
  const steps = [];
  // Get n from input (can be object or array)
  const n = input?.n ?? (Array.isArray(input) ? input[0] : 5);
  
  const res = new Array(n + 1).fill(0);
  let pow = 1;
  let x = 1;

  // Initial step - show all zeros
  steps.push({
    algorithmType: 'counting-bits',
    res: [...res],
    n: n,
    i: -1,
    pow: pow,
    x: x,
    highlightedLines: [1, 2, 3, 4],
    description: `Initialize res array of size ${n + 1} with zeros. pow=${pow}, x=${x}`,
    highlightedIndex: -1,
    referenceIndex: -1
  });

  for (let i = 1; i <= n; i++) {
    // Check if we're at power of 2
    if (i === pow) {
      // Step: We hit a power of two
      steps.push({
        algorithmType: 'counting-bits',
        res: [...res],
        n: n,
        i: i,
        pow: pow,
        x: x,
        highlightedLines: [7, 8, 9],
        description: `i=${i} == pow=${pow}: Update pow to ${pow * 2}, set x=${i}`,
        highlightedIndex: i,
        referenceIndex: -1,
        isPowerOfTwo: true
      });
      
      pow *= 2;
      x = i;
    }

    // Step: Calculate res[i] = res[i - x] + 1
    const refIndex = i - x;
    const newValue = res[refIndex] + 1;
    
    steps.push({
      algorithmType: 'counting-bits',
      res: [...res],
      n: n,
      i: i,
      pow: pow,
      x: x,
      highlightedLines: [11],
      description: `res[${i}] = res[${refIndex}] + 1 = ${res[refIndex]} + 1 = ${newValue}`,
      highlightedIndex: i,
      referenceIndex: refIndex
    });

    res[i] = newValue;

    // Step: Show updated array
    steps.push({
      algorithmType: 'counting-bits',
      res: [...res],
      n: n,
      i: i,
      pow: pow,
      x: x,
      highlightedLines: [11],
      description: `Updated res[${i}] = ${res[i]}`,
      highlightedIndex: i,
      referenceIndex: -1,
      justUpdated: true
    });
  }

  // Final step
  steps.push({
    algorithmType: 'counting-bits',
    res: [...res],
    n: n,
    i: -1,
    pow: pow,
    x: x,
    highlightedLines: [13],
    description: `Done! Return res = [${res.join(', ')}]`,
    highlightedIndex: -1,
    referenceIndex: -1,
    isComplete: true
  });

  return steps;
};

// ==================== SINGLE NUMBER III ====================

const generateSingleNumberIIISteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  let xor = 0;
  let diff = 0;
  let result = [0, 0];

  // Initial step
  steps.push({
    algorithmType: 'single-number-iii',
    array: [...arr],
    i: -1,
    phase: 'init',
    xor: 0,
    diff: 0,
    result: [0, 0],
    highlightedLines: [1, 2, 3],
    description: 'Initialize xor = 0. We need to find two unique numbers.',
    highlightedIndex: -1,
    group: null
  });

  // Phase 1: XOR all numbers
  steps.push({
    algorithmType: 'single-number-iii',
    array: [...arr],
    i: -1,
    phase: 'phase1-start',
    xor: 0,
    diff: 0,
    result: [0, 0],
    highlightedLines: [4, 5],
    description: 'Phase 1: XOR all numbers together',
    highlightedIndex: -1,
    group: null
  });

  for (let i = 0; i < arr.length; i++) {
    const prevXor = xor;
    xor ^= arr[i];

    steps.push({
      algorithmType: 'single-number-iii',
      array: [...arr],
      i: i,
      phase: 'phase1',
      xor: xor,
      diff: 0,
      result: [0, 0],
      highlightedLines: [5, 6],
      description: `i=${i}: xor = ${prevXor} XOR ${arr[i]} = ${xor}`,
      highlightedIndex: i,
      group: null
    });
  }

  // Phase 1 complete
  steps.push({
    algorithmType: 'single-number-iii',
    array: [...arr],
    i: -1,
    phase: 'phase1-complete',
    xor: xor,
    diff: 0,
    result: [0, 0],
    highlightedLines: [7],
    description: `Phase 1 complete: xor = ${xor} (XOR of the two unique numbers)`,
    highlightedIndex: -1,
    group: null
  });

  // Phase 2: Find rightmost set bit
  diff = xor & (-xor);
  steps.push({
    algorithmType: 'single-number-iii',
    array: [...arr],
    i: -1,
    phase: 'phase2',
    xor: xor,
    diff: diff,
    result: [0, 0],
    highlightedLines: [9, 10],
    description: `Phase 2: diff = xor & (-xor) = ${xor} & ${-xor} = ${diff} (rightmost set bit)`,
    highlightedIndex: -1,
    group: null
  });

  // Phase 3: Separate into groups
  steps.push({
    algorithmType: 'single-number-iii',
    array: [...arr],
    i: -1,
    phase: 'phase3-start',
    xor: xor,
    diff: diff,
    result: [0, 0],
    highlightedLines: [12, 13, 14],
    description: 'Phase 3: Separate numbers into two groups based on the diff bit',
    highlightedIndex: -1,
    group: null
  });

  for (let i = 0; i < arr.length; i++) {
    const num = arr[i];
    const group = (num & diff) === 0 ? 0 : 1;
    const prevResult = [...result];
    result[group] ^= num;

    steps.push({
      algorithmType: 'single-number-iii',
      array: [...arr],
      i: i,
      phase: 'phase3',
      xor: xor,
      diff: diff,
      result: [...result],
      highlightedLines: group === 0 ? [15, 16] : [17, 18],
      description: `i=${i}: ${num} & ${diff} = ${num & diff} → Group ${group}: result[${group}] = ${prevResult[group]} XOR ${num} = ${result[group]}`,
      highlightedIndex: i,
      group: group
    });
  }

  // Final result
  steps.push({
    algorithmType: 'single-number-iii',
    array: [...arr],
    i: -1,
    phase: 'complete',
    xor: xor,
    diff: diff,
    result: [...result],
    highlightedLines: [22],
    description: `Done! The two unique numbers are: [${result[0]}, ${result[1]}]`,
    highlightedIndex: -1,
    group: null,
    isComplete: true
  });

  return steps;
};

// ==================== GENERIC ====================

const generateGenericSteps = (initialArr) => {
  const steps = [];
  const arr = [...initialArr];
  const n = arr.length;

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: [],
    highlightedLines: [1],
    description: 'Start algorithm'
  });

  // Simple visualization - iterate through array
  for (let i = 0; i < n; i++) {
    steps.push({
      array: [...arr],
      comparing: [i],
      swapping: [],
      sorted: Array.from({ length: i }, (_, idx) => idx),
      highlightedLines: [3, 4],
      description: `Processing index ${i}: value = ${arr[i]}`
    });
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: Array.from({ length: n }, (_, i) => i),
    highlightedLines: [],
    description: 'Algorithm complete!'
  });

  return steps;
};

// ==================== STRING ALGORITHMS ====================

const generateIsSubsequenceSteps = (input) => {
  const steps = [];
  // Default input: s = "abc", t = "ahbgdc"
  const s = input?.s || "abc";
  const t = input?.t || "ahbgdc";
  let i = 0; // pointer for s

  steps.push({
    s: s,
    t: t,
    sPointer: -1,
    tPointer: -1,
    matchedS: [],
    matchedT: [],
    highlightedLines: [1, 2, 3],
    description: 'Initialize pointer i = 0 for string s',
    algorithmType: 'is-subsequence'
  });

  for (let j = 0; j < t.length; j++) {
    // Check current position
    steps.push({
      s: s,
      t: t,
      sPointer: i < s.length ? i : -1,
      tPointer: j,
      matchedS: Array.from({ length: i }, (_, idx) => idx),
      matchedT: [],
      highlightedLines: [6, 7, 8],
      description: `j=${j}: Compare s[${i}]='${s[i] || ''}' with t[${j}]='${t[j]}'`,
      algorithmType: 'is-subsequence'
    });

    if (i < s.length && s[i] === t[j]) {
      // Match found
      const matchedSIndices = Array.from({ length: i + 1 }, (_, idx) => idx);
      steps.push({
        s: s,
        t: t,
        sPointer: i,
        tPointer: j,
        matchedS: matchedSIndices,
        matchedT: [j],
        highlightedLines: [12, 13],
        description: `Match! '${s[i]}' == '${t[j]}', i++ → ${i + 1}`,
        algorithmType: 'is-subsequence',
        isMatch: true
      });
      i++;
    }

    // Early return if all chars found
    if (i === s.length) {
      steps.push({
        s: s,
        t: t,
        sPointer: -1,
        tPointer: j,
        matchedS: Array.from({ length: s.length }, (_, idx) => idx),
        matchedT: [],
        highlightedLines: [8, 9],
        description: `All characters found! Return true`,
        algorithmType: 'is-subsequence',
        result: true
      });
      return steps;
    }
  }

  // Final result
  const isSubseq = i === s.length;
  steps.push({
    s: s,
    t: t,
    sPointer: -1,
    tPointer: -1,
    matchedS: Array.from({ length: i }, (_, idx) => idx),
    matchedT: [],
    highlightedLines: [18],
    description: isSubseq ? 'Return true - s is a subsequence' : `Return false - only found ${i}/${s.length} chars`,
    algorithmType: 'is-subsequence',
    result: isSubseq
  });

  return steps;
};

const generateValidPalindromeSteps = (input) => {
  const steps = [];
  // Default input
  const s = (input?.s || "A man, a plan, a canal: Panama").toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = s.length - 1;

  steps.push({
    s: s,
    left: -1,
    right: -1,
    matchedIndices: [],
    highlightedLines: [1, 2, 3],
    description: `Clean string: "${s}"`,
    algorithmType: 'valid-palindrome'
  });

  steps.push({
    s: s,
    left: left,
    right: right,
    matchedIndices: [],
    highlightedLines: [5, 6],
    description: `Initialize left=${left}, right=${right}`,
    algorithmType: 'valid-palindrome'
  });

  while (left < right) {
    // Compare
    steps.push({
      s: s,
      left: left,
      right: right,
      matchedIndices: [],
      highlightedLines: [8, 9],
      description: `Compare s[${left}]='${s[left]}' with s[${right}]='${s[right]}'`,
      algorithmType: 'valid-palindrome'
    });

    if (s[left] !== s[right]) {
      steps.push({
        s: s,
        left: left,
        right: right,
        matchedIndices: [],
        highlightedLines: [10, 11],
        description: `'${s[left]}' ≠ '${s[right]}' → Not a palindrome!`,
        algorithmType: 'valid-palindrome',
        result: false,
        mismatch: true
      });
      return steps;
    }

    // Match
    steps.push({
      s: s,
      left: left,
      right: right,
      matchedIndices: [left, right],
      highlightedLines: [13, 14],
      description: `'${s[left]}' == '${s[right]}' → Match! left++, right--`,
      algorithmType: 'valid-palindrome',
      isMatch: true
    });

    left++;
    right--;
  }

  steps.push({
    s: s,
    left: -1,
    right: -1,
    matchedIndices: Array.from({ length: s.length }, (_, i) => i),
    highlightedLines: [17],
    description: 'All characters matched! Return true',
    algorithmType: 'valid-palindrome',
    result: true
  });

  return steps;
};

const generateLongestCommonPrefixSteps = (input) => {
  const steps = [];
  // Default input
  const strs = input?.strs || ["flower", "flow", "flight"];
  
  if (strs.length === 0) {
    steps.push({
      strings: strs,
      currentChar: -1,
      prefix: "",
      highlightedLines: [1, 2],
      description: 'Empty array, return ""',
      algorithmType: 'longest-common-prefix'
    });
    return steps;
  }

  steps.push({
    strings: strs,
    currentChar: -1,
    prefix: "",
    highlightedLines: [1, 2, 3],
    description: `Start with first string: "${strs[0]}"`,
    algorithmType: 'longest-common-prefix'
  });

  let prefix = "";
  const firstStr = strs[0];

  for (let i = 0; i < firstStr.length; i++) {
    const char = firstStr[i];
    
    steps.push({
      strings: strs,
      currentChar: i,
      prefix: prefix,
      highlightedLines: [5, 6],
      description: `Check char '${char}' at position ${i}`,
      algorithmType: 'longest-common-prefix'
    });

    let allMatch = true;
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j].length || strs[j][i] !== char) {
        allMatch = false;
        steps.push({
          strings: strs,
          currentChar: i,
          prefix: prefix,
          highlightedLines: [8, 9],
          description: `'${strs[j]}' doesn't match at position ${i}. Prefix: "${prefix}"`,
          algorithmType: 'longest-common-prefix',
          mismatchString: j
        });
        break;
      }
    }

    if (!allMatch) break;
    
    prefix += char;
    steps.push({
      strings: strs,
      currentChar: i,
      prefix: prefix,
      highlightedLines: [12],
      description: `All match! Prefix now: "${prefix}"`,
      algorithmType: 'longest-common-prefix',
      isMatch: true
    });
  }

  steps.push({
    strings: strs,
    currentChar: -1,
    prefix: prefix,
    highlightedLines: [15],
    description: `Return longest common prefix: "${prefix}"`,
    algorithmType: 'longest-common-prefix',
    result: prefix
  });

  return steps;
};

const generateReverseWordsSteps = (input) => {
  const steps = [];
  // Default input
  const s = input?.s || "the sky is blue";
  const words = s.trim().split(/\s+/);
  
  steps.push({
    original: s,
    words: [...words],
    reversed: [],
    highlightedLines: [1, 2],
    description: `Split into words: [${words.map(w => `"${w}"`).join(', ')}]`,
    algorithmType: 'reverse-words'
  });

  const reversed = [];
  for (let i = words.length - 1; i >= 0; i--) {
    steps.push({
      original: s,
      words: [...words],
      reversed: [...reversed],
      currentWord: i,
      highlightedLines: [5, 6],
      description: `Add word "${words[i]}" from end`,
      algorithmType: 'reverse-words'
    });

    reversed.push(words[i]);

    steps.push({
      original: s,
      words: [...words],
      reversed: [...reversed],
      currentWord: i,
      highlightedLines: [7],
      description: `Result so far: "${reversed.join(' ')}"`,
      algorithmType: 'reverse-words',
      isMatch: true
    });
  }

  steps.push({
    original: s,
    words: [...words],
    reversed: [...reversed],
    currentWord: -1,
    highlightedLines: [10],
    description: `Return: "${reversed.join(' ')}"`,
    algorithmType: 'reverse-words',
    result: reversed.join(' ')
  });

  return steps;
};

export default generateAnimationSteps;
