// Master index file that combines all algorithm implementations

import { sortingCode } from './sorting';
import { arrayCode } from './array';
import { stringCode } from './string';
import { bitManipulationCode } from './bitManipulation';
import { hashTableCode } from './hashTable';
import { twoPointersCode } from './twoPointers';
import { prefixSumCode } from './prefixSum';
import { slidingWindowCode } from './slidingWindow';
import { kadaneCode } from './kadane';
import { matrixCode } from './matrix';
import { linkedListCode } from './linkedList';
import { stackCode } from './stack';
import { queueCode } from './queue';
import { binarySearchCode } from './binarySearch';
import { dpCode } from './dp';
import { treeCode, graphCode } from './treeGraph';
import { backtrackingCode } from './backtracking';
import { heapCode } from './heap';
import { intervalsCode } from './intervals';
import { greedyCode } from './greedy';
import { triesCode } from './tries';
import { bstCode } from './bst';
import { quickSelectCode } from './quickSelect';
import { additionalTreeCode } from './additionalTree';
import { additionalGraphCode } from './additionalGraph';
import { additionalDpCode } from './additionalDp';

// Merge all code implementations
export const algorithmCode = {
  ...sortingCode,
  ...arrayCode,
  ...stringCode,
  ...bitManipulationCode,
  ...hashTableCode,
  ...twoPointersCode,
  ...prefixSumCode,
  ...slidingWindowCode,
  ...kadaneCode,
  ...matrixCode,
  ...linkedListCode,
  ...stackCode,
  ...queueCode,
  ...binarySearchCode,
  ...dpCode,
  ...treeCode,
  ...graphCode,
  ...backtrackingCode,
  ...heapCode,
  ...intervalsCode,
  ...greedyCode,
  ...triesCode,
  ...bstCode,
  ...quickSelectCode,
  ...additionalTreeCode,
  ...additionalGraphCode,
  ...additionalDpCode
};

// Generate default code for algorithms without specific implementation
export const getDefaultCode = (algorithmId, title) => {
  const templateCode = {
    java: `// ${title}
// Time Complexity: O(n)
// Space Complexity: O(1)

public class Solution {
    public void solve(int[] nums) {
        int n = nums.length;
        for (int i = 0; i < n; i++) {
            // Algorithm logic here
        }
    }
}`,
    python: `# ${title}
# Time Complexity: O(n)
# Space Complexity: O(1)

def solve(nums):
    n = len(nums)
    for i in range(n):
        pass  # Algorithm logic here
    return None`,
    javascript: `// ${title}
// Time Complexity: O(n)
// Space Complexity: O(1)

function solve(nums) {
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        // Algorithm logic here
    }
    return null;
}`,
    typescript: `// ${title}
// Time Complexity: O(n)
// Space Complexity: O(1)

function solve(nums: number[]): number | null {
    const n: number = nums.length;
    for (let i = 0; i < n; i++) {
        // Algorithm logic here
    }
    return null;
}`,
    csharp: `// ${title}
// Time Complexity: O(n)
// Space Complexity: O(1)

public class Solution {
    public void Solve(int[] nums) {
        int n = nums.Length;
        for (int i = 0; i < n; i++) {
            // Algorithm logic here
        }
    }
}`,
    cpp: `// ${title}
// Time Complexity: O(n)
// Space Complexity: O(1)

#include <vector>
using namespace std;

class Solution {
public:
    void solve(vector<int>& nums) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            // Algorithm logic here
        }
    }
};`,
    go: `// ${title}
// Time Complexity: O(n)
// Space Complexity: O(1)

package main

func solve(nums []int) {
    n := len(nums)
    for i := 0; i < n; i++ {
        // Algorithm logic here
    }
}`
  };
  return templateCode;
};

// Get code for any algorithm
export const getAlgorithmCode = (algorithmId, title) => {
  return algorithmCode[algorithmId] || getDefaultCode(algorithmId, title);
};

export default algorithmCode;
