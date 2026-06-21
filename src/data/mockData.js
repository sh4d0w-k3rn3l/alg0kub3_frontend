// Mock data for DSA Animations

export const categories = [
  "All Categories",
  "Sorting",
  "Array",
  "String",
  "Bit Manipulation",
  "Hash Table",
  "Two Pointers",
  "Prefix Sum",
  "Sliding Window",
  "Kadane's Algorithm",
  "Matrix",
  "Linked List",
  "Stack",
  "Queue",
  "QuickSelect",
  "Heaps",
  "Binary Search",
  "Backtracking",
  "Tree",
  "BST",
  "Tries",
  "Heap",
  "Intervals",
  "Greedy",
  "Graph",
  "Dynamic Programming"
];

export const difficulties = ["All Difficulties", "Easy", "Medium", "Hard"];

export const algorithms = [
  // Sorting
  { id: "bubble-sort", title: "Bubble Sort", description: "Sort an array using the bubble sort algorithm", category: "Sorting", difficulty: "Easy", timeComplexity: "O(n²)", spaceComplexity: "O(1)" },
  { id: "selection-sort", title: "Selection Sort", description: "Sort an array using the selection sort algorithm", category: "Sorting", difficulty: "Easy", timeComplexity: "O(n²)", spaceComplexity: "O(1)" },
  { id: "insertion-sort", title: "Insertion Sort", description: "Sort an array using the insertion sort algorithm", category: "Sorting", difficulty: "Easy", timeComplexity: "O(n²)", spaceComplexity: "O(1)" },
  
  // Array
  { id: "move-zeroes", title: "Move Zeroes", description: "Move all zeroes to end while maintaining relative order", category: "Array", difficulty: "Easy", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "majority-element", title: "Majority Element", description: "Find the majority element in an array", category: "Array", difficulty: "Easy", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "remove-duplicates", title: "Remove Duplicates from Sorted Array", description: "Remove duplicates from a sorted array", category: "Array", difficulty: "Easy", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "best-time-to-buy-and-sell-stock", title: "Best Time to Buy and Sell Stock", description: "Find maximum profit from single buy and sell transaction", category: "Array", difficulty: "Easy", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "rotate-array", title: "Rotate Array", description: "Rotate an array by k steps", category: "Array", difficulty: "Medium", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "product-except-self", title: "Product of Array Except Self", description: "Calculate product of array except self", category: "Array", difficulty: "Medium", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "best-time-to-buy-and-sell-stock-2", title: "Best Time to Buy and Sell Stock II", description: "Find maximum profit from multiple buy and sell transactions", category: "Array", difficulty: "Medium", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "zero-filled-subarrays", title: "Number of Zero-Filled Subarrays", description: "Find number of zero-filled subarrays", category: "Array", difficulty: "Medium", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "increasing-triplet-subsequence", title: "Increasing Triplet Subsequence", description: "Find increasing triplet subsequence", category: "Array", difficulty: "Medium", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "first-missing-positive", title: "First Missing Positive", description: "Find the first missing positive integer in an array", category: "Array", difficulty: "Hard", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  
  // String
  { id: "is-subsequence", title: "Is Subsequence", description: "Check if s is a subsequence of t", category: "String", difficulty: "Easy", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "valid-palindrome", title: "Valid Palindrome", description: "Check if a string is a valid palindrome", category: "String", difficulty: "Easy", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "longest-common-prefix", title: "Longest Common Prefix", description: "Find the longest common prefix in an array of strings", category: "String", difficulty: "Easy", timeComplexity: "O(n×m)", spaceComplexity: "O(1)" },
  { id: "reverse-words", title: "Reverse Words in a String", description: "Reverse the words in a string", category: "String", difficulty: "Medium", timeComplexity: "O(n)", spaceComplexity: "O(n)" },
  
  // Bit Manipulation
  { id: "single-number", title: "Single Number", description: "Find the single number in an array where every other number appears twice", category: "Bit Manipulation", difficulty: "Easy", timeComplexity: "O(n)", spaceComplexity: "O(1)" },
  { id: "counting-bits", title: "Counting Bits", description: "Count the number of 1 bits in the binary representation of a number", category: "Bit Manipulation", difficulty: "Easy", timeComplexity: "O(n)", spaceComplexity: "O(n)" },
  { id: "single-number-iii", title: "Single Number III", description: "Find the two numbers in an array where every other number appears twice", category: "Bit Manipulation", difficulty: "Medium" },
  
  // Hash Table
  { id: "ransom-note", title: "Ransom Note", description: "Check if a ransom note can be constructed from a magazine", category: "Hash Table", difficulty: "Easy" },
  { id: "number-of-good-pairs", title: "Number of Good Pairs", description: "Find the number of good pairs in an array", category: "Hash Table", difficulty: "Easy" },
  { id: "max-number-of-balloons", title: "Maximum Number of Balloons", description: "Find the maximum number of balloons in a string", category: "Hash Table", difficulty: "Easy" },
  { id: "contains-duplicate-ii", title: "Contains Duplicate II", description: "Check if an array contains duplicate elements within k distance", category: "Hash Table", difficulty: "Easy" },
  { id: "isomorphic-strings", title: "Isomorphic Strings", description: "Check if two strings are isomorphic", category: "Hash Table", difficulty: "Easy" },
  { id: "group-anagrams", title: "Group Anagrams", description: "Group anagrams together", category: "Hash Table", difficulty: "Medium" },
  { id: "reorganize-string", title: "Reorganize String", description: "Reorganize a string so that no two adjacent characters are the same", category: "Hash Table", difficulty: "Medium" },
  { id: "longest-consecutive", title: "Longest Consecutive Sequence", description: "Find the longest consecutive sequence in an array", category: "Hash Table", difficulty: "Medium" },
  { id: "num-splits", title: "Number of Good Ways to Split a String", description: "Find the number of good ways to split a string", category: "Hash Table", difficulty: "Medium" },
  
  // Two Pointers
  { id: "merge-sorted-array", title: "Merge Sorted Array", description: "Merge two sorted arrays into a single sorted array", category: "Two Pointers", difficulty: "Easy" },
  { id: "two-sum-ii", title: "Two Sum II - Input Array Is Sorted", description: "Find two numbers that add up to target using two pointers on sorted array", category: "Two Pointers", difficulty: "Medium" },
  { id: "container-with-most-water", title: "Container with Most Water", description: "Find two lines that form a container with maximum water capacity", category: "Two Pointers", difficulty: "Medium" },
  { id: "three-sum", title: "3Sum", description: "Find all unique triplets that sum to zero", category: "Two Pointers", difficulty: "Medium" },
  { id: "trapping-rain-water", title: "Trapping Rain Water", description: "Calculate total water trapped between elevation bars after raining", category: "Two Pointers", difficulty: "Hard" },
  
  // Prefix Sum
  { id: "contiguous-array", title: "Contiguous Array", description: "Find longest subarray with equal number of 0s and 1s using hash map", category: "Prefix Sum", difficulty: "Medium" },
  { id: "continuous-subarray-sum", title: "Continuous Subarray Sum", description: "Check if array has subarray (size >= 2) with sum that is multiple of k", category: "Prefix Sum", difficulty: "Medium" },
  { id: "subarray-sum-equals-k", title: "Subarray Sum Equals K", description: "Find subarrays with sum equal to target using prefix sums", category: "Prefix Sum", difficulty: "Medium" },
  { id: "subarray-sums-divisible-by-k", title: "Subarray Sum Divisible by K", description: "Find subarrays with sum divisible by k using prefix sums", category: "Prefix Sum", difficulty: "Medium" },
  
  // Sliding Window
  { id: "maximum-average-subarray-i", title: "Maximum Average Subarray I", description: "Find maximum average of contiguous subarray of length k using sliding window", category: "Sliding Window", difficulty: "Easy" },
  { id: "permutation-in-string", title: "Permutation in String", description: "Check if s1 is a permutation of s2 using sliding window", category: "Sliding Window", difficulty: "Medium" },
  { id: "find-all-anagrams-in-string", title: "Find All Anagrams in a String", description: "Find all anagrams of s1 in s2 using sliding window", category: "Sliding Window", difficulty: "Medium" },
  { id: "minimum-size-subarray-sum", title: "Minimum Size Subarray Sum", description: "Find minimal length subarray with sum >= target using variable-size sliding window", category: "Sliding Window", difficulty: "Medium" },
  { id: "max-consecutive-ones-iii", title: "Max Consecutive Ones III", description: "Find max consecutive 1s after flipping at most k zeros using sliding window", category: "Sliding Window", difficulty: "Medium" },
  { id: "longest-substring-without-repeating-characters", title: "Longest Substring Without Repeating Characters", description: "Find the length of the longest substring without repeating characters", category: "Sliding Window", difficulty: "Medium" },
  { id: "minimum-window-substring", title: "Minimum Window Substring", description: "Find the minimum window in string that contains all characters of target", category: "Sliding Window", difficulty: "Hard" },
  
  // Kadane's Algorithm
  { id: "maximum-subarray", title: "Maximum Subarray", description: "Find the contiguous subarray with the largest sum (Kadane's Algorithm)", category: "Kadane's Algorithm", difficulty: "Medium" },
  { id: "maximum-product-subarray", title: "Maximum Product Subarray", description: "Find the contiguous subarray with the largest product (Kadane's Algorithm)", category: "Kadane's Algorithm", difficulty: "Medium" },
  { id: "best-sightseeing-pair", title: "Best Sightseeing Pair", description: "Find the best sightseeing pair in an array", category: "Kadane's Algorithm", difficulty: "Medium" },
  
  // Matrix
  { id: "spiral-matrix", title: "Spiral Matrix", description: "Traverse matrix in spiral order from outer to inner layers", category: "Matrix", difficulty: "Medium" },
  { id: "rotate-image", title: "Rotate Image", description: "Rotate n×n matrix 90 degrees clockwise using transpose then reverse", category: "Matrix", difficulty: "Medium" },
  { id: "set-matrix-zeroes", title: "Set Matrix Zeroes", description: "Set entire row and column to zero if element is zero using O(1) space", category: "Matrix", difficulty: "Medium" },
  
  // Linked List
  { id: "middle-of-linked-list", title: "Middle of the Linked List", description: "Find the middle node of a linked list", category: "Linked List", difficulty: "Easy" },
  { id: "remove-nth-from-end", title: "Remove Nth Node From End of List", description: "Remove the nth node from the end of a linked list", category: "Linked List", difficulty: "Medium" },
  { id: "reverse-linked-list", title: "Reverse Linked List", description: "Reverse a singly linked list using three pointers", category: "Linked List", difficulty: "Easy" },
  { id: "reverse-linked-list-ii", title: "Reverse Linked List II", description: "Reverse a sublist from position left to right in one pass", category: "Linked List", difficulty: "Medium" },
  { id: "reverse-nodes-in-k-group", title: "Reverse Nodes in k-Group", description: "Reverse nodes in k-sized groups using iterative in-place reversal", category: "Linked List", difficulty: "Hard" },
  { id: "remove-duplicates-sorted-list-2", title: "Remove Duplicates from Sorted List II", description: "Remove all nodes with duplicate values from a sorted linked list", category: "Linked List", difficulty: "Medium" },
  { id: "merge-two-sorted-lists", title: "Merge Two Sorted Lists", description: "Merge two sorted linked lists into a single sorted linked list", category: "Linked List", difficulty: "Medium" },
  { id: "linked-list-cycle-2", title: "Linked List Cycle II", description: "Detect cycle and find entry point using Floyd's algorithm", category: "Linked List", difficulty: "Medium" },
  { id: "swap-nodes-in-pairs", title: "Swap Nodes in Pairs", description: "Swap every two adjacent nodes in a linked list", category: "Linked List", difficulty: "Medium" },
  { id: "partition-list", title: "Partition List", description: "Partition a linked list around a value x", category: "Linked List", difficulty: "Medium" },
  { id: "rotate-list", title: "Rotate List", description: "Rotate a linked list to the right by k places", category: "Linked List", difficulty: "Medium" },
  { id: "add-two-numbers", title: "Add Two Numbers", description: "Add two numbers represented by linked lists", category: "Linked List", difficulty: "Medium" },
  { id: "copy-list-with-random-pointer", title: "Copy List with Random Pointer", description: "Deep copy a linked list with random pointers using three-pass interleaving", category: "Linked List", difficulty: "Medium" },
  { id: "flatten-multilevel-doubly-linked-list", title: "Flatten a Multilevel Doubly Linked List", description: "Flatten a multilevel doubly linked list by inserting child lists inline", category: "Linked List", difficulty: "Medium" },
  { id: "intersection-of-two-linked-lists", title: "Intersection of Two Linked Lists", description: "Find the node where two linked lists intersect using two pointers", category: "Linked List", difficulty: "Easy" },
  
  // Stack
  { id: "valid-parentheses", title: "Valid Parentheses", description: "Determine if a string of brackets is properly balanced using a stack", category: "Stack", difficulty: "Easy" },
  { id: "remove-all-adjacent-duplicates-in-string", title: "Remove All Adjacent Duplicates In String", description: "Remove all adjacent duplicates in a string using a stack", category: "Stack", difficulty: "Easy" },
  { id: "remove-duplicate-letters", title: "Remove Duplicate Letters", description: "Remove duplicate letters from a string to form the lexicographically smallest string", category: "Stack", difficulty: "Medium" },
  { id: "removing-stars-from-a-string", title: "Removing Stars From a String", description: "Remove stars from a string", category: "Stack", difficulty: "Medium" },
  { id: "evaluate-reverse-polish-notation", title: "Evaluate Reverse Polish Notation", description: "Evaluate a reverse polish notation expression using a stack", category: "Stack", difficulty: "Medium" },
  { id: "basic-calculator-ii", title: "Basic Calculator II", description: "Evaluate a basic calculator expression using a stack", category: "Stack", difficulty: "Medium" },
  { id: "longest-valid-parentheses", title: "Longest Valid Parentheses", description: "Find the longest valid parentheses substring using a stack", category: "Stack", difficulty: "Hard" },
  { id: "next-greater-element-i", title: "Next Greater Element I", description: "Find the next greater element for each element in nums1 using a stack", category: "Stack", difficulty: "Easy" },
  { id: "daily-temperatures", title: "Daily Temperatures", description: "Find how many days until a warmer temperature using monotonic stack", category: "Stack", difficulty: "Medium" },
  { id: "132-pattern", title: "132 Pattern", description: "Find the 132 pattern in an array using a stack", category: "Stack", difficulty: "Medium" },
  { id: "number-of-visible-people-in-a-queue", title: "Number of Visible People in a Queue", description: "Find the number of visible people in a queue using a stack", category: "Stack", difficulty: "Hard" },
  { id: "largest-rectangle-histogram", title: "Largest Rectangle in Histogram", description: "Find the largest rectangle area in a histogram using a monotonic stack", category: "Stack", difficulty: "Hard" },
  
  // Queue
  { id: "reveal-cards-in-increasing-order", title: "Reveal Cards In Increasing Order", description: "Arrange deck so cards are revealed in increasing order using queue simulation", category: "Queue", difficulty: "Medium" },
  { id: "jump-game-vi", title: "Jump Game VI", description: "Find the maximum score of a jump game using a queue", category: "Queue", difficulty: "Medium" },
  { id: "sliding-window-maximum", title: "Sliding Window Maximum", description: "Find maximum in each sliding window using monotonic deque", category: "Queue", difficulty: "Hard" },
  { id: "max-value-of-equation", title: "Max Value of Equation", description: "Find the maximum value of equation using a queue", category: "Queue", difficulty: "Hard" },
  
  // QuickSelect
  { id: "sort-colors", title: "Sort Colors", description: "Sort an array of 0s, 1s, and 2s using the quickselect algorithm", category: "QuickSelect", difficulty: "Medium" },
  
  // Heaps
  { id: "kth-largest-element", title: "Kth Largest Element in an Array", description: "Find the kth largest element in an array using a min-heap", category: "Heaps", difficulty: "Medium" },
  
  // Binary Search
  { id: "search-insert-position", title: "Search Insert Position", description: "Find the insertion position of a target in a sorted array using binary search", category: "Binary Search", difficulty: "Easy" },
  { id: "search-rotated-array", title: "Search in Rotated Sorted Array", description: "Find target in rotated sorted array using modified binary search", category: "Binary Search", difficulty: "Medium" },
  { id: "find-peak-element", title: "Find Peak Element", description: "Find the peak element in a sorted array using binary search", category: "Binary Search", difficulty: "Medium" },
  { id: "find-minimum-rotated", title: "Find Minimum in Rotated Sorted Array", description: "Find the minimum element in a rotated sorted array using binary search", category: "Binary Search", difficulty: "Medium" },
  { id: "search-in-2d-matrix", title: "Search in 2D Matrix", description: "Find target in sorted 2D matrix using binary search", category: "Binary Search", difficulty: "Medium" },
  
  // Backtracking
  { id: "subsets", title: "Subsets", description: "Generate all subsets using recursive backtracking with decision tree", category: "Backtracking", difficulty: "Medium" },
  { id: "permutations", title: "Permutations", description: "Generate all permutations by choosing unused elements recursively", category: "Backtracking", difficulty: "Medium" },
  
  // Tree
  { id: "binary-tree-level-order", title: "Binary Tree Level Order Traversal", description: "Traverse tree level by level using BFS and queue", category: "Tree", difficulty: "Medium" },
  { id: "binary-tree-right-side-view", title: "Binary Tree Right Side View", description: "Traverse tree right side view using BFS and queue", category: "Tree", difficulty: "Medium" },
  { id: "binary-tree-zigzag", title: "Binary Tree Zigzag Level Order Traversal", description: "Traverse tree level by level in zigzag pattern using BFS and queue", category: "Tree", difficulty: "Medium" },
  { id: "populating-next-right-pointers", title: "Populating Next Right Pointers in Each Node II", description: "Connect nodes at same level using BFS with queue", category: "Tree", difficulty: "Medium" },
  { id: "binary-tree-preorder", title: "Binary Tree Preorder Traversal", description: "Traverse tree preorder using DFS and stack", category: "Tree", difficulty: "Easy" },
  { id: "same-tree", title: "Same Tree", description: "Check if two binary trees are identical", category: "Tree", difficulty: "Easy" },
  { id: "symmetric-tree", title: "Symmetric Tree", description: "Check if a binary tree is symmetric", category: "Tree", difficulty: "Easy" },
  { id: "binary-tree-paths", title: "Binary Tree Paths", description: "Find all root-to-leaf paths in a binary tree", category: "Tree", difficulty: "Easy" },
  { id: "sorted-array-to-bst", title: "Convert Sorted Array to Binary Search Tree", description: "Convert a sorted array to a binary search tree", category: "Tree", difficulty: "Easy" },
  { id: "max-ancestor-diff", title: "Maximum Difference Between Node and Ancestor", description: "Find the maximum difference between a node and its ancestor in a binary tree", category: "Tree", difficulty: "Medium" },
  { id: "path-sum-iii", title: "Path Sum III", description: "Count downward paths that sum to target using prefix sums and DFS", category: "Tree", difficulty: "Medium" },
  { id: "binary-tree-inorder", title: "Binary Tree Inorder Traversal", description: "Traverse tree inorder using DFS and stack", category: "Tree", difficulty: "Easy" },
  { id: "min-distance-bst", title: "Minimum Distance Between BST Nodes", description: "Find the minimum distance between any two nodes in a BST", category: "Tree", difficulty: "Easy" },
  { id: "validate-bst", title: "Validate Binary Search Tree", description: "Check if a binary tree satisfies BST properties using recursive DFS", category: "Tree", difficulty: "Medium" },
  { id: "kth-smallest-bst", title: "Kth Smallest Element in a BST", description: "Find the kth smallest element in a BST using iterative inorder traversal", category: "Tree", difficulty: "Medium" },
  { id: "binary-tree-postorder", title: "Binary Tree Postorder Traversal", description: "Traverse tree postorder using DFS and stack", category: "Tree", difficulty: "Easy" },
  { id: "invert-binary-tree", title: "Invert Binary Tree", description: "Invert a binary tree using DFS and stack", category: "Tree", difficulty: "Easy" },
  { id: "diameter-binary-tree", title: "Diameter of Binary Tree", description: "Find the diameter of a binary tree using recursion", category: "Tree", difficulty: "Medium" },
  { id: "lowest-common-ancestor", title: "Lowest Common Ancestor of a Binary Tree", description: "Find the lowest common ancestor of two nodes in a binary tree using recursion", category: "Tree", difficulty: "Medium" },
  { id: "find-duplicate-subtrees", title: "Find Duplicate Subtrees", description: "Find duplicate subtrees in a binary tree using serialization", category: "Tree", difficulty: "Medium" },
  { id: "flatten-binary-tree-to-linked-list", title: "Flatten Binary Tree to Linked List", description: "Flatten tree to right-skewed linked list in-place using Morris Traversal", category: "Tree", difficulty: "Medium" },
  { id: "distribute-coins", title: "Distribute Coins in Binary Tree", description: "Distribute coins to each node in a binary tree so that every node has exactly one coin", category: "Tree", difficulty: "Medium" },
  { id: "house-robber-iii", title: "House Robber III", description: "Find maximum amount of money the thief can rob from a binary tree", category: "Tree", difficulty: "Medium" },
  { id: "binary-tree-maximum-path-sum", title: "Binary Tree Maximum Path Sum", description: "Find maximum path sum in tree where path can start and end at any node", category: "Tree", difficulty: "Hard" },
  { id: "binary-tree-cameras", title: "Binary Tree Cameras", description: "Find minimum number of cameras to cover all nodes in a binary tree", category: "Tree", difficulty: "Hard" },
  
  // BST
  { id: "trim-bst", title: "Trim Binary Search Tree", description: "Trim BST to range [low, high] using recursive pruning and restructuring", category: "BST", difficulty: "Medium" },
  
  // Tries
  { id: "search-suggestions-system", title: "Search Suggestions System", description: "Generate product suggestions for each prefix using binary search", category: "Tries", difficulty: "Medium" },
  { id: "word-search-ii", title: "Word Search II", description: "Find all words from dictionary in board using Trie and DFS backtracking", category: "Tries", difficulty: "Hard" },
  
  // Heap
  { id: "sort-characters-by-frequency", title: "Sort Characters By Frequency", description: "Sort characters by frequency using min-heap", category: "Heap", difficulty: "Medium" },
  { id: "furthest-building", title: "Furthest Building You Can Reach", description: "Find furthest building reachable with bricks and ladders using min-heap", category: "Heap", difficulty: "Medium" },
  { id: "top-k-frequent", title: "Top K Frequent Elements", description: "Find top k frequent elements using min-heap", category: "Heap", difficulty: "Medium" },
  { id: "find-median-data-stream", title: "Find Median from Data Stream", description: "Find median from data stream using two heaps", category: "Heap", difficulty: "Hard" },
  { id: "ipo", title: "IPO", description: "Maximize capital by selecting k most profitable projects using max-heap", category: "Heap", difficulty: "Hard" },
  { id: "k-closest-points", title: "K Closest Points to Origin", description: "Find k closest points to origin using max-heap to track distances", category: "Heap", difficulty: "Medium" },
  { id: "k-smallest-pairs", title: "Find K Pairs with Smallest Sums", description: "Find k pairs with smallest sums using min-heap", category: "Heap", difficulty: "Medium" },
  { id: "merge-k-sorted-lists", title: "Merge k Sorted Lists", description: "Merge k sorted lists using min-heap", category: "Heap", difficulty: "Hard" },
  
  // Intervals
  { id: "merge-intervals", title: "Merge Intervals", description: "Merge all overlapping intervals on a timeline", category: "Intervals", difficulty: "Medium" },
  { id: "insert-interval", title: "Insert Interval", description: "Insert a new interval into a list of intervals", category: "Intervals", difficulty: "Medium" },
  { id: "minimum-arrows-to-burst-balloons", title: "Minimum Number of Arrows to Burst Balloons", description: "Find minimum arrows needed to burst all balloons using greedy algorithm", category: "Intervals", difficulty: "Medium" },
  { id: "non-overlapping-intervals", title: "Non-overlapping Intervals", description: "Find maximum number of non-overlapping intervals using greedy algorithm", category: "Intervals", difficulty: "Medium" },
  { id: "kth-smallest-in-sorted-matrix", title: "Kth Smallest Element in Sorted Matrix", description: "Find kth smallest element using binary search on value range", category: "Intervals", difficulty: "Medium" },
  
  // Greedy
  { id: "jump-game-2", title: "Jump Game II", description: "Find minimum jumps to reach the end using greedy BFS approach", category: "Greedy", difficulty: "Medium" },
  { id: "gas-station", title: "Gas Station", description: "Find starting gas station to complete circular route using greedy algorithm", category: "Greedy", difficulty: "Medium" },
  
  // Graph
  { id: "depth-first-search", title: "Depth First Search", description: "Traverse a graph using Depth First Search", category: "Graph", difficulty: "Medium" },
  { id: "number-of-islands", title: "Number of Islands", description: "Count separate islands in a 2D grid using BFS flood-fill", category: "Graph", difficulty: "Medium" },
  { id: "time-needed-to-inform", title: "Time Needed to Inform All Employees", description: "Find the time needed to inform all employees using DFS with memoization", category: "Graph", difficulty: "Medium" },
  { id: "employee-importance", title: "Employee Importance", description: "Find the importance of an employee using DFS with memoization", category: "Graph", difficulty: "Medium" },
  { id: "clone-graph", title: "Clone Graph", description: "Clone a graph using DFS", category: "Graph", difficulty: "Medium" },
  { id: "is-bipartite", title: "Is Graph Bipartite?", description: "Check if a graph is bipartite using DFS with coloring", category: "Graph", difficulty: "Medium" },
  { id: "all-nodes-distance-k-in-binary-tree", title: "All Nodes Distance K in Binary Tree", description: "Find all nodes exactly K edges away from target using BFS with parent links", category: "Graph", difficulty: "Medium" },
  { id: "rotting-oranges", title: "Rotting Oranges", description: "Find minimum time for all oranges to rot using multi-source BFS", category: "Graph", difficulty: "Medium" },
  { id: "word-ladder", title: "Word Ladder", description: "Find shortest word transformation sequence using BFS", category: "Graph", difficulty: "Hard" },
  { id: "course-schedule-ii", title: "Course Schedule II", description: "Find valid course order using DFS topological sort on prerequisite graph", category: "Graph", difficulty: "Medium" },
  { id: "find-eventual-safe-states", title: "Find Eventual Safe States", description: "Find eventual safe states in a graph using DFS", category: "Graph", difficulty: "Medium" },
  { id: "minimum-height-trees", title: "Minimum Height Trees", description: "Find minimum height trees in a graph using BFS", category: "Graph", difficulty: "Medium" },
  { id: "number-of-provinces", title: "Number of Provinces", description: "Count connected components in adjacency matrix using DFS", category: "Graph", difficulty: "Medium" },
  { id: "redundant-connection", title: "Redundant Connection", description: "Find redundant connection in a graph using Union-Find", category: "Graph", difficulty: "Medium" },
  { id: "minimize-malware-spread", title: "Minimize Malware Spread", description: "Find redundant connection in a graph using Union-Find", category: "Graph", difficulty: "Hard" },
  { id: "min-cost-connect-points", title: "Min Cost to Connect All Points", description: "Find minimum cost to connect all points using Kruskal's algorithm", category: "Graph", difficulty: "Medium" },
  
  // Dynamic Programming
  { id: "longest-increasing-subsequence", title: "Longest Increasing Subsequence", description: "Find the length of the longest increasing subsequence", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "minimum-path-sum", title: "Minimum Path Sum", description: "Find the minimum path sum from top-left to bottom-right in a grid", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "russian-doll-envelopes", title: "Russian Doll Envelopes", description: "Find max envelopes that can be Russian dolled using Sort + LIS", category: "Dynamic Programming", difficulty: "Hard" },
  { id: "climbing-stairs", title: "Climbing Stairs", description: "Find the number of ways to climb to the top of the stairs", category: "Dynamic Programming", difficulty: "Easy" },
  { id: "min-cost-climbing-stairs", title: "Min Cost Climbing Stairs", description: "Find the minimum cost to climb to the top of the stairs", category: "Dynamic Programming", difficulty: "Easy" },
  { id: "house-robber", title: "House Robber", description: "Find maximum money to rob from houses using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "house-robber-ii", title: "House Robber II", description: "Find maximum money to rob from houses in a circle using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "unique-paths-ii", title: "Unique Paths II", description: "Find number of unique paths to reach the bottom-right corner of a grid with obstacles using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "count-square-submatrices", title: "Count Square Submatrices with All Ones", description: "Find number of square submatrices with all ones using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "maximum-points-with-cost", title: "Maximum Number of Points with Cost", description: "Find maximum number of points with cost using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "burst-balloons", title: "Burst Balloons", description: "Find maximum number of points with cost using dynamic programming", category: "Dynamic Programming", difficulty: "Hard" },
  { id: "maximum-profit-job-scheduling", title: "Maximum Profit in Job Scheduling", description: "Find maximum profit in job scheduling using dynamic programming", category: "Dynamic Programming", difficulty: "Hard" },
  { id: "longest-common-subsequence", title: "Longest Common Subsequence", description: "Find length of longest subsequence common to both strings using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "edit-distance", title: "Edit Distance", description: "Find minimum number of operations to convert one string to another using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "longest-palindromic-subsequence", title: "Longest Palindromic Subsequence", description: "Find length of longest palindromic subsequence using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "decode-ways", title: "Decode Ways", description: "Find number of ways to decode a string using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "wildcard-matching", title: "Wildcard Matching", description: "Check if one string matches the pattern using dynamic programming", category: "Dynamic Programming", difficulty: "Hard" },
  { id: "distinct-subsequences", title: "Distinct Subsequences", description: "Count number of ways to get t from s using dynamic programming", category: "Dynamic Programming", difficulty: "Hard" },
  { id: "coin-change", title: "Coin Change", description: "Find minimum number of coins to make amount using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "coin-change-2", title: "Coin Change II", description: "Count number of ways to make amount using coins with dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "perfect-squares", title: "Perfect Squares", description: "Find minimum number of perfect squares that sum to n using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "partition-equal-subset-sum", title: "Partition Equal Subset Sum", description: "Check if the array can be partitioned into two subsets with equal sum using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "target-sum", title: "Target Sum", description: "Find number of ways to target sum using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "last-stone-weight-ii", title: "Last Stone Weight II", description: "Find the minimum weight of the last stone using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
  { id: "triangle", title: "Triangle", description: "Find minimum path sum in a triangle using dynamic programming", category: "Dynamic Programming", difficulty: "Medium" },
];

// Algorithm code snippets
export const algorithmCode = {
  "bubble-sort": {
    java: `public void bubbleSort(int[] arr) {
    int n = arr.length;

    for (int i = 0; i < n - 1; i++) {
        boolean swapped = false;

        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }

        // Early exit if no swaps
        if (!swapped) {
            break;
        }
    }
}`,
    python: `def bubble_sort(arr):
    n = len(arr)
    
    for i in range(n - 1):
        swapped = False
        
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                # Swap elements
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # Early exit if no swaps
        if not swapped:
            break`,
    javascript: `function bubbleSort(arr) {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let swapped = false;

        for (let j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap elements
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }

        // Early exit if no swaps
        if (!swapped) {
            break;
        }
    }
}`
  },
  "selection-sort": {
    java: `public void selectionSort(int[] arr) {
    int n = arr.length;

    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;

        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }

        // Swap minimum with current position
        if (minIdx != i) {
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
}`,
    python: `def selection_sort(arr):
    n = len(arr)
    
    for i in range(n - 1):
        min_idx = i
        
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        
        # Swap minimum with current position
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
    javascript: `function selectionSort(arr) {
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;

        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }

        // Swap minimum with current position
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
}`
  },
  "insertion-sort": {
    java: `public void insertionSort(int[] arr) {
    int n = arr.length;

    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;

        // Move elements greater than key
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = key;
    }
}`,
    python: `def insertion_sort(arr):
    n = len(arr)
    
    for i in range(1, n):
        key = arr[i]
        j = i - 1
        
        # Move elements greater than key
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        
        arr[j + 1] = key`,
    javascript: `function insertionSort(arr) {
    const n = arr.length;

    for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;

        // Move elements greater than key
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = key;
    }
}`
  }
};

// Default code for algorithms without specific implementation
export const getDefaultCode = (algorithmId, title) => ({
  java: `// ${title}\npublic void solve() {\n    // Implementation\n}`,
  python: `# ${title}\ndef solve():\n    # Implementation\n    pass`,
  javascript: `// ${title}\nfunction solve() {\n    // Implementation\n}`
});

// Input presets for animations
export const inputPresets = {
  "bubble-sort": {
    "Array 1": [64, 34, 25, 12, 22, 11, 90],
    "Array 2": [5, 1, 4, 2, 8, 3],
    "Reverse Sorted": [9, 8, 7, 6, 5, 4, 3, 2, 1],
    "Already Sorted": [1, 2, 3, 4, 5, 6, 7],
    "All Equal": [5, 5, 5, 5, 5]
  },
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
  }
};

// Get default presets for any algorithm
export const getDefaultPresets = () => ({
  "Array 1": [64, 34, 25, 12, 22, 11, 90],
  "Array 2": [5, 1, 4, 2, 8, 3],
  "Reverse Sorted": [9, 8, 7, 6, 5, 4, 3, 2, 1],
  "Already Sorted": [1, 2, 3, 4, 5, 6, 7],
  "All Equal": [5, 5, 5, 5, 5]
});