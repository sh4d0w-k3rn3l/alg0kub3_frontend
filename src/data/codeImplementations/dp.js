// Dynamic Programming Algorithms Code

export const dpCode = {
  "climbing-stairs": {
    java: `public int climbStairs(int n) {
    if (n <= 2) return n;
    int prev1 = 2, prev2 = 1;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    python: `def climb_stairs(n):
    if n <= 2:
        return n
    prev1, prev2 = 2, 1
    for i in range(3, n + 1):
        curr = prev1 + prev2
        prev2 = prev1
        prev1 = curr
    return prev1`,
    javascript: `function climbStairs(n) {
    if (n <= 2) return n;
    let prev1 = 2, prev2 = 1;
    for (let i = 3; i <= n; i++) {
        const curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    typescript: `function climbStairs(n: number): number {
    if (n <= 2) return n;
    let prev1: number = 2, prev2: number = 1;
    for (let i = 3; i <= n; i++) {
        const curr: number = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    csharp: `public int ClimbStairs(int n) {
    if (n <= 2) return n;
    int prev1 = 2, prev2 = 1;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    cpp: `int climbStairs(int n) {
    if (n <= 2) return n;
    int prev1 = 2, prev2 = 1;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    go: `func climbStairs(n int) int {
    if n <= 2 {
        return n
    }
    prev1, prev2 := 2, 1
    for i := 3; i <= n; i++ {
        curr := prev1 + prev2
        prev2 = prev1
        prev1 = curr
    }
    return prev1
}`
  },
  "house-robber": {
    java: `public int rob(int[] nums) {
    if (nums.length == 1) return nums[0];
    int prev1 = Math.max(nums[0], nums[1]);
    int prev2 = nums[0];
    for (int i = 2; i < nums.length; i++) {
        int curr = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    python: `def rob(nums):
    if len(nums) == 1:
        return nums[0]
    prev1 = max(nums[0], nums[1])
    prev2 = nums[0]
    for i in range(2, len(nums)):
        curr = max(prev1, prev2 + nums[i])
        prev2 = prev1
        prev1 = curr
    return prev1`,
    javascript: `function rob(nums) {
    if (nums.length === 1) return nums[0];
    let prev1 = Math.max(nums[0], nums[1]);
    let prev2 = nums[0];
    for (let i = 2; i < nums.length; i++) {
        const curr = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    typescript: `function rob(nums: number[]): number {
    if (nums.length === 1) return nums[0];
    let prev1: number = Math.max(nums[0], nums[1]);
    let prev2: number = nums[0];
    for (let i = 2; i < nums.length; i++) {
        const curr: number = Math.max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    csharp: `public int Rob(int[] nums) {
    if (nums.Length == 1) return nums[0];
    int prev1 = Math.Max(nums[0], nums[1]);
    int prev2 = nums[0];
    for (int i = 2; i < nums.Length; i++) {
        int curr = Math.Max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    cpp: `int rob(vector<int>& nums) {
    if (nums.size() == 1) return nums[0];
    int prev1 = max(nums[0], nums[1]);
    int prev2 = nums[0];
    for (int i = 2; i < nums.size(); i++) {
        int curr = max(prev1, prev2 + nums[i]);
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    go: `func rob(nums []int) int {
    if len(nums) == 1 {
        return nums[0]
    }
    prev1 := max(nums[0], nums[1])
    prev2 := nums[0]
    for i := 2; i < len(nums); i++ {
        curr := max(prev1, prev2+nums[i])
        prev2 = prev1
        prev1 = curr
    }
    return prev1
}`
  },
  "coin-change": {
    java: `public int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    python: `def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
    javascript: `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    typescript: `function coinChange(coins: number[], amount: number): number {
    const dp: number[] = new Array(amount + 1).fill(Infinity);
    dp[0] = 0;
    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] === Infinity ? -1 : dp[amount];
}`,
    csharp: `public int CoinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    Array.Fill(dp, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        foreach (int coin in coins) {
            if (coin <= i) {
                dp[i] = Math.Min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    go: `func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := range dp {
        dp[i] = amount + 1
    }
    dp[0] = 0
    for i := 1; i <= amount; i++ {
        for _, coin := range coins {
            if coin <= i && dp[i-coin]+1 < dp[i] {
                dp[i] = dp[i-coin] + 1
            }
        }
    }
    if dp[amount] > amount {
        return -1
    }
    return dp[amount]
}`
  },
  "longest-increasing-subsequence": {
    java: `public int lengthOfLIS(int[] nums) {
    int[] dp = new int[nums.length];
    Arrays.fill(dp, 1);
    int maxLen = 1;
    for (int i = 1; i < nums.length; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}`,
    python: `def length_of_lis(nums):
    dp = [1] * len(nums)
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[i] > nums[j]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
    javascript: `function lengthOfLIS(nums) {
    const dp = new Array(nums.length).fill(1);
    let maxLen = 1;
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}`,
    typescript: `function lengthOfLIS(nums: number[]): number {
    const dp: number[] = new Array(nums.length).fill(1);
    let maxLen: number = 1;
    for (let i = 1; i < nums.length; i++) {
        for (let j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.max(maxLen, dp[i]);
    }
    return maxLen;
}`,
    csharp: `public int LengthOfLIS(int[] nums) {
    int[] dp = new int[nums.Length];
    Array.Fill(dp, 1);
    int maxLen = 1;
    for (int i = 1; i < nums.Length; i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = Math.Max(dp[i], dp[j] + 1);
            }
        }
        maxLen = Math.Max(maxLen, dp[i]);
    }
    return maxLen;
}`,
    cpp: `int lengthOfLIS(vector<int>& nums) {
    vector<int> dp(nums.size(), 1);
    int maxLen = 1;
    for (int i = 1; i < nums.size(); i++) {
        for (int j = 0; j < i; j++) {
            if (nums[i] > nums[j]) {
                dp[i] = max(dp[i], dp[j] + 1);
            }
        }
        maxLen = max(maxLen, dp[i]);
    }
    return maxLen;
}`,
    go: `func lengthOfLIS(nums []int) int {
    dp := make([]int, len(nums))
    for i := range dp {
        dp[i] = 1
    }
    maxLen := 1
    for i := 1; i < len(nums); i++ {
        for j := 0; j < i; j++ {
            if nums[i] > nums[j] && dp[j]+1 > dp[i] {
                dp[i] = dp[j] + 1
            }
        }
        if dp[i] > maxLen {
            maxLen = dp[i]
        }
    }
    return maxLen
}`
  },
  "maximum-subarray": {
    java: `public int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
    python: `def max_sub_array(nums):
    max_sum = current_sum = nums[0]
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    return max_sum`,
    javascript: `function maxSubArray(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
    typescript: `function maxSubArray(nums: number[]): number {
    let maxSum: number = nums[0];
    let currentSum: number = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
    csharp: `public int MaxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    for (int i = 1; i < nums.Length; i++) {
        currentSum = Math.Max(nums[i], currentSum + nums[i]);
        maxSum = Math.Max(maxSum, currentSum);
    }
    return maxSum;
}`,
    cpp: `int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        currentSum = max(nums[i], currentSum + nums[i]);
        maxSum = max(maxSum, currentSum);
    }
    return maxSum;
}`,
    go: `func maxSubArray(nums []int) int {
    maxSum, currentSum := nums[0], nums[0]
    for i := 1; i < len(nums); i++ {
        if nums[i] > currentSum+nums[i] {
            currentSum = nums[i]
        } else {
            currentSum += nums[i]
        }
        if currentSum > maxSum {
            maxSum = currentSum
        }
    }
    return maxSum
}`
  },
  "unique-paths": {
    java: `public int uniquePaths(int m, int n) {
    int[] dp = new int[n];
    Arrays.fill(dp, 1);
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}`,
    python: `def unique_paths(m, n):
    dp = [1] * n
    for i in range(1, m):
        for j in range(1, n):
            dp[j] += dp[j - 1]
    return dp[n - 1]`,
    javascript: `function uniquePaths(m, n) {
    const dp = new Array(n).fill(1);
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}`,
    typescript: `function uniquePaths(m: number, n: number): number {
    const dp: number[] = new Array(n).fill(1);
    for (let i = 1; i < m; i++) {
        for (let j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}`,
    csharp: `public int UniquePaths(int m, int n) {
    int[] dp = new int[n];
    Array.Fill(dp, 1);
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}`,
    cpp: `int uniquePaths(int m, int n) {
    vector<int> dp(n, 1);
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            dp[j] += dp[j - 1];
        }
    }
    return dp[n - 1];
}`,
    go: `func uniquePaths(m int, n int) int {
    dp := make([]int, n)
    for i := range dp {
        dp[i] = 1
    }
    for i := 1; i < m; i++ {
        for j := 1; j < n; j++ {
            dp[j] += dp[j-1]
        }
    }
    return dp[n-1]
}`
  }
};
