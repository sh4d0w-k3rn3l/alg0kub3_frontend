// Matrix Algorithms Code

export const matrixCode = {
  "spiral-matrix": {
    java: `public List<Integer> spiralOrder(int[][] matrix) {
    List<Integer> result = new ArrayList<>();
    if (matrix.length == 0) return result;
    int top = 0, bottom = matrix.length - 1;
    int left = 0, right = matrix[0].length - 1;
    while (top <= bottom && left <= right) {
        for (int i = left; i <= right; i++) result.add(matrix[top][i]);
        top++;
        for (int i = top; i <= bottom; i++) result.add(matrix[i][right]);
        right--;
        if (top <= bottom) {
            for (int i = right; i >= left; i--) result.add(matrix[bottom][i]);
            bottom--;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) result.add(matrix[i][left]);
            left++;
        }
    }
    return result;
}`,
    python: `def spiral_order(matrix):
    if not matrix: return []
    result = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for i in range(left, right + 1): result.append(matrix[top][i])
        top += 1
        for i in range(top, bottom + 1): result.append(matrix[i][right])
        right -= 1
        if top <= bottom:
            for i in range(right, left - 1, -1): result.append(matrix[bottom][i])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1): result.append(matrix[i][left])
            left += 1
    return result`,
    javascript: `function spiralOrder(matrix) {
    if (!matrix.length) return [];
    const result = [];
    let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
    while (top <= bottom && left <= right) {
        for (let i = left; i <= right; i++) result.push(matrix[top][i]);
        top++;
        for (let i = top; i <= bottom; i++) result.push(matrix[i][right]);
        right--;
        if (top <= bottom) { for (let i = right; i >= left; i--) result.push(matrix[bottom][i]); bottom--; }
        if (left <= right) { for (let i = bottom; i >= top; i--) result.push(matrix[i][left]); left++; }
    }
    return result;
}`
  },
  "rotate-image": {
    java: `public void rotate(int[][] matrix) {
    int n = matrix.length;
    // Transpose
    for (int i = 0; i < n; i++) {
        for (int j = i; j < n; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[j][i];
            matrix[j][i] = temp;
        }
    }
    // Reverse each row
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n / 2; j++) {
            int temp = matrix[i][j];
            matrix[i][j] = matrix[i][n - 1 - j];
            matrix[i][n - 1 - j] = temp;
        }
    }
}`,
    python: `def rotate(matrix):
    n = len(matrix)
    # Transpose
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Reverse each row
    for row in matrix:
        row.reverse()`,
    javascript: `function rotate(matrix) {
    const n = matrix.length;
    // Transpose
    for (let i = 0; i < n; i++) {
        for (let j = i; j < n; j++) {
            [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
        }
    }
    // Reverse each row
    for (const row of matrix) row.reverse();
}`
  },
  "set-matrix-zeroes": {
    java: `public void setZeroes(int[][] matrix) {
    boolean firstRow = false, firstCol = false;
    int m = matrix.length, n = matrix[0].length;
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (matrix[i][j] == 0) {
                if (i == 0) firstRow = true;
                if (j == 0) firstCol = true;
                matrix[i][0] = matrix[0][j] = 0;
            }
        }
    }
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            if (matrix[i][0] == 0 || matrix[0][j] == 0) matrix[i][j] = 0;
        }
    }
    if (firstRow) for (int j = 0; j < n; j++) matrix[0][j] = 0;
    if (firstCol) for (int i = 0; i < m; i++) matrix[i][0] = 0;
}`,
    python: `def set_zeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    first_row = first_col = False
    for i in range(m):
        for j in range(n):
            if matrix[i][j] == 0:
                if i == 0: first_row = True
                if j == 0: first_col = True
                matrix[i][0] = matrix[0][j] = 0
    for i in range(1, m):
        for j in range(1, n):
            if matrix[i][0] == 0 or matrix[0][j] == 0:
                matrix[i][j] = 0
    if first_row:
        for j in range(n): matrix[0][j] = 0
    if first_col:
        for i in range(m): matrix[i][0] = 0`,
    javascript: `function setZeroes(matrix) {
    const m = matrix.length, n = matrix[0].length;
    let firstRow = false, firstCol = false;
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (matrix[i][j] === 0) {
                if (i === 0) firstRow = true;
                if (j === 0) firstCol = true;
                matrix[i][0] = matrix[0][j] = 0;
            }
        }
    }
    for (let i = 1; i < m; i++) for (let j = 1; j < n; j++) {
        if (matrix[i][0] === 0 || matrix[0][j] === 0) matrix[i][j] = 0;
    }
    if (firstRow) for (let j = 0; j < n; j++) matrix[0][j] = 0;
    if (firstCol) for (let i = 0; i < m; i++) matrix[i][0] = 0;
}`
  }
};