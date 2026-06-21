// Tree & Graph Algorithms Code

export const treeCode = {
  "binary-tree-level-order": {
    java: `public List<List<Integer>> levelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        List<Integer> level = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            level.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
    }
    return result;
}`,
    python: `def level_order(root):
    if not root: return []
    result, queue = [], [root]
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.pop(0)
            level.append(node.val)
            if node.left: queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result`,
    javascript: `function levelOrder(root) {
    if (!root) return [];
    const result = [], queue = [root];
    while (queue.length) {
        const level = [], size = queue.length;
        for (let i = 0; i < size; i++) {
            const node = queue.shift();
            level.push(node.val);
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
        result.push(level);
    }
    return result;
}`
  },
  "invert-binary-tree": {
    java: `public TreeNode invertTree(TreeNode root) {
    if (root == null) return null;
    TreeNode temp = root.left;
    root.left = invertTree(root.right);
    root.right = invertTree(temp);
    return root;
}`,
    python: `def invert_tree(root):
    if not root: return None
    root.left, root.right = invert_tree(root.right), invert_tree(root.left)
    return root`,
    javascript: `function invertTree(root) {
    if (!root) return null;
    [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
    return root;
}`
  },
  "validate-bst": {
    java: `public boolean isValidBST(TreeNode root) {
    return validate(root, null, null);
}
private boolean validate(TreeNode node, Integer min, Integer max) {
    if (node == null) return true;
    if ((min != null && node.val <= min) || (max != null && node.val >= max)) return false;
    return validate(node.left, min, node.val) && validate(node.right, node.val, max);
}`,
    python: `def is_valid_bst(root):
    def validate(node, min_val, max_val):
        if not node: return True
        if (min_val is not None and node.val <= min_val) or (max_val is not None and node.val >= max_val): return False
        return validate(node.left, min_val, node.val) and validate(node.right, node.val, max_val)
    return validate(root, None, None)`,
    javascript: `function isValidBST(root) {
    const validate = (node, min, max) => {
        if (!node) return true;
        if ((min !== null && node.val <= min) || (max !== null && node.val >= max)) return false;
        return validate(node.left, min, node.val) && validate(node.right, node.val, max);
    };
    return validate(root, null, null);
}`
  },
  "same-tree": {
    java: `public boolean isSameTree(TreeNode p, TreeNode q) {
    if (p == null && q == null) return true;
    if (p == null || q == null || p.val != q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`,
    python: `def is_same_tree(p, q):
    if not p and not q: return True
    if not p or not q or p.val != q.val: return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)`,
    javascript: `function isSameTree(p, q) {
    if (!p && !q) return true;
    if (!p || !q || p.val !== q.val) return false;
    return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);
}`
  },
  "symmetric-tree": {
    java: `public boolean isSymmetric(TreeNode root) {
    return isMirror(root, root);
}
private boolean isMirror(TreeNode t1, TreeNode t2) {
    if (t1 == null && t2 == null) return true;
    if (t1 == null || t2 == null) return false;
    return t1.val == t2.val && isMirror(t1.left, t2.right) && isMirror(t1.right, t2.left);
}`,
    python: `def is_symmetric(root):
    def is_mirror(t1, t2):
        if not t1 and not t2: return True
        if not t1 or not t2: return False
        return t1.val == t2.val and is_mirror(t1.left, t2.right) and is_mirror(t1.right, t2.left)
    return is_mirror(root, root)`,
    javascript: `function isSymmetric(root) {
    const isMirror = (t1, t2) => {
        if (!t1 && !t2) return true;
        if (!t1 || !t2) return false;
        return t1.val === t2.val && isMirror(t1.left, t2.right) && isMirror(t1.right, t2.left);
    };
    return isMirror(root, root);
}`
  },
  "diameter-binary-tree": {
    java: `int diameter = 0;
public int diameterOfBinaryTree(TreeNode root) {
    depth(root);
    return diameter;
}
private int depth(TreeNode node) {
    if (node == null) return 0;
    int left = depth(node.left);
    int right = depth(node.right);
    diameter = Math.max(diameter, left + right);
    return Math.max(left, right) + 1;
}`,
    python: `def diameter_of_binary_tree(root):
    diameter = 0
    def depth(node):
        nonlocal diameter
        if not node: return 0
        left, right = depth(node.left), depth(node.right)
        diameter = max(diameter, left + right)
        return max(left, right) + 1
    depth(root)
    return diameter`,
    javascript: `function diameterOfBinaryTree(root) {
    let diameter = 0;
    const depth = (node) => {
        if (!node) return 0;
        const left = depth(node.left), right = depth(node.right);
        diameter = Math.max(diameter, left + right);
        return Math.max(left, right) + 1;
    };
    depth(root);
    return diameter;
}`
  },
  "lowest-common-ancestor": {
    java: `public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    if (left != null && right != null) return root;
    return left != null ? left : right;
}`,
    python: `def lowest_common_ancestor(root, p, q):
    if not root or root == p or root == q: return root
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    if left and right: return root
    return left if left else right`,
    javascript: `function lowestCommonAncestor(root, p, q) {
    if (!root || root === p || root === q) return root;
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    if (left && right) return root;
    return left || right;
}`
  },
  "binary-tree-preorder": {
    java: `public List<Integer> preorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Stack<TreeNode> stack = new Stack<>();
    if (root != null) stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        result.add(node.val);
        if (node.right != null) stack.push(node.right);
        if (node.left != null) stack.push(node.left);
    }
    return result;
}`,
    python: `def preorder_traversal(root):
    if not root: return []
    result, stack = [], [root]
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right: stack.append(node.right)
        if node.left: stack.append(node.left)
    return result`,
    javascript: `function preorderTraversal(root) {
    if (!root) return [];
    const result = [], stack = [root];
    while (stack.length) {
        const node = stack.pop();
        result.push(node.val);
        if (node.right) stack.push(node.right);
        if (node.left) stack.push(node.left);
    }
    return result;
}`
  },
  "binary-tree-inorder": {
    java: `public List<Integer> inorderTraversal(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    Stack<TreeNode> stack = new Stack<>();
    TreeNode curr = root;
    while (curr != null || !stack.isEmpty()) {
        while (curr != null) { stack.push(curr); curr = curr.left; }
        curr = stack.pop();
        result.add(curr.val);
        curr = curr.right;
    }
    return result;
}`,
    python: `def inorder_traversal(root):
    result, stack, curr = [], [], root
    while curr or stack:
        while curr: stack.append(curr); curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result`,
    javascript: `function inorderTraversal(root) {
    const result = [], stack = [];
    let curr = root;
    while (curr || stack.length) {
        while (curr) { stack.push(curr); curr = curr.left; }
        curr = stack.pop();
        result.push(curr.val);
        curr = curr.right;
    }
    return result;
}`
  },
  "binary-tree-postorder": {
    java: `public List<Integer> postorderTraversal(TreeNode root) {
    LinkedList<Integer> result = new LinkedList<>();
    if (root == null) return result;
    Stack<TreeNode> stack = new Stack<>();
    stack.push(root);
    while (!stack.isEmpty()) {
        TreeNode node = stack.pop();
        result.addFirst(node.val);
        if (node.left != null) stack.push(node.left);
        if (node.right != null) stack.push(node.right);
    }
    return result;
}`,
    python: `def postorder_traversal(root):
    if not root: return []
    result, stack = [], [root]
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.left: stack.append(node.left)
        if node.right: stack.append(node.right)
    return result[::-1]`,
    javascript: `function postorderTraversal(root) {
    if (!root) return [];
    const result = [], stack = [root];
    while (stack.length) {
        const node = stack.pop();
        result.unshift(node.val);
        if (node.left) stack.push(node.left);
        if (node.right) stack.push(node.right);
    }
    return result;
}`
  }
};

