// Algorithm descriptions, interview tips, and related problems - COMPLETE for all 175 algorithms

export const algorithmInfo = {
  // ==================== SORTING ====================
  "bubble-sort": {
    description: "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
    howItWorks: "Compare adjacent pairs and swap if out of order. After each pass, the largest unsorted element 'bubbles up' to its correct position.",
    whenToUse: "Educational purposes, small datasets, or when simplicity is more important than efficiency.",
    interviewTip: "Know that it's O(n²) but can be optimized to O(n) for nearly sorted arrays by checking if any swaps were made.",
    relatedProblems: ["selection-sort", "insertion-sort"]
  },
  "selection-sort": {
    description: "Selection Sort divides the array into sorted and unsorted regions, repeatedly selecting the smallest element from the unsorted region.",
    howItWorks: "Find the minimum element in the unsorted portion, swap it with the first unsorted element, then expand the sorted region.",
    whenToUse: "When memory writes are expensive (makes minimum number of swaps), or for small datasets.",
    interviewTip: "Always O(n²) regardless of input. Makes at most n swaps, which can be useful when writes are costly.",
    relatedProblems: ["bubble-sort", "insertion-sort"]
  },
  "insertion-sort": {
    description: "Insertion Sort builds the final sorted array one item at a time, by repeatedly inserting a new element into the sorted portion.",
    howItWorks: "Take each element and insert it into its correct position among previously sorted elements by shifting larger elements right.",
    whenToUse: "Small datasets, nearly sorted arrays, or as part of more complex algorithms like Timsort.",
    interviewTip: "O(n) best case for nearly sorted arrays. Stable sort. Often used for small subarrays in hybrid sorting.",
    relatedProblems: ["bubble-sort", "selection-sort"]
  },

  // ==================== ARRAY ====================
  "move-zeroes": {
    description: "Move all zeros to the end of the array while maintaining the relative order of non-zero elements, in-place.",
    howItWorks: "Use two pointers: one to track the position for the next non-zero element, another to iterate through the array.",
    whenToUse: "Array manipulation problems requiring in-place modifications while preserving order.",
    interviewTip: "Classic two-pointer technique. O(n) time, O(1) space, maintains relative order.",
    relatedProblems: ["remove-duplicates", "sort-colors"]
  },
  "majority-element": {
    description: "Find the element that appears more than n/2 times in an array using Boyer-Moore Voting Algorithm.",
    howItWorks: "Maintain a candidate and count. When count reaches 0, pick new candidate. Increment for matches, decrement for mismatches.",
    whenToUse: "When you need to find a majority element efficiently without extra space.",
    interviewTip: "Boyer-Moore is optimal O(n) time, O(1) space. Explain why the majority survives the voting process.",
    relatedProblems: ["single-number", "move-zeroes"]
  },
  "remove-duplicates": {
    description: "Remove duplicates from a sorted array in-place and return the new length.",
    howItWorks: "Use two pointers: slow pointer tracks unique elements position, fast pointer scans through array.",
    whenToUse: "When you need to remove duplicates from sorted data in-place.",
    interviewTip: "Two-pointer technique for sorted arrays. O(n) time, O(1) space. Don't use extra array!",
    relatedProblems: ["move-zeroes", "remove-duplicates-sorted-list-2"]
  },
  "best-time-to-buy-and-sell-stock": {
    description: "Find the maximum profit from buying and selling a stock once, given daily prices.",
    howItWorks: "Track minimum price seen so far. At each day, calculate potential profit if sold today, update max profit.",
    whenToUse: "Single-pass array problems where you need to track min/max while calculating something.",
    interviewTip: "Kadane's algorithm variant. O(n) time, O(1) space. Explain the greedy approach.",
    relatedProblems: ["best-time-to-buy-and-sell-stock-2", "maximum-subarray"]
  },
  "best-time-to-buy-and-sell-stock-2": {
    description: "Find maximum profit with unlimited transactions (buy/sell multiple times).",
    howItWorks: "Add up all positive differences between consecutive days. Every upward movement is profit.",
    whenToUse: "When you can make unlimited transactions and want to maximize total profit.",
    interviewTip: "Greedy approach - capture every upward price movement. O(n) time, O(1) space.",
    relatedProblems: ["best-time-to-buy-and-sell-stock", "maximum-subarray"]
  },
  "rotate-array": {
    description: "Rotate an array to the right by k steps in-place.",
    howItWorks: "Reverse entire array, reverse first k elements, reverse remaining elements. Three reversals trick.",
    whenToUse: "Array rotation problems. The reversal technique is elegant and O(1) space.",
    interviewTip: "Know the three-reversal trick for O(1) space. Handle k > n by using k % n.",
    relatedProblems: ["rotate-image", "rotate-list"]
  },
  "product-except-self": {
    description: "Return array where each element is product of all other elements, without using division.",
    howItWorks: "Two passes: left-to-right for prefix products, right-to-left for suffix products. Multiply them.",
    whenToUse: "When you need products without including current element and division is not allowed.",
    interviewTip: "Prefix/suffix pattern. O(n) time, can be done in O(1) extra space using output array.",
    relatedProblems: ["trapping-rain-water", "maximum-subarray"]
  },
  "zero-filled-subarrays": {
    description: "Count the number of subarrays filled with zeros.",
    howItWorks: "For each consecutive sequence of zeros of length n, there are n*(n+1)/2 zero-filled subarrays.",
    whenToUse: "Counting subarrays problems with specific properties.",
    interviewTip: "Math trick: n consecutive zeros give n + (n-1) + ... + 1 = n*(n+1)/2 subarrays.",
    relatedProblems: ["subarray-sum-equals-k", "contiguous-array"]
  },
  "increasing-triplet-subsequence": {
    description: "Check if there exists an increasing triplet subsequence (i < j < k and nums[i] < nums[j] < nums[k]).",
    howItWorks: "Track smallest and second smallest values seen so far. If we find a third larger value, return true.",
    whenToUse: "Finding increasing patterns in sequences without using extra space.",
    interviewTip: "O(n) time, O(1) space. Update first when smaller found, second when between first and second.",
    relatedProblems: ["longest-increasing-subsequence", "132-pattern"]
  },
  "first-missing-positive": {
    description: "Find the smallest missing positive integer in an unsorted array in O(n) time and O(1) space.",
    howItWorks: "Place each number in its correct position (num at index num-1). Then scan for first mismatch.",
    whenToUse: "Finding missing elements with strict space constraints.",
    interviewTip: "Cyclic sort pattern. Use array itself as hash map. Answer is always in range [1, n+1].",
    relatedProblems: ["find-duplicate", "missing-number"]
  },

  // ==================== STRING ====================
  "is-subsequence": {
    description: "Check if string s is a subsequence of string t.",
    howItWorks: "Two pointers, one for each string. Move s pointer only when characters match.",
    whenToUse: "Subsequence validation problems.",
    interviewTip: "O(n) time with two pointers. For many queries, preprocess t with binary search.",
    relatedProblems: ["longest-common-subsequence", "valid-palindrome"]
  },
  "valid-palindrome": {
    description: "Check if a string is a valid palindrome, considering only alphanumeric characters.",
    howItWorks: "Two pointers from both ends, skip non-alphanumeric, compare characters case-insensitively.",
    whenToUse: "String validation problems comparing from both ends.",
    interviewTip: "Classic two-pointer. Handle edge cases: empty string, single character, only special chars.",
    relatedProblems: ["is-subsequence", "longest-palindromic-subsequence"]
  },
  "longest-common-prefix": {
    description: "Find the longest common prefix string amongst an array of strings.",
    howItWorks: "Compare characters position by position across all strings, stop when mismatch found.",
    whenToUse: "Finding common patterns at the start of multiple strings.",
    interviewTip: "Vertical scanning is intuitive. Can also use divide & conquer or binary search on length.",
    relatedProblems: ["longest-common-subsequence", "is-subsequence"]
  },
  "reverse-words": {
    description: "Reverse the order of words in a string.",
    howItWorks: "Split by spaces, reverse the array of words, join back. Or reverse entire string then each word.",
    whenToUse: "String manipulation problems involving word order.",
    interviewTip: "For O(1) space: reverse entire string, then reverse each word individually.",
    relatedProblems: ["rotate-array", "reverse-linked-list"]
  },

  // ==================== BIT MANIPULATION ====================
  "single-number": {
    description: "Find the single number in an array where every other number appears twice.",
    howItWorks: "XOR all numbers together. Pairs cancel out (a XOR a = 0), leaving the single number.",
    whenToUse: "Finding unique elements when others appear in pairs.",
    interviewTip: "XOR properties: a^a=0, a^0=a, commutative/associative. O(n) time, O(1) space.",
    relatedProblems: ["single-number-iii", "majority-element"]
  },
  "single-number-iii": {
    description: "Find two numbers that appear once when all others appear twice.",
    howItWorks: "XOR all to get a^b. Find a set bit to partition numbers into two groups, XOR each group.",
    whenToUse: "Finding multiple unique elements using bit manipulation.",
    interviewTip: "Use a set bit in a^b to separate the two unique numbers into different groups.",
    relatedProblems: ["single-number", "majority-element"]
  },
  "counting-bits": {
    description: "Count the number of 1 bits for every number from 0 to n.",
    howItWorks: "DP: dp[i] = dp[i >> 1] + (i & 1). Or dp[i] = dp[i & (i-1)] + 1.",
    whenToUse: "Bit counting problems, understanding binary representations.",
    interviewTip: "Use DP to avoid recounting. i & (i-1) removes lowest set bit.",
    relatedProblems: ["single-number", "reverse-bits"]
  },

  // ==================== HASH TABLE ====================
  "two-sum": {
    description: "Find two numbers in an array that add up to a target sum.",
    howItWorks: "Use hash map to store each number's index. For each number, check if complement exists.",
    whenToUse: "Finding pairs with a specific sum. Foundation for many sum problems.",
    interviewTip: "Hash map is O(n). For sorted arrays, two-pointer is O(n) with O(1) space.",
    relatedProblems: ["two-sum-ii", "three-sum"]
  },
  "group-anagrams": {
    description: "Group strings that are anagrams of each other.",
    howItWorks: "Use sorted string or character count as key in hash map. Group strings with same key.",
    whenToUse: "Grouping items by some canonical form or signature.",
    interviewTip: "Sorting key: O(n * k log k). Count key: O(n * k). Choose based on string length.",
    relatedProblems: ["valid-anagram", "find-all-anagrams-in-string"]
  },
  "longest-consecutive": {
    description: "Find the length of the longest consecutive elements sequence.",
    howItWorks: "Put all in set. For each number, if it's sequence start (n-1 not in set), count sequence length.",
    whenToUse: "Finding consecutive sequences in unsorted data.",
    interviewTip: "O(n) by only starting count from sequence beginnings. Don't sort - that's O(n log n)!",
    relatedProblems: ["longest-increasing-subsequence", "increasing-triplet-subsequence"]
  },
  "contains-duplicate-ii": {
    description: "Check if array contains duplicates within k indices of each other.",
    howItWorks: "Use hash map to store last index of each element. Check if current - last <= k.",
    whenToUse: "Duplicate detection with distance constraints.",
    interviewTip: "Sliding window with hash set of size k also works. O(n) time either way.",
    relatedProblems: ["contains-duplicate", "longest-substring-without-repeating-characters"]
  },
  "ransom-note": {
    description: "Check if ransom note can be constructed from magazine letters.",
    howItWorks: "Count character frequencies in magazine, verify ransom note doesn't exceed any count.",
    whenToUse: "Character frequency matching problems.",
    interviewTip: "Simple frequency counting. O(m + n) time, O(1) space (26 letters).",
    relatedProblems: ["valid-anagram", "group-anagrams"]
  },
  "isomorphic-strings": {
    description: "Check if two strings are isomorphic (characters can be replaced to get the other).",
    howItWorks: "Use two hash maps for bidirectional character mapping. Ensure consistent mapping both ways.",
    whenToUse: "Pattern matching where symbol names don't matter, only structure.",
    interviewTip: "Must check both directions: s->t and t->s mappings. O(n) time.",
    relatedProblems: ["word-pattern", "group-anagrams"]
  },
  "number-of-good-pairs": {
    description: "Count pairs (i,j) where i < j and nums[i] == nums[j].",
    howItWorks: "For each number, pairs = count * (count-1) / 2, or add running count as you go.",
    whenToUse: "Counting pairs with specific properties.",
    interviewTip: "Math trick: n same numbers give n*(n-1)/2 pairs. O(n) with hash map.",
    relatedProblems: ["two-sum", "contains-duplicate-ii"]
  },
  "max-number-of-balloons": {
    description: "Count how many times 'balloon' can be formed from given string.",
    howItWorks: "Count frequencies of b,a,l,o,n. Answer is min of counts (l,o need to be halved).",
    whenToUse: "Word formation problems with limited character supply.",
    interviewTip: "Simple frequency counting. Remember 'l' and 'o' appear twice in 'balloon'.",
    relatedProblems: ["ransom-note", "valid-anagram"]
  },
  "find-all-anagrams-in-string": {
    description: "Find all start indices of p's anagrams in s.",
    howItWorks: "Sliding window of size len(p). Maintain frequency map, check if window matches p's frequencies.",
    whenToUse: "Finding pattern matches allowing character reordering.",
    interviewTip: "Sliding window with frequency count. O(n) time. Track 'matches' to avoid comparing maps.",
    relatedProblems: ["group-anagrams", "permutation-in-string"]
  },

  // ==================== TWO POINTERS ====================
  "merge-sorted-array": {
    description: "Merge two sorted arrays where nums1 has extra space at the end to accommodate nums2.",
    howItWorks: "Start from the end of both arrays. Compare elements and place the larger one at the back of nums1. Work backwards to avoid overwriting.",
    whenToUse: "When merging sorted sequences in-place, especially when one array has extra capacity.",
    interviewTip: "Key insight: work backwards from the end to avoid overwriting. O(m+n) time, O(1) space. Handle remaining elements from nums2.",
    relatedProblems: ["two-sum-ii", "merge-two-sorted-lists", "sort-colors"]
  },
  "sort-colors": {
    description: "Sort an array containing only 0s, 1s, and 2s in-place using the Dutch National Flag algorithm.",
    howItWorks: "Three pointers: low (next 0 position), mid (current), high (next 2 position). Move 0s left, 2s right, 1s stay in middle.",
    whenToUse: "When sorting an array with a small fixed number of distinct values in-place.",
    interviewTip: "Dutch National Flag by Dijkstra. O(n) time, O(1) space. Be careful with pointer movements after swaps.",
    relatedProblems: ["move-zeroes", "merge-sorted-array", "three-sum"]
  },
  "two-sum-ii": {
    description: "Find two numbers in a SORTED array that add up to target using two pointers.",
    howItWorks: "Pointers at both ends. If sum < target, move left right. If sum > target, move right left.",
    whenToUse: "When array is sorted and you need O(1) space.",
    interviewTip: "Two-pointer preferred for sorted arrays. O(n) time, O(1) space vs hash map's O(n) space.",
    relatedProblems: ["two-sum", "three-sum", "container-with-most-water"]
  },
  "three-sum": {
    description: "Find all unique triplets that sum to zero.",
    howItWorks: "Sort array. Fix first element, use two-pointer for remaining two. Skip duplicates.",
    whenToUse: "Finding triplets with specific sum. Extension of two-sum.",
    interviewTip: "O(n²) time. Key is handling duplicates - skip same values for all three positions.",
    relatedProblems: ["two-sum", "two-sum-ii"]
  },
  "container-with-most-water": {
    description: "Find two lines that form a container holding the most water.",
    howItWorks: "Two pointers at ends. Calculate area, move pointer pointing to shorter line inward.",
    whenToUse: "Optimization problems finding best pair from both ends.",
    interviewTip: "Moving shorter line is key - taller line can never improve area. O(n) time.",
    relatedProblems: ["trapping-rain-water", "largest-rectangle-histogram"]
  },
  "trapping-rain-water": {
    description: "Calculate how much rain water can be trapped between bars.",
    howItWorks: "Two pointers or precompute left/right max arrays. Water at i = min(leftMax, rightMax) - height[i].",
    whenToUse: "Classic interview problem testing array and two-pointer skills.",
    interviewTip: "Two-pointer solution is O(n) time, O(1) space. Explain the logic of moving the smaller side.",
    relatedProblems: ["container-with-most-water", "largest-rectangle-histogram"]
  },

  // ==================== PREFIX SUM ====================
  "subarray-sum-equals-k": {
    description: "Count subarrays with sum equal to k.",
    howItWorks: "Use prefix sum with hash map. For each prefix sum, check if (prefixSum - k) exists in map.",
    whenToUse: "Counting subarrays with specific sum properties.",
    interviewTip: "Prefix sum + hash map pattern. O(n) time. Initialize map with {0: 1}.",
    relatedProblems: ["contiguous-array", "subarray-sums-divisible-by-k"]
  },
  "contiguous-array": {
    description: "Find longest contiguous subarray with equal number of 0s and 1s.",
    howItWorks: "Treat 0 as -1. Use prefix sum - same prefix sum means equal 0s and 1s between.",
    whenToUse: "Finding balanced subarrays. Transform problem to prefix sum.",
    interviewTip: "Convert to sum problem: 0→-1. When we see same prefix sum, subarray between has sum 0.",
    relatedProblems: ["subarray-sum-equals-k", "subarray-sums-divisible-by-k"]
  },
  "subarray-sums-divisible-by-k": {
    description: "Count subarrays with sum divisible by k.",
    howItWorks: "Prefix sum mod k. Same remainder means difference is divisible by k. Handle negative mods.",
    whenToUse: "Divisibility problems with subarrays.",
    interviewTip: "Prefix sum mod pattern. Handle negative remainders: (sum % k + k) % k.",
    relatedProblems: ["subarray-sum-equals-k", "contiguous-array"]
  },
  "continuous-subarray-sum": {
    description: "Check if there exists a subarray of size >= 2 with sum multiple of k.",
    howItWorks: "Prefix sum mod k. If same mod seen before and distance >= 2, we found it.",
    whenToUse: "Checking existence of subarrays with divisibility constraints.",
    interviewTip: "Store index with each mod value to check length >= 2. Handle k=0 case specially.",
    relatedProblems: ["subarray-sums-divisible-by-k", "subarray-sum-equals-k"]
  },

  // ==================== SLIDING WINDOW ====================
  "longest-substring-without-repeating-characters": {
    description: "Find length of longest substring without repeating characters.",
    howItWorks: "Sliding window with hash set/map. Expand right, shrink left when duplicate found.",
    whenToUse: "Substring problems with uniqueness constraints.",
    interviewTip: "Classic sliding window. Use map to store last index for O(n) single pass.",
    relatedProblems: ["minimum-window-substring", "permutation-in-string"]
  },
  "minimum-window-substring": {
    description: "Find minimum window in s containing all characters of t.",
    howItWorks: "Expand to include all chars, shrink while still valid. Track minimum valid window.",
    whenToUse: "Finding minimum window with constraints.",
    interviewTip: "Hard sliding window. Use frequency map and 'formed' counter. O(n) time.",
    relatedProblems: ["longest-substring-without-repeating-characters", "find-all-anagrams-in-string"]
  },
  "permutation-in-string": {
    description: "Check if s2 contains a permutation of s1.",
    howItWorks: "Fixed-size sliding window of len(s1). Check if window matches s1's character frequencies.",
    whenToUse: "Finding anagram/permutation within another string.",
    interviewTip: "Fixed window size makes this easier than variable window. Track matches count.",
    relatedProblems: ["find-all-anagrams-in-string", "minimum-window-substring"]
  },
  "max-consecutive-ones-iii": {
    description: "Find longest subarray of 1s with at most k zeros flipped.",
    howItWorks: "Sliding window. Expand right, shrink left when zeros exceed k.",
    whenToUse: "Maximum subarray with limited modifications allowed.",
    interviewTip: "Classic sliding window. Track zero count. O(n) time, O(1) space.",
    relatedProblems: ["longest-substring-without-repeating-characters", "minimum-window-substring"]
  },
  "maximum-average-subarray-i": {
    description: "Find maximum average of a subarray of length k.",
    howItWorks: "Fixed-size sliding window. Add new element, remove old element, track max sum.",
    whenToUse: "Fixed-size window problems.",
    interviewTip: "Simple sliding window. No need to actually divide - max sum gives max average.",
    relatedProblems: ["minimum-window-substring", "sliding-window-maximum"]
  },
  "minimum-size-subarray-sum": {
    description: "Find minimal length subarray with sum >= target.",
    howItWorks: "Sliding window. Expand until sum >= target, then shrink while maintaining condition.",
    whenToUse: "Finding minimum window satisfying a sum condition.",
    interviewTip: "Variable-size sliding window. O(n) time. Each element visited at most twice.",
    relatedProblems: ["maximum-subarray", "subarray-sum-equals-k"]
  },

  // ==================== KADANE'S ALGORITHM ====================
  "maximum-subarray": {
    description: "Find contiguous subarray with largest sum using Kadane's algorithm.",
    howItWorks: "Track current sum and max sum. If current becomes negative, reset to 0. Update max at each step.",
    whenToUse: "Contiguous subarray optimization. Foundation for many array DP problems.",
    interviewTip: "Kadane's is O(n) time, O(1) space. Negative prefix never helps. Know divide & conquer too.",
    relatedProblems: ["maximum-product-subarray", "best-sightseeing-pair"]
  },
  "maximum-product-subarray": {
    description: "Find contiguous subarray with largest product.",
    howItWorks: "Track both max and min products (negatives can flip). Update both at each step.",
    whenToUse: "Product optimization where negatives matter.",
    interviewTip: "Must track min too because negative * negative = positive. Reset logic differs from sum.",
    relatedProblems: ["maximum-subarray", "best-time-to-buy-and-sell-stock"]
  },
  "best-sightseeing-pair": {
    description: "Find maximum values[i] + values[j] + i - j where i < j.",
    howItWorks: "Rewrite as (values[i] + i) + (values[j] - j). Track max of first term as you go.",
    whenToUse: "Optimization problems that can be decomposed into independent terms.",
    interviewTip: "Algebraic transformation to separate i and j terms. O(n) time.",
    relatedProblems: ["maximum-subarray", "best-time-to-buy-and-sell-stock"]
  },

  // ==================== MATRIX ====================
  "spiral-matrix": {
    description: "Return all elements of a matrix in spiral order.",
    howItWorks: "Maintain four boundaries (top, bottom, left, right). Traverse and shrink boundaries.",
    whenToUse: "Matrix traversal in specific patterns.",
    interviewTip: "Track boundaries carefully. Handle edge cases of single row/column. O(m*n) time.",
    relatedProblems: ["rotate-image", "set-matrix-zeroes"]
  },
  "rotate-image": {
    description: "Rotate a matrix 90 degrees clockwise in-place.",
    howItWorks: "Transpose the matrix (swap rows and columns), then reverse each row.",
    whenToUse: "In-place matrix rotation without extra space.",
    interviewTip: "Transpose + reverse = 90° clockwise. Transpose + reverse cols = 90° counter-clockwise.",
    relatedProblems: ["spiral-matrix", "set-matrix-zeroes"]
  },
  "set-matrix-zeroes": {
    description: "Set entire row and column to zeros if an element is zero, in-place.",
    howItWorks: "Use first row/col as markers. First pass marks, second pass zeros.",
    whenToUse: "Matrix modification with propagating effects.",
    interviewTip: "O(1) space by using first row/col as flags. Handle first row/col specially.",
    relatedProblems: ["spiral-matrix", "rotate-image"]
  },
  "search-in-2d-matrix": {
    description: "Search for a value in a row-wise and column-wise sorted matrix.",
    howItWorks: "Start from top-right or bottom-left. Eliminate row or column based on comparison.",
    whenToUse: "Searching in sorted 2D structures.",
    interviewTip: "O(m+n) staircase search, or O(log(m*n)) treating as sorted 1D array.",
    relatedProblems: ["binary-search", "kth-smallest-in-sorted-matrix"]
  },

  // ==================== LINKED LIST ====================
  "reverse-linked-list": {
    description: "Reverse a singly linked list iteratively or recursively.",
    howItWorks: "Iterative: Use three pointers (prev, curr, next). Reverse pointer, advance all.",
    whenToUse: "Foundation for many linked list problems.",
    interviewTip: "Know both iterative O(1) space and recursive O(n) stack space solutions.",
    relatedProblems: ["reverse-linked-list-ii", "palindrome-linked-list"]
  },
  "reverse-linked-list-ii": {
    description: "Reverse linked list from position m to n.",
    howItWorks: "Find node before m, reverse m to n portion, reconnect the pieces.",
    whenToUse: "Partial list reversal problems.",
    interviewTip: "Keep track of connection points. One pass O(n) solution possible.",
    relatedProblems: ["reverse-linked-list", "reverse-nodes-in-k-group"]
  },
  "merge-two-sorted-lists": {
    description: "Merge two sorted linked lists into one sorted list.",
    howItWorks: "Compare heads, append smaller to result, advance that pointer. Handle remaining nodes.",
    whenToUse: "Merging sorted sequences.",
    interviewTip: "Iterative or recursive both work. Handle empty lists carefully.",
    relatedProblems: ["merge-k-sorted-lists", "merge-sorted-array"]
  },
  "linked-list-cycle": {
    description: "Detect if a linked list has a cycle using Floyd's algorithm.",
    howItWorks: "Slow pointer moves 1 step, fast moves 2. If they meet, there's a cycle.",
    whenToUse: "Cycle detection in sequences.",
    interviewTip: "Floyd's is O(n) time, O(1) space. Know how to find cycle start too!",
    relatedProblems: ["linked-list-cycle-2", "find-duplicate"]
  },
  "linked-list-cycle-2": {
    description: "Find the node where a cycle begins in a linked list.",
    howItWorks: "After finding meeting point, reset one pointer to head. Move both by 1 until they meet.",
    whenToUse: "Finding cycle entry point.",
    interviewTip: "Mathematical proof: distance from head to cycle start = distance from meeting point to cycle start.",
    relatedProblems: ["linked-list-cycle", "find-duplicate"]
  },
  "middle-of-linked-list": {
    description: "Find the middle node of a linked list.",
    howItWorks: "Slow and fast pointers. When fast reaches end, slow is at middle.",
    whenToUse: "Finding middle of list in one pass.",
    interviewTip: "Fast/slow pointer pattern. For even length, this returns second middle.",
    relatedProblems: ["linked-list-cycle", "palindrome-linked-list"]
  },
  "remove-nth-from-end": {
    description: "Remove the nth node from the end of a linked list in one pass.",
    howItWorks: "Two pointers n nodes apart. When first reaches end, second is at target's previous.",
    whenToUse: "Removing nodes at specific positions from end.",
    interviewTip: "Use dummy head to handle edge case of removing first node. One pass solution.",
    relatedProblems: ["middle-of-linked-list", "remove-duplicates-sorted-list-2"]
  },
  "remove-duplicates-sorted-list-2": {
    description: "Remove all nodes that have duplicates in a sorted list.",
    howItWorks: "Use prev pointer. Skip all nodes with same value when duplicates found.",
    whenToUse: "Complete duplicate removal (not keeping one copy).",
    interviewTip: "Use dummy head. Track when duplicates are found to skip entire group.",
    relatedProblems: ["remove-nth-from-end", "remove-duplicates"]
  },
  "add-two-numbers": {
    description: "Add two numbers represented as linked lists (digits in reverse order).",
    howItWorks: "Traverse both lists, add corresponding digits plus carry. Create new list with results.",
    whenToUse: "Arithmetic on linked list representations.",
    interviewTip: "Handle carry carefully, especially at the end. Handle different length lists.",
    relatedProblems: ["merge-two-sorted-lists", "reverse-linked-list"]
  },
  "copy-list-with-random-pointer": {
    description: "Deep copy a linked list where nodes have random pointers.",
    howItWorks: "Three passes: interleave copies, set random pointers, separate lists. Or use hash map.",
    whenToUse: "Deep copying complex linked structures.",
    interviewTip: "O(1) space interleaving is elegant. Hash map approach is O(n) space but simpler.",
    relatedProblems: ["clone-graph", "reverse-linked-list"]
  },
  "intersection-of-two-linked-lists": {
    description: "Find the node where two linked lists intersect.",
    howItWorks: "Get lengths, advance longer list by difference, then move together until match.",
    whenToUse: "Finding common nodes in linked lists.",
    interviewTip: "Two-pointer trick: traverse both, swap to other head at end. They meet at intersection.",
    relatedProblems: ["linked-list-cycle", "middle-of-linked-list"]
  },
  "rotate-list": {
    description: "Rotate a linked list to the right by k places.",
    howItWorks: "Find length, connect tail to head (make circular), find new tail, break circle.",
    whenToUse: "List rotation problems.",
    interviewTip: "k % length handles k > length. Make circular then break at right point.",
    relatedProblems: ["rotate-array", "reverse-linked-list"]
  },
  "partition-list": {
    description: "Partition list so all nodes < x come before nodes >= x.",
    howItWorks: "Create two separate lists (less than, greater or equal), then connect them.",
    whenToUse: "Partitioning linked lists by value.",
    interviewTip: "Maintain original relative order. Use dummy heads for both partitions.",
    relatedProblems: ["sort-colors", "merge-two-sorted-lists"]
  },
  "swap-nodes-in-pairs": {
    description: "Swap every two adjacent nodes in a linked list.",
    howItWorks: "Use dummy head. For each pair, adjust next pointers to swap.",
    whenToUse: "Pairwise operations on linked lists.",
    interviewTip: "Draw the pointer changes. Can be done iteratively or recursively.",
    relatedProblems: ["reverse-nodes-in-k-group", "reverse-linked-list"]
  },
  "reverse-nodes-in-k-group": {
    description: "Reverse nodes in groups of k. Nodes less than k remain unchanged.",
    howItWorks: "Count k nodes, reverse that group, recursively handle rest.",
    whenToUse: "Group-wise list reversal.",
    interviewTip: "Check if k nodes exist before reversing. Connect groups properly.",
    relatedProblems: ["swap-nodes-in-pairs", "reverse-linked-list-ii"]
  },
  "flatten-multilevel-doubly-linked-list": {
    description: "Flatten a multilevel doubly linked list with child pointers.",
    howItWorks: "When child found, insert child list between current and next, continue.",
    whenToUse: "Flattening nested/hierarchical linked structures.",
    interviewTip: "Handle child's tail connection to parent's next. Clear child pointers.",
    relatedProblems: ["flatten-binary-tree-to-linked-list", "copy-list-with-random-pointer"]
  },

  // ==================== STACK ====================
  "valid-parentheses": {
    description: "Check if a string of brackets is valid - every open has matching close in correct order.",
    howItWorks: "Push open brackets to stack. For close, check if stack top matches.",
    whenToUse: "Matching pairs, expression validation, nested structures.",
    interviewTip: "Classic stack problem. Use map for bracket pairs. Handle empty stack case.",
    relatedProblems: ["generate-parentheses", "longest-valid-parentheses"]
  },
  "daily-temperatures": {
    description: "Find days until warmer temperature using monotonic stack.",
    howItWorks: "Maintain decreasing stack of indices. Pop smaller temps and calculate days.",
    whenToUse: "Next greater/smaller element problems.",
    interviewTip: "Monotonic stack pattern. Explain why stack stays monotonic for O(n) time.",
    relatedProblems: ["next-greater-element-i", "largest-rectangle-histogram"]
  },
  "evaluate-reverse-polish-notation": {
    description: "Evaluate arithmetic expression in Reverse Polish Notation.",
    howItWorks: "Push numbers to stack. For operators, pop two operands, compute, push result.",
    whenToUse: "Expression evaluation, calculator problems.",
    interviewTip: "RPN eliminates need for parentheses. Watch order of operands for - and /.",
    relatedProblems: ["basic-calculator-ii", "valid-parentheses"]
  },
  "basic-calculator-ii": {
    description: "Evaluate expression with +, -, *, / (no parentheses).",
    howItWorks: "Use stack for pending additions. Handle * and / immediately, + and - push to stack.",
    whenToUse: "Expression evaluation with operator precedence.",
    interviewTip: "Process * and / immediately, defer + and -. Finally sum the stack.",
    relatedProblems: ["evaluate-reverse-polish-notation", "valid-parentheses"]
  },
  "next-greater-element-i": {
    description: "Find next greater element for each element in nums1 from nums2.",
    howItWorks: "Precompute next greater for all in nums2 using monotonic stack, then lookup.",
    whenToUse: "Next greater element problems.",
    interviewTip: "Monotonic decreasing stack. Store mapping in hash map for O(1) lookup.",
    relatedProblems: ["daily-temperatures", "largest-rectangle-histogram"]
  },
  "removing-stars-from-a-string": {
    description: "Process string where * removes the closest non-star character to its left.",
    howItWorks: "Use stack. Push non-star characters, pop when seeing star.",
    whenToUse: "String processing with deletion based on markers.",
    interviewTip: "Simple stack application. Build result from remaining stack.",
    relatedProblems: ["remove-all-adjacent-duplicates-in-string", "valid-parentheses"]
  },
  "remove-all-adjacent-duplicates-in-string": {
    description: "Remove adjacent duplicate characters repeatedly until no more possible.",
    howItWorks: "Use stack. If top equals current char, pop. Otherwise push.",
    whenToUse: "Removing adjacent duplicates.",
    interviewTip: "Stack naturally handles chain reactions. O(n) time.",
    relatedProblems: ["removing-stars-from-a-string", "valid-parentheses"]
  },
  "remove-duplicate-letters": {
    description: "Remove duplicate letters to get smallest lexicographical result.",
    howItWorks: "Monotonic stack. Pop if current char smaller and popped char appears later.",
    whenToUse: "Lexicographically smallest subsequence problems.",
    interviewTip: "Track last occurrence of each char. Use stack for building result.",
    relatedProblems: ["removing-stars-from-a-string", "next-greater-element-i"]
  },
  "reveal-cards-in-increasing-order": {
    description: "Reorder deck so reveal alternating with moving bottom to top gives sorted order.",
    howItWorks: "Simulate in reverse. For sorted cards from largest, insert at positions that reverse the process.",
    whenToUse: "Simulation problems with specific reveal patterns.",
    interviewTip: "Work backwards from desired result. Use deque for efficient operations.",
    relatedProblems: ["valid-parentheses", "evaluate-reverse-polish-notation"]
  },
  "number-of-visible-people-in-a-queue": {
    description: "For each person, count how many people to the right they can see.",
    howItWorks: "Monotonic decreasing stack from right. Pop and count shorter people.",
    whenToUse: "Visibility problems with height constraints.",
    interviewTip: "Process from right. Stack holds candidates. Count pops as visible people.",
    relatedProblems: ["daily-temperatures", "largest-rectangle-histogram"]
  },
  "largest-rectangle-histogram": {
    description: "Find largest rectangle in histogram.",
    howItWorks: "Monotonic increasing stack. When smaller bar found, pop and calculate rectangle widths.",
    whenToUse: "Maximum rectangle/area problems.",
    interviewTip: "Classic hard problem. Stack stores indices. Width = current - stack.top - 1.",
    relatedProblems: ["trapping-rain-water", "daily-temperatures"]
  },
  "longest-valid-parentheses": {
    description: "Find length of longest valid parentheses substring.",
    howItWorks: "Stack with indices. Push -1 as base. Pop on ), calculate length using new top.",
    whenToUse: "Finding longest valid sequences.",
    interviewTip: "Can also solve with DP or two-pass counting. Stack is most intuitive.",
    relatedProblems: ["valid-parentheses", "generate-parentheses"]
  },

  // ==================== QUEUE ====================
  "sliding-window-maximum": {
    description: "Find maximum in each sliding window of size k using monotonic deque.",
    howItWorks: "Maintain decreasing deque of indices. Front is always max. Remove out-of-window elements.",
    whenToUse: "Maximum/minimum in sliding window problems.",
    interviewTip: "Monotonic deque gives O(n). Each element added and removed at most once.",
    relatedProblems: ["daily-temperatures", "minimum-window-substring"]
  },
  "rotting-oranges": {
    description: "Find minimum time for all oranges to rot using BFS.",
    howItWorks: "Multi-source BFS from all rotten oranges simultaneously. Each level is one minute.",
    whenToUse: "Minimum time/steps spreading from multiple sources.",
    interviewTip: "Multi-source BFS. Count fresh oranges, return -1 if any remain.",
    relatedProblems: ["number-of-islands", "walls-and-gates"]
  },

  // ==================== BINARY SEARCH ====================
  "binary-search": {
    description: "Find target in sorted array by repeatedly dividing search space in half.",
    howItWorks: "Compare with middle. If equal, found. If smaller, search left. If larger, search right.",
    whenToUse: "Searching in sorted arrays. Finding boundaries. Optimization with monotonic property.",
    interviewTip: "O(log n). Use mid = left + (right-left)/2 to avoid overflow. Know inclusive/exclusive bounds.",
    relatedProblems: ["search-insert-position", "find-minimum-rotated"]
  },
  "search-insert-position": {
    description: "Find index to insert target in sorted array to keep it sorted.",
    howItWorks: "Binary search. If not found, left pointer gives insertion position.",
    whenToUse: "Finding insertion point in sorted arrays.",
    interviewTip: "Standard binary search template. Left pointer gives lower bound.",
    relatedProblems: ["binary-search", "search-in-2d-matrix"]
  },
  "search-rotated-array": {
    description: "Search in rotated sorted array.",
    howItWorks: "Modified binary search. Determine which half is sorted, check if target is there.",
    whenToUse: "Searching in partially sorted data.",
    interviewTip: "At least one half is always sorted. Use that to determine search direction.",
    relatedProblems: ["find-minimum-rotated", "binary-search"]
  },
  "find-minimum-rotated": {
    description: "Find minimum element in rotated sorted array.",
    howItWorks: "Binary search comparing mid with right. If mid > right, min is in right half.",
    whenToUse: "Finding rotation point in rotated arrays.",
    interviewTip: "Compare with rightmost element. O(log n) time.",
    relatedProblems: ["search-rotated-array", "binary-search"]
  },
  "find-peak-element": {
    description: "Find any peak element (greater than neighbors) in O(log n).",
    howItWorks: "Binary search. If mid < mid+1, peak is on right. Otherwise peak is on left or at mid.",
    whenToUse: "Finding local maxima/minima.",
    interviewTip: "Multiple peaks possible, find any. Guaranteed to exist (imagine boundaries as -∞).",
    relatedProblems: ["binary-search", "find-minimum-rotated"]
  },
  "kth-smallest-in-sorted-matrix": {
    description: "Find kth smallest element in row and column sorted matrix.",
    howItWorks: "Binary search on value range. Count elements <= mid, adjust search range.",
    whenToUse: "Finding kth element with efficient counting.",
    interviewTip: "Binary search on value (not index). Can also use min-heap approach.",
    relatedProblems: ["search-in-2d-matrix", "median-of-two-sorted-arrays"]
  },
  "search-suggestions-system": {
    description: "Suggest products starting with each prefix of search word.",
    howItWorks: "Sort products, binary search for prefix, return up to 3 suggestions per prefix.",
    whenToUse: "Autocomplete/suggestion systems.",
    interviewTip: "Sorting + binary search or Trie both work. Binary search is simpler.",
    relatedProblems: ["binary-search", "implement-trie"]
  },

  // ==================== TREE ====================
  "binary-tree-inorder": {
    description: "Inorder traversal: left, root, right.",
    howItWorks: "Recursive: traverse left, visit root, traverse right. Iterative: use stack.",
    whenToUse: "BST gives sorted order. Foundation for tree problems.",
    interviewTip: "Know iterative solution with stack. Morris traversal for O(1) space.",
    relatedProblems: ["binary-tree-preorder", "binary-tree-postorder"]
  },
  "binary-tree-preorder": {
    description: "Preorder traversal: root, left, right.",
    howItWorks: "Visit root first, then traverse left subtree, then right subtree.",
    whenToUse: "Creating copy of tree, serialization.",
    interviewTip: "Iterative: push right then left to stack (LIFO gives correct order).",
    relatedProblems: ["binary-tree-inorder", "binary-tree-postorder"]
  },
  "binary-tree-postorder": {
    description: "Postorder traversal: left, right, root.",
    howItWorks: "Traverse left, traverse right, then visit root.",
    whenToUse: "Deleting tree, evaluating expression trees.",
    interviewTip: "Iterative is tricky. Can reverse modified preorder (root, right, left).",
    relatedProblems: ["binary-tree-preorder", "binary-tree-inorder"]
  },
  "binary-tree-level-order": {
    description: "Level order traversal using BFS.",
    howItWorks: "BFS with queue. Process all nodes at current level before moving to next.",
    whenToUse: "Level-by-level operations, finding depth.",
    interviewTip: "Track level size to know when level ends. Can also use DFS with level parameter.",
    relatedProblems: ["binary-tree-zigzag", "binary-tree-right-side-view"]
  },
  "binary-tree-zigzag": {
    description: "Level order but alternating left-to-right and right-to-left.",
    howItWorks: "BFS with direction flag. Reverse level or use deque based on direction.",
    whenToUse: "Zigzag pattern problems.",
    interviewTip: "Track direction, alternate each level. Can add to front/back of list based on direction.",
    relatedProblems: ["binary-tree-level-order", "binary-tree-right-side-view"]
  },
  "binary-tree-right-side-view": {
    description: "Return nodes visible from right side (rightmost at each level).",
    howItWorks: "BFS taking last node of each level, or DFS going right-first with level tracking.",
    whenToUse: "Finding edge/boundary nodes.",
    interviewTip: "DFS: visit right before left, first node at each depth is visible.",
    relatedProblems: ["binary-tree-level-order", "binary-tree-zigzag"]
  },
  "validate-bst": {
    description: "Check if binary tree is valid BST.",
    howItWorks: "Pass valid range (min, max) down. Each node must be in range. Update range when recursing.",
    whenToUse: "Validating tree properties.",
    interviewTip: "Range-based or inorder traversal (should be sorted). Handle Integer.MIN/MAX.",
    relatedProblems: ["kth-smallest-bst", "lowest-common-ancestor"]
  },
  "lowest-common-ancestor": {
    description: "Find lowest common ancestor of two nodes.",
    howItWorks: "Recursively search. If both sides return non-null, current is LCA.",
    whenToUse: "Finding relationships between nodes.",
    interviewTip: "For BST, use BST property. For general tree, this recursive solution is elegant.",
    relatedProblems: ["path-sum-iii", "binary-tree-paths"]
  },
  "invert-binary-tree": {
    description: "Invert a binary tree (mirror image).",
    howItWorks: "Swap left and right children, recurse on both subtrees.",
    whenToUse: "Tree transformation problems.",
    interviewTip: "Simple recursion. Can also use BFS/DFS iteratively.",
    relatedProblems: ["symmetric-tree", "same-tree"]
  },
  "symmetric-tree": {
    description: "Check if a tree is symmetric around its center.",
    howItWorks: "Check if left subtree is mirror of right subtree. Compare outer and inner pairs.",
    whenToUse: "Checking mirror properties.",
    interviewTip: "Recursive or iterative with two queues. Compare left.left with right.right.",
    relatedProblems: ["invert-binary-tree", "same-tree"]
  },
  "same-tree": {
    description: "Check if two trees are identical.",
    howItWorks: "Recursively compare: both null (true), one null (false), values equal and subtrees match.",
    whenToUse: "Tree comparison.",
    interviewTip: "Simple recursion. Base cases: both null=true, one null=false.",
    relatedProblems: ["symmetric-tree", "invert-binary-tree"]
  },
  "diameter-binary-tree": {
    description: "Find diameter (longest path between any two nodes).",
    howItWorks: "For each node, diameter through it = left height + right height. Track global max.",
    whenToUse: "Finding longest paths in trees.",
    interviewTip: "Path may not go through root. Calculate height while tracking diameter.",
    relatedProblems: ["binary-tree-maximum-path-sum", "balanced-binary-tree"]
  },
  "depth-first-search": {
    description: "Explore as far as possible along each branch before backtracking.",
    howItWorks: "Use recursion or explicit stack. Visit node, then all its children recursively.",
    whenToUse: "Tree/graph traversal, pathfinding, connected components.",
    interviewTip: "O(V+E) time. Recursive is cleaner, iterative avoids stack overflow.",
    relatedProblems: ["binary-tree-inorder", "number-of-islands"]
  },
  "kth-smallest-bst": {
    description: "Find kth smallest element in BST.",
    howItWorks: "Inorder traversal gives sorted order. Return kth element visited.",
    whenToUse: "Finding elements by rank in BST.",
    interviewTip: "Inorder is O(H+k). Can augment BST with subtree sizes for O(H).",
    relatedProblems: ["validate-bst", "binary-tree-inorder"]
  },
  "binary-tree-maximum-path-sum": {
    description: "Find maximum path sum (path can start and end anywhere).",
    howItWorks: "For each node, max path through it = node + max(left,0) + max(right,0). Track global max.",
    whenToUse: "Maximum path problems in trees.",
    interviewTip: "Return single-branch max for recursion, but track two-branch max globally.",
    relatedProblems: ["diameter-binary-tree", "path-sum-iii"]
  },
  "path-sum-iii": {
    description: "Count paths that sum to target (path can start/end anywhere going down).",
    howItWorks: "Prefix sum technique on tree. Track prefix sums, count (currentSum - target) occurrences.",
    whenToUse: "Counting paths with specific sums.",
    interviewTip: "Combine DFS with prefix sum hash map. Remove from map when backtracking.",
    relatedProblems: ["subarray-sum-equals-k", "binary-tree-maximum-path-sum"]
  },
  "binary-tree-paths": {
    description: "Return all root-to-leaf paths.",
    howItWorks: "DFS building path string. When leaf reached, add path to result.",
    whenToUse: "Enumerating all paths.",
    interviewTip: "Backtracking not needed if using string concatenation (immutable). Use StringBuilder for efficiency.",
    relatedProblems: ["path-sum-iii", "lowest-common-ancestor"]
  },
  "flatten-binary-tree-to-linked-list": {
    description: "Flatten tree to linked list in preorder using right pointers.",
    howItWorks: "For each node: save right, connect left to right, connect end of left-subtree to saved right.",
    whenToUse: "Tree to list conversion.",
    interviewTip: "Morris traversal approach for O(1) space. Or use stack/recursion.",
    relatedProblems: ["binary-tree-preorder", "flatten-multilevel-doubly-linked-list"]
  },
  "populating-next-right-pointers": {
    description: "Connect each node to its next right node at same level.",
    howItWorks: "Level by level, use established next pointers to traverse and connect next level.",
    whenToUse: "Connecting siblings in tree.",
    interviewTip: "O(1) space using already-set next pointers. Process level while connecting next level.",
    relatedProblems: ["binary-tree-level-order", "binary-tree-right-side-view"]
  },
  "house-robber-iii": {
    description: "Maximum money robbing houses on a binary tree (can't rob adjacent nodes).",
    howItWorks: "For each node, return (rob_this, skip_this). Rob = val + skip children. Skip = max of children.",
    whenToUse: "DP on trees with adjacency constraints.",
    interviewTip: "Return pair to avoid recomputation. Post-order traversal.",
    relatedProblems: ["house-robber", "house-robber-ii"]
  },
  "sorted-array-to-bst": {
    description: "Convert sorted array to height-balanced BST.",
    howItWorks: "Pick middle as root, recursively build left subtree from left half, right from right half.",
    whenToUse: "Building balanced trees from sorted data.",
    interviewTip: "Always pick middle for balance. O(n) time, O(log n) recursion stack.",
    relatedProblems: ["validate-bst", "binary-search"]
  },
  "trim-bst": {
    description: "Trim BST to only contain values in [low, high].",
    howItWorks: "If node < low, return trimmed right subtree. If node > high, return trimmed left. Otherwise trim both.",
    whenToUse: "Modifying BST based on value constraints.",
    interviewTip: "Use BST property to eliminate entire subtrees. O(n) time.",
    relatedProblems: ["validate-bst", "kth-smallest-bst"]
  },
  "all-nodes-distance-k-in-binary-tree": {
    description: "Find all nodes at distance k from target node.",
    howItWorks: "Build parent pointers, then BFS from target for k levels.",
    whenToUse: "Finding nodes at specific distances.",
    interviewTip: "Convert to graph (add parent pointers), then BFS. O(n) time.",
    relatedProblems: ["binary-tree-level-order", "lowest-common-ancestor"]
  },
  "binary-tree-cameras": {
    description: "Minimum cameras to monitor all nodes (camera covers parent, self, children).",
    howItWorks: "Greedy post-order: prefer placing cameras at parents of leaves. Track states.",
    whenToUse: "Covering problems on trees.",
    interviewTip: "3 states: not covered, covered no camera, has camera. Place camera when child not covered.",
    relatedProblems: ["house-robber-iii", "binary-tree-maximum-path-sum"]
  },
  "distribute-coins": {
    description: "Minimum moves to distribute coins so each node has exactly one.",
    howItWorks: "Post-order: each node passes excess (coins-1) up. Moves = sum of absolute excesses.",
    whenToUse: "Distribution/balancing on trees.",
    interviewTip: "Return excess/deficit. Parent receives it. Moves = abs(left) + abs(right).",
    relatedProblems: ["binary-tree-cameras", "house-robber-iii"]
  },
  "find-duplicate-subtrees": {
    description: "Find all duplicate subtrees in a binary tree.",
    howItWorks: "Serialize each subtree, use hash map to track. Add to result when count becomes 2.",
    whenToUse: "Finding duplicate structures.",
    interviewTip: "Serialize subtrees with postorder. Use unique ID mapping for O(n) time.",
    relatedProblems: ["same-tree", "serialize-deserialize-bst"]
  },
  "max-ancestor-diff": {
    description: "Maximum |ancestor - node| difference in tree.",
    howItWorks: "Track min and max values on path from root. At each node, check diff with min/max.",
    whenToUse: "Finding extreme differences on paths.",
    interviewTip: "Pass min/max down. Answer is max(current-min, max-current).",
    relatedProblems: ["binary-tree-maximum-path-sum", "diameter-binary-tree"]
  },
  "min-distance-bst": {
    description: "Minimum difference between any two nodes in BST.",
    howItWorks: "Inorder traversal gives sorted order. Min diff is between consecutive elements.",
    whenToUse: "Finding minimum gaps in BST.",
    interviewTip: "Inorder traversal, track previous value. Compare adjacent pairs.",
    relatedProblems: ["kth-smallest-bst", "validate-bst"]
  },

  // ==================== GRAPH ====================
  "number-of-islands": {
    description: "Count islands in a grid (1=land, 0=water).",
    howItWorks: "Iterate grid. When '1' found, increment count, DFS/BFS to mark all connected land visited.",
    whenToUse: "Connected components on grids.",
    interviewTip: "Classic DFS/BFS on grid. Can modify input or use visited set. O(m×n) time.",
    relatedProblems: ["max-area-of-island", "surrounded-regions"]
  },
  "clone-graph": {
    description: "Deep copy a graph.",
    howItWorks: "BFS/DFS with hash map: old node -> new node. Clone neighbors recursively.",
    whenToUse: "Graph copying/cloning.",
    interviewTip: "Map prevents infinite loops and duplicate creation. Handle empty graph.",
    relatedProblems: ["copy-list-with-random-pointer", "number-of-islands"]
  },
  "course-schedule": {
    description: "Check if all courses can be finished (cycle detection in directed graph).",
    howItWorks: "Build graph, detect cycle using DFS with 3 states or BFS topological sort.",
    whenToUse: "Dependency problems, cycle detection.",
    interviewTip: "Know both DFS (3 states) and BFS (Kahn's algorithm) approaches.",
    relatedProblems: ["course-schedule-ii", "alien-dictionary"]
  },
  "course-schedule-ii": {
    description: "Return valid course order (topological sort).",
    howItWorks: "Topological sort using DFS or BFS (Kahn's). Return order or empty if cycle.",
    whenToUse: "Finding valid ordering with dependencies.",
    interviewTip: "Kahn's algorithm naturally produces order. DFS needs post-order reversal.",
    relatedProblems: ["course-schedule", "alien-dictionary"]
  },
  "number-of-provinces": {
    description: "Count connected components in adjacency matrix.",
    howItWorks: "DFS/BFS from each unvisited node, mark all reachable as visited, increment count.",
    whenToUse: "Counting connected components.",
    interviewTip: "Union-Find also works well. O(n²) time for adjacency matrix.",
    relatedProblems: ["number-of-islands", "redundant-connection"]
  },
  "redundant-connection": {
    description: "Find edge that creates cycle in undirected graph.",
    howItWorks: "Union-Find: process edges, when both nodes already in same set, that edge is redundant.",
    whenToUse: "Detecting cycle-creating edges.",
    interviewTip: "Union-Find with path compression. O(n α(n)) ≈ O(n) time.",
    relatedProblems: ["number-of-provinces", "min-cost-connect-points"]
  },
  "is-bipartite": {
    description: "Check if graph can be 2-colored (no adjacent same colors).",
    howItWorks: "BFS/DFS coloring. Assign color, color neighbors opposite. Conflict = not bipartite.",
    whenToUse: "Two-coloring problems, matching.",
    interviewTip: "Graph is bipartite iff no odd-length cycles. O(V+E) time.",
    relatedProblems: ["number-of-islands", "course-schedule"]
  },
  "find-eventual-safe-states": {
    description: "Find nodes not part of any cycle (safe nodes).",
    howItWorks: "DFS with 3 states. Node is safe if all its descendants lead to terminal nodes.",
    whenToUse: "Finding nodes with certain reachability properties.",
    interviewTip: "Reverse graph + topological sort also works. O(V+E) time.",
    relatedProblems: ["course-schedule", "number-of-provinces"]
  },
  "minimum-height-trees": {
    description: "Find roots that minimize tree height.",
    howItWorks: "Topological approach: repeatedly remove leaf nodes. Remaining 1-2 nodes are centroids.",
    whenToUse: "Finding central nodes in trees.",
    interviewTip: "At most 2 MHT roots. Keep removing leaves until 1-2 nodes remain.",
    relatedProblems: ["course-schedule-ii", "number-of-provinces"]
  },
  "min-cost-connect-points": {
    description: "Minimum cost to connect all points (Minimum Spanning Tree).",
    howItWorks: "Prim's or Kruskal's algorithm. Prim's with heap: always pick cheapest edge to unvisited node.",
    whenToUse: "MST problems.",
    interviewTip: "Prim's with heap is O(n² log n). Can optimize for dense graphs.",
    relatedProblems: ["redundant-connection", "number-of-provinces"]
  },
  "word-ladder": {
    description: "Minimum transformations from beginWord to endWord, changing one letter at a time.",
    howItWorks: "BFS where neighbors are words differing by one letter. Use set for valid words.",
    whenToUse: "Shortest path with transformation constraints.",
    interviewTip: "BFS for shortest path. Preprocess with wildcard patterns for efficiency.",
    relatedProblems: ["number-of-islands", "rotting-oranges"]
  },
  "employee-importance": {
    description: "Sum importance of employee and all subordinates.",
    howItWorks: "Build ID to employee map, DFS/BFS to sum importance values.",
    whenToUse: "Tree aggregation problems.",
    interviewTip: "Simple DFS. O(n) time with hash map lookup.",
    relatedProblems: ["time-needed-to-inform", "number-of-provinces"]
  },
  "time-needed-to-inform": {
    description: "Time for all employees to receive message from head.",
    howItWorks: "Build tree, DFS to find max path sum of inform times.",
    whenToUse: "Tree path maximum problems.",
    interviewTip: "Max time = longest path from root weighted by inform times. DFS O(n).",
    relatedProblems: ["employee-importance", "binary-tree-maximum-path-sum"]
  },
  "minimize-malware-spread": {
    description: "Remove one infected node to minimize final infection spread.",
    howItWorks: "Find connected components with Union-Find. Remove node that uniquely infects largest component.",
    whenToUse: "Optimization with component analysis.",
    interviewTip: "If multiple infected in same component, removing any won't help. Find unique infections.",
    relatedProblems: ["number-of-provinces", "redundant-connection"]
  },

  // ==================== HEAP ====================
  "kth-largest-element": {
    description: "Find kth largest element in unsorted array.",
    howItWorks: "Min-heap of size k, or QuickSelect for average O(n).",
    whenToUse: "Finding kth element without full sorting.",
    interviewTip: "Min-heap: O(n log k). QuickSelect: O(n) average, O(n²) worst. Know both!",
    relatedProblems: ["top-k-frequent", "k-closest-points"]
  },
  "top-k-frequent": {
    description: "Find k most frequent elements.",
    howItWorks: "Count frequencies, use min-heap of size k or bucket sort for O(n).",
    whenToUse: "Top-K by frequency.",
    interviewTip: "Min-heap: O(n log k). Bucket sort: O(n). QuickSelect also works.",
    relatedProblems: ["kth-largest-element", "sort-characters-by-frequency"]
  },
  "sort-characters-by-frequency": {
    description: "Sort string characters by frequency descending.",
    howItWorks: "Count frequencies, sort by frequency (heap or bucket), build result.",
    whenToUse: "Frequency-based sorting.",
    interviewTip: "Bucket sort is O(n). Heap is O(n log n). Both work.",
    relatedProblems: ["top-k-frequent", "reorganize-string"]
  },
  "reorganize-string": {
    description: "Rearrange string so no two adjacent characters are same.",
    howItWorks: "Max-heap by frequency. Always place most frequent, then second most, alternate.",
    whenToUse: "Arrangement with separation constraints.",
    interviewTip: "Impossible if max freq > (n+1)/2. Greedy with heap works.",
    relatedProblems: ["sort-characters-by-frequency", "task-scheduler"]
  },
  "furthest-building": {
    description: "Furthest building reachable with limited bricks and ladders.",
    howItWorks: "Min-heap of ladder climbs. Use ladders for largest climbs, bricks for rest.",
    whenToUse: "Resource allocation optimization.",
    interviewTip: "Greedy: use ladders for k largest climbs (heap tracks these). O(n log n).",
    relatedProblems: ["kth-largest-element", "top-k-frequent"]
  },
  "find-median-data-stream": {
    description: "Find median from data stream.",
    howItWorks: "Two heaps: max-heap for lower half, min-heap for upper half. Balance sizes.",
    whenToUse: "Running median problems.",
    interviewTip: "Keep heaps balanced (differ by at most 1). Median from heap tops. O(log n) insert.",
    relatedProblems: ["sliding-window-maximum", "kth-largest-element"]
  },
  "ipo": {
    description: "Maximize capital after k projects with capital constraints.",
    howItWorks: "Sort by capital, use max-heap for profits of affordable projects. Greedy selection.",
    whenToUse: "Greedy selection with constraints.",
    interviewTip: "Two-step: filter by capital, select by profit. O(n log n).",
    relatedProblems: ["top-k-frequent", "furthest-building"]
  },
  "k-closest-points": {
    description: "Find k closest points to origin.",
    howItWorks: "Max-heap of size k (by distance), or QuickSelect.",
    whenToUse: "Finding k closest/nearest.",
    interviewTip: "Max-heap keeps k smallest distances. O(n log k) time.",
    relatedProblems: ["kth-largest-element", "top-k-frequent"]
  },
  "k-smallest-pairs": {
    description: "Find k pairs with smallest sums from two sorted arrays.",
    howItWorks: "Min-heap starting with (nums1[i], nums2[0]). Pop smallest, push next from nums2.",
    whenToUse: "K-way merge pattern.",
    interviewTip: "Similar to merge k sorted lists. Don't generate all pairs upfront.",
    relatedProblems: ["merge-k-sorted-lists", "kth-smallest-in-sorted-matrix"]
  },
  "merge-k-sorted-lists": {
    description: "Merge k sorted linked lists.",
    howItWorks: "Min-heap of list heads. Pop smallest, add its next to heap.",
    whenToUse: "Merging multiple sorted sequences.",
    interviewTip: "Heap: O(n log k). Divide & conquer also O(n log k). Know both.",
    relatedProblems: ["merge-two-sorted-lists", "k-smallest-pairs"]
  },

  // ==================== INTERVALS ====================
  "merge-intervals": {
    description: "Merge overlapping intervals.",
    howItWorks: "Sort by start, iterate and merge if overlap (current.start <= prev.end).",
    whenToUse: "Interval consolidation.",
    interviewTip: "Sort first! O(n log n). Extend end when merging: max(prev.end, current.end).",
    relatedProblems: ["insert-interval", "non-overlapping-intervals"]
  },
  "insert-interval": {
    description: "Insert new interval and merge if necessary.",
    howItWorks: "Add all before, merge overlapping, add all after.",
    whenToUse: "Inserting into sorted intervals.",
    interviewTip: "Three phases: before, overlapping, after. O(n) if already sorted.",
    relatedProblems: ["merge-intervals", "non-overlapping-intervals"]
  },
  "non-overlapping-intervals": {
    description: "Minimum intervals to remove for non-overlapping.",
    howItWorks: "Greedy: sort by end, keep interval that ends earliest when conflict.",
    whenToUse: "Interval scheduling, activity selection.",
    interviewTip: "Sort by END time (not start). Greedy keeps most intervals. O(n log n).",
    relatedProblems: ["merge-intervals", "minimum-arrows-to-burst-balloons"]
  },
  "minimum-arrows-to-burst-balloons": {
    description: "Minimum arrows to burst all balloons (intervals).",
    howItWorks: "Sort by end, shoot at end of first unpopped. Count when new balloon starts after shot.",
    whenToUse: "Interval covering problems.",
    interviewTip: "Similar to non-overlapping intervals. Sort by end. O(n log n).",
    relatedProblems: ["non-overlapping-intervals", "merge-intervals"]
  },

  // ==================== GREEDY ====================
  "jump-game-2": {
    description: "Minimum jumps to reach end.",
    howItWorks: "Greedy BFS: track current end and farthest reachable. Jump when reaching current end.",
    whenToUse: "Minimum steps with variable jumps.",
    interviewTip: "O(n) greedy. Each 'level' is one jump. Track farthest within current level.",
    relatedProblems: ["jump-game", "maximum-subarray"]
  },
  "gas-station": {
    description: "Find starting station to complete circular route.",
    howItWorks: "If total gas >= total cost, solution exists. Start from station after most negative point.",
    whenToUse: "Circular route optimization.",
    interviewTip: "O(n) greedy. If we can't reach station i from start s, try starting from i+1.",
    relatedProblems: ["jump-game-2", "maximum-subarray"]
  },

  // ==================== BACKTRACKING ====================
  "subsets": {
    description: "Generate all possible subsets.",
    howItWorks: "Backtracking: for each element, include or exclude it.",
    whenToUse: "Generating all combinations.",
    interviewTip: "2^n subsets. Can also do iteratively. Template for subset/combination problems.",
    relatedProblems: ["subsets-ii", "permutations", "combination-sum"]
  },
  "permutations": {
    description: "Generate all permutations.",
    howItWorks: "Backtracking with swap or used array. Try each unused element at each position.",
    whenToUse: "Generating all orderings.",
    interviewTip: "n! permutations. Know swap-based and used-array approaches.",
    relatedProblems: ["permutations-ii", "subsets"]
  },
  "word-search-ii": {
    description: "Find all words from dictionary in board.",
    howItWorks: "Build Trie from words, DFS on board with Trie navigation.",
    whenToUse: "Multiple pattern search on grid.",
    interviewTip: "Trie + DFS. Mark visited during DFS. Remove found words from Trie.",
    relatedProblems: ["word-search", "implement-trie"]
  },

  // ==================== TRIES ====================

  // ==================== DYNAMIC PROGRAMMING ====================
  "climbing-stairs": {
    description: "Count ways to climb n stairs taking 1 or 2 steps.",
    howItWorks: "dp[i] = dp[i-1] + dp[i-2]. Fibonacci sequence.",
    whenToUse: "Counting paths with choices.",
    interviewTip: "Classic DP intro problem. O(n) time, O(1) space with two variables.",
    relatedProblems: ["min-cost-climbing-stairs", "house-robber"]
  },
  "min-cost-climbing-stairs": {
    description: "Minimum cost to climb stairs paying cost[i] to step on stair i.",
    howItWorks: "dp[i] = cost[i] + min(dp[i-1], dp[i-2]). Start from step 0 or 1.",
    whenToUse: "Minimum cost path problems.",
    interviewTip: "Can reach top from last or second-last stair. O(n) time, O(1) space.",
    relatedProblems: ["climbing-stairs", "house-robber"]
  },
  "house-robber": {
    description: "Maximum money robbing non-adjacent houses.",
    howItWorks: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]). Rob or skip current house.",
    whenToUse: "Maximum with skip constraints.",
    interviewTip: "Classic DP. O(n) time, O(1) space with two variables.",
    relatedProblems: ["house-robber-ii", "house-robber-iii"]
  },
  "house-robber-ii": {
    description: "House robber with circular street (first and last adjacent).",
    howItWorks: "Run house robber twice: exclude first house, exclude last house. Take max.",
    whenToUse: "Circular version of skip constraint problems.",
    interviewTip: "Can't rob both first and last. Two passes solve the circular constraint.",
    relatedProblems: ["house-robber", "house-robber-iii"]
  },
  "coin-change": {
    description: "Minimum coins to make amount.",
    howItWorks: "dp[i] = min(dp[i], dp[i-coin] + 1) for each coin. Bottom-up.",
    whenToUse: "Minimum items to reach target with choices.",
    interviewTip: "Unbounded knapsack variant. Initialize dp[0]=0, others=infinity. O(amount * coins).",
    relatedProblems: ["coin-change-2", "perfect-squares"]
  },
  "coin-change-2": {
    description: "Count number of ways to make amount.",
    howItWorks: "dp[i] += dp[i-coin] for each coin. Process coins in outer loop to avoid counting order.",
    whenToUse: "Counting combinations (not permutations).",
    interviewTip: "Coin loop outside to count combinations. If amount loop outside, counts permutations.",
    relatedProblems: ["coin-change", "combination-sum-iv"]
  },
  "longest-increasing-subsequence": {
    description: "Length of longest strictly increasing subsequence.",
    howItWorks: "O(n²): dp[i] = max(dp[j]+1) for j<i where nums[j]<nums[i]. O(n log n): binary search.",
    whenToUse: "Subsequence with ordering constraints.",
    interviewTip: "Know both O(n²) DP and O(n log n) binary search solutions.",
    relatedProblems: ["longest-common-subsequence", "russian-doll-envelopes"]
  },
  "longest-common-subsequence": {
    description: "Length of longest common subsequence of two strings.",
    howItWorks: "dp[i][j] = dp[i-1][j-1]+1 if match, else max(dp[i-1][j], dp[i][j-1]).",
    whenToUse: "Comparing two sequences for common elements.",
    interviewTip: "Classic 2D DP. O(mn) time and space. Can optimize to O(min(m,n)) space.",
    relatedProblems: ["longest-increasing-subsequence", "edit-distance"]
  },
  "edit-distance": {
    description: "Minimum operations (insert, delete, replace) to convert word1 to word2.",
    howItWorks: "dp[i][j] = min(insert, delete, replace). If chars match, dp[i-1][j-1].",
    whenToUse: "String transformation with operations.",
    interviewTip: "Classic DP. O(mn) time. Levenshtein distance. Used in spell checkers.",
    relatedProblems: ["longest-common-subsequence", "distinct-subsequences"]
  },
  "perfect-squares": {
    description: "Minimum perfect squares that sum to n.",
    howItWorks: "dp[i] = min(dp[i-j²]+1) for all j where j²<=i.",
    whenToUse: "Minimum items to form target.",
    interviewTip: "Similar to coin change with coins = {1,4,9,16,...}. BFS also works.",
    relatedProblems: ["coin-change", "climbing-stairs"]
  },
  "partition-equal-subset-sum": {
    description: "Check if array can be partitioned into two equal sum subsets.",
    howItWorks: "0/1 knapsack: can we make sum/2? dp[j] = dp[j] || dp[j-num].",
    whenToUse: "Subset sum problems.",
    interviewTip: "Sum must be even. Then 0/1 knapsack for sum/2. O(n * sum) time.",
    relatedProblems: ["coin-change", "target-sum"]
  },
  "target-sum": {
    description: "Count ways to assign +/- to reach target sum.",
    howItWorks: "Transform: P - N = target, P + N = sum. Find subsets summing to (sum+target)/2.",
    whenToUse: "Counting assignments with constraints.",
    interviewTip: "Convert to subset sum problem. O(n * sum) DP.",
    relatedProblems: ["partition-equal-subset-sum", "coin-change-2"]
  },
  "unique-paths-ii": {
    description: "Count paths in grid with obstacles.",
    howItWorks: "dp[i][j] = dp[i-1][j] + dp[i][j-1] if not obstacle, else 0.",
    whenToUse: "Path counting with blocked cells.",
    interviewTip: "Handle obstacles (set to 0). First row/col need special handling for obstacles.",
    relatedProblems: ["minimum-path-sum", "climbing-stairs"]
  },
  "minimum-path-sum": {
    description: "Minimum sum path from top-left to bottom-right.",
    howItWorks: "dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).",
    whenToUse: "Optimal path in grid.",
    interviewTip: "Classic grid DP. O(mn) time, can be O(n) space with single row.",
    relatedProblems: ["unique-paths-ii", "triangle"]
  },
  "triangle": {
    description: "Minimum path sum from top to bottom of triangle.",
    howItWorks: "Bottom-up: dp[j] = triangle[i][j] + min(dp[j], dp[j+1]).",
    whenToUse: "Optimal path in triangular structure.",
    interviewTip: "Bottom-up easier. O(n) space using 1D array. O(n²) time.",
    relatedProblems: ["minimum-path-sum", "climbing-stairs"]
  },
  "decode-ways": {
    description: "Count ways to decode number string to letters (1=A, ..., 26=Z).",
    howItWorks: "dp[i] = dp[i-1] (if valid single) + dp[i-2] (if valid double 10-26).",
    whenToUse: "Counting decodings/interpretations.",
    interviewTip: "Handle '0' carefully - not valid alone. Check two-digit range [10,26].",
    relatedProblems: ["climbing-stairs", "word-break"]
  },
  "word-break": {
    description: "Check if string can be segmented into dictionary words.",
    howItWorks: "dp[i] = true if dp[j] && s[j:i] in dict for some j < i.",
    whenToUse: "String segmentation problems.",
    interviewTip: "O(n² * m) where m is word check time. Use set for O(1) word lookup.",
    relatedProblems: ["decode-ways", "word-break-ii"]
  },
  "132-pattern": {
    description: "Find i<j<k where nums[i]<nums[k]<nums[j] (132 pattern).",
    howItWorks: "Track potential 'k' values with monotonic stack. Process right to left.",
    whenToUse: "Finding specific patterns in arrays.",
    interviewTip: "Stack stores candidates for 'j'. Track largest popped as potential 'k'.",
    relatedProblems: ["increasing-triplet-subsequence", "next-greater-element-i"]
  },
  "burst-balloons": {
    description: "Maximum coins from bursting all balloons.",
    howItWorks: "Interval DP: dp[i][j] = max coins from bursting balloons between i and j.",
    whenToUse: "Interval problems where order matters.",
    interviewTip: "Think of last balloon to burst in range. Add padding 1s at ends. O(n³).",
    relatedProblems: ["matrix-chain-multiplication", "minimum-path-sum"]
  },
  "count-square-submatrices": {
    description: "Count square submatrices with all ones.",
    howItWorks: "dp[i][j] = min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1]) + 1 if cell is 1.",
    whenToUse: "Counting squares in binary matrices.",
    interviewTip: "dp[i][j] = size of largest square ending at (i,j). Sum all dp values.",
    relatedProblems: ["maximal-square", "minimum-path-sum"]
  },
  "distinct-subsequences": {
    description: "Count distinct subsequences of s that equal t.",
    howItWorks: "dp[i][j] = dp[i-1][j] + (dp[i-1][j-1] if s[i]==t[j]).",
    whenToUse: "Counting matching subsequences.",
    interviewTip: "O(mn) DP. dp[i][j] = ways to form t[0..j] from s[0..i].",
    relatedProblems: ["longest-common-subsequence", "edit-distance"]
  },
  "last-stone-weight-ii": {
    description: "Minimize last stone weight after smashing.",
    howItWorks: "Partition into two groups to minimize difference. 0/1 knapsack for sum/2.",
    whenToUse: "Minimizing difference partition problems.",
    interviewTip: "Equivalent to partition-equal-subset-sum. Find closest sum to half.",
    relatedProblems: ["partition-equal-subset-sum", "target-sum"]
  },
  "longest-palindromic-subsequence": {
    description: "Length of longest palindromic subsequence.",
    howItWorks: "dp[i][j] = dp[i+1][j-1]+2 if match, else max(dp[i+1][j], dp[i][j-1]).",
    whenToUse: "Palindrome problems on subsequences.",
    interviewTip: "Same as LCS of string and its reverse. O(n²) time and space.",
    relatedProblems: ["longest-common-subsequence", "valid-palindrome"]
  },
  "maximum-profit-job-scheduling": {
    description: "Maximum profit scheduling non-overlapping jobs.",
    howItWorks: "Sort by end time, binary search for compatible previous job, DP.",
    whenToUse: "Weighted job scheduling.",
    interviewTip: "Sort by end. dp[i] = max(dp[i-1], profit[i] + dp[last_compatible]). Binary search.",
    relatedProblems: ["non-overlapping-intervals", "house-robber"]
  },
  "russian-doll-envelopes": {
    description: "Maximum envelopes that can be nested (2D LIS).",
    howItWorks: "Sort by width asc, height desc. LIS on heights.",
    whenToUse: "2D increasing subsequence.",
    interviewTip: "Sort by width. For same width, larger height first prevents invalid nesting. Then LIS.",
    relatedProblems: ["longest-increasing-subsequence", "box-stacking"]
  },
  "maximum-points-with-cost": {
    description: "Maximum points picking one cell per row with transition cost.",
    howItWorks: "DP with left/right max arrays to handle absolute difference penalty in O(n).",
    whenToUse: "Grid DP with position-dependent costs.",
    interviewTip: "Naive O(mn²) times out. Use left/right prefix max for O(mn).",
    relatedProblems: ["minimum-path-sum", "maximum-subarray"]
  },
  "wildcard-matching": {
    description: "Match pattern with * (any sequence) and ? (any single char).",
    howItWorks: "dp[i][j] = match status. * matches 0 or more: dp[i][j-1] || dp[i-1][j].",
    whenToUse: "Pattern matching with wildcards.",
    interviewTip: "Similar to regex matching. * is greedy. O(mn) DP.",
    relatedProblems: ["regular-expression-matching", "edit-distance"]
  },
  "jump-game-vi": {
    description: "Maximum score reaching end with at most k jumps.",
    howItWorks: "DP with monotonic deque to get max in sliding window of size k.",
    whenToUse: "DP with range queries.",
    interviewTip: "Naive O(nk) times out. Monotonic deque gives O(n).",
    relatedProblems: ["sliding-window-maximum", "jump-game-2"]
  },
  "max-value-of-equation": {
    description: "Maximum yi + yj + |xi - xj| for i < j.",
    howItWorks: "Rewrite as (yi - xi) + (yj + xj). Monotonic deque to track max(yi - xi) in window.",
    whenToUse: "Optimization with algebraic transformation.",
    interviewTip: "Transform equation to separate i and j terms. Sliding window with deque.",
    relatedProblems: ["best-sightseeing-pair", "sliding-window-maximum"]
  },
  "num-splits": {
    description: "Count valid splits where both parts have same distinct characters.",
    howItWorks: "Precompute left/right distinct counts. Count where they're equal.",
    whenToUse: "String split problems with distinct counting.",
    interviewTip: "Two passes: left-to-right and right-to-left for distinct counts.",
    relatedProblems: ["number-of-good-pairs", "contiguous-array"]
  }
};

