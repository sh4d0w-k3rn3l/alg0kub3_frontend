// Additional Graph Algorithms Code

export const additionalGraphCode = {
  "is-bipartite": {
    java: `public boolean isBipartite(int[][] graph) {
    int n = graph.length;
    int[] colors = new int[n];
    for (int i = 0; i < n; i++) {
        if (colors[i] == 0 && !dfs(graph, colors, i, 1)) return false;
    }
    return true;
}
private boolean dfs(int[][] graph, int[] colors, int node, int color) {
    colors[node] = color;
    for (int neighbor : graph[node]) {
        if (colors[neighbor] == color) return false;
        if (colors[neighbor] == 0 && !dfs(graph, colors, neighbor, -color)) return false;
    }
    return true;
}`,
    python: `def isBipartite(graph):
    n = len(graph)
    colors = [0] * n
    def dfs(node, color):
        colors[node] = color
        for neighbor in graph[node]:
            if colors[neighbor] == color: return False
            if colors[neighbor] == 0 and not dfs(neighbor, -color): return False
        return True
    for i in range(n):
        if colors[i] == 0 and not dfs(i, 1): return False
    return True`,
    javascript: `function isBipartite(graph) {
    const n = graph.length, colors = new Array(n).fill(0);
    const dfs = (node, color) => {
        colors[node] = color;
        for (const neighbor of graph[node]) {
            if (colors[neighbor] === color) return false;
            if (colors[neighbor] === 0 && !dfs(neighbor, -color)) return false;
        }
        return true;
    };
    for (let i = 0; i < n; i++) {
        if (colors[i] === 0 && !dfs(i, 1)) return false;
    }
    return true;
}`
  },
  "find-eventual-safe-states": {
    java: `public List<Integer> eventualSafeNodes(int[][] graph) {
    int n = graph.length;
    int[] state = new int[n]; // 0=unvisited, 1=visiting, 2=safe
    List<Integer> result = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        if (isSafe(graph, state, i)) result.add(i);
    }
    return result;
}
private boolean isSafe(int[][] graph, int[] state, int node) {
    if (state[node] > 0) return state[node] == 2;
    state[node] = 1;
    for (int neighbor : graph[node]) {
        if (!isSafe(graph, state, neighbor)) return false;
    }
    state[node] = 2;
    return true;
}`,
    python: `def eventualSafeNodes(graph):
    n = len(graph)
    state = [0] * n
    def is_safe(node):
        if state[node] > 0: return state[node] == 2
        state[node] = 1
        for neighbor in graph[node]:
            if not is_safe(neighbor): return False
        state[node] = 2
        return True
    return [i for i in range(n) if is_safe(i)]`,
    javascript: `function eventualSafeNodes(graph) {
    const n = graph.length, state = new Array(n).fill(0);
    const isSafe = (node) => {
        if (state[node] > 0) return state[node] === 2;
        state[node] = 1;
        for (const neighbor of graph[node]) {
            if (!isSafe(neighbor)) return false;
        }
        state[node] = 2;
        return true;
    };
    return [...Array(n).keys()].filter(i => isSafe(i));
}`
  },
  "minimize-malware-spread": {
    java: `public int minMalwareSpread(int[][] graph, int[] initial) {
    int n = graph.length;
    int[] parent = new int[n], size = new int[n];
    for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (graph[i][j] == 1) union(parent, size, i, j);
        }
    }
    
    int[] malwareCount = new int[n];
    for (int node : initial) malwareCount[find(parent, node)]++;
    
    int result = Integer.MAX_VALUE, maxSize = 0;
    for (int node : initial) {
        int root = find(parent, node);
        if (malwareCount[root] == 1) {
            if (size[root] > maxSize || (size[root] == maxSize && node < result)) {
                maxSize = size[root];
                result = node;
            }
        }
    }
    
    if (result == Integer.MAX_VALUE) {
        result = initial[0];
        for (int node : initial) result = Math.min(result, node);
    }
    return result;
}
private int find(int[] parent, int x) {
    if (parent[x] != x) parent[x] = find(parent, parent[x]);
    return parent[x];
}
private void union(int[] parent, int[] size, int x, int y) {
    int px = find(parent, x), py = find(parent, y);
    if (px != py) {
        if (size[px] < size[py]) { int t = px; px = py; py = t; }
        parent[py] = px;
        size[px] += size[py];
    }
}`,
    python: `def minMalwareSpread(graph, initial):
    n = len(graph)
    parent = list(range(n))
    size = [1] * n
    
    def find(x):
        if parent[x] != x: parent[x] = find(parent[x])
        return parent[x]
    
    def union(x, y):
        px, py = find(x), find(y)
        if px != py:
            if size[px] < size[py]: px, py = py, px
            parent[py] = px
            size[px] += size[py]
    
    for i in range(n):
        for j in range(i + 1, n):
            if graph[i][j]: union(i, j)
    
    from collections import Counter
    malware_count = Counter(find(node) for node in initial)
    
    result, max_size = min(initial), 0
    for node in initial:
        root = find(node)
        if malware_count[root] == 1:
            if size[root] > max_size or (size[root] == max_size and node < result):
                max_size, result = size[root], node
    return result`,
    javascript: `function minMalwareSpread(graph, initial) {
    const n = graph.length;
    const parent = [...Array(n).keys()], size = new Array(n).fill(1);
    
    const find = (x) => parent[x] === x ? x : parent[x] = find(parent[x]);
    const union = (x, y) => {
        let px = find(x), py = find(y);
        if (px !== py) {
            if (size[px] < size[py]) [px, py] = [py, px];
            parent[py] = px;
            size[px] += size[py];
        }
    };
    
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            if (graph[i][j]) union(i, j);
    
    const malwareCount = {};
    for (const node of initial) {
        const root = find(node);
        malwareCount[root] = (malwareCount[root] || 0) + 1;
    }
    
    let result = Math.min(...initial), maxSize = 0;
    for (const node of initial) {
        const root = find(node);
        if (malwareCount[root] === 1) {
            if (size[root] > maxSize || (size[root] === maxSize && node < result)) {
                maxSize = size[root];
                result = node;
            }
        }
    }
    return result;
}`
  },
  "minimum-height-trees": {
    java: `public List<Integer> findMinHeightTrees(int n, int[][] edges) {
    if (n == 1) return Arrays.asList(0);
    List<Set<Integer>> adj = new ArrayList<>();
    for (int i = 0; i < n; i++) adj.add(new HashSet<>());
    for (int[] e : edges) {
        adj.get(e[0]).add(e[1]);
        adj.get(e[1]).add(e[0]);
    }
    List<Integer> leaves = new ArrayList<>();
    for (int i = 0; i < n; i++) {
        if (adj.get(i).size() == 1) leaves.add(i);
    }
    int remaining = n;
    while (remaining > 2) {
        remaining -= leaves.size();
        List<Integer> newLeaves = new ArrayList<>();
        for (int leaf : leaves) {
            int neighbor = adj.get(leaf).iterator().next();
            adj.get(neighbor).remove(leaf);
            if (adj.get(neighbor).size() == 1) newLeaves.add(neighbor);
        }
        leaves = newLeaves;
    }
    return leaves;
}`,
    python: `def findMinHeightTrees(n, edges):
    if n == 1: return [0]
    adj = [set() for _ in range(n)]
    for u, v in edges:
        adj[u].add(v)
        adj[v].add(u)
    leaves = [i for i in range(n) if len(adj[i]) == 1]
    remaining = n
    while remaining > 2:
        remaining -= len(leaves)
        new_leaves = []
        for leaf in leaves:
            neighbor = adj[leaf].pop()
            adj[neighbor].remove(leaf)
            if len(adj[neighbor]) == 1: new_leaves.append(neighbor)
        leaves = new_leaves
    return leaves`,
    javascript: `function findMinHeightTrees(n, edges) {
    if (n === 1) return [0];
    const adj = Array.from({length: n}, () => new Set());
    for (const [u, v] of edges) { adj[u].add(v); adj[v].add(u); }
    let leaves = [];
    for (let i = 0; i < n; i++) if (adj[i].size === 1) leaves.push(i);
    let remaining = n;
    while (remaining > 2) {
        remaining -= leaves.length;
        const newLeaves = [];
        for (const leaf of leaves) {
            const neighbor = [...adj[leaf]][0];
            adj[neighbor].delete(leaf);
            if (adj[neighbor].size === 1) newLeaves.push(neighbor);
        }
        leaves = newLeaves;
    }
    return leaves;
}`
  },
  "number-of-provinces": {
    java: `public int findCircleNum(int[][] isConnected) {
    int n = isConnected.length, provinces = 0;
    boolean[] visited = new boolean[n];
    for (int i = 0; i < n; i++) {
        if (!visited[i]) {
            dfs(isConnected, visited, i);
            provinces++;
        }
    }
    return provinces;
}
private void dfs(int[][] isConnected, boolean[] visited, int city) {
    visited[city] = true;
    for (int j = 0; j < isConnected.length; j++) {
        if (isConnected[city][j] == 1 && !visited[j]) dfs(isConnected, visited, j);
    }
}`,
    python: `def findCircleNum(isConnected):
    n = len(isConnected)
    visited = [False] * n
    provinces = 0
    def dfs(city):
        visited[city] = True
        for j in range(n):
            if isConnected[city][j] == 1 and not visited[j]:
                dfs(j)
    for i in range(n):
        if not visited[i]:
            dfs(i)
            provinces += 1
    return provinces`,
    javascript: `function findCircleNum(isConnected) {
    const n = isConnected.length, visited = new Array(n).fill(false);
    let provinces = 0;
    const dfs = (city) => {
        visited[city] = true;
        for (let j = 0; j < n; j++) {
            if (isConnected[city][j] === 1 && !visited[j]) dfs(j);
        }
    };
    for (let i = 0; i < n; i++) {
        if (!visited[i]) { dfs(i); provinces++; }
    }
    return provinces;
}`
  },
  "redundant-connection": {
    java: `public int[] findRedundantConnection(int[][] edges) {
    int n = edges.length;
    int[] parent = new int[n + 1];
    for (int i = 1; i <= n; i++) parent[i] = i;
    for (int[] edge : edges) {
        int p1 = find(parent, edge[0]), p2 = find(parent, edge[1]);
        if (p1 == p2) return edge;
        parent[p1] = p2;
    }
    return new int[0];
}
private int find(int[] parent, int x) {
    if (parent[x] != x) parent[x] = find(parent, parent[x]);
    return parent[x];
}`,
    python: `def findRedundantConnection(edges):
    parent = list(range(len(edges) + 1))
    def find(x):
        if parent[x] != x: parent[x] = find(parent[x])
        return parent[x]
    for u, v in edges:
        pu, pv = find(u), find(v)
        if pu == pv: return [u, v]
        parent[pu] = pv
    return []`,
    javascript: `function findRedundantConnection(edges) {
    const parent = [...Array(edges.length + 1).keys()];
    const find = (x) => parent[x] === x ? x : parent[x] = find(parent[x]);
    for (const [u, v] of edges) {
        const pu = find(u), pv = find(v);
        if (pu === pv) return [u, v];
        parent[pu] = pv;
    }
    return [];
}`
  },
  "min-cost-connect-points": {
    java: `public int minCostConnectPoints(int[][] points) {
    int n = points.length;
    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[0] - b[0]);
    boolean[] visited = new boolean[n];
    pq.offer(new int[]{0, 0});
    int cost = 0, edges = 0;
    while (edges < n) {
        int[] curr = pq.poll();
        if (visited[curr[1]]) continue;
        visited[curr[1]] = true;
        cost += curr[0];
        edges++;
        for (int i = 0; i < n; i++) {
            if (!visited[i]) {
                int dist = Math.abs(points[curr[1]][0] - points[i][0]) + 
                           Math.abs(points[curr[1]][1] - points[i][1]);
                pq.offer(new int[]{dist, i});
            }
        }
    }
    return cost;
}`,
    python: `def minCostConnectPoints(points):
    import heapq
    n = len(points)
    visited = [False] * n
    heap = [(0, 0)]
    cost = edges = 0
    while edges < n:
        d, i = heapq.heappop(heap)
        if visited[i]: continue
        visited[i] = True
        cost += d
        edges += 1
        for j in range(n):
            if not visited[j]:
                dist = abs(points[i][0] - points[j][0]) + abs(points[i][1] - points[j][1])
                heapq.heappush(heap, (dist, j))
    return cost`,
    javascript: `function minCostConnectPoints(points) {
    const n = points.length, visited = new Array(n).fill(false);
    const heap = [[0, 0]];
    let cost = 0, edges = 0;
    while (edges < n) {
        heap.sort((a, b) => a[0] - b[0]);
        const [d, i] = heap.shift();
        if (visited[i]) continue;
        visited[i] = true;
        cost += d;
        edges++;
        for (let j = 0; j < n; j++) {
            if (!visited[j]) {
                const dist = Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);
                heap.push([dist, j]);
            }
        }
    }
    return cost;
}`
  },
  "word-ladder": {
    java: `public int ladderLength(String beginWord, String endWord, List<String> wordList) {
    Set<String> words = new HashSet<>(wordList);
    if (!words.contains(endWord)) return 0;
    Queue<String> queue = new LinkedList<>();
    queue.offer(beginWord);
    int level = 1;
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            String word = queue.poll();
            char[] chars = word.toCharArray();
            for (int j = 0; j < chars.length; j++) {
                char original = chars[j];
                for (char c = 'a'; c <= 'z'; c++) {
                    chars[j] = c;
                    String newWord = new String(chars);
                    if (newWord.equals(endWord)) return level + 1;
                    if (words.contains(newWord)) {
                        words.remove(newWord);
                        queue.offer(newWord);
                    }
                }
                chars[j] = original;
            }
        }
        level++;
    }
    return 0;
}`,
    python: `def ladderLength(beginWord, endWord, wordList):
    from collections import deque
    words = set(wordList)
    if endWord not in words: return 0
    queue = deque([beginWord])
    level = 1
    while queue:
        for _ in range(len(queue)):
            word = queue.popleft()
            for i in range(len(word)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    new_word = word[:i] + c + word[i+1:]
                    if new_word == endWord: return level + 1
                    if new_word in words:
                        words.remove(new_word)
                        queue.append(new_word)
        level += 1
    return 0`,
    javascript: `function ladderLength(beginWord, endWord, wordList) {
    const words = new Set(wordList);
    if (!words.has(endWord)) return 0;
    const queue = [beginWord];
    let level = 1;
    while (queue.length) {
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const word = queue.shift();
            for (let j = 0; j < word.length; j++) {
                for (let c = 97; c <= 122; c++) {
                    const newWord = word.slice(0, j) + String.fromCharCode(c) + word.slice(j + 1);
                    if (newWord === endWord) return level + 1;
                    if (words.has(newWord)) {
                        words.delete(newWord);
                        queue.push(newWord);
                    }
                }
            }
        }
        level++;
    }
    return 0;
}`
  },
  "employee-importance": {
    java: `public int getImportance(List<Employee> employees, int id) {
    Map<Integer, Employee> map = new HashMap<>();
    for (Employee e : employees) map.put(e.id, e);
    return dfs(map, id);
}
private int dfs(Map<Integer, Employee> map, int id) {
    Employee e = map.get(id);
    int total = e.importance;
    for (int sub : e.subordinates) total += dfs(map, sub);
    return total;
}`,
    python: `def getImportance(employees, id):
    emp_map = {e.id: e for e in employees}
    def dfs(eid):
        e = emp_map[eid]
        return e.importance + sum(dfs(sub) for sub in e.subordinates)
    return dfs(id)`,
    javascript: `function getImportance(employees, id) {
    const map = new Map(employees.map(e => [e.id, e]));
    const dfs = (eid) => {
        const e = map.get(eid);
        return e.importance + e.subordinates.reduce((sum, sub) => sum + dfs(sub), 0);
    };
    return dfs(id);
}`
  },
  "time-needed-to-inform": {
    java: `public int numOfMinutes(int n, int headID, int[] manager, int[] informTime) {
    List<List<Integer>> children = new ArrayList<>();
    for (int i = 0; i < n; i++) children.add(new ArrayList<>());
    for (int i = 0; i < n; i++) {
        if (manager[i] != -1) children.get(manager[i]).add(i);
    }
    return dfs(headID, children, informTime);
}
private int dfs(int node, List<List<Integer>> children, int[] informTime) {
    int maxTime = 0;
    for (int child : children.get(node)) {
        maxTime = Math.max(maxTime, dfs(child, children, informTime));
    }
    return informTime[node] + maxTime;
}`,
    python: `def numOfMinutes(n, headID, manager, informTime):
    from collections import defaultdict
    children = defaultdict(list)
    for i, m in enumerate(manager):
        if m != -1: children[m].append(i)
    def dfs(node):
        return informTime[node] + max([dfs(c) for c in children[node]] or [0])
    return dfs(headID)`,
    javascript: `function numOfMinutes(n, headID, manager, informTime) {
    const children = Array.from({length: n}, () => []);
    for (let i = 0; i < n; i++) {
        if (manager[i] !== -1) children[manager[i]].push(i);
    }
    const dfs = (node) => {
        return informTime[node] + Math.max(0, ...children[node].map(dfs));
    };
    return dfs(headID);
}`
  }
};