export const graphCode = {
  "number-of-islands": {
    java: `public int numIslands(char[][] grid) {
    int count = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == '1') {
                dfs(grid, i, j);
                count++;
            }
        }
    }
    return count;
}
private void dfs(char[][] grid, int i, int j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != '1') return;
    grid[i][j] = '0';
    dfs(grid, i + 1, j); dfs(grid, i - 1, j); dfs(grid, i, j + 1); dfs(grid, i, j - 1);
}`,
    python: `def num_islands(grid):
    def dfs(i, j):
        if i < 0 or i >= len(grid) or j < 0 or j >= len(grid[0]) or grid[i][j] != '1': return
        grid[i][j] = '0'
        dfs(i + 1, j); dfs(i - 1, j); dfs(i, j + 1); dfs(i, j - 1)
    count = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == '1': dfs(i, j); count += 1
    return count`,
    javascript: `function numIslands(grid) {
    const dfs = (i, j) => {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] !== '1') return;
        grid[i][j] = '0';
        dfs(i + 1, j); dfs(i - 1, j); dfs(i, j + 1); dfs(i, j - 1);
    };
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === '1') { dfs(i, j); count++; }
        }
    }
    return count;
}`
  },
  "depth-first-search": {
    java: `public void dfs(int node, boolean[] visited, List<List<Integer>> graph) {
    visited[node] = true;
    System.out.print(node + " ");
    for (int neighbor : graph.get(node)) {
        if (!visited[neighbor]) dfs(neighbor, visited, graph);
    }
}`,
    python: `def dfs(node, visited, graph):
    visited[node] = True
    print(node, end=" ")
    for neighbor in graph[node]:
        if not visited[neighbor]:
            dfs(neighbor, visited, graph)`,
    javascript: `function dfs(node, visited, graph) {
    visited[node] = true;
    console.log(node);
    for (const neighbor of graph[node]) {
        if (!visited[neighbor]) dfs(neighbor, visited, graph);
    }
}`
  },
  "clone-graph": {
    java: `public Node cloneGraph(Node node) {
    if (node == null) return null;
    Map<Node, Node> map = new HashMap<>();
    return dfs(node, map);
}
private Node dfs(Node node, Map<Node, Node> map) {
    if (map.containsKey(node)) return map.get(node);
    Node clone = new Node(node.val);
    map.put(node, clone);
    for (Node neighbor : node.neighbors) {
        clone.neighbors.add(dfs(neighbor, map));
    }
    return clone;
}`,
    python: `def clone_graph(node):
    if not node: return None
    clones = {}
    def dfs(n):
        if n in clones: return clones[n]
        clone = Node(n.val)
        clones[n] = clone
        for neighbor in n.neighbors:
            clone.neighbors.append(dfs(neighbor))
        return clone
    return dfs(node)`,
    javascript: `function cloneGraph(node) {
    if (!node) return null;
    const map = new Map();
    const dfs = (n) => {
        if (map.has(n)) return map.get(n);
        const clone = new Node(n.val);
        map.set(n, clone);
        for (const neighbor of n.neighbors) clone.neighbors.push(dfs(neighbor));
        return clone;
    };
    return dfs(node);
}`
  },
  "rotting-oranges": {
    java: `public int orangesRotting(int[][] grid) {
    Queue<int[]> queue = new LinkedList<>();
    int fresh = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == 2) queue.offer(new int[]{i, j});
            else if (grid[i][j] == 1) fresh++;
        }
    }
    int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};
    int minutes = 0;
    while (!queue.isEmpty() && fresh > 0) {
        minutes++;
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            int[] pos = queue.poll();
            for (int[] d : dirs) {
                int ni = pos[0] + d[0], nj = pos[1] + d[1];
                if (ni >= 0 && ni < grid.length && nj >= 0 && nj < grid[0].length && grid[ni][nj] == 1) {
                    grid[ni][nj] = 2;
                    queue.offer(new int[]{ni, nj});
                    fresh--;
                }
            }
        }
    }
    return fresh == 0 ? minutes : -1;
}`,
    python: `def oranges_rotting(grid):
    from collections import deque
    queue = deque()
    fresh = 0
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == 2: queue.append((i, j))
            elif grid[i][j] == 1: fresh += 1
    dirs = [(1,0),(-1,0),(0,1),(0,-1)]
    minutes = 0
    while queue and fresh > 0:
        minutes += 1
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in dirs:
                nr, nc = r + dr, c + dc
                if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    queue.append((nr, nc))
                    fresh -= 1
    return minutes if fresh == 0 else -1`,
    javascript: `function orangesRotting(grid) {
    const queue = []; let fresh = 0;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] === 2) queue.push([i, j]);
            else if (grid[i][j] === 1) fresh++;
        }
    }
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let minutes = 0;
    while (queue.length && fresh > 0) {
        minutes++;
        const size = queue.length;
        for (let i = 0; i < size; i++) {
            const [r, c] = queue.shift();
            for (const [dr, dc] of dirs) {
                const nr = r + dr, nc = c + dc;
                if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc] === 1) {
                    grid[nr][nc] = 2; queue.push([nr, nc]); fresh--;
                }
            }
        }
    }
    return fresh === 0 ? minutes : -1;
}`
  },
  "course-schedule-ii": {
    java: `public int[] findOrder(int numCourses, int[][] prerequisites) {
    List<List<Integer>> graph = new ArrayList<>();
    int[] indegree = new int[numCourses];
    for (int i = 0; i < numCourses; i++) graph.add(new ArrayList<>());
    for (int[] p : prerequisites) {
        graph.get(p[1]).add(p[0]);
        indegree[p[0]]++;
    }
    Queue<Integer> queue = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) if (indegree[i] == 0) queue.offer(i);
    int[] result = new int[numCourses];
    int idx = 0;
    while (!queue.isEmpty()) {
        int course = queue.poll();
        result[idx++] = course;
        for (int next : graph.get(course)) {
            if (--indegree[next] == 0) queue.offer(next);
        }
    }
    return idx == numCourses ? result : new int[0];
}`,
    python: `def find_order(num_courses, prerequisites):
    from collections import deque
    graph = [[] for _ in range(num_courses)]
    indegree = [0] * num_courses
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        indegree[course] += 1
    queue = deque([i for i in range(num_courses) if indegree[i] == 0])
    result = []
    while queue:
        course = queue.popleft()
        result.append(course)
        for next_course in graph[course]:
            indegree[next_course] -= 1
            if indegree[next_course] == 0: queue.append(next_course)
    return result if len(result) == num_courses else []`,
    javascript: `function findOrder(numCourses, prerequisites) {
    const graph = Array.from({length: numCourses}, () => []);
    const indegree = new Array(numCourses).fill(0);
    for (const [course, prereq] of prerequisites) {
        graph[prereq].push(course);
        indegree[course]++;
    }
    const queue = [];
    for (let i = 0; i < numCourses; i++) if (indegree[i] === 0) queue.push(i);
    const result = [];
    while (queue.length) {
        const course = queue.shift();
        result.push(course);
        for (const next of graph[course]) if (--indegree[next] === 0) queue.push(next);
    }
    return result.length === numCourses ? result : [];
}`
  }
};