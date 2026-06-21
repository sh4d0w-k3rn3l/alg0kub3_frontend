// Tries algorithm implementations

export const triesCode = {
  "search-suggestions-system": {
    java: `public List<List<String>> suggestedProducts(String[] products, String searchWord) {
    Arrays.sort(products);
    List<List<String>> result = new ArrayList<>();
    String prefix = "";
    
    for (char c : searchWord.toCharArray()) {
        prefix += c;
        List<String> suggestions = new ArrayList<>();
        
        int idx = binarySearch(products, prefix);
        for (int i = idx; i < Math.min(idx + 3, products.length); i++) {
            if (products[i].startsWith(prefix)) {
                suggestions.add(products[i]);
            }
        }
        result.add(suggestions);
    }
    return result;
}

private int binarySearch(String[] products, String prefix) {
    int left = 0, right = products.length;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (products[mid].compareTo(prefix) < 0) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    return left;
}`,
    python: `def suggestedProducts(products, searchWord):
    products.sort()
    result = []
    prefix = ""
    
    for c in searchWord:
        prefix += c
        # Binary search for prefix
        left, right = 0, len(products)
        while left < right:
            mid = (left + right) // 2
            if products[mid] < prefix:
                left = mid + 1
            else:
                right = mid
        
        suggestions = []
        for i in range(left, min(left + 3, len(products))):
            if products[i].startswith(prefix):
                suggestions.append(products[i])
        result.append(suggestions)
    
    return result`,
    javascript: `function suggestedProducts(products, searchWord) {
    products.sort();
    const result = [];
    let prefix = "";
    
    for (const c of searchWord) {
        prefix += c;
        
        // Binary search for prefix
        let left = 0, right = products.length;
        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (products[mid] < prefix) left = mid + 1;
            else right = mid;
        }
        
        const suggestions = [];
        for (let i = left; i < Math.min(left + 3, products.length); i++) {
            if (products[i].startsWith(prefix)) {
                suggestions.push(products[i]);
            }
        }
        result.push(suggestions);
    }
    return result;
}`
  },
  "word-search-ii": {
    java: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    String word = null;
}

public List<String> findWords(char[][] board, String[] words) {
    TrieNode root = buildTrie(words);
    List<String> result = new ArrayList<>();
    
    for (int i = 0; i < board.length; i++) {
        for (int j = 0; j < board[0].length; j++) {
            dfs(board, i, j, root, result);
        }
    }
    return result;
}

private void dfs(char[][] board, int i, int j, TrieNode node, List<String> result) {
    if (i < 0 || j < 0 || i >= board.length || j >= board[0].length) return;
    
    char c = board[i][j];
    if (c == '#' || node.children[c - 'a'] == null) return;
    
    node = node.children[c - 'a'];
    if (node.word != null) {
        result.add(node.word);
        node.word = null;
    }
    
    board[i][j] = '#';
    dfs(board, i + 1, j, node, result);
    dfs(board, i - 1, j, node, result);
    dfs(board, i, j + 1, node, result);
    dfs(board, i, j - 1, node, result);
    board[i][j] = c;
}`,
    python: `def findWords(board, words):
    # Build Trie
    trie = {}
    for word in words:
        node = trie
        for c in word:
            node = node.setdefault(c, {})
        node['$'] = word
    
    result = []
    m, n = len(board), len(board[0])
    
    def dfs(i, j, node):
        if '$' in node:
            result.append(node['$'])
            del node['$']
        
        if i < 0 or j < 0 or i >= m or j >= n:
            return
        
        c = board[i][j]
        if c not in node:
            return
        
        board[i][j] = '#'
        dfs(i + 1, j, node[c])
        dfs(i - 1, j, node[c])
        dfs(i, j + 1, node[c])
        dfs(i, j - 1, node[c])
        board[i][j] = c
    
    for i in range(m):
        for j in range(n):
            dfs(i, j, trie)
    
    return result`,
    javascript: `function findWords(board, words) {
    // Build Trie
    const trie = {};
    for (const word of words) {
        let node = trie;
        for (const c of word) {
            node[c] = node[c] || {};
            node = node[c];
        }
        node.word = word;
    }
    
    const result = [];
    const m = board.length, n = board[0].length;
    
    function dfs(i, j, node) {
        if (node.word) {
            result.push(node.word);
            node.word = null;
        }
        
        if (i < 0 || j < 0 || i >= m || j >= n) return;
        
        const c = board[i][j];
        if (!node[c]) return;
        
        board[i][j] = '#';
        dfs(i + 1, j, node[c]);
        dfs(i - 1, j, node[c]);
        dfs(i, j + 1, node[c]);
        dfs(i, j - 1, node[c]);
        board[i][j] = c;
    }
    
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            dfs(i, j, trie);
        }
    }
    
    return result;
}`
  }
};
