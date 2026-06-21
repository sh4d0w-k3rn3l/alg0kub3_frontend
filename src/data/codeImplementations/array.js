// Array Algorithms Code

export const arrayCode = {
  "move-zeroes": {
    java: `public void moveZeros(int[] nums) {
    int writePos = 0;
    for (int readPos = 0; readPos < nums.length; readPos++) {
        if (nums[readPos] != 0) {
            int temp = nums[writePos];
            nums[writePos] = nums[readPos];
            nums[readPos] = temp;
            writePos++;
        }
    }
}`,
    python: `def move_zeros(nums):
    write_pos = 0
    for read_pos in range(len(nums)):
        if nums[read_pos] != 0:
            nums[write_pos], nums[read_pos] = nums[read_pos], nums[write_pos]
            write_pos += 1`,
    javascript: `function moveZeros(nums) {
    let writePos = 0;
    for (let readPos = 0; readPos < nums.length; readPos++) {
        if (nums[readPos] !== 0) {
            let temp = nums[writePos];
            nums[writePos] = nums[readPos];
            nums[readPos] = temp;
            writePos++;
        }
    }
}`,
    typescript: `function moveZeros(nums: number[]): void {
    let writePos: number = 0;
    for (let readPos = 0; readPos < nums.length; readPos++) {
        if (nums[readPos] !== 0) {
            let temp: number = nums[writePos];
            nums[writePos] = nums[readPos];
            nums[readPos] = temp;
            writePos++;
        }
    }
}`,
    csharp: `public void MoveZeros(int[] nums) {
    int writePos = 0;
    for (int readPos = 0; readPos < nums.Length; readPos++) {
        if (nums[readPos] != 0) {
            int temp = nums[writePos];
            nums[writePos] = nums[readPos];
            nums[readPos] = temp;
            writePos++;
        }
    }
}`,
    cpp: `void moveZeros(vector<int>& nums) {
    int writePos = 0;
    for (int readPos = 0; readPos < nums.size(); readPos++) {
        if (nums[readPos] != 0) {
            int temp = nums[writePos];
            nums[writePos] = nums[readPos];
            nums[readPos] = temp;
            writePos++;
        }
    }
}`,
    go: `func moveZeros(nums []int) {
    writePos := 0
    for readPos := 0; readPos < len(nums); readPos++ {
        if nums[readPos] != 0 {
            nums[writePos], nums[readPos] = nums[readPos], nums[writePos]
            writePos++
        }
    }
}`
  },
  "majority-element": {
    java: `public int majorityElement(int[] nums) {
    // Boyer-Moore Voting Algorithm
    int candidate = nums[0];
    int count = 1;

    // Find candidate
    for (int i = 1; i < nums.length; i++) {
        if (count == 0) {
            candidate = nums[i];
            count = 1;
        } else if (nums[i] == candidate) {
            count++;
        } else {
            count--;
        }
    }

    // The candidate is the majority element
    return candidate;
}`,
    python: `def majority_element(nums):
    # Boyer-Moore Voting Algorithm
    candidate = nums[0]
    count = 1

    # Find candidate
    for i in range(1, len(nums)):
        if count == 0:
            candidate = nums[i]
            count = 1
        elif nums[i] == candidate:
            count += 1
        else:
            count -= 1

    # The candidate is the majority element
    return candidate`,
    javascript: `function majorityElement(nums) {
    // Boyer-Moore Voting Algorithm
    let candidate = nums[0];
    let count = 1;

    // Find candidate
    for (let i = 1; i < nums.length; i++) {
        if (count === 0) {
            candidate = nums[i];
            count = 1;
        } else if (nums[i] === candidate) {
            count++;
        } else {
            count--;
        }
    }

    // The candidate is the majority element
    return candidate;
}`,
    typescript: `function majorityElement(nums: number[]): number {
    // Boyer-Moore Voting Algorithm
    let candidate: number = nums[0];
    let count: number = 1;

    // Find candidate
    for (let i = 1; i < nums.length; i++) {
        if (count === 0) {
            candidate = nums[i];
            count = 1;
        } else if (nums[i] === candidate) {
            count++;
        } else {
            count--;
        }
    }

    // The candidate is the majority element
    return candidate;
}`,
    csharp: `public int MajorityElement(int[] nums) {
    // Boyer-Moore Voting Algorithm
    int candidate = nums[0];
    int count = 1;

    // Find candidate
    for (int i = 1; i < nums.Length; i++) {
        if (count == 0) {
            candidate = nums[i];
            count = 1;
        } else if (nums[i] == candidate) {
            count++;
        } else {
            count--;
        }
    }

    // The candidate is the majority element
    return candidate;
}`,
    cpp: `int majorityElement(vector<int>& nums) {
    // Boyer-Moore Voting Algorithm
    int candidate = nums[0];
    int count = 1;

    // Find candidate
    for (int i = 1; i < nums.size(); i++) {
        if (count == 0) {
            candidate = nums[i];
            count = 1;
        } else if (nums[i] == candidate) {
            count++;
        } else {
            count--;
        }
    }

    // The candidate is the majority element
    return candidate;
}`,
    go: `func majorityElement(nums []int) int {
    // Boyer-Moore Voting Algorithm
    candidate := nums[0]
    count := 1

    // Find candidate
    for i := 1; i < len(nums); i++ {
        if count == 0 {
            candidate = nums[i]
            count = 1
        } else if nums[i] == candidate {
            count++
        } else {
            count--
        }
    }

    // The candidate is the majority element
    return candidate
}`
  },
  "remove-duplicates": {
    java: `public int removeDuplicates(int[] nums) {
    if (nums.length == 0) return 0;

    int writePos = 0;
    for (int readPos = 1; readPos < nums.length; readPos++) {
        if (nums[readPos] != nums[writePos]) {
            writePos++;
            nums[writePos] = nums[readPos];
        }
    }

    return writePos + 1;
}`,
    python: `def remove_duplicates(nums):
    if not nums:
        return 0

    write_pos = 0
    for read_pos in range(1, len(nums)):
        if nums[read_pos] != nums[write_pos]:
            write_pos += 1
            nums[write_pos] = nums[read_pos]

    return write_pos + 1`,
    javascript: `function removeDuplicates(nums) {
    if (nums.length === 0) return 0;

    let writePos = 0;
    for (let readPos = 1; readPos < nums.length; readPos++) {
        if (nums[readPos] !== nums[writePos]) {
            writePos++;
            nums[writePos] = nums[readPos];
        }
    }

    return writePos + 1;
}`,
    typescript: `function removeDuplicates(nums: number[]): number {
    if (nums.length === 0) return 0;

    let writePos: number = 0;
    for (let readPos = 1; readPos < nums.length; readPos++) {
        if (nums[readPos] !== nums[writePos]) {
            writePos++;
            nums[writePos] = nums[readPos];
        }
    }

    return writePos + 1;
}`,
    csharp: `public int RemoveDuplicates(int[] nums) {
    if (nums.Length == 0) return 0;

    int writePos = 0;
    for (int readPos = 1; readPos < nums.Length; readPos++) {
        if (nums[readPos] != nums[writePos]) {
            writePos++;
            nums[writePos] = nums[readPos];
        }
    }

    return writePos + 1;
}`,
    cpp: `int removeDuplicates(vector<int>& nums) {
    if (nums.empty()) return 0;

    int writePos = 0;
    for (int readPos = 1; readPos < nums.size(); readPos++) {
        if (nums[readPos] != nums[writePos]) {
            writePos++;
            nums[writePos] = nums[readPos];
        }
    }

    return writePos + 1;
}`,
    go: `func removeDuplicates(nums []int) int {
    if len(nums) == 0 {
        return 0
    }

    writePos := 0
    for readPos := 1; readPos < len(nums); readPos++ {
        if nums[readPos] != nums[writePos] {
            writePos++
            nums[writePos] = nums[readPos]
        }
    }

    return writePos + 1
}`
  },
  "best-time-to-buy-and-sell-stock": {
    java: `public int maxProfit(int[] prices) {
    int minPrice = prices[0];
    int maxProfit = 0;

    for (int i = 1; i < prices.length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else {
            int profit = prices[i] - minPrice;
            if (profit > maxProfit) {
                maxProfit = profit;
            }
        }
    }

    return maxProfit;
}`,
    python: `def max_profit(prices):
    min_price = prices[0]
    max_profit = 0

    for i in range(1, len(prices)):
        if prices[i] < min_price:
            min_price = prices[i]
        else:
            profit = prices[i] - min_price
            if profit > max_profit:
                max_profit = profit

    return max_profit`,
    javascript: `function maxProfit(prices) {
    let minPrice = prices[0];
    let maxProfit = 0;

    for (let i = 1; i < prices.length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else {
            let profit = prices[i] - minPrice;
            if (profit > maxProfit) {
                maxProfit = profit;
            }
        }
    }

    return maxProfit;
}`,
    typescript: `function maxProfit(prices: number[]): number {
    let minPrice: number = prices[0];
    let maxProfit: number = 0;

    for (let i = 1; i < prices.length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else {
            let profit: number = prices[i] - minPrice;
            if (profit > maxProfit) {
                maxProfit = profit;
            }
        }
    }

    return maxProfit;
}`,
    csharp: `public int MaxProfit(int[] prices) {
    int minPrice = prices[0];
    int maxProfit = 0;

    for (int i = 1; i < prices.Length; i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else {
            int profit = prices[i] - minPrice;
            if (profit > maxProfit) {
                maxProfit = profit;
            }
        }
    }

    return maxProfit;
}`,
    cpp: `int maxProfit(vector<int>& prices) {
    int minPrice = prices[0];
    int maxProfit = 0;

    for (int i = 1; i < prices.size(); i++) {
        if (prices[i] < minPrice) {
            minPrice = prices[i];
        } else {
            int profit = prices[i] - minPrice;
            if (profit > maxProfit) {
                maxProfit = profit;
            }
        }
    }

    return maxProfit;
}`,
    go: `func maxProfit(prices []int) int {
    minPrice := prices[0]
    maxProfit := 0

    for i := 1; i < len(prices); i++ {
        if prices[i] < minPrice {
            minPrice = prices[i]
        } else {
            profit := prices[i] - minPrice
            if profit > maxProfit {
                maxProfit = profit
            }
        }
    }

    return maxProfit
}`
  },
  "best-time-to-buy-and-sell-stock-2": {
    java: `public int maxProfit(int[] prices) {
    int profit = 0;
    for (int i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
}`,
    python: `def max_profit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]
    return profit`,
    javascript: `function maxProfit(prices) {
    let profit = 0;
    for (let i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
}`,
    typescript: `function maxProfit(prices: number[]): number {
    let profit: number = 0;
    for (let i = 1; i < prices.length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
}`,
    csharp: `public int MaxProfit(int[] prices) {
    int profit = 0;
    for (int i = 1; i < prices.Length; i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
}`,
    cpp: `int maxProfit(vector<int>& prices) {
    int profit = 0;
    for (int i = 1; i < prices.size(); i++) {
        if (prices[i] > prices[i - 1]) {
            profit += prices[i] - prices[i - 1];
        }
    }
    return profit;
}`,
    go: `func maxProfit(prices []int) int {
    profit := 0
    for i := 1; i < len(prices); i++ {
        if prices[i] > prices[i-1] {
            profit += prices[i] - prices[i-1]
        }
    }
    return profit
}`
  },
  "rotate-array": {
    java: `public void rotate(int[] nums, int k) {
    k = k % nums.length;

    // Reverse entire array
    reverse(nums, 0, nums.length - 1);

    // Reverse first k elements
    reverse(nums, 0, k - 1);

    // Reverse remaining elements
    reverse(nums, k, nums.length - 1);
}

private void reverse(int[] nums, int start, int end) {
    while (start < end) {
        int temp = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}`,
    python: `def rotate(nums, k):
    k = k % len(nums)

    # Reverse entire array
    reverse(nums, 0, len(nums) - 1)

    # Reverse first k elements
    reverse(nums, 0, k - 1)

    # Reverse remaining elements
    reverse(nums, k, len(nums) - 1)

def reverse(nums, start, end):
    while start < end:
        nums[start], nums[end] = nums[end], nums[start]
        start += 1
        end -= 1`,
    javascript: `function rotate(nums, k) {
    k = k % nums.length;

    // Reverse entire array
    reverse(nums, 0, nums.length - 1);

    // Reverse first k elements
    reverse(nums, 0, k - 1);

    // Reverse remaining elements
    reverse(nums, k, nums.length - 1);
}

function reverse(nums, start, end) {
    while (start < end) {
        let temp = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}`,
    typescript: `function rotate(nums: number[], k: number): void {
    k = k % nums.length;

    // Reverse entire array
    reverse(nums, 0, nums.length - 1);

    // Reverse first k elements
    reverse(nums, 0, k - 1);

    // Reverse remaining elements
    reverse(nums, k, nums.length - 1);
}

function reverse(nums: number[], start: number, end: number): void {
    while (start < end) {
        let temp: number = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}`,
    csharp: `public void Rotate(int[] nums, int k) {
    k = k % nums.Length;

    // Reverse entire array
    Reverse(nums, 0, nums.Length - 1);

    // Reverse first k elements
    Reverse(nums, 0, k - 1);

    // Reverse remaining elements
    Reverse(nums, k, nums.Length - 1);
}

private void Reverse(int[] nums, int start, int end) {
    while (start < end) {
        int temp = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}`,
    cpp: `void rotate(vector<int>& nums, int k) {
    k = k % nums.size();

    // Reverse entire array
    reverse(nums, 0, nums.size() - 1);

    // Reverse first k elements
    reverse(nums, 0, k - 1);

    // Reverse remaining elements
    reverse(nums, k, nums.size() - 1);
}

void reverse(vector<int>& nums, int start, int end) {
    while (start < end) {
        int temp = nums[start];
        nums[start] = nums[end];
        nums[end] = temp;
        start++;
        end--;
    }
}`,
    go: `func rotate(nums []int, k int) {
    k = k % len(nums)

    // Reverse entire array
    reverse(nums, 0, len(nums)-1)

    // Reverse first k elements
    reverse(nums, 0, k-1)

    // Reverse remaining elements
    reverse(nums, k, len(nums)-1)
}

func reverse(nums []int, start, end int) {
    for start < end {
        nums[start], nums[end] = nums[end], nums[start]
        start++
        end--
    }
}`
  },
  "product-except-self": {
    java: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    result[0] = 1;
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    int right = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    return result;
}`,
    python: `def product_except_self(nums):
    n = len(nums)
    result = [1] * n
    for i in range(1, n):
        result[i] = result[i - 1] * nums[i - 1]
    right = 1
    for i in range(n - 1, -1, -1):
        result[i] *= right
        right *= nums[i]
    return result`,
    javascript: `function productExceptSelf(nums) {
    const n = nums.length;
    const result = new Array(n).fill(1);
    for (let i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    let right = 1;
    for (let i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    return result;
}`,
    typescript: `function productExceptSelf(nums: number[]): number[] {
    const n: number = nums.length;
    const result: number[] = new Array(n).fill(1);
    for (let i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    let right: number = 1;
    for (let i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    return result;
}`,
    csharp: `public int[] ProductExceptSelf(int[] nums) {
    int n = nums.Length;
    int[] result = new int[n];
    result[0] = 1;
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    int right = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    return result;
}`,
    cpp: `vector<int> productExceptSelf(vector<int>& nums) {
    int n = nums.size();
    vector<int> result(n, 1);
    for (int i = 1; i < n; i++) {
        result[i] = result[i - 1] * nums[i - 1];
    }
    int right = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    return result;
}`,
    go: `func productExceptSelf(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    result[0] = 1
    for i := 1; i < n; i++ {
        result[i] = result[i-1] * nums[i-1]
    }
    right := 1
    for i := n - 1; i >= 0; i-- {
        result[i] *= right
        right *= nums[i]
    }
    return result
}`
  },
  "zero-filled-subarrays": {
    java: `public long zeroFilledSubarray(int[] nums) {
    long result = 0;
    int zeroCount = 0;

    for (int num : nums) {
        if (num == 0) {
            zeroCount++;
        } else {
            result += zeroCount * (zeroCount + 1L) / 2;
            zeroCount = 0;
        }
    }

    result += zeroCount * (zeroCount + 1L) / 2;

    return result;
}`,
    python: `def zero_filled_subarray(nums):
    result = 0
    zero_count = 0

    for num in nums:
        if num == 0:
            zero_count += 1
        else:
            result += zero_count * (zero_count + 1) // 2
            zero_count = 0

    result += zero_count * (zero_count + 1) // 2

    return result`,
    javascript: `function zeroFilledSubarray(nums) {
    let result = 0;
    let zeroCount = 0;

    for (const num of nums) {
        if (num === 0) {
            zeroCount++;
        } else {
            result += zeroCount * (zeroCount + 1) / 2;
            zeroCount = 0;
        }
    }

    result += zeroCount * (zeroCount + 1) / 2;

    return result;
}`,
    typescript: `function zeroFilledSubarray(nums: number[]): number {
    let result: number = 0;
    let zeroCount: number = 0;

    for (const num of nums) {
        if (num === 0) {
            zeroCount++;
        } else {
            result += zeroCount * (zeroCount + 1) / 2;
            zeroCount = 0;
        }
    }

    result += zeroCount * (zeroCount + 1) / 2;

    return result;
}`,
    csharp: `public long ZeroFilledSubarray(int[] nums) {
    long result = 0;
    int zeroCount = 0;

    foreach (int num in nums) {
        if (num == 0) {
            zeroCount++;
        } else {
            result += zeroCount * (zeroCount + 1L) / 2;
            zeroCount = 0;
        }
    }

    result += zeroCount * (zeroCount + 1L) / 2;

    return result;
}`,
    cpp: `long long zeroFilledSubarray(vector<int>& nums) {
    long long result = 0;
    int zeroCount = 0;

    for (int num : nums) {
        if (num == 0) {
            zeroCount++;
        } else {
            result += (long long)zeroCount * (zeroCount + 1) / 2;
            zeroCount = 0;
        }
    }

    result += (long long)zeroCount * (zeroCount + 1) / 2;

    return result;
}`,
    go: `func zeroFilledSubarray(nums []int) int64 {
    var result int64 = 0
    var zeroCount int64 = 0

    for _, num := range nums {
        if num == 0 {
            zeroCount++
        } else {
            result += zeroCount * (zeroCount + 1) / 2
            zeroCount = 0
        }
    }

    result += zeroCount * (zeroCount + 1) / 2

    return result
}`
  },
  "increasing-triplet-subsequence": {
    java: `public boolean increasingTriplet(int[] nums) {
    int first = Integer.MAX_VALUE;
    int second = Integer.MAX_VALUE;
    for (int num : nums) {
        if (num <= first) {
            first = num;
        } else if (num <= second) {
            second = num;
        } else {
            return true;
        }
    }
    return false;
}`,
    python: `def increasing_triplet(nums):
    first = second = float('inf')
    for num in nums:
        if num <= first:
            first = num
        elif num <= second:
            second = num
        else:
            return True
    return False`,
    javascript: `function increasingTriplet(nums) {
    let first = Infinity, second = Infinity;
    for (const num of nums) {
        if (num <= first) {
            first = num;
        } else if (num <= second) {
            second = num;
        } else {
            return true;
        }
    }
    return false;
}`,
    typescript: `function increasingTriplet(nums: number[]): boolean {
    let first: number = Infinity, second: number = Infinity;
    for (const num of nums) {
        if (num <= first) {
            first = num;
        } else if (num <= second) {
            second = num;
        } else {
            return true;
        }
    }
    return false;
}`,
    csharp: `public bool IncreasingTriplet(int[] nums) {
    int first = int.MaxValue, second = int.MaxValue;
    foreach (int num in nums) {
        if (num <= first) {
            first = num;
        } else if (num <= second) {
            second = num;
        } else {
            return true;
        }
    }
    return false;
}`,
    cpp: `bool increasingTriplet(vector<int>& nums) {
    int first = INT_MAX, second = INT_MAX;
    for (int num : nums) {
        if (num <= first) {
            first = num;
        } else if (num <= second) {
            second = num;
        } else {
            return true;
        }
    }
    return false;
}`,
    go: `func increasingTriplet(nums []int) bool {
    first, second := int(^uint(0)>>1), int(^uint(0)>>1)
    for _, num := range nums {
        if num <= first {
            first = num
        } else if num <= second {
            second = num
        } else {
            return true
        }
    }
    return false
}`
  },
  "first-missing-positive": {
    java: `public int firstMissingPositive(int[] nums) {
    int n = nums.length;
    for (int i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && 
               nums[nums[i] - 1] != nums[i]) {
            int temp = nums[nums[i] - 1];
            nums[nums[i] - 1] = nums[i];
            nums[i] = temp;
        }
    }
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) return i + 1;
    }
    return n + 1;
}`,
    python: `def first_missing_positive(nums):
    n = len(nums)
    for i in range(n):
        while 0 < nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            nums[nums[i] - 1], nums[i] = nums[i], nums[nums[i] - 1]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1`,
    javascript: `function firstMissingPositive(nums) {
    const n = nums.length;
    for (let i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && 
               nums[nums[i] - 1] !== nums[i]) {
            [nums[nums[i] - 1], nums[i]] = [nums[i], nums[nums[i] - 1]];
        }
    }
    for (let i = 0; i < n; i++) {
        if (nums[i] !== i + 1) return i + 1;
    }
    return n + 1;
}`,
    typescript: `function firstMissingPositive(nums: number[]): number {
    const n: number = nums.length;
    for (let i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && 
               nums[nums[i] - 1] !== nums[i]) {
            [nums[nums[i] - 1], nums[i]] = [nums[i], nums[nums[i] - 1]];
        }
    }
    for (let i = 0; i < n; i++) {
        if (nums[i] !== i + 1) return i + 1;
    }
    return n + 1;
}`,
    csharp: `public int FirstMissingPositive(int[] nums) {
    int n = nums.Length;
    for (int i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && 
               nums[nums[i] - 1] != nums[i]) {
            int temp = nums[nums[i] - 1];
            nums[nums[i] - 1] = nums[i];
            nums[i] = temp;
        }
    }
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) return i + 1;
    }
    return n + 1;
}`,
    cpp: `int firstMissingPositive(vector<int>& nums) {
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        while (nums[i] > 0 && nums[i] <= n && 
               nums[nums[i] - 1] != nums[i]) {
            swap(nums[i], nums[nums[i] - 1]);
        }
    }
    for (int i = 0; i < n; i++) {
        if (nums[i] != i + 1) return i + 1;
    }
    return n + 1;
}`,
    go: `func firstMissingPositive(nums []int) int {
    n := len(nums)
    for i := 0; i < n; i++ {
        for nums[i] > 0 && nums[i] <= n && 
            nums[nums[i]-1] != nums[i] {
            nums[nums[i]-1], nums[i] = nums[i], nums[nums[i]-1]
        }
    }
    for i := 0; i < n; i++ {
        if nums[i] != i+1 {
            return i + 1
        }
    }
    return n + 1
}`
  }
};
