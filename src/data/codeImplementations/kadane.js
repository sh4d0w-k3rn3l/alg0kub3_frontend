// Kadane's Algorithm Code

export const kadaneCode = {
  "maximum-subarray": {
    java: `public int maxSubArray(int[] nums) {
    int maxSum = nums[0], currentSum = nums[0];
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
    let maxSum = nums[0], currentSum = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
    typescript: `function maxSubArray(nums: number[]): number {
    let maxSum: number = nums[0], currentSum: number = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
    csharp: `public int MaxSubArray(int[] nums) {
    int maxSum = nums[0], currentSum = nums[0];
    for (int i = 1; i < nums.Length; i++) {
        currentSum = Math.Max(nums[i], currentSum + nums[i]);
        maxSum = Math.Max(maxSum, currentSum);
    }
    return maxSum;
}`,
    cpp: `int maxSubArray(vector<int>& nums) {
    int maxSum = nums[0], currentSum = nums[0];
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
        if currentSum > maxSum { maxSum = currentSum }
    }
    return maxSum
}`
  },
  "maximum-product-subarray": {
    java: `public int maxProduct(int[] nums) {
    int maxProd = nums[0], minProd = nums[0], result = nums[0];
    for (int i = 1; i < nums.length; i++) {
        if (nums[i] < 0) { int temp = maxProd; maxProd = minProd; minProd = temp; }
        maxProd = Math.max(nums[i], maxProd * nums[i]);
        minProd = Math.min(nums[i], minProd * nums[i]);
        result = Math.max(result, maxProd);
    }
    return result;
}`,
    python: `def max_product(nums):
    max_prod = min_prod = result = nums[0]
    for i in range(1, len(nums)):
        if nums[i] < 0: max_prod, min_prod = min_prod, max_prod
        max_prod = max(nums[i], max_prod * nums[i])
        min_prod = min(nums[i], min_prod * nums[i])
        result = max(result, max_prod)
    return result`,
    javascript: `function maxProduct(nums) {
    let maxProd = nums[0], minProd = nums[0], result = nums[0];
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] < 0) [maxProd, minProd] = [minProd, maxProd];
        maxProd = Math.max(nums[i], maxProd * nums[i]);
        minProd = Math.min(nums[i], minProd * nums[i]);
        result = Math.max(result, maxProd);
    }
    return result;
}`,
    typescript: `function maxProduct(nums: number[]): number {
    let maxProd: number = nums[0], minProd: number = nums[0], result: number = nums[0];
    for (let i = 1; i < nums.length; i++) {
        if (nums[i] < 0) [maxProd, minProd] = [minProd, maxProd];
        maxProd = Math.max(nums[i], maxProd * nums[i]);
        minProd = Math.min(nums[i], minProd * nums[i]);
        result = Math.max(result, maxProd);
    }
    return result;
}`,
    csharp: `public int MaxProduct(int[] nums) {
    int maxProd = nums[0], minProd = nums[0], result = nums[0];
    for (int i = 1; i < nums.Length; i++) {
        if (nums[i] < 0) { int temp = maxProd; maxProd = minProd; minProd = temp; }
        maxProd = Math.Max(nums[i], maxProd * nums[i]);
        minProd = Math.Min(nums[i], minProd * nums[i]);
        result = Math.Max(result, maxProd);
    }
    return result;
}`,
    cpp: `int maxProduct(vector<int>& nums) {
    int maxProd = nums[0], minProd = nums[0], result = nums[0];
    for (int i = 1; i < nums.size(); i++) {
        if (nums[i] < 0) swap(maxProd, minProd);
        maxProd = max(nums[i], maxProd * nums[i]);
        minProd = min(nums[i], minProd * nums[i]);
        result = max(result, maxProd);
    }
    return result;
}`,
    go: `func maxProduct(nums []int) int {
    maxProd, minProd, result := nums[0], nums[0], nums[0]
    for i := 1; i < len(nums); i++ {
        if nums[i] < 0 { maxProd, minProd = minProd, maxProd }
        if nums[i] > maxProd*nums[i] { maxProd = nums[i] } else { maxProd *= nums[i] }
        if nums[i] < minProd*nums[i] { minProd = nums[i] } else { minProd *= nums[i] }
        if maxProd > result { result = maxProd }
    }
    return result
}`
  },
  "best-sightseeing-pair": {
    java: `public int maxScoreSightseeingPair(int[] values) {
    int maxScore = 0, maxI = values[0];
    for (int j = 1; j < values.length; j++) {
        maxScore = Math.max(maxScore, maxI + values[j] - j);
        maxI = Math.max(maxI, values[j] + j);
    }
    return maxScore;
}`,
    python: `def max_score_sightseeing_pair(values):
    max_score = 0
    max_i = values[0]
    for j in range(1, len(values)):
        max_score = max(max_score, max_i + values[j] - j)
        max_i = max(max_i, values[j] + j)
    return max_score`,
    javascript: `function maxScoreSightseeingPair(values) {
    let maxScore = 0, maxI = values[0];
    for (let j = 1; j < values.length; j++) {
        maxScore = Math.max(maxScore, maxI + values[j] - j);
        maxI = Math.max(maxI, values[j] + j);
    }
    return maxScore;
}`,
    typescript: `function maxScoreSightseeingPair(values: number[]): number {
    let maxScore: number = 0, maxI: number = values[0];
    for (let j = 1; j < values.length; j++) {
        maxScore = Math.max(maxScore, maxI + values[j] - j);
        maxI = Math.max(maxI, values[j] + j);
    }
    return maxScore;
}`,
    csharp: `public int MaxScoreSightseeingPair(int[] values) {
    int maxScore = 0, maxI = values[0];
    for (int j = 1; j < values.Length; j++) {
        maxScore = Math.Max(maxScore, maxI + values[j] - j);
        maxI = Math.Max(maxI, values[j] + j);
    }
    return maxScore;
}`,
    cpp: `int maxScoreSightseeingPair(vector<int>& values) {
    int maxScore = 0, maxI = values[0];
    for (int j = 1; j < values.size(); j++) {
        maxScore = max(maxScore, maxI + values[j] - j);
        maxI = max(maxI, values[j] + j);
    }
    return maxScore;
}`,
    go: `func maxScoreSightseeingPair(values []int) int {
    maxScore, maxI := 0, values[0]
    for j := 1; j < len(values); j++ {
        if maxI+values[j]-j > maxScore { maxScore = maxI + values[j] - j }
        if values[j]+j > maxI { maxI = values[j] + j }
    }
    return maxScore
}`
  }
};
