// Prefix Sum Algorithms Code

export const prefixSumCode = {
  "contiguous-array": {
    java: `public int findMaxLength(int[] nums) {
    Map<Integer, Integer> map = new HashMap<>();
    map.put(0, -1);
    int maxLen = 0, count = 0;
    for (int i = 0; i < nums.length; i++) {
        count += nums[i] == 1 ? 1 : -1;
        if (map.containsKey(count)) {
            maxLen = Math.max(maxLen, i - map.get(count));
        } else {
            map.put(count, i);
        }
    }
    return maxLen;
}`,
    python: `def find_max_length(nums):
    count_map = {0: -1}
    max_len = count = 0
    for i, num in enumerate(nums):
        count += 1 if num == 1 else -1
        if count in count_map:
            max_len = max(max_len, i - count_map[count])
        else:
            count_map[count] = i
    return max_len`,
    javascript: `function findMaxLength(nums) {
    const map = new Map([[0, -1]]);
    let maxLen = 0, count = 0;
    for (let i = 0; i < nums.length; i++) {
        count += nums[i] === 1 ? 1 : -1;
        if (map.has(count)) maxLen = Math.max(maxLen, i - map.get(count));
        else map.set(count, i);
    }
    return maxLen;
}`,
    typescript: `function findMaxLength(nums: number[]): number {
    const map = new Map<number, number>([[0, -1]]);
    let maxLen: number = 0, count: number = 0;
    for (let i = 0; i < nums.length; i++) {
        count += nums[i] === 1 ? 1 : -1;
        if (map.has(count)) maxLen = Math.max(maxLen, i - map.get(count)!);
        else map.set(count, i);
    }
    return maxLen;
}`,
    csharp: `public int FindMaxLength(int[] nums) {
    var map = new Dictionary<int, int> { { 0, -1 } };
    int maxLen = 0, count = 0;
    for (int i = 0; i < nums.Length; i++) {
        count += nums[i] == 1 ? 1 : -1;
        if (map.ContainsKey(count)) maxLen = Math.Max(maxLen, i - map[count]);
        else map[count] = i;
    }
    return maxLen;
}`,
    cpp: `int findMaxLength(vector<int>& nums) {
    unordered_map<int, int> map;
    map[0] = -1;
    int maxLen = 0, count = 0;
    for (int i = 0; i < nums.size(); i++) {
        count += nums[i] == 1 ? 1 : -1;
        if (map.count(count)) maxLen = max(maxLen, i - map[count]);
        else map[count] = i;
    }
    return maxLen;
}`,
    go: `func findMaxLength(nums []int) int {
    m := map[int]int{0: -1}
    maxLen, count := 0, 0
    for i, num := range nums {
        if num == 1 { count++ } else { count-- }
        if j, ok := m[count]; ok {
            if i-j > maxLen { maxLen = i - j }
        } else { m[count] = i }
    }
    return maxLen
}`
  },
  "continuous-subarray-sum": {
    java: `public boolean checkSubarraySum(int[] nums, int k) {
    Map<Integer, Integer> map = new HashMap<>();
    map.put(0, -1);
    int sum = 0;
    for (int i = 0; i < nums.length; i++) {
        sum += nums[i];
        int rem = k == 0 ? sum : sum % k;
        if (map.containsKey(rem)) {
            if (i - map.get(rem) >= 2) return true;
        } else {
            map.put(rem, i);
        }
    }
    return false;
}`,
    python: `def check_subarray_sum(nums, k):
    prefix_map = {0: -1}
    prefix_sum = 0
    for i, num in enumerate(nums):
        prefix_sum += num
        rem = prefix_sum % k if k else prefix_sum
        if rem in prefix_map:
            if i - prefix_map[rem] >= 2: return True
        else:
            prefix_map[rem] = i
    return False`,
    javascript: `function checkSubarraySum(nums, k) {
    const map = new Map([[0, -1]]);
    let sum = 0;
    for (let i = 0; i < nums.length; i++) {
        sum += nums[i];
        const rem = k === 0 ? sum : sum % k;
        if (map.has(rem)) { if (i - map.get(rem) >= 2) return true; }
        else map.set(rem, i);
    }
    return false;
}`,
    typescript: `function checkSubarraySum(nums: number[], k: number): boolean {
    const map = new Map<number, number>([[0, -1]]);
    let sum: number = 0;
    for (let i = 0; i < nums.length; i++) {
        sum += nums[i];
        const rem: number = k === 0 ? sum : sum % k;
        if (map.has(rem)) { if (i - map.get(rem)! >= 2) return true; }
        else map.set(rem, i);
    }
    return false;
}`,
    csharp: `public bool CheckSubarraySum(int[] nums, int k) {
    var map = new Dictionary<int, int> { { 0, -1 } };
    int sum = 0;
    for (int i = 0; i < nums.Length; i++) {
        sum += nums[i];
        int rem = k == 0 ? sum : sum % k;
        if (map.ContainsKey(rem)) { if (i - map[rem] >= 2) return true; }
        else map[rem] = i;
    }
    return false;
}`,
    cpp: `bool checkSubarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> map;
    map[0] = -1;
    int sum = 0;
    for (int i = 0; i < nums.size(); i++) {
        sum += nums[i];
        int rem = k == 0 ? sum : sum % k;
        if (map.count(rem)) { if (i - map[rem] >= 2) return true; }
        else map[rem] = i;
    }
    return false;
}`,
    go: `func checkSubarraySum(nums []int, k int) bool {
    m := map[int]int{0: -1}
    sum := 0
    for i, num := range nums {
        sum += num
        rem := sum
        if k != 0 { rem = sum % k }
        if j, ok := m[rem]; ok {
            if i-j >= 2 { return true }
        } else { m[rem] = i }
    }
    return false
}`
  },
  "subarray-sum-equals-k": {
    java: `public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> map = new HashMap<>();
    map.put(0, 1);
    int sum = 0, count = 0;
    for (int num : nums) {
        sum += num;
        count += map.getOrDefault(sum - k, 0);
        map.put(sum, map.getOrDefault(sum, 0) + 1);
    }
    return count;
}`,
    python: `def subarray_sum(nums, k):
    count_map = {0: 1}
    prefix_sum = count = 0
    for num in nums:
        prefix_sum += num
        count += count_map.get(prefix_sum - k, 0)
        count_map[prefix_sum] = count_map.get(prefix_sum, 0) + 1
    return count`,
    javascript: `function subarraySum(nums, k) {
    const map = new Map([[0, 1]]);
    let sum = 0, count = 0;
    for (const num of nums) {
        sum += num;
        count += map.get(sum - k) || 0;
        map.set(sum, (map.get(sum) || 0) + 1);
    }
    return count;
}`,
    typescript: `function subarraySum(nums: number[], k: number): number {
    const map = new Map<number, number>([[0, 1]]);
    let sum: number = 0, count: number = 0;
    for (const num of nums) {
        sum += num;
        count += map.get(sum - k) || 0;
        map.set(sum, (map.get(sum) || 0) + 1);
    }
    return count;
}`,
    csharp: `public int SubarraySum(int[] nums, int k) {
    var map = new Dictionary<int, int> { { 0, 1 } };
    int sum = 0, count = 0;
    foreach (int num in nums) {
        sum += num;
        count += map.GetValueOrDefault(sum - k, 0);
        map[sum] = map.GetValueOrDefault(sum, 0) + 1;
    }
    return count;
}`,
    cpp: `int subarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> map;
    map[0] = 1;
    int sum = 0, count = 0;
    for (int num : nums) {
        sum += num;
        if (map.count(sum - k)) count += map[sum - k];
        map[sum]++;
    }
    return count;
}`,
    go: `func subarraySum(nums []int, k int) int {
    m := map[int]int{0: 1}
    sum, count := 0, 0
    for _, num := range nums {
        sum += num
        count += m[sum-k]
        m[sum]++
    }
    return count
}`
  },
  "subarray-sums-divisible-by-k": {
    java: `public int subarraysDivByK(int[] nums, int k) {
    Map<Integer, Integer> map = new HashMap<>();
    map.put(0, 1);
    int sum = 0, count = 0;
    for (int num : nums) {
        sum += num;
        int rem = ((sum % k) + k) % k;
        count += map.getOrDefault(rem, 0);
        map.put(rem, map.getOrDefault(rem, 0) + 1);
    }
    return count;
}`,
    python: `def subarrays_div_by_k(nums, k):
    count_map = {0: 1}
    prefix_sum = count = 0
    for num in nums:
        prefix_sum += num
        rem = prefix_sum % k
        count += count_map.get(rem, 0)
        count_map[rem] = count_map.get(rem, 0) + 1
    return count`,
    javascript: `function subarraysDivByK(nums, k) {
    const map = new Map([[0, 1]]);
    let sum = 0, count = 0;
    for (const num of nums) {
        sum += num;
        const rem = ((sum % k) + k) % k;
        count += map.get(rem) || 0;
        map.set(rem, (map.get(rem) || 0) + 1);
    }
    return count;
}`,
    typescript: `function subarraysDivByK(nums: number[], k: number): number {
    const map = new Map<number, number>([[0, 1]]);
    let sum: number = 0, count: number = 0;
    for (const num of nums) {
        sum += num;
        const rem: number = ((sum % k) + k) % k;
        count += map.get(rem) || 0;
        map.set(rem, (map.get(rem) || 0) + 1);
    }
    return count;
}`,
    csharp: `public int SubarraysDivByK(int[] nums, int k) {
    var map = new Dictionary<int, int> { { 0, 1 } };
    int sum = 0, count = 0;
    foreach (int num in nums) {
        sum += num;
        int rem = ((sum % k) + k) % k;
        count += map.GetValueOrDefault(rem, 0);
        map[rem] = map.GetValueOrDefault(rem, 0) + 1;
    }
    return count;
}`,
    cpp: `int subarraysDivByK(vector<int>& nums, int k) {
    unordered_map<int, int> map;
    map[0] = 1;
    int sum = 0, count = 0;
    for (int num : nums) {
        sum += num;
        int rem = ((sum % k) + k) % k;
        if (map.count(rem)) count += map[rem];
        map[rem]++;
    }
    return count;
}`,
    go: `func subarraysDivByK(nums []int, k int) int {
    m := map[int]int{0: 1}
    sum, count := 0, 0
    for _, num := range nums {
        sum += num
        rem := ((sum % k) + k) % k
        count += m[rem]
        m[rem]++
    }
    return count
}`
  }
};
