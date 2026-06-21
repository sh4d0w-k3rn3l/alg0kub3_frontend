// Intervals algorithm implementations

export const intervalsCode = {
  "merge-intervals": {
    java: `public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
    List<int[]> result = new ArrayList<>();
    for (int[] interval : intervals) {
        if (result.isEmpty() || result.get(result.size() - 1)[1] < interval[0]) {
            result.add(interval);
        } else {
            result.get(result.size() - 1)[1] = Math.max(result.get(result.size() - 1)[1], interval[1]);
        }
    }
    return result.toArray(new int[result.size()][]);
}`,
    python: `def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    result = []
    for interval in intervals:
        if not result or result[-1][1] < interval[0]:
            result.append(interval)
        else:
            result[-1][1] = max(result[-1][1], interval[1])
    return result`,
    javascript: `function merge(intervals) {
    intervals.sort((a, b) => a[0] - b[0]);
    const result = [];
    for (const interval of intervals) {
        if (!result.length || result[result.length - 1][1] < interval[0]) {
            result.push(interval);
        } else {
            result[result.length - 1][1] = Math.max(result[result.length - 1][1], interval[1]);
        }
    }
    return result;
}`,
    typescript: `function merge(intervals: number[][]): number[][] {
    intervals.sort((a, b) => a[0] - b[0]);
    const result: number[][] = [];
    for (const interval of intervals) {
        if (!result.length || result[result.length - 1][1] < interval[0]) {
            result.push(interval);
        } else {
            result[result.length - 1][1] = Math.max(result[result.length - 1][1], interval[1]);
        }
    }
    return result;
}`,
    csharp: `public int[][] Merge(int[][] intervals) {
    Array.Sort(intervals, (a, b) => a[0] - b[0]);
    var result = new List<int[]>();
    foreach (var interval in intervals) {
        if (result.Count == 0 || result[result.Count - 1][1] < interval[0]) {
            result.Add(interval);
        } else {
            result[result.Count - 1][1] = Math.Max(result[result.Count - 1][1], interval[1]);
        }
    }
    return result.ToArray();
}`,
    cpp: `vector<vector<int>> merge(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end());
    vector<vector<int>> result;
    for (auto& interval : intervals) {
        if (result.empty() || result.back()[1] < interval[0]) {
            result.push_back(interval);
        } else {
            result.back()[1] = max(result.back()[1], interval[1]);
        }
    }
    return result;
}`,
    go: `func merge(intervals [][]int) [][]int {
    sort.Slice(intervals, func(i, j int) bool { return intervals[i][0] < intervals[j][0] })
    result := [][]int{}
    for _, interval := range intervals {
        if len(result) == 0 || result[len(result)-1][1] < interval[0] {
            result = append(result, interval)
        } else if result[len(result)-1][1] < interval[1] {
            result[len(result)-1][1] = interval[1]
        }
    }
    return result
}`
  },
  "insert-interval": {
    java: `public int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> result = new ArrayList<>();
    int i = 0, n = intervals.length;
    while (i < n && intervals[i][1] < newInterval[0]) result.add(intervals[i++]);
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.add(newInterval);
    while (i < n) result.add(intervals[i++]);
    return result.toArray(new int[result.size()][]);
}`,
    python: `def insert(intervals, newInterval):
    result = []
    i, n = 0, len(intervals)
    while i < n and intervals[i][1] < newInterval[0]:
        result.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= newInterval[1]:
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i += 1
    result.append(newInterval)
    while i < n: result.append(intervals[i]); i += 1
    return result`,
    javascript: `function insert(intervals, newInterval) {
    const result = [];
    let i = 0, n = intervals.length;
    while (i < n && intervals[i][1] < newInterval[0]) result.push(intervals[i++]);
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.push(newInterval);
    while (i < n) result.push(intervals[i++]);
    return result;
}`,
    typescript: `function insert(intervals: number[][], newInterval: number[]): number[][] {
    const result: number[][] = [];
    let i: number = 0, n: number = intervals.length;
    while (i < n && intervals[i][1] < newInterval[0]) result.push(intervals[i++]);
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.push(newInterval);
    while (i < n) result.push(intervals[i++]);
    return result;
}`,
    csharp: `public int[][] Insert(int[][] intervals, int[] newInterval) {
    var result = new List<int[]>();
    int i = 0, n = intervals.Length;
    while (i < n && intervals[i][1] < newInterval[0]) result.Add(intervals[i++]);
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = Math.Min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.Max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.Add(newInterval);
    while (i < n) result.Add(intervals[i++]);
    return result.ToArray();
}`,
    cpp: `vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
    vector<vector<int>> result;
    int i = 0, n = intervals.size();
    while (i < n && intervals[i][1] < newInterval[0]) result.push_back(intervals[i++]);
    while (i < n && intervals[i][0] <= newInterval[1]) {
        newInterval[0] = min(newInterval[0], intervals[i][0]);
        newInterval[1] = max(newInterval[1], intervals[i][1]);
        i++;
    }
    result.push_back(newInterval);
    while (i < n) result.push_back(intervals[i++]);
    return result;
}`,
    go: `func insert(intervals [][]int, newInterval []int) [][]int {
    result := [][]int{}
    i, n := 0, len(intervals)
    for i < n && intervals[i][1] < newInterval[0] { result = append(result, intervals[i]); i++ }
    for i < n && intervals[i][0] <= newInterval[1] {
        newInterval[0] = min(newInterval[0], intervals[i][0])
        newInterval[1] = max(newInterval[1], intervals[i][1])
        i++
    }
    result = append(result, newInterval)
    for i < n { result = append(result, intervals[i]); i++ }
    return result
}`
  },
  "minimum-arrows-to-burst-balloons": {
    java: `public int findMinArrowShots(int[][] points) {
    Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));
    int arrows = 1, end = points[0][1];
    for (int i = 1; i < points.length; i++) {
        if (points[i][0] > end) { arrows++; end = points[i][1]; }
    }
    return arrows;
}`,
    python: `def findMinArrowShots(points):
    points.sort(key=lambda x: x[1])
    arrows, end = 1, points[0][1]
    for i in range(1, len(points)):
        if points[i][0] > end:
            arrows += 1
            end = points[i][1]
    return arrows`,
    javascript: `function findMinArrowShots(points) {
    points.sort((a, b) => a[1] - b[1]);
    let arrows = 1, end = points[0][1];
    for (let i = 1; i < points.length; i++) {
        if (points[i][0] > end) { arrows++; end = points[i][1]; }
    }
    return arrows;
}`,
    typescript: `function findMinArrowShots(points: number[][]): number {
    points.sort((a, b) => a[1] - b[1]);
    let arrows: number = 1, end: number = points[0][1];
    for (let i = 1; i < points.length; i++) {
        if (points[i][0] > end) { arrows++; end = points[i][1]; }
    }
    return arrows;
}`,
    csharp: `public int FindMinArrowShots(int[][] points) {
    Array.Sort(points, (a, b) => a[1].CompareTo(b[1]));
    int arrows = 1, end = points[0][1];
    for (int i = 1; i < points.Length; i++) {
        if (points[i][0] > end) { arrows++; end = points[i][1]; }
    }
    return arrows;
}`,
    cpp: `int findMinArrowShots(vector<vector<int>>& points) {
    sort(points.begin(), points.end(), [](auto& a, auto& b) { return a[1] < b[1]; });
    int arrows = 1, end = points[0][1];
    for (int i = 1; i < points.size(); i++) {
        if (points[i][0] > end) { arrows++; end = points[i][1]; }
    }
    return arrows;
}`,
    go: `func findMinArrowShots(points [][]int) int {
    sort.Slice(points, func(i, j int) bool { return points[i][1] < points[j][1] })
    arrows, end := 1, points[0][1]
    for i := 1; i < len(points); i++ {
        if points[i][0] > end { arrows++; end = points[i][1] }
    }
    return arrows
}`
  },
  "non-overlapping-intervals": {
    java: `public int eraseOverlapIntervals(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> a[1] - b[1]);
    int count = 0, end = Integer.MIN_VALUE;
    for (int[] interval : intervals) {
        if (interval[0] >= end) end = interval[1];
        else count++;
    }
    return count;
}`,
    python: `def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda x: x[1])
    count, end = 0, float('-inf')
    for interval in intervals:
        if interval[0] >= end: end = interval[1]
        else: count += 1
    return count`,
    javascript: `function eraseOverlapIntervals(intervals) {
    intervals.sort((a, b) => a[1] - b[1]);
    let count = 0, end = -Infinity;
    for (const interval of intervals) {
        if (interval[0] >= end) end = interval[1];
        else count++;
    }
    return count;
}`,
    typescript: `function eraseOverlapIntervals(intervals: number[][]): number {
    intervals.sort((a, b) => a[1] - b[1]);
    let count: number = 0, end: number = -Infinity;
    for (const interval of intervals) {
        if (interval[0] >= end) end = interval[1];
        else count++;
    }
    return count;
}`,
    csharp: `public int EraseOverlapIntervals(int[][] intervals) {
    Array.Sort(intervals, (a, b) => a[1] - b[1]);
    int count = 0, end = int.MinValue;
    foreach (var interval in intervals) {
        if (interval[0] >= end) end = interval[1];
        else count++;
    }
    return count;
}`,
    cpp: `int eraseOverlapIntervals(vector<vector<int>>& intervals) {
    sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[1] < b[1]; });
    int count = 0, end = INT_MIN;
    for (auto& interval : intervals) {
        if (interval[0] >= end) end = interval[1];
        else count++;
    }
    return count;
}`,
    go: `func eraseOverlapIntervals(intervals [][]int) int {
    sort.Slice(intervals, func(i, j int) bool { return intervals[i][1] < intervals[j][1] })
    count, end := 0, -1<<31
    for _, interval := range intervals {
        if interval[0] >= end { end = interval[1] } else { count++ }
    }
    return count
}`
  }
};
