// Sliding Window Algorithms Code

export const slidingWindowCode = {
  "maximum-average-subarray-i": {
    java: `public double findMaxAverage(int[] nums, int k) {
    double sum = 0;
    for (int i = 0; i < k; i++) sum += nums[i];
    double maxSum = sum;
    for (int i = k; i < nums.length; i++) {
        sum += nums[i] - nums[i - k];
        maxSum = Math.max(maxSum, sum);
    }
    return maxSum / k;
}`,
    python: `def find_max_average(nums, k):
    window_sum = sum(nums[:k])
    max_sum = window_sum
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum / k`,
    javascript: `function findMaxAverage(nums, k) {
    let sum = nums.slice(0, k).reduce((a, b) => a + b, 0);
    let maxSum = sum;
    for (let i = k; i < nums.length; i++) {
        sum += nums[i] - nums[i - k];
        maxSum = Math.max(maxSum, sum);
    }
    return maxSum / k;
}`,
    typescript: `function findMaxAverage(nums: number[], k: number): number {
    let sum: number = nums.slice(0, k).reduce((a, b) => a + b, 0);
    let maxSum: number = sum;
    for (let i = k; i < nums.length; i++) {
        sum += nums[i] - nums[i - k];
        maxSum = Math.max(maxSum, sum);
    }
    return maxSum / k;
}`,
    csharp: `public double FindMaxAverage(int[] nums, int k) {
    double sum = 0;
    for (int i = 0; i < k; i++) sum += nums[i];
    double maxSum = sum;
    for (int i = k; i < nums.Length; i++) {
        sum += nums[i] - nums[i - k];
        maxSum = Math.Max(maxSum, sum);
    }
    return maxSum / k;
}`,
    cpp: `double findMaxAverage(vector<int>& nums, int k) {
    double sum = 0;
    for (int i = 0; i < k; i++) sum += nums[i];
    double maxSum = sum;
    for (int i = k; i < nums.size(); i++) {
        sum += nums[i] - nums[i - k];
        maxSum = max(maxSum, sum);
    }
    return maxSum / k;
}`,
    go: `func findMaxAverage(nums []int, k int) float64 {
    sum := 0
    for i := 0; i < k; i++ { sum += nums[i] }
    maxSum := sum
    for i := k; i < len(nums); i++ {
        sum += nums[i] - nums[i-k]
        if sum > maxSum { maxSum = sum }
    }
    return float64(maxSum) / float64(k)
}`
  },
  "longest-substring-without-repeating-characters": {
    java: `public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> map = new HashMap<>();
    int maxLen = 0, left = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (map.containsKey(c)) {
            left = Math.max(left, map.get(c) + 1);
        }
        map.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    python: `def length_of_longest_substring(s):
    char_index = {}
    max_len = left = 0
    for right, char in enumerate(s):
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1
        char_index[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len`,
    javascript: `function lengthOfLongestSubstring(s) {
    const map = new Map();
    let maxLen = 0, left = 0;
    for (let right = 0; right < s.length; right++) {
        if (map.has(s[right])) {
            left = Math.max(left, map.get(s[right]) + 1);
        }
        map.set(s[right], right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    typescript: `function lengthOfLongestSubstring(s: string): number {
    const map = new Map<string, number>();
    let maxLen: number = 0, left: number = 0;
    for (let right = 0; right < s.length; right++) {
        if (map.has(s[right])) {
            left = Math.max(left, map.get(s[right])! + 1);
        }
        map.set(s[right], right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    csharp: `public int LengthOfLongestSubstring(string s) {
    var map = new Dictionary<char, int>();
    int maxLen = 0, left = 0;
    for (int right = 0; right < s.Length; right++) {
        if (map.ContainsKey(s[right])) {
            left = Math.Max(left, map[s[right]] + 1);
        }
        map[s[right]] = right;
        maxLen = Math.Max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    cpp: `int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> map;
    int maxLen = 0, left = 0;
    for (int right = 0; right < s.size(); right++) {
        if (map.count(s[right])) {
            left = max(left, map[s[right]] + 1);
        }
        map[s[right]] = right;
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    go: `func lengthOfLongestSubstring(s string) int {
    charIndex := make(map[byte]int)
    maxLen, left := 0, 0
    for right := 0; right < len(s); right++ {
        if idx, ok := charIndex[s[right]]; ok && idx >= left {
            left = idx + 1
        }
        charIndex[s[right]] = right
        if right-left+1 > maxLen { maxLen = right - left + 1 }
    }
    return maxLen
}`
  },
  "minimum-window-substring": {
    java: `public String minWindow(String s, String t) {
    Map<Character, Integer> need = new HashMap<>();
    for (char c : t.toCharArray()) need.put(c, need.getOrDefault(c, 0) + 1);
    int left = 0, minStart = 0, minLen = Integer.MAX_VALUE, count = need.size();
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (need.containsKey(c)) {
            need.put(c, need.get(c) - 1);
            if (need.get(c) == 0) count--;
        }
        while (count == 0) {
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minStart = left;
            }
            char lc = s.charAt(left++);
            if (need.containsKey(lc)) {
                if (need.get(lc) == 0) count++;
                need.put(lc, need.get(lc) + 1);
            }
        }
    }
    return minLen == Integer.MAX_VALUE ? "" : s.substring(minStart, minStart + minLen);
}`,
    python: `def min_window(s, t):
    from collections import Counter
    need = Counter(t)
    left = count = 0
    min_start, min_len = 0, float('inf')
    for right, char in enumerate(s):
        if char in need:
            if need[char] > 0: count += 1
            need[char] -= 1
        while count == len(t):
            if right - left + 1 < min_len:
                min_len = right - left + 1
                min_start = left
            if s[left] in need:
                need[s[left]] += 1
                if need[s[left]] > 0: count -= 1
            left += 1
    return "" if min_len == float('inf') else s[min_start:min_start + min_len]`,
    javascript: `function minWindow(s, t) {
    const need = {};
    for (const c of t) need[c] = (need[c] || 0) + 1;
    let left = 0, minStart = 0, minLen = Infinity, count = Object.keys(need).length;
    for (let right = 0; right < s.length; right++) {
        if (s[right] in need) {
            need[s[right]]--;
            if (need[s[right]] === 0) count--;
        }
        while (count === 0) {
            if (right - left + 1 < minLen) {
                minLen = right - left + 1;
                minStart = left;
            }
            if (s[left] in need) {
                if (need[s[left]] === 0) count++;
                need[s[left]]++;
            }
            left++;
        }
    }
    return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}`,
    typescript: `function minWindow(s: string, t: string): string {
    const need: Record<string, number> = {};
    for (const c of t) need[c] = (need[c] || 0) + 1;
    let left = 0, minStart = 0, minLen = Infinity, count = Object.keys(need).length;
    for (let right = 0; right < s.length; right++) {
        if (s[right] in need) {
            need[s[right]]--;
            if (need[s[right]] === 0) count--;
        }
        while (count === 0) {
            if (right - left + 1 < minLen) { minLen = right - left + 1; minStart = left; }
            if (s[left] in need) { if (need[s[left]] === 0) count++; need[s[left]]++; }
            left++;
        }
    }
    return minLen === Infinity ? "" : s.slice(minStart, minStart + minLen);
}`,
    csharp: `public string MinWindow(string s, string t) {
    var need = new Dictionary<char, int>();
    foreach (char c in t) need[c] = need.GetValueOrDefault(c, 0) + 1;
    int left = 0, minStart = 0, minLen = int.MaxValue, count = need.Count;
    for (int right = 0; right < s.Length; right++) {
        if (need.ContainsKey(s[right])) {
            need[s[right]]--;
            if (need[s[right]] == 0) count--;
        }
        while (count == 0) {
            if (right - left + 1 < minLen) { minLen = right - left + 1; minStart = left; }
            if (need.ContainsKey(s[left])) {
                if (need[s[left]] == 0) count++;
                need[s[left]]++;
            }
            left++;
        }
    }
    return minLen == int.MaxValue ? "" : s.Substring(minStart, minLen);
}`,
    cpp: `string minWindow(string s, string t) {
    unordered_map<char, int> need;
    for (char c : t) need[c]++;
    int left = 0, minStart = 0, minLen = INT_MAX, count = need.size();
    for (int right = 0; right < s.size(); right++) {
        if (need.count(s[right])) {
            if (--need[s[right]] == 0) count--;
        }
        while (count == 0) {
            if (right - left + 1 < minLen) { minLen = right - left + 1; minStart = left; }
            if (need.count(s[left])) {
                if (need[s[left]]++ == 0) count++;
            }
            left++;
        }
    }
    return minLen == INT_MAX ? "" : s.substr(minStart, minLen);
}`,
    go: `func minWindow(s string, t string) string {
    need := make(map[byte]int)
    for i := 0; i < len(t); i++ { need[t[i]]++ }
    left, minStart, minLen, count := 0, 0, len(s)+1, len(need)
    for right := 0; right < len(s); right++ {
        if _, ok := need[s[right]]; ok {
            need[s[right]]--
            if need[s[right]] == 0 { count-- }
        }
        for count == 0 {
            if right-left+1 < minLen { minLen = right - left + 1; minStart = left }
            if _, ok := need[s[left]]; ok {
                if need[s[left]] == 0 { count++ }
                need[s[left]]++
            }
            left++
        }
    }
    if minLen > len(s) { return "" }
    return s[minStart : minStart+minLen]
}`
  },
  "max-consecutive-ones-iii": {
    java: `public int longestOnes(int[] nums, int k) {
    int left = 0, zeros = 0, maxLen = 0;
    for (int right = 0; right < nums.length; right++) {
        if (nums[right] == 0) zeros++;
        while (zeros > k) {
            if (nums[left++] == 0) zeros--;
        }
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    python: `def longest_ones(nums, k):
    left = zeros = max_len = 0
    for right, num in enumerate(nums):
        if num == 0: zeros += 1
        while zeros > k:
            if nums[left] == 0: zeros -= 1
            left += 1
        max_len = max(max_len, right - left + 1)
    return max_len`,
    javascript: `function longestOnes(nums, k) {
    let left = 0, zeros = 0, maxLen = 0;
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) zeros++;
        while (zeros > k) {
            if (nums[left++] === 0) zeros--;
        }
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    typescript: `function longestOnes(nums: number[], k: number): number {
    let left: number = 0, zeros: number = 0, maxLen: number = 0;
    for (let right = 0; right < nums.length; right++) {
        if (nums[right] === 0) zeros++;
        while (zeros > k) {
            if (nums[left++] === 0) zeros--;
        }
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    csharp: `public int LongestOnes(int[] nums, int k) {
    int left = 0, zeros = 0, maxLen = 0;
    for (int right = 0; right < nums.Length; right++) {
        if (nums[right] == 0) zeros++;
        while (zeros > k) {
            if (nums[left++] == 0) zeros--;
        }
        maxLen = Math.Max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    cpp: `int longestOnes(vector<int>& nums, int k) {
    int left = 0, zeros = 0, maxLen = 0;
    for (int right = 0; right < nums.size(); right++) {
        if (nums[right] == 0) zeros++;
        while (zeros > k) {
            if (nums[left++] == 0) zeros--;
        }
        maxLen = max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    go: `func longestOnes(nums []int, k int) int {
    left, zeros, maxLen := 0, 0, 0
    for right := 0; right < len(nums); right++ {
        if nums[right] == 0 { zeros++ }
        for zeros > k {
            if nums[left] == 0 { zeros-- }
            left++
        }
        if right-left+1 > maxLen { maxLen = right - left + 1 }
    }
    return maxLen
}`
  }
};
