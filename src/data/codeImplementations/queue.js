// Queue Algorithms Code

export const queueCode = {
  "reveal-cards-in-increasing-order": {
    java: `public int[] deckRevealedIncreasing(int[] deck) {
    Arrays.sort(deck);
    Deque<Integer> queue = new LinkedList<>();
    for (int i = deck.length - 1; i >= 0; i--) {
        if (!queue.isEmpty()) queue.addFirst(queue.removeLast());
        queue.addFirst(deck[i]);
    }
    int[] result = new int[deck.length];
    for (int i = 0; i < deck.length; i++) result[i] = queue.removeFirst();
    return result;
}`,
    python: `def deck_revealed_increasing(deck):
    from collections import deque
    deck.sort()
    queue = deque()
    for card in reversed(deck):
        if queue: queue.appendleft(queue.pop())
        queue.appendleft(card)
    return list(queue)`,
    javascript: `function deckRevealedIncreasing(deck) {
    deck.sort((a, b) => a - b);
    const queue = [];
    for (let i = deck.length - 1; i >= 0; i--) {
        if (queue.length) queue.unshift(queue.pop());
        queue.unshift(deck[i]);
    }
    return queue;
}`,
    typescript: `function deckRevealedIncreasing(deck: number[]): number[] {
    deck.sort((a, b) => a - b);
    const queue: number[] = [];
    for (let i = deck.length - 1; i >= 0; i--) {
        if (queue.length) queue.unshift(queue.pop()!);
        queue.unshift(deck[i]);
    }
    return queue;
}`,
    csharp: `public int[] DeckRevealedIncreasing(int[] deck) {
    Array.Sort(deck);
    var queue = new LinkedList<int>();
    for (int i = deck.Length - 1; i >= 0; i--) {
        if (queue.Count > 0) { queue.AddFirst(queue.Last.Value); queue.RemoveLast(); }
        queue.AddFirst(deck[i]);
    }
    return queue.ToArray();
}`,
    cpp: `vector<int> deckRevealedIncreasing(vector<int>& deck) {
    sort(deck.begin(), deck.end());
    deque<int> q;
    for (int i = deck.size() - 1; i >= 0; i--) {
        if (!q.empty()) { q.push_front(q.back()); q.pop_back(); }
        q.push_front(deck[i]);
    }
    return vector<int>(q.begin(), q.end());
}`,
    go: `func deckRevealedIncreasing(deck []int) []int {
    sort.Ints(deck)
    queue := []int{}
    for i := len(deck) - 1; i >= 0; i-- {
        if len(queue) > 0 {
            queue = append([]int{queue[len(queue)-1]}, queue[:len(queue)-1]...)
        }
        queue = append([]int{deck[i]}, queue...)
    }
    return queue
}`
  },
  "jump-game-vi": {
    java: `public int maxResult(int[] nums, int k) {
    Deque<Integer> deque = new LinkedList<>();
    deque.offer(0);
    for (int i = 1; i < nums.length; i++) {
        while (!deque.isEmpty() && deque.peekFirst() < i - k) deque.pollFirst();
        nums[i] += nums[deque.peekFirst()];
        while (!deque.isEmpty() && nums[i] >= nums[deque.peekLast()]) deque.pollLast();
        deque.offerLast(i);
    }
    return nums[nums.length - 1];
}`,
    python: `def max_result(nums, k):
    from collections import deque
    dq = deque([0])
    for i in range(1, len(nums)):
        while dq and dq[0] < i - k: dq.popleft()
        nums[i] += nums[dq[0]]
        while dq and nums[i] >= nums[dq[-1]]: dq.pop()
        dq.append(i)
    return nums[-1]`,
    javascript: `function maxResult(nums, k) {
    const deque = [0];
    for (let i = 1; i < nums.length; i++) {
        while (deque.length && deque[0] < i - k) deque.shift();
        nums[i] += nums[deque[0]];
        while (deque.length && nums[i] >= nums[deque[deque.length - 1]]) deque.pop();
        deque.push(i);
    }
    return nums[nums.length - 1];
}`,
    typescript: `function maxResult(nums: number[], k: number): number {
    const deque: number[] = [0];
    for (let i = 1; i < nums.length; i++) {
        while (deque.length && deque[0] < i - k) deque.shift();
        nums[i] += nums[deque[0]];
        while (deque.length && nums[i] >= nums[deque[deque.length - 1]]) deque.pop();
        deque.push(i);
    }
    return nums[nums.length - 1];
}`,
    csharp: `public int MaxResult(int[] nums, int k) {
    var deque = new LinkedList<int>();
    deque.AddLast(0);
    for (int i = 1; i < nums.Length; i++) {
        while (deque.Count > 0 && deque.First.Value < i - k) deque.RemoveFirst();
        nums[i] += nums[deque.First.Value];
        while (deque.Count > 0 && nums[i] >= nums[deque.Last.Value]) deque.RemoveLast();
        deque.AddLast(i);
    }
    return nums[nums.Length - 1];
}`,
    cpp: `int maxResult(vector<int>& nums, int k) {
    deque<int> dq;
    dq.push_back(0);
    for (int i = 1; i < nums.size(); i++) {
        while (!dq.empty() && dq.front() < i - k) dq.pop_front();
        nums[i] += nums[dq.front()];
        while (!dq.empty() && nums[i] >= nums[dq.back()]) dq.pop_back();
        dq.push_back(i);
    }
    return nums.back();
}`,
    go: `func maxResult(nums []int, k int) int {
    dq := []int{0}
    for i := 1; i < len(nums); i++ {
        for len(dq) > 0 && dq[0] < i-k { dq = dq[1:] }
        nums[i] += nums[dq[0]]
        for len(dq) > 0 && nums[i] >= nums[dq[len(dq)-1]] { dq = dq[:len(dq)-1] }
        dq = append(dq, i)
    }
    return nums[len(nums)-1]
}`
  },
  "sliding-window-maximum": {
    java: `public int[] maxSlidingWindow(int[] nums, int k) {
    Deque<Integer> deque = new LinkedList<>();
    int[] result = new int[nums.length - k + 1];
    for (int i = 0; i < nums.length; i++) {
        while (!deque.isEmpty() && deque.peekFirst() <= i - k) deque.pollFirst();
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i]) deque.pollLast();
        deque.offerLast(i);
        if (i >= k - 1) result[i - k + 1] = nums[deque.peekFirst()];
    }
    return result;
}`,
    python: `def max_sliding_window(nums, k):
    from collections import deque
    dq = deque()
    result = []
    for i in range(len(nums)):
        while dq and dq[0] <= i - k: dq.popleft()
        while dq and nums[dq[-1]] < nums[i]: dq.pop()
        dq.append(i)
        if i >= k - 1: result.append(nums[dq[0]])
    return result`,
    javascript: `function maxSlidingWindow(nums, k) {
    const deque = [], result = [];
    for (let i = 0; i < nums.length; i++) {
        while (deque.length && deque[0] <= i - k) deque.shift();
        while (deque.length && nums[deque[deque.length - 1]] < nums[i]) deque.pop();
        deque.push(i);
        if (i >= k - 1) result.push(nums[deque[0]]);
    }
    return result;
}`,
    typescript: `function maxSlidingWindow(nums: number[], k: number): number[] {
    const deque: number[] = [], result: number[] = [];
    for (let i = 0; i < nums.length; i++) {
        while (deque.length && deque[0] <= i - k) deque.shift();
        while (deque.length && nums[deque[deque.length - 1]] < nums[i]) deque.pop();
        deque.push(i);
        if (i >= k - 1) result.push(nums[deque[0]]);
    }
    return result;
}`,
    csharp: `public int[] MaxSlidingWindow(int[] nums, int k) {
    var deque = new LinkedList<int>();
    var result = new int[nums.Length - k + 1];
    for (int i = 0; i < nums.Length; i++) {
        while (deque.Count > 0 && deque.First.Value <= i - k) deque.RemoveFirst();
        while (deque.Count > 0 && nums[deque.Last.Value] < nums[i]) deque.RemoveLast();
        deque.AddLast(i);
        if (i >= k - 1) result[i - k + 1] = nums[deque.First.Value];
    }
    return result;
}`,
    cpp: `vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> result;
    for (int i = 0; i < nums.size(); i++) {
        while (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) result.push_back(nums[dq.front()]);
    }
    return result;
}`,
    go: `func maxSlidingWindow(nums []int, k int) []int {
    dq := []int{}
    result := []int{}
    for i := 0; i < len(nums); i++ {
        for len(dq) > 0 && dq[0] <= i-k { dq = dq[1:] }
        for len(dq) > 0 && nums[dq[len(dq)-1]] < nums[i] { dq = dq[:len(dq)-1] }
        dq = append(dq, i)
        if i >= k-1 { result = append(result, nums[dq[0]]) }
    }
    return result
}`
  },
  "max-value-of-equation": {
    java: `public int findMaxValueOfEquation(int[][] points, int k) {
    Deque<int[]> deque = new LinkedList<>();
    int max = Integer.MIN_VALUE;
    for (int[] p : points) {
        while (!deque.isEmpty() && p[0] - deque.peekFirst()[0] > k) deque.pollFirst();
        if (!deque.isEmpty()) max = Math.max(max, p[0] + p[1] + deque.peekFirst()[1] - deque.peekFirst()[0]);
        while (!deque.isEmpty() && p[1] - p[0] >= deque.peekLast()[1] - deque.peekLast()[0]) deque.pollLast();
        deque.offerLast(p);
    }
    return max;
}`,
    python: `def find_max_value_of_equation(points, k):
    from collections import deque
    dq = deque()
    max_val = float('-inf')
    for x, y in points:
        while dq and x - dq[0][0] > k: dq.popleft()
        if dq: max_val = max(max_val, x + y + dq[0][1] - dq[0][0])
        while dq and y - x >= dq[-1][1] - dq[-1][0]: dq.pop()
        dq.append((x, y))
    return max_val`,
    javascript: `function findMaxValueOfEquation(points, k) {
    const deque = []; let max = -Infinity;
    for (const [x, y] of points) {
        while (deque.length && x - deque[0][0] > k) deque.shift();
        if (deque.length) max = Math.max(max, x + y + deque[0][1] - deque[0][0]);
        while (deque.length && y - x >= deque[deque.length - 1][1] - deque[deque.length - 1][0]) deque.pop();
        deque.push([x, y]);
    }
    return max;
}`,
    typescript: `function findMaxValueOfEquation(points: number[][], k: number): number {
    const deque: number[][] = [];
    let max: number = -Infinity;
    for (const [x, y] of points) {
        while (deque.length && x - deque[0][0] > k) deque.shift();
        if (deque.length) max = Math.max(max, x + y + deque[0][1] - deque[0][0]);
        while (deque.length && y - x >= deque[deque.length - 1][1] - deque[deque.length - 1][0]) deque.pop();
        deque.push([x, y]);
    }
    return max;
}`,
    csharp: `public int FindMaxValueOfEquation(int[][] points, int k) {
    var deque = new LinkedList<int[]>();
    int max = int.MinValue;
    foreach (var p in points) {
        while (deque.Count > 0 && p[0] - deque.First.Value[0] > k) deque.RemoveFirst();
        if (deque.Count > 0) max = Math.Max(max, p[0] + p[1] + deque.First.Value[1] - deque.First.Value[0]);
        while (deque.Count > 0 && p[1] - p[0] >= deque.Last.Value[1] - deque.Last.Value[0]) deque.RemoveLast();
        deque.AddLast(p);
    }
    return max;
}`,
    cpp: `int findMaxValueOfEquation(vector<vector<int>>& points, int k) {
    deque<pair<int, int>> dq;
    int maxVal = INT_MIN;
    for (auto& p : points) {
        while (!dq.empty() && p[0] - dq.front().first > k) dq.pop_front();
        if (!dq.empty()) maxVal = max(maxVal, p[0] + p[1] + dq.front().second - dq.front().first);
        while (!dq.empty() && p[1] - p[0] >= dq.back().second - dq.back().first) dq.pop_back();
        dq.push_back({p[0], p[1]});
    }
    return maxVal;
}`,
    go: `func findMaxValueOfEquation(points [][]int, k int) int {
    dq := [][]int{}
    maxVal := -1 << 31
    for _, p := range points {
        for len(dq) > 0 && p[0]-dq[0][0] > k { dq = dq[1:] }
        if len(dq) > 0 {
            val := p[0] + p[1] + dq[0][1] - dq[0][0]
            if val > maxVal { maxVal = val }
        }
        for len(dq) > 0 && p[1]-p[0] >= dq[len(dq)-1][1]-dq[len(dq)-1][0] { dq = dq[:len(dq)-1] }
        dq = append(dq, p)
    }
    return maxVal
}`
  }
};