// Get step explanation with "what" and "why"
export const getStepExplanation = (algorithmId, step, description) => {
  const baseWhat = description || "Processing...";
  
  const whyExplanations = {
    "bubble-sort": "Moving larger elements towards the end of the array",
    "selection-sort": "Finding the minimum element to place in sorted portion",
    "insertion-sort": "Placing element in correct position among sorted elements",
    "majority-element": "Using Boyer-Moore voting to find the majority candidate",
    "move-zeroes": "Maintaining relative order while moving non-zero elements forward",
    "two-sum": "Using hash map for O(1) complement lookup",
    "reverse-linked-list": "Reversing pointers to point to previous node",
    "valid-parentheses": "Matching brackets using LIFO property of stack",
    "binary-search": "Eliminating half the search space each iteration",
    "coin-change": "Building optimal solution from smaller subproblems",
    "number-of-islands": "Marking visited land cells to count connected components",
    "merge-intervals": "Combining overlapping intervals to simplify the list",
    "sliding-window-maximum": "Maintaining decreasing deque for O(1) max lookup",
    "longest-increasing-subsequence": "Building the longest chain of increasing elements",
    "trapping-rain-water": "Calculating water trapped based on surrounding heights"
  };

  const defaultWhy = algorithmInfo[algorithmId]?.howItWorks?.split('.')[0] || 
                     "Building towards the optimal solution step by step";
  const why = whyExplanations[algorithmId] || defaultWhy;

  return { what: baseWhat, why };
};

export default algorithmInfo;
