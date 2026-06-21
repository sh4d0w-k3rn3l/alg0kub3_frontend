// Stack Algorithms Code

export const stackCode = {
  "valid-parentheses": {
    java: `public boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return stack.isEmpty();
}`,
    python: `def is_valid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
        else:
            stack.append(char)
    return len(stack) == 0`,
    javascript: `function isValid(s) {
    const stack = [];
    const mapping = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (mapping[char]) {
            if (stack.pop() !== mapping[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`,
    typescript: `function isValid(s: string): boolean {
    const stack: string[] = [];
    const mapping: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (mapping[char]) {
            if (stack.pop() !== mapping[char]) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}`,
    csharp: `public bool IsValid(string s) {
    var stack = new Stack<char>();
    var mapping = new Dictionary<char, char> { { ')', '(' }, { '}', '{' }, { ']', '[' } };
    foreach (char c in s) {
        if (mapping.ContainsKey(c)) {
            if (stack.Count == 0 || stack.Pop() != mapping[c]) return false;
        } else {
            stack.Push(c);
        }
    }
    return stack.Count == 0;
}`,
    cpp: `bool isValid(string s) {
    stack<char> stk;
    unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char c : s) {
        if (mapping.count(c)) {
            if (stk.empty() || stk.top() != mapping[c]) return false;
            stk.pop();
        } else {
            stk.push(c);
        }
    }
    return stk.empty();
}`,
    go: `func isValid(s string) bool {
    stack := []rune{}
    mapping := map[rune]rune{')': '(', '}': '{', ']': '['}
    for _, c := range s {
        if match, ok := mapping[c]; ok {
            if len(stack) == 0 || stack[len(stack)-1] != match {
                return false
            }
            stack = stack[:len(stack)-1]
        } else {
            stack = append(stack, c)
        }
    }
    return len(stack) == 0
}`
  },
  "min-stack": {
    java: `class MinStack {
    private Stack<Integer> stack = new Stack<>();
    private Stack<Integer> minStack = new Stack<>();
    
    public void push(int val) {
        stack.push(val);
        if (minStack.isEmpty() || val <= minStack.peek()) {
            minStack.push(val);
        }
    }
    
    public void pop() {
        if (stack.pop().equals(minStack.peek())) {
            minStack.pop();
        }
    }
    
    public int top() { return stack.peek(); }
    public int getMin() { return minStack.peek(); }
}`,
    python: `class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []
    
    def push(self, val):
        self.stack.append(val)
        if not self.min_stack or val <= self.min_stack[-1]:
            self.min_stack.append(val)
    
    def pop(self):
        if self.stack.pop() == self.min_stack[-1]:
            self.min_stack.pop()
    
    def top(self):
        return self.stack[-1]
    
    def getMin(self):
        return self.min_stack[-1]`,
    javascript: `class MinStack {
    constructor() {
        this.stack = [];
        this.minStack = [];
    }
    
    push(val) {
        this.stack.push(val);
        if (!this.minStack.length || val <= this.minStack[this.minStack.length - 1]) {
            this.minStack.push(val);
        }
    }
    
    pop() {
        if (this.stack.pop() === this.minStack[this.minStack.length - 1]) {
            this.minStack.pop();
        }
    }
    
    top() { return this.stack[this.stack.length - 1]; }
    getMin() { return this.minStack[this.minStack.length - 1]; }
}`,
    typescript: `class MinStack {
    private stack: number[] = [];
    private minStack: number[] = [];
    
    push(val: number): void {
        this.stack.push(val);
        if (!this.minStack.length || val <= this.minStack[this.minStack.length - 1]) {
            this.minStack.push(val);
        }
    }
    
    pop(): void {
        if (this.stack.pop() === this.minStack[this.minStack.length - 1]) {
            this.minStack.pop();
        }
    }
    
    top(): number { return this.stack[this.stack.length - 1]; }
    getMin(): number { return this.minStack[this.minStack.length - 1]; }
}`,
    csharp: `public class MinStack {
    private Stack<int> stack = new Stack<int>();
    private Stack<int> minStack = new Stack<int>();
    
    public void Push(int val) {
        stack.Push(val);
        if (minStack.Count == 0 || val <= minStack.Peek()) {
            minStack.Push(val);
        }
    }
    
    public void Pop() {
        if (stack.Pop() == minStack.Peek()) {
            minStack.Pop();
        }
    }
    
    public int Top() => stack.Peek();
    public int GetMin() => minStack.Peek();
}`,
    cpp: `class MinStack {
    stack<int> stk;
    stack<int> minStk;
public:
    void push(int val) {
        stk.push(val);
        if (minStk.empty() || val <= minStk.top()) {
            minStk.push(val);
        }
    }
    
    void pop() {
        if (stk.top() == minStk.top()) {
            minStk.pop();
        }
        stk.pop();
    }
    
    int top() { return stk.top(); }
    int getMin() { return minStk.top(); }
};`,
    go: `type MinStack struct {
    stack    []int
    minStack []int
}

func (s *MinStack) Push(val int) {
    s.stack = append(s.stack, val)
    if len(s.minStack) == 0 || val <= s.minStack[len(s.minStack)-1] {
        s.minStack = append(s.minStack, val)
    }
}

func (s *MinStack) Pop() {
    if s.stack[len(s.stack)-1] == s.minStack[len(s.minStack)-1] {
        s.minStack = s.minStack[:len(s.minStack)-1]
    }
    s.stack = s.stack[:len(s.stack)-1]
}

func (s *MinStack) Top() int { return s.stack[len(s.stack)-1] }
func (s *MinStack) GetMin() int { return s.minStack[len(s.minStack)-1] }`
  },
  "daily-temperatures": {
    java: `public int[] dailyTemperatures(int[] temperatures) {
    int n = temperatures.length;
    int[] result = new int[n];
    Stack<Integer> stack = new Stack<>();
    for (int i = 0; i < n; i++) {
        while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
            int idx = stack.pop();
            result[idx] = i - idx;
        }
        stack.push(i);
    }
    return result;
}`,
    python: `def daily_temperatures(temperatures):
    n = len(temperatures)
    result = [0] * n
    stack = []
    for i, temp in enumerate(temperatures):
        while stack and temp > temperatures[stack[-1]]:
            idx = stack.pop()
            result[idx] = i - idx
        stack.append(i)
    return result`,
    javascript: `function dailyTemperatures(temperatures) {
    const n = temperatures.length;
    const result = new Array(n).fill(0);
    const stack = [];
    for (let i = 0; i < n; i++) {
        while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
            const idx = stack.pop();
            result[idx] = i - idx;
        }
        stack.push(i);
    }
    return result;
}`,
    typescript: `function dailyTemperatures(temperatures: number[]): number[] {
    const n: number = temperatures.length;
    const result: number[] = new Array(n).fill(0);
    const stack: number[] = [];
    for (let i = 0; i < n; i++) {
        while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
            const idx: number = stack.pop()!;
            result[idx] = i - idx;
        }
        stack.push(i);
    }
    return result;
}`,
    csharp: `public int[] DailyTemperatures(int[] temperatures) {
    int n = temperatures.Length;
    int[] result = new int[n];
    var stack = new Stack<int>();
    for (int i = 0; i < n; i++) {
        while (stack.Count > 0 && temperatures[i] > temperatures[stack.Peek()]) {
            int idx = stack.Pop();
            result[idx] = i - idx;
        }
        stack.Push(i);
    }
    return result;
}`,
    cpp: `vector<int> dailyTemperatures(vector<int>& temperatures) {
    int n = temperatures.size();
    vector<int> result(n, 0);
    stack<int> stk;
    for (int i = 0; i < n; i++) {
        while (!stk.empty() && temperatures[i] > temperatures[stk.top()]) {
            int idx = stk.top();
            stk.pop();
            result[idx] = i - idx;
        }
        stk.push(i);
    }
    return result;
}`,
    go: `func dailyTemperatures(temperatures []int) []int {
    n := len(temperatures)
    result := make([]int, n)
    stack := []int{}
    for i := 0; i < n; i++ {
        for len(stack) > 0 && temperatures[i] > temperatures[stack[len(stack)-1]] {
            idx := stack[len(stack)-1]
            stack = stack[:len(stack)-1]
            result[idx] = i - idx
        }
        stack = append(stack, i)
    }
    return result
}`
  },
  "largest-rectangle-histogram": {
    java: `public int largestRectangleArea(int[] heights) {
    Stack<Integer> stack = new Stack<>();
    int maxArea = 0;
    for (int i = 0; i <= heights.length; i++) {
        int h = (i == heights.length) ? 0 : heights[i];
        while (!stack.isEmpty() && h < heights[stack.peek()]) {
            int height = heights[stack.pop()];
            int width = stack.isEmpty() ? i : i - stack.peek() - 1;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }
    return maxArea;
}`,
    python: `def largest_rectangle_area(heights):
    stack = []
    max_area = 0
    for i, h in enumerate(heights + [0]):
        while stack and h < heights[stack[-1]]:
            height = heights[stack.pop()]
            width = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, height * width)
        stack.append(i)
    return max_area`,
    javascript: `function largestRectangleArea(heights) {
    const stack = [];
    let maxArea = 0;
    heights.push(0);
    for (let i = 0; i < heights.length; i++) {
        while (stack.length && heights[i] < heights[stack[stack.length - 1]]) {
            const height = heights[stack.pop()];
            const width = stack.length ? i - stack[stack.length - 1] - 1 : i;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }
    heights.pop();
    return maxArea;
}`,
    typescript: `function largestRectangleArea(heights: number[]): number {
    const stack: number[] = [];
    let maxArea: number = 0;
    heights.push(0);
    for (let i = 0; i < heights.length; i++) {
        while (stack.length && heights[i] < heights[stack[stack.length - 1]]) {
            const height: number = heights[stack.pop()!];
            const width: number = stack.length ? i - stack[stack.length - 1] - 1 : i;
            maxArea = Math.max(maxArea, height * width);
        }
        stack.push(i);
    }
    heights.pop();
    return maxArea;
}`,
    csharp: `public int LargestRectangleArea(int[] heights) {
    var stack = new Stack<int>();
    int maxArea = 0;
    var arr = heights.Append(0).ToArray();
    for (int i = 0; i < arr.Length; i++) {
        while (stack.Count > 0 && arr[i] < arr[stack.Peek()]) {
            int height = arr[stack.Pop()];
            int width = stack.Count == 0 ? i : i - stack.Peek() - 1;
            maxArea = Math.Max(maxArea, height * width);
        }
        stack.Push(i);
    }
    return maxArea;
}`,
    cpp: `int largestRectangleArea(vector<int>& heights) {
    stack<int> stk;
    int maxArea = 0;
    heights.push_back(0);
    for (int i = 0; i < heights.size(); i++) {
        while (!stk.empty() && heights[i] < heights[stk.top()]) {
            int height = heights[stk.top()];
            stk.pop();
            int width = stk.empty() ? i : i - stk.top() - 1;
            maxArea = max(maxArea, height * width);
        }
        stk.push(i);
    }
    heights.pop_back();
    return maxArea;
}`,
    go: `func largestRectangleArea(heights []int) int {
    stack := []int{}
    maxArea := 0
    heights = append(heights, 0)
    for i := 0; i < len(heights); i++ {
        for len(stack) > 0 && heights[i] < heights[stack[len(stack)-1]] {
            height := heights[stack[len(stack)-1]]
            stack = stack[:len(stack)-1]
            width := i
            if len(stack) > 0 {
                width = i - stack[len(stack)-1] - 1
            }
            if height*width > maxArea {
                maxArea = height * width
            }
        }
        stack = append(stack, i)
    }
    return maxArea
}`
  },
  "next-greater-element-i": {
    java: `public int[] nextGreaterElement(int[] nums1, int[] nums2) {
    Map<Integer, Integer> map = new HashMap<>();
    Stack<Integer> stack = new Stack<>();
    for (int num : nums2) {
        while (!stack.isEmpty() && stack.peek() < num) {
            map.put(stack.pop(), num);
        }
        stack.push(num);
    }
    int[] result = new int[nums1.length];
    for (int i = 0; i < nums1.length; i++) {
        result[i] = map.getOrDefault(nums1[i], -1);
    }
    return result;
}`,
    python: `def next_greater_element(nums1, nums2):
    mapping = {}
    stack = []
    for num in nums2:
        while stack and stack[-1] < num:
            mapping[stack.pop()] = num
        stack.append(num)
    return [mapping.get(num, -1) for num in nums1]`,
    javascript: `function nextGreaterElement(nums1, nums2) {
    const map = new Map();
    const stack = [];
    for (const num of nums2) {
        while (stack.length && stack[stack.length - 1] < num) {
            map.set(stack.pop(), num);
        }
        stack.push(num);
    }
    return nums1.map(num => map.get(num) ?? -1);
}`,
    typescript: `function nextGreaterElement(nums1: number[], nums2: number[]): number[] {
    const map = new Map<number, number>();
    const stack: number[] = [];
    for (const num of nums2) {
        while (stack.length && stack[stack.length - 1] < num) {
            map.set(stack.pop()!, num);
        }
        stack.push(num);
    }
    return nums1.map(num => map.get(num) ?? -1);
}`,
    csharp: `public int[] NextGreaterElement(int[] nums1, int[] nums2) {
    var map = new Dictionary<int, int>();
    var stack = new Stack<int>();
    foreach (int num in nums2) {
        while (stack.Count > 0 && stack.Peek() < num) {
            map[stack.Pop()] = num;
        }
        stack.Push(num);
    }
    return nums1.Select(num => map.GetValueOrDefault(num, -1)).ToArray();
}`,
    cpp: `vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
    unordered_map<int, int> map;
    stack<int> stk;
    for (int num : nums2) {
        while (!stk.empty() && stk.top() < num) {
            map[stk.top()] = num;
            stk.pop();
        }
        stk.push(num);
    }
    vector<int> result;
    for (int num : nums1) {
        result.push_back(map.count(num) ? map[num] : -1);
    }
    return result;
}`,
    go: `func nextGreaterElement(nums1 []int, nums2 []int) []int {
    mapping := make(map[int]int)
    stack := []int{}
    for _, num := range nums2 {
        for len(stack) > 0 && stack[len(stack)-1] < num {
            mapping[stack[len(stack)-1]] = num
            stack = stack[:len(stack)-1]
        }
        stack = append(stack, num)
    }
    result := make([]int, len(nums1))
    for i, num := range nums1 {
        if val, ok := mapping[num]; ok {
            result[i] = val
        } else {
            result[i] = -1
        }
    }
    return result
}`
  }
};
