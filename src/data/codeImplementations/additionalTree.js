// Additional Tree Algorithms Code

export const additionalTreeCode = {
  "all-nodes-distance-k-in-binary-tree": {
    java: `public List<Integer> distanceK(TreeNode root, TreeNode target, int k) {
    Map<TreeNode, TreeNode> parent = new HashMap<>();
    buildParent(root, null, parent);
    Set<TreeNode> visited = new HashSet<>();
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(target);
    visited.add(target);
    int dist = 0;
    while (!queue.isEmpty()) {
        if (dist == k) {
            List<Integer> result = new ArrayList<>();
            for (TreeNode n : queue) result.add(n.val);
            return result;
        }
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (node.left != null && !visited.contains(node.left)) {
                visited.add(node.left); queue.offer(node.left);
            }
            if (node.right != null && !visited.contains(node.right)) {
                visited.add(node.right); queue.offer(node.right);
            }
            TreeNode p = parent.get(node);
            if (p != null && !visited.contains(p)) {
                visited.add(p); queue.offer(p);
            }
        }
        dist++;
    }
    return new ArrayList<>();
}
private void buildParent(TreeNode node, TreeNode par, Map<TreeNode, TreeNode> parent) {
    if (node == null) return;
    parent.put(node, par);
    buildParent(node.left, node, parent);
    buildParent(node.right, node, parent);
}`,
    python: `def distanceK(root, target, k):
    parent = {}
    def build_parent(node, par):
        if not node: return
        parent[node] = par
        build_parent(node.left, node)
        build_parent(node.right, node)
    build_parent(root, None)
    visited = {target}
    queue = [target]
    dist = 0
    while queue:
        if dist == k: return [n.val for n in queue]
        next_queue = []
        for node in queue:
            for neighbor in [node.left, node.right, parent.get(node)]:
                if neighbor and neighbor not in visited:
                    visited.add(neighbor)
                    next_queue.append(neighbor)
        queue = next_queue
        dist += 1
    return []`,
    javascript: `function distanceK(root, target, k) {
    const parent = new Map();
    const buildParent = (node, par) => {
        if (!node) return;
        parent.set(node, par);
        buildParent(node.left, node);
        buildParent(node.right, node);
    };
    buildParent(root, null);
    const visited = new Set([target]);
    let queue = [target], dist = 0;
    while (queue.length) {
        if (dist === k) return queue.map(n => n.val);
        const nextQueue = [];
        for (const node of queue) {
            for (const neighbor of [node.left, node.right, parent.get(node)]) {
                if (neighbor && !visited.has(neighbor)) {
                    visited.add(neighbor);
                    nextQueue.push(neighbor);
                }
            }
        }
        queue = nextQueue;
        dist++;
    }
    return [];
}`
  },
  "binary-tree-cameras": {
    java: `int cameras = 0;
public int minCameraCover(TreeNode root) {
    return dfs(root) == 0 ? cameras + 1 : cameras;
}
// 0=not covered, 1=covered no camera, 2=has camera
private int dfs(TreeNode node) {
    if (node == null) return 1;
    int left = dfs(node.left), right = dfs(node.right);
    if (left == 0 || right == 0) { cameras++; return 2; }
    if (left == 2 || right == 2) return 1;
    return 0;
}`,
    python: `def minCameraCover(root):
    cameras = [0]
    def dfs(node):
        if not node: return 1
        left, right = dfs(node.left), dfs(node.right)
        if left == 0 or right == 0:
            cameras[0] += 1
            return 2
        if left == 2 or right == 2: return 1
        return 0
    return cameras[0] + 1 if dfs(root) == 0 else cameras[0]`,
    javascript: `function minCameraCover(root) {
    let cameras = 0;
    const dfs = (node) => {
        if (!node) return 1;
        const left = dfs(node.left), right = dfs(node.right);
        if (left === 0 || right === 0) { cameras++; return 2; }
        if (left === 2 || right === 2) return 1;
        return 0;
    };
    return dfs(root) === 0 ? cameras + 1 : cameras;
}`
  },
  "binary-tree-maximum-path-sum": {
    java: `int maxSum = Integer.MIN_VALUE;
public int maxPathSum(TreeNode root) {
    dfs(root);
    return maxSum;
}
private int dfs(TreeNode node) {
    if (node == null) return 0;
    int left = Math.max(0, dfs(node.left));
    int right = Math.max(0, dfs(node.right));
    maxSum = Math.max(maxSum, left + right + node.val);
    return Math.max(left, right) + node.val;
}`,
    python: `def maxPathSum(root):
    max_sum = [float('-inf')]
    def dfs(node):
        if not node: return 0
        left = max(0, dfs(node.left))
        right = max(0, dfs(node.right))
        max_sum[0] = max(max_sum[0], left + right + node.val)
        return max(left, right) + node.val
    dfs(root)
    return max_sum[0]`,
    javascript: `function maxPathSum(root) {
    let maxSum = -Infinity;
    const dfs = (node) => {
        if (!node) return 0;
        const left = Math.max(0, dfs(node.left));
        const right = Math.max(0, dfs(node.right));
        maxSum = Math.max(maxSum, left + right + node.val);
        return Math.max(left, right) + node.val;
    };
    dfs(root);
    return maxSum;
}`
  },
  "binary-tree-paths": {
    java: `public List<String> binaryTreePaths(TreeNode root) {
    List<String> result = new ArrayList<>();
    if (root != null) dfs(root, "", result);
    return result;
}
private void dfs(TreeNode node, String path, List<String> result) {
    path += node.val;
    if (node.left == null && node.right == null) {
        result.add(path);
        return;
    }
    if (node.left != null) dfs(node.left, path + "->", result);
    if (node.right != null) dfs(node.right, path + "->", result);
}`,
    python: `def binaryTreePaths(root):
    if not root: return []
    result = []
    def dfs(node, path):
        if not node.left and not node.right:
            result.append(path + str(node.val))
            return
        if node.left: dfs(node.left, path + str(node.val) + "->")
        if node.right: dfs(node.right, path + str(node.val) + "->")
    dfs(root, "")
    return result`,
    javascript: `function binaryTreePaths(root) {
    if (!root) return [];
    const result = [];
    const dfs = (node, path) => {
        if (!node.left && !node.right) { result.push(path + node.val); return; }
        if (node.left) dfs(node.left, path + node.val + "->");
        if (node.right) dfs(node.right, path + node.val + "->");
    };
    dfs(root, "");
    return result;
}`
  },
  "binary-tree-right-side-view": {
    java: `public List<Integer> rightSideView(TreeNode root) {
    List<Integer> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    while (!queue.isEmpty()) {
        int size = queue.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (i == size - 1) result.add(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
    }
    return result;
}`,
    python: `def rightSideView(root):
    if not root: return []
    result, queue = [], [root]
    while queue:
        result.append(queue[-1].val)
        next_level = []
        for node in queue:
            if node.left: next_level.append(node.left)
            if node.right: next_level.append(node.right)
        queue = next_level
    return result`,
    javascript: `function rightSideView(root) {
    if (!root) return [];
    const result = [];
    let queue = [root];
    while (queue.length) {
        result.push(queue[queue.length - 1].val);
        const nextLevel = [];
        for (const node of queue) {
            if (node.left) nextLevel.push(node.left);
            if (node.right) nextLevel.push(node.right);
        }
        queue = nextLevel;
    }
    return result;
}`
  },
  "binary-tree-zigzag": {
    java: `public List<List<Integer>> zigzagLevelOrder(TreeNode root) {
    List<List<Integer>> result = new ArrayList<>();
    if (root == null) return result;
    Queue<TreeNode> queue = new LinkedList<>();
    queue.offer(root);
    boolean leftToRight = true;
    while (!queue.isEmpty()) {
        int size = queue.size();
        LinkedList<Integer> level = new LinkedList<>();
        for (int i = 0; i < size; i++) {
            TreeNode node = queue.poll();
            if (leftToRight) level.addLast(node.val);
            else level.addFirst(node.val);
            if (node.left != null) queue.offer(node.left);
            if (node.right != null) queue.offer(node.right);
        }
        result.add(level);
        leftToRight = !leftToRight;
    }
    return result;
}`,
    python: `def zigzagLevelOrder(root):
    if not root: return []
    result, queue, left_to_right = [], [root], True
    while queue:
        level = []
        for node in queue:
            level.append(node.val)
        if not left_to_right: level.reverse()
        result.append(level)
        next_level = []
        for node in queue:
            if node.left: next_level.append(node.left)
            if node.right: next_level.append(node.right)
        queue = next_level
        left_to_right = not left_to_right
    return result`,
    javascript: `function zigzagLevelOrder(root) {
    if (!root) return [];
    const result = [];
    let queue = [root], leftToRight = true;
    while (queue.length) {
        const level = queue.map(n => n.val);
        result.push(leftToRight ? level : level.reverse());
        const nextLevel = [];
        for (const node of queue) {
            if (node.left) nextLevel.push(node.left);
            if (node.right) nextLevel.push(node.right);
        }
        queue = nextLevel;
        leftToRight = !leftToRight;
    }
    return result;
}`
  },
  "flatten-binary-tree-to-linked-list": {
    java: `public void flatten(TreeNode root) {
    TreeNode curr = root;
    while (curr != null) {
        if (curr.left != null) {
            TreeNode rightmost = curr.left;
            while (rightmost.right != null) rightmost = rightmost.right;
            rightmost.right = curr.right;
            curr.right = curr.left;
            curr.left = null;
        }
        curr = curr.right;
    }
}`,
    python: `def flatten(root):
    curr = root
    while curr:
        if curr.left:
            rightmost = curr.left
            while rightmost.right: rightmost = rightmost.right
            rightmost.right = curr.right
            curr.right = curr.left
            curr.left = None
        curr = curr.right`,
    javascript: `function flatten(root) {
    let curr = root;
    while (curr) {
        if (curr.left) {
            let rightmost = curr.left;
            while (rightmost.right) rightmost = rightmost.right;
            rightmost.right = curr.right;
            curr.right = curr.left;
            curr.left = null;
        }
        curr = curr.right;
    }
}`
  },
  "house-robber-iii": {
    java: `public int rob(TreeNode root) {
    int[] result = dfs(root);
    return Math.max(result[0], result[1]);
}
private int[] dfs(TreeNode node) {
    if (node == null) return new int[]{0, 0};
    int[] left = dfs(node.left), right = dfs(node.right);
    int rob = node.val + left[1] + right[1];
    int notRob = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);
    return new int[]{rob, notRob};
}`,
    python: `def rob(root):
    def dfs(node):
        if not node: return 0, 0
        left = dfs(node.left)
        right = dfs(node.right)
        rob = node.val + left[1] + right[1]
        not_rob = max(left) + max(right)
        return rob, not_rob
    return max(dfs(root))`,
    javascript: `function rob(root) {
    const dfs = (node) => {
        if (!node) return [0, 0];
        const left = dfs(node.left), right = dfs(node.right);
        const rob = node.val + left[1] + right[1];
        const notRob = Math.max(...left) + Math.max(...right);
        return [rob, notRob];
    };
    return Math.max(...dfs(root));
}`
  },
  "kth-smallest-bst": {
    java: `public int kthSmallest(TreeNode root, int k) {
    Stack<TreeNode> stack = new Stack<>();
    TreeNode curr = root;
    while (curr != null || !stack.isEmpty()) {
        while (curr != null) { stack.push(curr); curr = curr.left; }
        curr = stack.pop();
        if (--k == 0) return curr.val;
        curr = curr.right;
    }
    return -1;
}`,
    python: `def kthSmallest(root, k):
    stack, curr = [], root
    while stack or curr:
        while curr: stack.append(curr); curr = curr.left
        curr = stack.pop()
        k -= 1
        if k == 0: return curr.val
        curr = curr.right`,
    javascript: `function kthSmallest(root, k) {
    const stack = [];
    let curr = root;
    while (curr || stack.length) {
        while (curr) { stack.push(curr); curr = curr.left; }
        curr = stack.pop();
        if (--k === 0) return curr.val;
        curr = curr.right;
    }
}`
  },
  "max-ancestor-diff": {
    java: `public int maxAncestorDiff(TreeNode root) {
    return dfs(root, root.val, root.val);
}
private int dfs(TreeNode node, int min, int max) {
    if (node == null) return max - min;
    min = Math.min(min, node.val);
    max = Math.max(max, node.val);
    return Math.max(dfs(node.left, min, max), dfs(node.right, min, max));
}`,
    python: `def maxAncestorDiff(root):
    def dfs(node, min_val, max_val):
        if not node: return max_val - min_val
        min_val = min(min_val, node.val)
        max_val = max(max_val, node.val)
        return max(dfs(node.left, min_val, max_val), dfs(node.right, min_val, max_val))
    return dfs(root, root.val, root.val)`,
    javascript: `function maxAncestorDiff(root) {
    const dfs = (node, min, max) => {
        if (!node) return max - min;
        min = Math.min(min, node.val);
        max = Math.max(max, node.val);
        return Math.max(dfs(node.left, min, max), dfs(node.right, min, max));
    };
    return dfs(root, root.val, root.val);
}`
  },
  "min-distance-bst": {
    java: `int prev = -1, minDiff = Integer.MAX_VALUE;
public int minDiffInBST(TreeNode root) {
    inorder(root);
    return minDiff;
}
private void inorder(TreeNode node) {
    if (node == null) return;
    inorder(node.left);
    if (prev != -1) minDiff = Math.min(minDiff, node.val - prev);
    prev = node.val;
    inorder(node.right);
}`,
    python: `def minDiffInBST(root):
    prev, min_diff = [None], [float('inf')]
    def inorder(node):
        if not node: return
        inorder(node.left)
        if prev[0] is not None:
            min_diff[0] = min(min_diff[0], node.val - prev[0])
        prev[0] = node.val
        inorder(node.right)
    inorder(root)
    return min_diff[0]`,
    javascript: `function minDiffInBST(root) {
    let prev = null, minDiff = Infinity;
    const inorder = (node) => {
        if (!node) return;
        inorder(node.left);
        if (prev !== null) minDiff = Math.min(minDiff, node.val - prev);
        prev = node.val;
        inorder(node.right);
    };
    inorder(root);
    return minDiff;
}`
  },
  "path-sum-iii": {
    java: `public int pathSum(TreeNode root, int targetSum) {
    Map<Long, Integer> prefixSum = new HashMap<>();
    prefixSum.put(0L, 1);
    return dfs(root, 0, targetSum, prefixSum);
}
private int dfs(TreeNode node, long currSum, int target, Map<Long, Integer> prefixSum) {
    if (node == null) return 0;
    currSum += node.val;
    int count = prefixSum.getOrDefault(currSum - target, 0);
    prefixSum.put(currSum, prefixSum.getOrDefault(currSum, 0) + 1);
    count += dfs(node.left, currSum, target, prefixSum) + dfs(node.right, currSum, target, prefixSum);
    prefixSum.put(currSum, prefixSum.get(currSum) - 1);
    return count;
}`,
    python: `def pathSum(root, targetSum):
    prefix_sum = {0: 1}
    def dfs(node, curr_sum):
        if not node: return 0
        curr_sum += node.val
        count = prefix_sum.get(curr_sum - targetSum, 0)
        prefix_sum[curr_sum] = prefix_sum.get(curr_sum, 0) + 1
        count += dfs(node.left, curr_sum) + dfs(node.right, curr_sum)
        prefix_sum[curr_sum] -= 1
        return count
    return dfs(root, 0)`,
    javascript: `function pathSum(root, targetSum) {
    const prefixSum = new Map([[0, 1]]);
    const dfs = (node, currSum) => {
        if (!node) return 0;
        currSum += node.val;
        let count = prefixSum.get(currSum - targetSum) || 0;
        prefixSum.set(currSum, (prefixSum.get(currSum) || 0) + 1);
        count += dfs(node.left, currSum) + dfs(node.right, currSum);
        prefixSum.set(currSum, prefixSum.get(currSum) - 1);
        return count;
    };
    return dfs(root, 0);
}`
  },
  "populating-next-right-pointers": {
    java: `public Node connect(Node root) {
    if (root == null) return null;
    Node leftmost = root;
    while (leftmost.left != null) {
        Node head = leftmost;
        while (head != null) {
            head.left.next = head.right;
            if (head.next != null) head.right.next = head.next.left;
            head = head.next;
        }
        leftmost = leftmost.left;
    }
    return root;
}`,
    python: `def connect(root):
    if not root: return None
    leftmost = root
    while leftmost.left:
        head = leftmost
        while head:
            head.left.next = head.right
            if head.next: head.right.next = head.next.left
            head = head.next
        leftmost = leftmost.left
    return root`,
    javascript: `function connect(root) {
    if (!root) return null;
    let leftmost = root;
    while (leftmost.left) {
        let head = leftmost;
        while (head) {
            head.left.next = head.right;
            if (head.next) head.right.next = head.next.left;
            head = head.next;
        }
        leftmost = leftmost.left;
    }
    return root;
}`
  },
  "sorted-array-to-bst": {
    java: `public TreeNode sortedArrayToBST(int[] nums) {
    return build(nums, 0, nums.length - 1);
}
private TreeNode build(int[] nums, int left, int right) {
    if (left > right) return null;
    int mid = left + (right - left) / 2;
    TreeNode node = new TreeNode(nums[mid]);
    node.left = build(nums, left, mid - 1);
    node.right = build(nums, mid + 1, right);
    return node;
}`,
    python: `def sortedArrayToBST(nums):
    def build(left, right):
        if left > right: return None
        mid = (left + right) // 2
        node = TreeNode(nums[mid])
        node.left = build(left, mid - 1)
        node.right = build(mid + 1, right)
        return node
    return build(0, len(nums) - 1)`,
    javascript: `function sortedArrayToBST(nums) {
    const build = (left, right) => {
        if (left > right) return null;
        const mid = Math.floor((left + right) / 2);
        const node = new TreeNode(nums[mid]);
        node.left = build(left, mid - 1);
        node.right = build(mid + 1, right);
        return node;
    };
    return build(0, nums.length - 1);
}`
  },
  "distribute-coins": {
    java: `int moves = 0;
public int distributeCoins(TreeNode root) {
    dfs(root);
    return moves;
}
private int dfs(TreeNode node) {
    if (node == null) return 0;
    int left = dfs(node.left), right = dfs(node.right);
    moves += Math.abs(left) + Math.abs(right);
    return node.val + left + right - 1;
}`,
    python: `def distributeCoins(root):
    moves = [0]
    def dfs(node):
        if not node: return 0
        left, right = dfs(node.left), dfs(node.right)
        moves[0] += abs(left) + abs(right)
        return node.val + left + right - 1
    dfs(root)
    return moves[0]`,
    javascript: `function distributeCoins(root) {
    let moves = 0;
    const dfs = (node) => {
        if (!node) return 0;
        const left = dfs(node.left), right = dfs(node.right);
        moves += Math.abs(left) + Math.abs(right);
        return node.val + left + right - 1;
    };
    dfs(root);
    return moves;
}`
  },
  "find-duplicate-subtrees": {
    java: `public List<TreeNode> findDuplicateSubtrees(TreeNode root) {
    List<TreeNode> result = new ArrayList<>();
    Map<String, Integer> map = new HashMap<>();
    serialize(root, map, result);
    return result;
}
private String serialize(TreeNode node, Map<String, Integer> map, List<TreeNode> result) {
    if (node == null) return "#";
    String s = node.val + "," + serialize(node.left, map, result) + "," + serialize(node.right, map, result);
    map.put(s, map.getOrDefault(s, 0) + 1);
    if (map.get(s) == 2) result.add(node);
    return s;
}`,
    python: `def findDuplicateSubtrees(root):
    result = []
    count = {}
    def serialize(node):
        if not node: return "#"
        s = f"{node.val},{serialize(node.left)},{serialize(node.right)}"
        count[s] = count.get(s, 0) + 1
        if count[s] == 2: result.append(node)
        return s
    serialize(root)
    return result`,
    javascript: `function findDuplicateSubtrees(root) {
    const result = [], count = new Map();
    const serialize = (node) => {
        if (!node) return "#";
        const s = \`\${node.val},\${serialize(node.left)},\${serialize(node.right)}\`;
        count.set(s, (count.get(s) || 0) + 1);
        if (count.get(s) === 2) result.push(node);
        return s;
    };
    serialize(root);
    return result;
}`
  }
};
