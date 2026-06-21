// Hash Table Algorithms Code (additional algorithms not in hash.js)

export const hashTableCode = {
  "ransom-note": {
    java: `public boolean canConstruct(String ransomNote, String magazine) {
    int[] count = new int[26];
    for (char c : magazine.toCharArray()) count[c - 'a']++;
    for (char c : ransomNote.toCharArray()) {
        if (--count[c - 'a'] < 0) return false;
    }
    return true;
}`,
    python: `def can_construct(ransom_note, magazine):
    from collections import Counter
    mag_count = Counter(magazine)
    for c in ransom_note:
        if mag_count[c] <= 0: return False
        mag_count[c] -= 1
    return True`,
    javascript: `function canConstruct(ransomNote, magazine) {
    const count = {};
    for (const c of magazine) count[c] = (count[c] || 0) + 1;
    for (const c of ransomNote) {
        if (!count[c]) return false;
        count[c]--;
    }
    return true;
}`,
    typescript: `function canConstruct(ransomNote: string, magazine: string): boolean {
    const count: Record<string, number> = {};
    for (const c of magazine) count[c] = (count[c] || 0) + 1;
    for (const c of ransomNote) {
        if (!count[c]) return false;
        count[c]--;
    }
    return true;
}`,
    csharp: `public bool CanConstruct(string ransomNote, string magazine) {
    int[] count = new int[26];
    foreach (char c in magazine) count[c - 'a']++;
    foreach (char c in ransomNote) {
        if (--count[c - 'a'] < 0) return false;
    }
    return true;
}`,
    cpp: `bool canConstruct(string ransomNote, string magazine) {
    int count[26] = {0};
    for (char c : magazine) count[c - 'a']++;
    for (char c : ransomNote) {
        if (--count[c - 'a'] < 0) return false;
    }
    return true;
}`,
    go: `func canConstruct(ransomNote string, magazine string) bool {
    count := make(map[rune]int)
    for _, c := range magazine { count[c]++ }
    for _, c := range ransomNote {
        if count[c] <= 0 { return false }
        count[c]--
    }
    return true
}`
  },
  "number-of-good-pairs": {
    java: `public int numIdenticalPairs(int[] nums) {
    int[] count = new int[101];
    int pairs = 0;
    for (int num : nums) {
        pairs += count[num];
        count[num]++;
    }
    return pairs;
}`,
    python: `def num_identical_pairs(nums):
    from collections import defaultdict
    count = defaultdict(int)
    pairs = 0
    for num in nums:
        pairs += count[num]
        count[num] += 1
    return pairs`,
    javascript: `function numIdenticalPairs(nums) {
    const count = {};
    let pairs = 0;
    for (const num of nums) {
        pairs += count[num] || 0;
        count[num] = (count[num] || 0) + 1;
    }
    return pairs;
}`,
    typescript: `function numIdenticalPairs(nums: number[]): number {
    const count: Record<number, number> = {};
    let pairs: number = 0;
    for (const num of nums) {
        pairs += count[num] || 0;
        count[num] = (count[num] || 0) + 1;
    }
    return pairs;
}`,
    csharp: `public int NumIdenticalPairs(int[] nums) {
    var count = new Dictionary<int, int>();
    int pairs = 0;
    foreach (int num in nums) {
        pairs += count.GetValueOrDefault(num, 0);
        count[num] = count.GetValueOrDefault(num, 0) + 1;
    }
    return pairs;
}`,
    cpp: `int numIdenticalPairs(vector<int>& nums) {
    unordered_map<int, int> count;
    int pairs = 0;
    for (int num : nums) {
        pairs += count[num];
        count[num]++;
    }
    return pairs;
}`,
    go: `func numIdenticalPairs(nums []int) int {
    count := make(map[int]int)
    pairs := 0
    for _, num := range nums {
        pairs += count[num]
        count[num]++
    }
    return pairs
}`
  },
  "contains-duplicate-ii": {
    java: `public boolean containsNearbyDuplicate(int[] nums, int k) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        if (map.containsKey(nums[i]) && i - map.get(nums[i]) <= k) {
            return true;
        }
        map.put(nums[i], i);
    }
    return false;
}`,
    python: `def contains_nearby_duplicate(nums, k):
    seen = {}
    for i, num in enumerate(nums):
        if num in seen and i - seen[num] <= k:
            return True
        seen[num] = i
    return False`,
    javascript: `function containsNearbyDuplicate(nums, k) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        if (map.has(nums[i]) && i - map.get(nums[i]) <= k) {
            return true;
        }
        map.set(nums[i], i);
    }
    return false;
}`,
    typescript: `function containsNearbyDuplicate(nums: number[], k: number): boolean {
    const map = new Map<number, number>();
    for (let i = 0; i < nums.length; i++) {
        if (map.has(nums[i]) && i - map.get(nums[i])! <= k) {
            return true;
        }
        map.set(nums[i], i);
    }
    return false;
}`,
    csharp: `public bool ContainsNearbyDuplicate(int[] nums, int k) {
    var map = new Dictionary<int, int>();
    for (int i = 0; i < nums.Length; i++) {
        if (map.ContainsKey(nums[i]) && i - map[nums[i]] <= k) {
            return true;
        }
        map[nums[i]] = i;
    }
    return false;
}`,
    cpp: `bool containsNearbyDuplicate(vector<int>& nums, int k) {
    unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); i++) {
        if (map.count(nums[i]) && i - map[nums[i]] <= k) {
            return true;
        }
        map[nums[i]] = i;
    }
    return false;
}`,
    go: `func containsNearbyDuplicate(nums []int, k int) bool {
    seen := make(map[int]int)
    for i, num := range nums {
        if j, ok := seen[num]; ok && i-j <= k {
            return true
        }
        seen[num] = i
    }
    return false
}`
  },
  "isomorphic-strings": {
    java: `public boolean isIsomorphic(String s, String t) {
    int[] mapS = new int[256], mapT = new int[256];
    for (int i = 0; i < s.length(); i++) {
        if (mapS[s.charAt(i)] != mapT[t.charAt(i)]) return false;
        mapS[s.charAt(i)] = i + 1;
        mapT[t.charAt(i)] = i + 1;
    }
    return true;
}`,
    python: `def is_isomorphic(s, t):
    return len(set(zip(s, t))) == len(set(s)) == len(set(t))`,
    javascript: `function isIsomorphic(s, t) {
    const mapS = {}, mapT = {};
    for (let i = 0; i < s.length; i++) {
        if (mapS[s[i]] !== mapT[t[i]]) return false;
        mapS[s[i]] = i + 1;
        mapT[t[i]] = i + 1;
    }
    return true;
}`,
    typescript: `function isIsomorphic(s: string, t: string): boolean {
    const mapS: Record<string, number> = {}, mapT: Record<string, number> = {};
    for (let i = 0; i < s.length; i++) {
        if (mapS[s[i]] !== mapT[t[i]]) return false;
        mapS[s[i]] = i + 1;
        mapT[t[i]] = i + 1;
    }
    return true;
}`,
    csharp: `public bool IsIsomorphic(string s, string t) {
    int[] mapS = new int[256], mapT = new int[256];
    for (int i = 0; i < s.Length; i++) {
        if (mapS[s[i]] != mapT[t[i]]) return false;
        mapS[s[i]] = i + 1;
        mapT[t[i]] = i + 1;
    }
    return true;
}`,
    cpp: `bool isIsomorphic(string s, string t) {
    int mapS[256] = {0}, mapT[256] = {0};
    for (int i = 0; i < s.size(); i++) {
        if (mapS[s[i]] != mapT[t[i]]) return false;
        mapS[s[i]] = i + 1;
        mapT[t[i]] = i + 1;
    }
    return true;
}`,
    go: `func isIsomorphic(s string, t string) bool {
    mapS, mapT := make(map[byte]int), make(map[byte]int)
    for i := 0; i < len(s); i++ {
        if mapS[s[i]] != mapT[t[i]] { return false }
        mapS[s[i]] = i + 1
        mapT[t[i]] = i + 1
    }
    return true
}`
  },
  "longest-consecutive": {
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
    for _, num := range nums { set[num] = true }
    maxLen := 0
    for num := range set {
        if !set[num-1] {
            length := 1
            for set[num+length] { length++ }
            if length > maxLen { maxLen = length }
        }
    }
    return maxLen
}`
  }
};
