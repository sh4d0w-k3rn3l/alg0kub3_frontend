// Hash/Map Algorithms Code

export const hashCode = {
  "two-sum": {
    java: `public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
    python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    javascript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    typescript: `function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        const complement: number = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
    csharp: `public int[] TwoSum(int[] nums, int target) {
    var map = new Dictionary<int, int>();
    for (int i = 0; i < nums.Length; i++) {
        int complement = target - nums[i];
        if (map.ContainsKey(complement)) {
            return new int[] { map[complement], i };
        }
        map[nums[i]] = i;
    }
    return new int[] {};
}`,
    cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];
        if (map.count(complement)) {
            return {map[complement], i};
        }
        map[nums[i]] = i;
    }
    return {};
}`,
    go: `func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        complement := target - num
        if j, ok := seen[complement]; ok {
            return []int{j, i}
        }
        seen[num] = i
    }
    return []int{}
}`
  },
  "contains-duplicate": {
    java: `public boolean containsDuplicate(int[] nums) {
    Set<Integer> seen = new HashSet<>();
    for (int num : nums) {
        if (!seen.add(num)) return true;
    }
    return false;
}`,
    python: `def contains_duplicate(nums):
    return len(nums) != len(set(nums))`,
    javascript: `function containsDuplicate(nums) {
    return new Set(nums).size !== nums.length;
}`,
    typescript: `function containsDuplicate(nums: number[]): boolean {
    return new Set(nums).size !== nums.length;
}`,
    csharp: `public bool ContainsDuplicate(int[] nums) {
    return nums.Length != nums.Distinct().Count();
}`,
    cpp: `bool containsDuplicate(vector<int>& nums) {
    unordered_set<int> seen;
    for (int num : nums) {
        if (seen.count(num)) return true;
        seen.insert(num);
    }
    return false;
}`,
    go: `func containsDuplicate(nums []int) bool {
    seen := make(map[int]bool)
    for _, num := range nums {
        if seen[num] {
            return true
        }
        seen[num] = true
    }
    return false
}`
  },
  "single-number": {
    java: `public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}`,
    python: `def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
    javascript: `function singleNumber(nums) {
    return nums.reduce((a, b) => a ^ b, 0);
}`,
    typescript: `function singleNumber(nums: number[]): number {
    return nums.reduce((a, b) => a ^ b, 0);
}`,
    csharp: `public int SingleNumber(int[] nums) {
    int result = 0;
    foreach (int num in nums) {
        result ^= num;
    }
    return result;
}`,
    cpp: `int singleNumber(vector<int>& nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}`,
    go: `func singleNumber(nums []int) int {
    result := 0
    for _, num := range nums {
        result ^= num
    }
    return result
}`
  },
  "group-anagrams": {
    java: `public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    for (String s : strs) {
        char[] chars = s.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(map.values());
}`,
    python: `def group_anagrams(strs):
    from collections import defaultdict
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    return list(groups.values())`,
    javascript: `function groupAnagrams(strs) {
    const map = new Map();
    for (const s of strs) {
        const key = [...s].sort().join('');
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(s);
    }
    return [...map.values()];
}`,
    typescript: `function groupAnagrams(strs: string[]): string[][] {
    const map = new Map<string, string[]>();
    for (const s of strs) {
        const key: string = [...s].sort().join('');
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(s);
    }
    return [...map.values()];
}`,
    csharp: `public IList<IList<string>> GroupAnagrams(string[] strs) {
    var map = new Dictionary<string, IList<string>>();
    foreach (string s in strs) {
        var key = new string(s.OrderBy(c => c).ToArray());
        if (!map.ContainsKey(key)) map[key] = new List<string>();
        map[key].Add(s);
    }
    return map.Values.ToList();
}`,
    cpp: `vector<vector<string>> groupAnagrams(vector<string>& strs) {
    unordered_map<string, vector<string>> map;
    for (const string& s : strs) {
        string key = s;
        sort(key.begin(), key.end());
        map[key].push_back(s);
    }
    vector<vector<string>> result;
    for (auto& pair : map) {
        result.push_back(pair.second);
    }
    return result;
}`,
    go: `func groupAnagrams(strs []string) [][]string {
    groups := make(map[string][]string)
    for _, s := range strs {
        runes := []rune(s)
        sort.Slice(runes, func(i, j int) bool { return runes[i] < runes[j] })
        key := string(runes)
        groups[key] = append(groups[key], s)
    }
    result := make([][]string, 0, len(groups))
    for _, v := range groups {
        result = append(result, v)
    }
    return result
}`
  },
  "longest-consecutive-sequence": {
    java: `public int longestConsecutive(int[] nums) {
    Set<Integer> set = new HashSet<>();
    for (int num : nums) set.add(num);
    int maxLen = 0;
    for (int num : set) {
        if (!set.contains(num - 1)) {
            int len = 1;
            while (set.contains(num + len)) len++;
            maxLen = Math.max(maxLen, len);
        }
    }
    return maxLen;
}`,
    python: `def longest_consecutive(nums):
    num_set = set(nums)
    max_len = 0
    for num in num_set:
        if num - 1 not in num_set:
            length = 1
            while num + length in num_set:
                length += 1
            max_len = max(max_len, length)
    return max_len`,
    javascript: `function longestConsecutive(nums) {
    const set = new Set(nums);
    let maxLen = 0;
    for (const num of set) {
        if (!set.has(num - 1)) {
            let len = 1;
            while (set.has(num + len)) len++;
            maxLen = Math.max(maxLen, len);
        }
    }
    return maxLen;
}`,
    typescript: `function longestConsecutive(nums: number[]): number {
    const set = new Set<number>(nums);
    let maxLen: number = 0;
    for (const num of set) {
        if (!set.has(num - 1)) {
            let len: number = 1;
            while (set.has(num + len)) len++;
            maxLen = Math.max(maxLen, len);
        }
    }
    return maxLen;
}`,
    csharp: `public int LongestConsecutive(int[] nums) {
    var set = new HashSet<int>(nums);
    int maxLen = 0;
    foreach (int num in set) {
        if (!set.Contains(num - 1)) {
            int len = 1;
            while (set.Contains(num + len)) len++;
            maxLen = Math.Max(maxLen, len);
        }
    }
    return maxLen;
}`,
    cpp: `int longestConsecutive(vector<int>& nums) {
    unordered_set<int> set(nums.begin(), nums.end());
    int maxLen = 0;
    for (int num : set) {
        if (!set.count(num - 1)) {
            int len = 1;
            while (set.count(num + len)) len++;
            maxLen = max(maxLen, len);
        }
    }
    return maxLen;
}`,
    go: `func longestConsecutive(nums []int) int {
    set := make(map[int]bool)
    for _, num := range nums {
        set[num] = true
    }
    maxLen := 0
    for num := range set {
        if !set[num-1] {
            length := 1
            for set[num+length] {
                length++
            }
            if length > maxLen {
                maxLen = length
            }
        }
    }
    return maxLen
}`
  },
  "subarray-sum-equals-k": {
    java: `public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> map = new HashMap<>();
    map.put(0, 1);
    int count = 0, sum = 0;
    for (int num : nums) {
        sum += num;
        count += map.getOrDefault(sum - k, 0);
        map.put(sum, map.getOrDefault(sum, 0) + 1);
    }
    return count;
}`,
    python: `def subarray_sum(nums, k):
    from collections import defaultdict
    prefix_count = defaultdict(int)
    prefix_count[0] = 1
    count = prefix_sum = 0
    for num in nums:
        prefix_sum += num
        count += prefix_count[prefix_sum - k]
        prefix_count[prefix_sum] += 1
    return count`,
    javascript: `function subarraySum(nums, k) {
    const map = new Map([[0, 1]]);
    let count = 0, sum = 0;
    for (const num of nums) {
        sum += num;
        count += map.get(sum - k) || 0;
        map.set(sum, (map.get(sum) || 0) + 1);
    }
    return count;
}`,
    typescript: `function subarraySum(nums: number[], k: number): number {
    const map = new Map<number, number>([[0, 1]]);
    let count: number = 0, sum: number = 0;
    for (const num of nums) {
        sum += num;
        count += map.get(sum - k) || 0;
        map.set(sum, (map.get(sum) || 0) + 1);
    }
    return count;
}`,
    csharp: `public int SubarraySum(int[] nums, int k) {
    var map = new Dictionary<int, int> { { 0, 1 } };
    int count = 0, sum = 0;
    foreach (int num in nums) {
        sum += num;
        if (map.ContainsKey(sum - k)) count += map[sum - k];
        map[sum] = map.GetValueOrDefault(sum, 0) + 1;
    }
    return count;
}`,
    cpp: `int subarraySum(vector<int>& nums, int k) {
    unordered_map<int, int> map;
    map[0] = 1;
    int count = 0, sum = 0;
    for (int num : nums) {
        sum += num;
        if (map.count(sum - k)) count += map[sum - k];
        map[sum]++;
    }
    return count;
}`,
    go: `func subarraySum(nums []int, k int) int {
    prefixCount := map[int]int{0: 1}
    count, sum := 0, 0
    for _, num := range nums {
        sum += num
        count += prefixCount[sum-k]
        prefixCount[sum]++
    }
    return count
}`
  }
};
