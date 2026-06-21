// Additional DP Algorithms Code

export const additionalDpCode = {
  "burst-balloons": {
    java: `public int maxCoins(int[] nums) {
    int n = nums.length;
    int[] arr = new int[n + 2];
    arr[0] = arr[n + 1] = 1;
    for (int i = 0; i < n; i++) arr[i + 1] = nums[i];
    
    int[][] dp = new int[n + 2][n + 2];
    for (int len = 1; len <= n; len++) {
        for (int left = 1; left <= n - len + 1; left++) {
            int right = left + len - 1;
            for (int k = left; k <= right; k++) {
                dp[left][right] = Math.max(dp[left][right],
                    dp[left][k - 1] + arr[left - 1] * arr[k] * arr[right + 1] + dp[k + 1][right]);
            }
        }
    }
    return dp[1][n];
}`,
    python: `def maxCoins(nums):
    n = len(nums)
    arr = [1] + nums + [1]
    dp = [[0] * (n + 2) for _ in range(n + 2)]
    
    for length in range(1, n + 1):
        for left in range(1, n - length + 2):
            right = left + length - 1
            for k in range(left, right + 1):
                dp[left][right] = max(dp[left][right],
                    dp[left][k - 1] + arr[left - 1] * arr[k] * arr[right + 1] + dp[k + 1][right])
    return dp[1][n]`,
    javascript: `function maxCoins(nums) {
    const n = nums.length;
    const arr = [1, ...nums, 1];
    const dp = Array.from({length: n + 2}, () => new Array(n + 2).fill(0));
    
    for (let len = 1; len <= n; len++) {
        for (let left = 1; left <= n - len + 1; left++) {
            const right = left + len - 1;
            for (let k = left; k <= right; k++) {
                dp[left][right] = Math.max(dp[left][right],
                    dp[left][k - 1] + arr[left - 1] * arr[k] * arr[right + 1] + dp[k + 1][right]);
            }
        }
    }
    return dp[1][n];
}`
  },
  "count-square-submatrices": {
    java: `public int countSquares(int[][] matrix) {
    int m = matrix.length, n = matrix[0].length, count = 0;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (matrix[i][j] == 1 && i > 0 && j > 0) {
                matrix[i][j] = Math.min(matrix[i-1][j-1], 
                    Math.min(matrix[i-1][j], matrix[i][j-1])) + 1;
            }
            count += matrix[i][j];
        }
    }
    return count;
}`,
    python: `def countSquares(matrix):
    m, n = len(matrix), len(matrix[0])
    count = 0
    for i in range(m):
        for j in range(n):
            if matrix[i][j] == 1 and i > 0 and j > 0:
                matrix[i][j] = min(matrix[i-1][j-1], matrix[i-1][j], matrix[i][j-1]) + 1
            count += matrix[i][j]
    return count`,
    javascript: `function countSquares(matrix) {
    const m = matrix.length, n = matrix[0].length;
    let count = 0;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] === 1 && i > 0 && j > 0) {
                matrix[i][j] = Math.min(matrix[i-1][j-1], matrix[i-1][j], matrix[i][j-1]) + 1;
            }
            count += matrix[i][j];
        }
    }
    return count;
}`
  },
  "decode-ways": {
    java: `public int numDecodings(String s) {
    if (s.charAt(0) == '0') return 0;
    int n = s.length();
    int prev2 = 1, prev1 = 1;
    for (int i = 1; i < n; i++) {
        int curr = 0;
        if (s.charAt(i) != '0') curr = prev1;
        int twoDigit = Integer.parseInt(s.substring(i - 1, i + 1));
        if (twoDigit >= 10 && twoDigit <= 26) curr += prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
    python: `def numDecodings(s):
    if s[0] == '0': return 0
    prev2, prev1 = 1, 1
    for i in range(1, len(s)):
        curr = 0
        if s[i] != '0': curr = prev1
        two_digit = int(s[i-1:i+1])
        if 10 <= two_digit <= 26: curr += prev2
        prev2, prev1 = prev1, curr
    return prev1`,
    javascript: `function numDecodings(s) {
    if (s[0] === '0') return 0;
    let prev2 = 1, prev1 = 1;
    for (let i = 1; i < s.length; i++) {
        let curr = 0;
        if (s[i] !== '0') curr = prev1;
        const twoDigit = parseInt(s.slice(i - 1, i + 1));
        if (twoDigit >= 10 && twoDigit <= 26) curr += prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`
  },
  "distinct-subsequences": {
    java: `public int numDistinct(String s, String t) {
    int m = s.length(), n = t.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 0; i <= m; i++) dp[i][0] = 1;
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            dp[i][j] = dp[i - 1][j];
            if (s.charAt(i - 1) == t.charAt(j - 1)) {
                dp[i][j] += dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`,
    python: `def numDistinct(s, t):
    m, n = len(s), len(t)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1): dp[i][0] = 1
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i - 1][j]
            if s[i - 1] == t[j - 1]:
                dp[i][j] += dp[i - 1][j - 1]
    return dp[m][n]`,
    javascript: `function numDistinct(s, t) {
    const m = s.length, n = t.length;
    const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = 1;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = dp[i - 1][j];
            if (s[i - 1] === t[j - 1]) dp[i][j] += dp[i - 1][j - 1];
        }
    }
    return dp[m][n];
}`
  },
  "last-stone-weight-ii": {
    java: `public int lastStoneWeightII(int[] stones) {
    int sum = 0;
    for (int s : stones) sum += s;
    int target = sum / 2;
    boolean[] dp = new boolean[target + 1];
    dp[0] = true;
    for (int stone : stones) {
        for (int i = target; i >= stone; i--) {
            dp[i] = dp[i] || dp[i - stone];
        }
    }
    for (int i = target; i >= 0; i--) {
        if (dp[i]) return sum - 2 * i;
    }
    return 0;
}`,
    python: `def lastStoneWeightII(stones):
    total = sum(stones)
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True
    for stone in stones:
        for i in range(target, stone - 1, -1):
            dp[i] = dp[i] or dp[i - stone]
    for i in range(target, -1, -1):
        if dp[i]: return total - 2 * i`,
    javascript: `function lastStoneWeightII(stones) {
    const sum = stones.reduce((a, b) => a + b);
    const target = Math.floor(sum / 2);
    const dp = new Array(target + 1).fill(false);
    dp[0] = true;
    for (const stone of stones) {
        for (let i = target; i >= stone; i--) {
            dp[i] = dp[i] || dp[i - stone];
        }
    }
    for (let i = target; i >= 0; i--) {
        if (dp[i]) return sum - 2 * i;
    }
}`
  },
  "longest-palindromic-subsequence": {
    java: `public int longestPalindromeSubseq(String s) {
    int n = s.length();
    int[][] dp = new int[n][n];
    for (int i = n - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (int j = i + 1; j < n; j++) {
            if (s.charAt(i) == s.charAt(j)) {
                dp[i][j] = dp[i + 1][j - 1] + 2;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[0][n - 1];
}`,
    python: `def longestPalindromeSubseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        dp[i][i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])
    return dp[0][n - 1]`,
    javascript: `function longestPalindromeSubseq(s) {
    const n = s.length;
    const dp = Array.from({length: n}, () => new Array(n).fill(0));
    for (let i = n - 1; i >= 0; i--) {
        dp[i][i] = 1;
        for (let j = i + 1; j < n; j++) {
            if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;
            else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);
        }
    }
    return dp[0][n - 1];
}`
  },
  "maximum-points-with-cost": {
    java: `public long maxPoints(int[][] points) {
    int m = points.length, n = points[0].length;
    long[] prev = new long[n];
    for (int j = 0; j < n; j++) prev[j] = points[0][j];
    
    for (int i = 1; i < m; i++) {
        long[] left = new long[n], right = new long[n], curr = new long[n];
        left[0] = prev[0];
        for (int j = 1; j < n; j++) left[j] = Math.max(left[j - 1] - 1, prev[j]);
        right[n - 1] = prev[n - 1];
        for (int j = n - 2; j >= 0; j--) right[j] = Math.max(right[j + 1] - 1, prev[j]);
        for (int j = 0; j < n; j++) curr[j] = points[i][j] + Math.max(left[j], right[j]);
        prev = curr;
    }
    
    long max = 0;
    for (long v : prev) max = Math.max(max, v);
    return max;
}`,
    python: `def maxPoints(points):
    m, n = len(points), len(points[0])
    prev = points[0][:]
    
    for i in range(1, m):
        left, right = [0] * n, [0] * n
        left[0] = prev[0]
        for j in range(1, n): left[j] = max(left[j - 1] - 1, prev[j])
        right[n - 1] = prev[n - 1]
        for j in range(n - 2, -1, -1): right[j] = max(right[j + 1] - 1, prev[j])
        prev = [points[i][j] + max(left[j], right[j]) for j in range(n)]
    
    return max(prev)`,
    javascript: `function maxPoints(points) {
    const m = points.length, n = points[0].length;
    let prev = [...points[0]];
    
    for (let i = 1; i < m; i++) {
        const left = new Array(n), right = new Array(n), curr = new Array(n);
        left[0] = prev[0];
        for (let j = 1; j < n; j++) left[j] = Math.max(left[j - 1] - 1, prev[j]);
        right[n - 1] = prev[n - 1];
        for (let j = n - 2; j >= 0; j--) right[j] = Math.max(right[j + 1] - 1, prev[j]);
        for (let j = 0; j < n; j++) curr[j] = points[i][j] + Math.max(left[j], right[j]);
        prev = curr;
    }
    
    return Math.max(...prev);
}`
  },
  "maximum-profit-job-scheduling": {
    java: `public int jobScheduling(int[] startTime, int[] endTime, int[] profit) {
    int n = startTime.length;
    int[][] jobs = new int[n][3];
    for (int i = 0; i < n; i++) jobs[i] = new int[]{endTime[i], startTime[i], profit[i]};
    Arrays.sort(jobs, (a, b) -> a[0] - b[0]);
    
    TreeMap<Integer, Integer> dp = new TreeMap<>();
    dp.put(0, 0);
    
    for (int[] job : jobs) {
        int curr = dp.floorEntry(job[1]).getValue() + job[2];
        if (curr > dp.lastEntry().getValue()) {
            dp.put(job[0], curr);
        }
    }
    return dp.lastEntry().getValue();
}`,
    python: `def jobScheduling(startTime, endTime, profit):
    import bisect
    jobs = sorted(zip(endTime, startTime, profit))
    dp = [(0, 0)]  # (end_time, max_profit)
    
    for end, start, p in jobs:
        i = bisect.bisect_right(dp, (start, float('inf'))) - 1
        curr = dp[i][1] + p
        if curr > dp[-1][1]:
            dp.append((end, curr))
    
    return dp[-1][1]`,
    javascript: `function jobScheduling(startTime, endTime, profit) {
    const n = startTime.length;
    const jobs = [];
    for (let i = 0; i < n; i++) jobs.push([endTime[i], startTime[i], profit[i]]);
    jobs.sort((a, b) => a[0] - b[0]);
    
    const dp = [[0, 0]];
    
    for (const [end, start, p] of jobs) {
        let i = dp.length - 1;
        while (i >= 0 && dp[i][0] > start) i--;
        const curr = dp[i][1] + p;
        if (curr > dp[dp.length - 1][1]) {
            dp.push([end, curr]);
        }
    }
    return dp[dp.length - 1][1];
}`
  },
  "russian-doll-envelopes": {
    java: `public int maxEnvelopes(int[][] envelopes) {
    Arrays.sort(envelopes, (a, b) -> a[0] == b[0] ? b[1] - a[1] : a[0] - b[0]);
    int[] dp = new int[envelopes.length];
    int len = 0;
    for (int[] env : envelopes) {
        int i = Arrays.binarySearch(dp, 0, len, env[1]);
        if (i < 0) i = -(i + 1);
        dp[i] = env[1];
        if (i == len) len++;
    }
    return len;
}`,
    python: `def maxEnvelopes(envelopes):
    import bisect
    envelopes.sort(key=lambda x: (x[0], -x[1]))
    dp = []
    for _, h in envelopes:
        i = bisect.bisect_left(dp, h)
        if i == len(dp): dp.append(h)
        else: dp[i] = h
    return len(dp)`,
    javascript: `function maxEnvelopes(envelopes) {
    envelopes.sort((a, b) => a[0] === b[0] ? b[1] - a[1] : a[0] - b[0]);
    const dp = [];
    for (const [, h] of envelopes) {
        let left = 0, right = dp.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (dp[mid] < h) left = mid + 1;
            else right = mid;
        }
        if (left === dp.length) dp.push(h);
        else dp[left] = h;
    }
    return dp.length;
}`
  },
  "wildcard-matching": {
    java: `public boolean isMatch(String s, String p) {
    int m = s.length(), n = p.length();
    boolean[][] dp = new boolean[m + 1][n + 1];
    dp[0][0] = true;
    for (int j = 1; j <= n; j++) {
        if (p.charAt(j - 1) == '*') dp[0][j] = dp[0][j - 1];
    }
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (p.charAt(j - 1) == '*') {
                dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
            } else if (p.charAt(j - 1) == '?' || s.charAt(i - 1) == p.charAt(j - 1)) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`,
    python: `def isMatch(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        if p[j - 1] == '*': dp[0][j] = dp[0][j - 1]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == '*':
                dp[i][j] = dp[i - 1][j] or dp[i][j - 1]
            elif p[j - 1] == '?' or s[i - 1] == p[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
    return dp[m][n]`,
    javascript: `function isMatch(s, p) {
    const m = s.length, n = p.length;
    const dp = Array.from({length: m + 1}, () => new Array(n + 1).fill(false));
    dp[0][0] = true;
    for (let j = 1; j <= n; j++) {
        if (p[j - 1] === '*') dp[0][j] = dp[0][j - 1];
    }
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (p[j - 1] === '*') {
                dp[i][j] = dp[i - 1][j] || dp[i][j - 1];
            } else if (p[j - 1] === '?' || s[i - 1] === p[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            }
        }
    }
    return dp[m][n];
}`
  }
};
