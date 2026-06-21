// BST algorithm implementations

export const bstCode = {
  "trim-bst": {
    java: `public TreeNode trimBST(TreeNode root, int low, int high) {
    if (root == null) return null;
    
    if (root.val < low) {
        return trimBST(root.right, low, high);
    }
    if (root.val > high) {
        return trimBST(root.left, low, high);
    }
    
    root.left = trimBST(root.left, low, high);
    root.right = trimBST(root.right, low, high);
    return root;
}`,
    python: `def trimBST(root, low, high):
    if not root:
        return None
    
    if root.val < low:
        return trimBST(root.right, low, high)
    if root.val > high:
        return trimBST(root.left, low, high)
    
    root.left = trimBST(root.left, low, high)
    root.right = trimBST(root.right, low, high)
    return root`,
    javascript: `function trimBST(root, low, high) {
    if (!root) return null;
    
    if (root.val < low) {
        return trimBST(root.right, low, high);
    }
    if (root.val > high) {
        return trimBST(root.left, low, high);
    }
    
    root.left = trimBST(root.left, low, high);
    root.right = trimBST(root.right, low, high);
    return root;
}`
  }
};
