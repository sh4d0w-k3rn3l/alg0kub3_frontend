// Heap algorithm implementations

export const heapCode = {
  "kth-largest-element": {
    java: `public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int num : nums) {
        minHeap.offer(num);
        if (minHeap.size() > k) minHeap.poll();
    }
    return minHeap.peek();
}`,
    python: `import heapq

def findKthLargest(nums, k):
    min_heap = []
    for num in nums:
        heapq.heappush(min_heap, num)
        if len(min_heap) > k:
            heapq.heappop(min_heap)
    return min_heap[0]`,
    javascript: `function findKthLargest(nums, k) {
    nums.sort((a, b) => b - a);
    return nums[k - 1];
}`,
    typescript: `function findKthLargest(nums: number[], k: number): number {
    nums.sort((a, b) => b - a);
    return nums[k - 1];
}`,
    csharp: `public int FindKthLargest(int[] nums, int k) {
    var minHeap = new PriorityQueue<int, int>();
    foreach (int num in nums) {
        minHeap.Enqueue(num, num);
        if (minHeap.Count > k) minHeap.Dequeue();
    }
    return minHeap.Peek();
}`,
    cpp: `int findKthLargest(vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> minHeap;
    for (int num : nums) {
        minHeap.push(num);
        if (minHeap.size() > k) minHeap.pop();
    }
    return minHeap.top();
}`,
    go: `func findKthLargest(nums []int, k int) int {
    sort.Ints(nums)
    return nums[len(nums)-k]
}`
  },
  "top-k-frequent": {
    java: `public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> count = new HashMap<>();
    for (int num : nums) count.put(num, count.getOrDefault(num, 0) + 1);
    PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[1] - b[1]);
    for (var entry : count.entrySet()) {
        minHeap.offer(new int[]{entry.getKey(), entry.getValue()});
        if (minHeap.size() > k) minHeap.poll();
    }
    int[] result = new int[k];
    for (int i = 0; i < k; i++) result[i] = minHeap.poll()[0];
    return result;
}`,
    python: `from collections import Counter
import heapq

def topKFrequent(nums, k):
    count = Counter(nums)
    return heapq.nlargest(k, count.keys(), key=count.get)`,
    javascript: `function topKFrequent(nums, k) {
    const count = {};
    for (const num of nums) count[num] = (count[num] || 0) + 1;
    return Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, k)
        .map(([num]) => Number(num));
}`,
    typescript: `function topKFrequent(nums: number[], k: number): number[] {
    const count: Record<number, number> = {};
    for (const num of nums) count[num] = (count[num] || 0) + 1;
    return Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, k)
        .map(([num]) => Number(num));
}`,
    csharp: `public int[] TopKFrequent(int[] nums, int k) {
    var count = new Dictionary<int, int>();
    foreach (int num in nums) count[num] = count.GetValueOrDefault(num) + 1;
    return count.OrderByDescending(x => x.Value).Take(k).Select(x => x.Key).ToArray();
}`,
    cpp: `vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> count;
    for (int num : nums) count[num]++;
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> minHeap;
    for (auto& [num, freq] : count) {
        minHeap.push({freq, num});
        if (minHeap.size() > k) minHeap.pop();
    }
    vector<int> result;
    while (!minHeap.empty()) { result.push_back(minHeap.top().second); minHeap.pop(); }
    return result;
}`,
    go: `func topKFrequent(nums []int, k int) []int {
    count := make(map[int]int)
    for _, num := range nums { count[num]++ }
    type pair struct { num, freq int }
    pairs := make([]pair, 0, len(count))
    for num, freq := range count { pairs = append(pairs, pair{num, freq}) }
    sort.Slice(pairs, func(i, j int) bool { return pairs[i].freq > pairs[j].freq })
    result := make([]int, k)
    for i := 0; i < k; i++ { result[i] = pairs[i].num }
    return result
}`
  },
  "sort-characters-by-frequency": {
    java: `public String frequencySort(String s) {
    Map<Character, Integer> count = new HashMap<>();
    for (char c : s.toCharArray()) count.put(c, count.getOrDefault(c, 0) + 1);
    PriorityQueue<Character> maxHeap = new PriorityQueue<>((a, b) -> count.get(b) - count.get(a));
    maxHeap.addAll(count.keySet());
    StringBuilder sb = new StringBuilder();
    while (!maxHeap.isEmpty()) {
        char c = maxHeap.poll();
        for (int i = 0; i < count.get(c); i++) sb.append(c);
    }
    return sb.toString();
}`,
    python: `from collections import Counter

def frequencySort(s):
    count = Counter(s)
    sorted_chars = sorted(count.items(), key=lambda x: -x[1])
    return ''.join(char * freq for char, freq in sorted_chars)`,
    javascript: `function frequencySort(s) {
    const count = {};
    for (const c of s) count[c] = (count[c] || 0) + 1;
    return Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .map(([char, freq]) => char.repeat(freq))
        .join('');
}`,
    typescript: `function frequencySort(s: string): string {
    const count: Record<string, number> = {};
    for (const c of s) count[c] = (count[c] || 0) + 1;
    return Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .map(([char, freq]) => char.repeat(freq))
        .join('');
}`,
    csharp: `public string FrequencySort(string s) {
    var count = s.GroupBy(c => c).ToDictionary(g => g.Key, g => g.Count());
    return string.Concat(count.OrderByDescending(x => x.Value)
        .SelectMany(x => Enumerable.Repeat(x.Key, x.Value)));
}`,
    cpp: `string frequencySort(string s) {
    unordered_map<char, int> count;
    for (char c : s) count[c]++;
    vector<pair<int, char>> freq;
    for (auto& [c, f] : count) freq.push_back({f, c});
    sort(freq.rbegin(), freq.rend());
    string result;
    for (auto& [f, c] : freq) result += string(f, c);
    return result;
}`,
    go: `func frequencySort(s string) string {
    count := make(map[rune]int)
    for _, c := range s { count[c]++ }
    type pair struct { char rune; freq int }
    pairs := make([]pair, 0, len(count))
    for c, f := range count { pairs = append(pairs, pair{c, f}) }
    sort.Slice(pairs, func(i, j int) bool { return pairs[i].freq > pairs[j].freq })
    var result strings.Builder
    for _, p := range pairs { for i := 0; i < p.freq; i++ { result.WriteRune(p.char) } }
    return result.String()
}`
  },
  "furthest-building": {
    java: `public int furthestBuilding(int[] heights, int bricks, int ladders) {
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    for (int i = 0; i < heights.length - 1; i++) {
        int diff = heights[i + 1] - heights[i];
        if (diff <= 0) continue;
        minHeap.offer(diff);
        if (minHeap.size() > ladders) {
            bricks -= minHeap.poll();
            if (bricks < 0) return i;
        }
    }
    return heights.length - 1;
}`,
    python: `import heapq

def furthestBuilding(heights, bricks, ladders):
    min_heap = []
    for i in range(len(heights) - 1):
        diff = heights[i + 1] - heights[i]
        if diff <= 0: continue
        heapq.heappush(min_heap, diff)
        if len(min_heap) > ladders:
            bricks -= heapq.heappop(min_heap)
            if bricks < 0: return i
    return len(heights) - 1`,
    javascript: `function furthestBuilding(heights, bricks, ladders) {
    const climbs = [];
    for (let i = 0; i < heights.length - 1; i++) {
        const diff = heights[i + 1] - heights[i];
        if (diff <= 0) continue;
        climbs.push(diff);
        climbs.sort((a, b) => a - b);
        if (climbs.length > ladders) {
            bricks -= climbs.shift();
            if (bricks < 0) return i;
        }
    }
    return heights.length - 1;
}`,
    typescript: `function furthestBuilding(heights: number[], bricks: number, ladders: number): number {
    const climbs: number[] = [];
    for (let i = 0; i < heights.length - 1; i++) {
        const diff: number = heights[i + 1] - heights[i];
        if (diff <= 0) continue;
        climbs.push(diff);
        climbs.sort((a, b) => a - b);
        if (climbs.length > ladders) {
            bricks -= climbs.shift()!;
            if (bricks < 0) return i;
        }
    }
    return heights.length - 1;
}`,
    csharp: `public int FurthestBuilding(int[] heights, int bricks, int ladders) {
    var minHeap = new PriorityQueue<int, int>();
    for (int i = 0; i < heights.Length - 1; i++) {
        int diff = heights[i + 1] - heights[i];
        if (diff <= 0) continue;
        minHeap.Enqueue(diff, diff);
        if (minHeap.Count > ladders) {
            bricks -= minHeap.Dequeue();
            if (bricks < 0) return i;
        }
    }
    return heights.Length - 1;
}`,
    cpp: `int furthestBuilding(vector<int>& heights, int bricks, int ladders) {
    priority_queue<int, vector<int>, greater<int>> minHeap;
    for (int i = 0; i < heights.size() - 1; i++) {
        int diff = heights[i + 1] - heights[i];
        if (diff <= 0) continue;
        minHeap.push(diff);
        if (minHeap.size() > ladders) {
            bricks -= minHeap.top(); minHeap.pop();
            if (bricks < 0) return i;
        }
    }
    return heights.size() - 1;
}`,
    go: `func furthestBuilding(heights []int, bricks int, ladders int) int {
    climbs := []int{}
    for i := 0; i < len(heights)-1; i++ {
        diff := heights[i+1] - heights[i]
        if diff <= 0 { continue }
        climbs = append(climbs, diff)
        sort.Ints(climbs)
        if len(climbs) > ladders {
            bricks -= climbs[0]
            climbs = climbs[1:]
            if bricks < 0 { return i }
        }
    }
    return len(heights) - 1
}`
  },
  "find-median-data-stream": {
    java: `class MedianFinder {
    PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
    PriorityQueue<Integer> minHeap = new PriorityQueue<>();
    
    public void addNum(int num) {
        maxHeap.offer(num);
        minHeap.offer(maxHeap.poll());
        if (minHeap.size() > maxHeap.size()) maxHeap.offer(minHeap.poll());
    }
    
    public double findMedian() {
        if (maxHeap.size() > minHeap.size()) return maxHeap.peek();
        return (maxHeap.peek() + minHeap.peek()) / 2.0;
    }
}`,
    python: `import heapq

class MedianFinder:
    def __init__(self):
        self.max_heap = []
        self.min_heap = []
    
    def addNum(self, num):
        heapq.heappush(self.max_heap, -num)
        heapq.heappush(self.min_heap, -heapq.heappop(self.max_heap))
        if len(self.min_heap) > len(self.max_heap):
            heapq.heappush(self.max_heap, -heapq.heappop(self.min_heap))
    
    def findMedian(self):
        if len(self.max_heap) > len(self.min_heap): return -self.max_heap[0]
        return (-self.max_heap[0] + self.min_heap[0]) / 2`,
    javascript: `class MedianFinder {
    constructor() { this.nums = []; }
    addNum(num) {
        let l = 0, r = this.nums.length;
        while (l < r) {
            const m = Math.floor((l + r) / 2);
            if (this.nums[m] < num) l = m + 1; else r = m;
        }
        this.nums.splice(l, 0, num);
    }
    findMedian() {
        const n = this.nums.length;
        if (n % 2 === 1) return this.nums[Math.floor(n / 2)];
        return (this.nums[n/2 - 1] + this.nums[n/2]) / 2;
    }
}`,
    typescript: `class MedianFinder {
    private nums: number[] = [];
    addNum(num: number): void {
        let l = 0, r = this.nums.length;
        while (l < r) {
            const m = Math.floor((l + r) / 2);
            if (this.nums[m] < num) l = m + 1; else r = m;
        }
        this.nums.splice(l, 0, num);
    }
    findMedian(): number {
        const n = this.nums.length;
        if (n % 2 === 1) return this.nums[Math.floor(n / 2)];
        return (this.nums[n/2 - 1] + this.nums[n/2]) / 2;
    }
}`,
    csharp: `public class MedianFinder {
    private List<int> nums = new List<int>();
    public void AddNum(int num) {
        int idx = nums.BinarySearch(num);
        if (idx < 0) idx = ~idx;
        nums.Insert(idx, num);
    }
    public double FindMedian() {
        int n = nums.Count;
        if (n % 2 == 1) return nums[n / 2];
        return (nums[n/2 - 1] + nums[n/2]) / 2.0;
    }
}`,
    cpp: `class MedianFinder {
    priority_queue<int> maxHeap;
    priority_queue<int, vector<int>, greater<int>> minHeap;
public:
    void addNum(int num) {
        maxHeap.push(num);
        minHeap.push(maxHeap.top()); maxHeap.pop();
        if (minHeap.size() > maxHeap.size()) { maxHeap.push(minHeap.top()); minHeap.pop(); }
    }
    double findMedian() {
        if (maxHeap.size() > minHeap.size()) return maxHeap.top();
        return (maxHeap.top() + minHeap.top()) / 2.0;
    }
};`,
    go: `type MedianFinder struct { nums []int }

func (mf *MedianFinder) AddNum(num int) {
    i := sort.SearchInts(mf.nums, num)
    mf.nums = append(mf.nums[:i], append([]int{num}, mf.nums[i:]...)...)
}

func (mf *MedianFinder) FindMedian() float64 {
    n := len(mf.nums)
    if n%2 == 1 { return float64(mf.nums[n/2]) }
    return float64(mf.nums[n/2-1]+mf.nums[n/2]) / 2.0
}`
  },
  "k-closest-points": {
    java: `public int[][] kClosest(int[][] points, int k) {
    PriorityQueue<int[]> maxHeap = new PriorityQueue<>(
        (a, b) -> (b[0]*b[0] + b[1]*b[1]) - (a[0]*a[0] + a[1]*a[1]));
    for (int[] p : points) {
        maxHeap.offer(p);
        if (maxHeap.size() > k) maxHeap.poll();
    }
    return maxHeap.toArray(new int[k][2]);
}`,
    python: `import heapq

def kClosest(points, k):
    return heapq.nsmallest(k, points, key=lambda p: p[0]**2 + p[1]**2)`,
    javascript: `function kClosest(points, k) {
    return points.sort((a, b) => (a[0]**2 + a[1]**2) - (b[0]**2 + b[1]**2)).slice(0, k);
}`,
    typescript: `function kClosest(points: number[][], k: number): number[][] {
    return points.sort((a, b) => (a[0]**2 + a[1]**2) - (b[0]**2 + b[1]**2)).slice(0, k);
}`,
    csharp: `public int[][] KClosest(int[][] points, int k) {
    return points.OrderBy(p => p[0]*p[0] + p[1]*p[1]).Take(k).ToArray();
}`,
    cpp: `vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {
    sort(points.begin(), points.end(), [](auto& a, auto& b) {
        return a[0]*a[0] + a[1]*a[1] < b[0]*b[0] + b[1]*b[1];
    });
    return vector<vector<int>>(points.begin(), points.begin() + k);
}`,
    go: `func kClosest(points [][]int, k int) [][]int {
    sort.Slice(points, func(i, j int) bool {
        return points[i][0]*points[i][0]+points[i][1]*points[i][1] < 
               points[j][0]*points[j][0]+points[j][1]*points[j][1]
    })
    return points[:k]
}`
  },
  "merge-k-sorted-lists": {
    java: `public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> minHeap = new PriorityQueue<>((a, b) -> a.val - b.val);
    for (ListNode node : lists) if (node != null) minHeap.offer(node);
    ListNode dummy = new ListNode(0), curr = dummy;
    while (!minHeap.isEmpty()) {
        ListNode node = minHeap.poll();
        curr.next = node;
        curr = curr.next;
        if (node.next != null) minHeap.offer(node.next);
    }
    return dummy.next;
}`,
    python: `import heapq

def mergeKLists(lists):
    min_heap = []
    for i, node in enumerate(lists):
        if node: heapq.heappush(min_heap, (node.val, i, node))
    dummy = curr = ListNode(0)
    while min_heap:
        val, i, node = heapq.heappop(min_heap)
        curr.next = node
        curr = curr.next
        if node.next: heapq.heappush(min_heap, (node.next.val, i, node.next))
    return dummy.next`,
    javascript: `function mergeKLists(lists) {
    const nodes = [];
    for (const list of lists) {
        let curr = list;
        while (curr) { nodes.push(curr.val); curr = curr.next; }
    }
    nodes.sort((a, b) => a - b);
    const dummy = new ListNode(0);
    let curr = dummy;
    for (const val of nodes) { curr.next = new ListNode(val); curr = curr.next; }
    return dummy.next;
}`,
    typescript: `function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
    const nodes: number[] = [];
    for (const list of lists) {
        let curr = list;
        while (curr) { nodes.push(curr.val); curr = curr.next; }
    }
    nodes.sort((a, b) => a - b);
    const dummy = new ListNode(0);
    let curr: ListNode = dummy;
    for (const val of nodes) { curr.next = new ListNode(val); curr = curr.next; }
    return dummy.next;
}`,
    csharp: `public ListNode MergeKLists(ListNode[] lists) {
    var minHeap = new PriorityQueue<ListNode, int>();
    foreach (var node in lists) if (node != null) minHeap.Enqueue(node, node.val);
    ListNode dummy = new ListNode(0), curr = dummy;
    while (minHeap.Count > 0) {
        var node = minHeap.Dequeue();
        curr.next = node;
        curr = curr.next;
        if (node.next != null) minHeap.Enqueue(node.next, node.next.val);
    }
    return dummy.next;
}`,
    cpp: `ListNode* mergeKLists(vector<ListNode*>& lists) {
    auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
    priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> minHeap(cmp);
    for (auto node : lists) if (node) minHeap.push(node);
    ListNode dummy(0), *curr = &dummy;
    while (!minHeap.empty()) {
        auto node = minHeap.top(); minHeap.pop();
        curr->next = node;
        curr = curr->next;
        if (node->next) minHeap.push(node->next);
    }
    return dummy.next;
}`,
    go: `func mergeKLists(lists []*ListNode) *ListNode {
    vals := []int{}
    for _, list := range lists {
        for list != nil { vals = append(vals, list.Val); list = list.Next }
    }
    sort.Ints(vals)
    dummy := &ListNode{}
    curr := dummy
    for _, val := range vals { curr.Next = &ListNode{Val: val}; curr = curr.Next }
    return dummy.Next
}`
  }
};
