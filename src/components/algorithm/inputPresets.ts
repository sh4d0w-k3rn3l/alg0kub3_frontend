// Input presets for different algorithm types
export const getInputPresets = (algorithmId: string, category?: string) => {
  const defaultArrayPresets = {
    "Array 1": [64, 34, 25, 12, 22, 11, 90],
    "Array 2": [5, 1, 4, 2, 8, 3],
    "Reverse Sorted": [9, 8, 7, 6, 5, 4, 3, 2, 1],
    "Already Sorted": [1, 2, 3, 4, 5, 6, 7],
    "All Equal": [5, 5, 5, 5, 5]
  };

  const presetsByAlgorithm = {
    // Sorting
    "bubble-sort": defaultArrayPresets,
    "selection-sort": {
      "Array 1": [64, 25, 12, 22, 11],
      "Array 2": [29, 10, 14, 37, 13],
      "Reverse Sorted": [9, 8, 7, 6, 5, 4, 3, 2, 1],
      "Already Sorted": [1, 2, 3, 4, 5, 6, 7],
      "All Equal": [5, 5, 5, 5, 5]
    },
    "insertion-sort": {
      "Array 1": [12, 11, 13, 5, 6],
      "Array 2": [31, 41, 59, 26, 41, 58],
      "Reverse Sorted": [9, 8, 7, 6, 5, 4, 3, 2, 1],
      "Already Sorted": [1, 2, 3, 4, 5, 6, 7],
      "All Equal": [5, 5, 5, 5, 5]
    },

    // Array
    "move-zeroes": {
      "Array 1": [0, 1, 0, 3, 12],
      "Array 2": [0, 0, 1],
      "Many Zeroes": [0, 0, 0, 1, 2],
      "No Zeroes": [1, 2, 3, 4, 5],
      "Single Zero": [0]
    },
    "majority-element": {
      "Example 1": [2, 2, 1, 1, 1, 2, 2],
      "Majority at Start": [5, 5, 5, 5, 1, 2, 3],
      "Majority at End": [1, 2, 3, 5, 5, 5, 5]
    },
    "remove-duplicates": {
      "Input 1": [0, 0, 1, 1, 1, 2, 2, 3, 3, 4],
      "All Duplicates": [1, 1, 1, 1, 1],
      "No Duplicates": [1, 2, 3, 4, 5]
    },
    "best-time-to-buy-and-sell-stock": {
      "Input 1": [7, 1, 5, 3, 6, 4],
      "Input 2": [7, 6, 4, 3, 1],
      "Input 3": [1, 2, 3, 4, 5, 6]
    },
    "rotate-array": {
      "Array 1": [1, 2, 3, 4, 5, 6, 7],
      "Array 2": [-1, -100, 3, 99],
      "Small": [1, 2],
      "Five Elements": [1, 2, 3, 4, 5],
      "All Same": [3, 3, 3, 3]
    },
    "product-except-self": {
      "Array 1": [1, 2, 3, 4],
      "Array 2": [-1, 1, 0, -3, 3],
      "With Zero": [1, 2, 0, 4],
      "All Ones": [1, 1, 1, 1],
      "Negatives": [-1, -2, -3, -4]
    },
    "zero-filled-subarrays": {
      "Multiple Runs": [1, 0, 0, 2, 0, 0, 0, 3, 0, 0],
      "All Zeros": [0, 0, 0, 0, 0],
      "No Zeros": [1, 2, 3, 4, 5],
      "Alternating": [0, 1, 0, 1, 0, 1]
    },
    "best-time-to-buy-and-sell-stock-2": {
      "Input 1": [7, 1, 5, 3, 6, 4],
      "Input 2": [1, 2, 3, 4, 5],
      "Input 3": [7, 6, 4, 3, 1],
      "Fluctuating": [3, 2, 6, 5, 0, 3]
    },
    "increasing-triplet-subsequence": {
      "All Increasing": [1, 2, 3, 4, 5],
      "All Decreasing": [5, 4, 3, 2, 1],
      "Triplet Exists": [2, 1, 5, 0, 4, 6],
      "No Triplet": [5, 4, 3, 2, 1]
    },
    "first-missing-positive": {
      "Example 1": [3, 4, -1, 1],
      "Example 2": [1, 2, 0],
      "Example 3": [7, 8, 9, 11, 12]
    },

    // Two Pointers
    "two-sum-ii": {
      "Array 1": [2, 7, 11, 15],
      "Array 2": [2, 3, 4],
      "Array 3": [-1, 0],
      "Larger": [1, 2, 3, 4, 5, 6, 7, 8, 9],
      "Two Elements": [1, 2]
    },
    "container-with-most-water": {
      "Array 1": [1, 8, 6, 2, 5, 4, 8, 3, 7],
      "Array 2": [1, 1],
      "Increasing": [1, 2, 3, 4, 5],
      "Decreasing": [5, 4, 3, 2, 1],
      "Peak": [1, 5, 9, 5, 1]
    },
    "three-sum": {
      "Array 1": [-1, 0, 1, 2, -1, -4],
      "Array 2": [0, 1, 1],
      "All Zeros": [0, 0, 0],
      "Mixed": [-2, -1, 0, 1, 2],
      "No Solution": [1, 2, 3, 4]
    },
    "trapping-rain-water": {
      "Array 1": [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
      "Array 2": [4, 2, 0, 3, 2, 5],
      "Flat": [1, 1, 1, 1],
      "V Shape": [3, 0, 3],
      "Stairs": [0, 1, 2, 3, 4]
    },
    "merge-sorted-array": {
      "Array 1": [1, 2, 3, 0, 0, 0],
      "Array 2": [1],
      "Array 3": [2, 4, 6, 0, 0],
      "Interleave": [1, 3, 5, 0, 0, 0],
      "All Zeros": [0, 0, 0]
    },

    // Binary Search
    "search-insert-position": {
      "Array 1": [1, 3, 5, 6],
      "Array 2": [1, 3, 5, 7, 9],
      "Single": [1],
      "Dense": [1, 2, 3, 4, 5, 6, 7],
      "Sparse": [10, 20, 30, 40, 50]
    },
    "search-rotated-array": {
      "Array 1": [4, 5, 6, 7, 0, 1, 2],
      "Array 2": [1],
      "Not Rotated": [1, 2, 3, 4, 5],
      "Two Elements": [3, 1],
      "Rotated Once": [2, 3, 4, 5, 1]
    },
    "find-peak-element": {
      "Array 1": [1, 2, 3, 1],
      "Array 2": [1, 2, 1, 3, 5, 6, 4],
      "Single Peak": [1, 3, 2],
      "End Peak": [1, 2, 3, 4, 5],
      "Start Peak": [5, 4, 3, 2, 1]
    },

    // String algorithms
    "is-subsequence": {
      "Example 1": { s: "abc", t: "ahbgdc" },
      "No Match": { s: "axc", t: "ahbgdc" },
      "Empty s": { s: "", t: "ahbgdc" },
      "Exact Match": { s: "abc", t: "abc" }
    },
    "valid-palindrome": {
      "Example 1": { s: "A man, a plan, a canal: Panama" },
      "Not Palindrome": { s: "race a car" },
      "Single Char": { s: "a" },
      "Empty": { s: " " }
    },
    "longest-common-prefix": {
      "Example 1": { strs: ["flower", "flow", "flight"] },
      "No Prefix": { strs: ["dog", "racecar", "car"] },
      "Same Words": { strs: ["test", "test", "test"] },
      "Single Word": { strs: ["alone"] }
    },
    "reverse-words": {
      "Example 1": { s: "the sky is blue" },
      "Extra Spaces": { s: "  hello world  " },
      "Single Word": { s: "hello" },
      "Many Words": { s: "a good   example" }
    },

    // Sliding Window
    "maximum-average-subarray-i": {
      "Array 1": [1, 12, -5, -6, 50, 3],
      "Array 2": [5],
      "All Same": [4, 4, 4, 4],
      "Increasing": [1, 2, 3, 4, 5, 6],
      "Mixed": [-1, 0, 1, 2, 3]
    },
    "longest-substring-without-repeating-characters": {
      "Array 1": [97, 98, 99, 97, 98, 99],
      "Array 2": [98, 98, 98, 98],
      "Array 3": [112, 119, 119, 107, 101, 119]
    },

    // Stack
    "daily-temperatures": {
      "Array 1": [73, 74, 75, 71, 69, 72, 76, 73],
      "Array 2": [30, 40, 50, 60],
      "Decreasing": [60, 50, 40, 30],
      "All Same": [50, 50, 50, 50],
      "V Shape": [70, 60, 50, 60, 70]
    },
    "largest-rectangle-histogram": {
      "Array 1": [2, 1, 5, 6, 2, 3],
      "Array 2": [2, 4],
      "Increasing": [1, 2, 3, 4, 5],
      "Decreasing": [5, 4, 3, 2, 1],
      "Peak": [1, 3, 5, 3, 1]
    },
    "next-greater-element-i": {
      "Array 1": [4, 1, 2],
      "Array 2": [2, 4],
      "Decreasing": [5, 4, 3, 2, 1],
      "Increasing": [1, 2, 3, 4, 5],
      "Mixed": [3, 1, 4, 2, 5]
    },

    // Dynamic Programming
    "climbing-stairs": {
      "n=5": [5],
      "n=3": [3],
      "n=10": [10],
      "n=7": [7],
      "n=2": [2]
    },
    "house-robber": {
      "Array 1": [1, 2, 3, 1],
      "Array 2": [2, 7, 9, 3, 1],
      "Increasing": [1, 2, 3, 4, 5],
      "All Same": [5, 5, 5, 5],
      "Single": [100]
    },
    "coin-change": {
      "Coins": [1, 2, 5],
      "Coins 2": [2],
      "Coins 3": [1, 5, 10],
      "Large Coins": [186, 419, 83, 408],
      "Simple": [1, 3, 4]
    },
    "longest-increasing-subsequence": {
      "Array 1": [10, 9, 2, 5, 3, 7, 101, 18],
      "Array 2": [0, 1, 0, 3, 2, 3],
      "Increasing": [1, 2, 3, 4, 5],
      "Decreasing": [5, 4, 3, 2, 1],
      "Random": [3, 1, 4, 1, 5, 9, 2, 6]
    },
    "maximum-subarray": {
      "Array 1": [-2, 1, -3, 4, -1, 2, 1, -5, 4],
      "Array 2": [1],
      "All Negative": [-1, -2, -3],
      "All Positive": [1, 2, 3, 4, 5],
      "Mixed": [5, -3, 5]
    },

    // Linked List
    "reverse-linked-list": {
      "Array 1": [1, 2, 3, 4, 5],
      "Array 2": [1, 2],
      "Single": [1],
      "Longer": [1, 2, 3, 4, 5, 6, 7, 8],
      "Three": [1, 2, 3]
    },
    "middle-of-linked-list": {
      "Odd Length": [1, 2, 3, 4, 5],
      "Even Length": [1, 2, 3, 4, 5, 6],
      "Two Nodes": [1, 2],
      "Single": [1],
      "Seven": [1, 2, 3, 4, 5, 6, 7]
    },

    // Hash/Bit
    "single-number": {
      "Example 1": [2, 2, 1],
      "Example 2": [4, 1, 2, 1, 2],
      "Example 3": [1],
      "Example 4": [1, 2, 3, 2, 1]
    },
    "counting-bits": {
      "Example 1": { n: 5 },
      "Example 2": { n: 8 },
      "Example 3": { n: 15 }
    },
    "single-number-iii": {
      "Example 1": [1, 2, 1, 3, 2, 5],
      "Example 2": [-1, 0],
      "Example 3": [0, 1]
    },
    "group-anagrams": {
      "Array 1": [101, 97, 116],
      "Array 2": [116, 101, 97],
      "Array 3": [97, 116, 101]
    }
  };

  return (presetsByAlgorithm as Record<string, any>)[algorithmId] || defaultArrayPresets;
};

// Get default code for algorithms not in the code file
export const getDefaultCode = (algorithmId: string, title: string) => ({
  java: `// ${title}\npublic void solve() {\n    // Implementation\n    // See the animation for visualization\n}`,
  python: `# ${title}\ndef solve():\n    # Implementation\n    # See the animation for visualization\n    pass`,
  javascript: `// ${title}\nfunction solve() {\n    // Implementation\n    // See the animation for visualization\n}`
});
