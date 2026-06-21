// Bit Manipulation Algorithms Code

export const bitManipulationCode = {
  "single-number": {
    java: `public int singleNumber(int[] nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}`,
    python: `def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result`,
    javascript: `function singleNumber(nums) {
    return nums.reduce((a, b) => a ^ b, 0);
}`,
    typescript: `function singleNumber(nums: number[]): number {
    return nums.reduce((a, b) => a ^ b, 0);
}`,
    csharp: `public int SingleNumber(int[] nums) {
    int result = 0;
    foreach (int num in nums) {
        result ^= num;
    }
    return result;
}`,
    cpp: `int singleNumber(vector<int>& nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}`,
    go: `func singleNumber(nums []int) int {
    result := 0
    for _, num := range nums {
        result ^= num
    }
    return result
}`
  },
  "counting-bits": {
    java: `public int[] countBits(int n) {
    int[] res = new int[n + 1];
    int pow = 1; // Current power of two
    int x = 1;   // Index at current power level

    for (int i = 1; i <= n; i++) {
        if (i == pow) {
            pow *= 2; // Move to next power of two
            x = i;
        }
        res[i] = res[i - x] + 1;
    }
    return res;
}`,
    python: `def count_bits(n):
    res = [0] * (n + 1)
    pow = 1  # Current power of two
    x = 1    # Index at current power level

    for i in range(1, n + 1):
        if i == pow:
            pow *= 2  # Move to next power of two
            x = i
        res[i] = res[i - x] + 1
    return res`,
    javascript: `function countBits(n) {
    const res = new Array(n + 1).fill(0);
    let pow = 1; // Current power of two
    let x = 1;   // Index at current power level

    for (let i = 1; i <= n; i++) {
        if (i === pow) {
            pow *= 2; // Move to next power of two
            x = i;
        }
        res[i] = res[i - x] + 1;
    }
    return res;
}`,
    typescript: `function countBits(n: number): number[] {
    const res: number[] = new Array(n + 1).fill(0);
    let pow: number = 1;
    let x: number = 1;

    for (let i = 1; i <= n; i++) {
        if (i === pow) {
            pow *= 2;
            x = i;
        }
        res[i] = res[i - x] + 1;
    }
    return res;
}`,
    csharp: `public int[] CountBits(int n) {
    int[] res = new int[n + 1];
    int pow = 1;
    int x = 1;

    for (int i = 1; i <= n; i++) {
        if (i == pow) {
            pow *= 2;
            x = i;
        }
        res[i] = res[i - x] + 1;
    }
    return res;
}`,
    cpp: `vector<int> countBits(int n) {
    vector<int> res(n + 1, 0);
    int pow = 1;
    int x = 1;

    for (int i = 1; i <= n; i++) {
        if (i == pow) {
            pow *= 2;
            x = i;
        }
        res[i] = res[i - x] + 1;
    }
    return res;
}`,
    go: `func countBits(n int) []int {
    res := make([]int, n+1)
    pow := 1
    x := 1

    for i := 1; i <= n; i++ {
        if i == pow {
            pow *= 2
            x = i
        }
        res[i] = res[i-x] + 1
    }
    return res
}`
  },
  "single-number-iii": {
    java: `public int[] singleNumber(int[] nums) {
    // Step 1: XOR all numbers
    int xor = 0;
    for (int num : nums) {
        xor ^= num;
    }

    // Step 2: Find rightmost set bit
    int diff = xor & (-xor);

    // Step 3: Separate into two groups and XOR
    int[] result = new int[2];
    for (int num : nums) {
        if ((num & diff) == 0) {
            result[0] ^= num; // Group 0
        } else {
            result[1] ^= num; // Group 1
        }
    }

    return result;
}`,
    python: `def single_number(nums):
    # Step 1: XOR all numbers
    xor = 0
    for num in nums:
        xor ^= num

    # Step 2: Find rightmost set bit
    diff = xor & (-xor)

    # Step 3: Separate into two groups and XOR
    result = [0, 0]
    for num in nums:
        if num & diff:
            result[1] ^= num  # Group 1
        else:
            result[0] ^= num  # Group 0
    return result`,
    javascript: `function singleNumber(nums) {
    // Step 1: XOR all numbers
    let xor = 0;
    for (const num of nums) {
        xor ^= num;
    }

    // Step 2: Find rightmost set bit
    const diff = xor & (-xor);

    // Step 3: Separate into two groups and XOR
    const result = [0, 0];
    for (const num of nums) {
        if (num & diff) {
            result[1] ^= num; // Group 1
        } else {
            result[0] ^= num; // Group 0
        }
    }

    return result;
}`,
    typescript: `function singleNumber(nums: number[]): number[] {
    // Step 1: XOR all numbers
    let xor: number = 0;
    for (const num of nums) {
        xor ^= num;
    }

    // Step 2: Find rightmost set bit
    const diff: number = xor & (-xor);

    // Step 3: Separate into two groups and XOR
    const result: number[] = [0, 0];
    for (const num of nums) {
        if (num & diff) {
            result[1] ^= num; // Group 1
        } else {
            result[0] ^= num; // Group 0
        }
    }

    return result;
}`,
    csharp: `public int[] SingleNumber(int[] nums) {
    // Step 1: XOR all numbers
    int xor = 0;
    foreach (int num in nums) {
        xor ^= num;
    }

    // Step 2: Find rightmost set bit
    int diff = xor & (-xor);

    // Step 3: Separate into two groups and XOR
    int[] result = new int[2];
    foreach (int num in nums) {
        if ((num & diff) == 0) {
            result[0] ^= num; // Group 0
        } else {
            result[1] ^= num; // Group 1
        }
    }

    return result;
}`,
    cpp: `vector<int> singleNumber(vector<int>& nums) {
    // Step 1: XOR all numbers
    int xorVal = 0;
    for (int num : nums) {
        xorVal ^= num;
    }

    // Step 2: Find rightmost set bit
    int diff = xorVal & (-xorVal);

    // Step 3: Separate into two groups and XOR
    vector<int> result(2, 0);
    for (int num : nums) {
        if (num & diff) {
            result[1] ^= num; // Group 1
        } else {
            result[0] ^= num; // Group 0
        }
    }

    return result;
}`,
    go: `func singleNumber(nums []int) []int {
    // Step 1: XOR all numbers
    xor := 0
    for _, num := range nums {
        xor ^= num
    }

    // Step 2: Find rightmost set bit
    diff := xor & (-xor)

    // Step 3: Separate into two groups and XOR
    result := []int{0, 0}
    for _, num := range nums {
        if num&diff != 0 {
            result[1] ^= num // Group 1
        } else {
            result[0] ^= num // Group 0
        }
    }

    return result
}`
  }
};
