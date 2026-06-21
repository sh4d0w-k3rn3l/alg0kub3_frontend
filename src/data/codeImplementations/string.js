// String Algorithms Code

export const stringCode = {
  "is-subsequence": {
    java: `public boolean isSubsequence(String s, String t) {
    int i = 0, j = 0;
    while (i < s.length() && j < t.length()) {
        if (s.charAt(i) == t.charAt(j)) {
            i++;
        }
        j++;
    }
    return i == s.length();
}`,
    python: `def is_subsequence(s, t):
    i = j = 0
    while i < len(s) and j < len(t):
        if s[i] == t[j]:
            i += 1
        j += 1
    return i == len(s)`,
    javascript: `function isSubsequence(s, t) {
    let i = 0, j = 0;
    while (i < s.length && j < t.length) {
        if (s[i] === t[j]) i++;
        j++;
    }
    return i === s.length;
}`,
    typescript: `function isSubsequence(s: string, t: string): boolean {
    let i: number = 0, j: number = 0;
    while (i < s.length && j < t.length) {
        if (s[i] === t[j]) i++;
        j++;
    }
    return i === s.length;
}`,
    csharp: `public bool IsSubsequence(string s, string t) {
    int i = 0, j = 0;
    while (i < s.Length && j < t.Length) {
        if (s[i] == t[j]) i++;
        j++;
    }
    return i == s.Length;
}`,
    cpp: `bool isSubsequence(string s, string t) {
    int i = 0, j = 0;
    while (i < s.size() && j < t.size()) {
        if (s[i] == t[j]) i++;
        j++;
    }
    return i == s.size();
}`,
    go: `func isSubsequence(s string, t string) bool {
    i, j := 0, 0
    for i < len(s) && j < len(t) {
        if s[i] == t[j] {
            i++
        }
        j++
    }
    return i == len(s)
}`
  },
  "valid-palindrome": {
    java: `public boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        while (left < right && !Character.isLetterOrDigit(s.charAt(left))) left++;
        while (left < right && !Character.isLetterOrDigit(s.charAt(right))) right--;
        if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
    python: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        while left < right and not s[left].isalnum():
            left += 1
        while left < right and not s[right].isalnum():
            right -= 1
        if s[left].lower() != s[right].lower():
            return False
        left += 1
        right -= 1
    return True`,
    javascript: `function isPalindrome(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        while (left < right && !isAlphaNumeric(s[left])) left++;
        while (left < right && !isAlphaNumeric(s[right])) right--;
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}

function isAlphaNumeric(c) {
    return /[a-zA-Z0-9]/.test(c);
}`,
    typescript: `function isPalindrome(s: string): boolean {
    let left: number = 0, right: number = s.length - 1;
    const isAlphaNumeric = (c: string): boolean => /[a-zA-Z0-9]/.test(c);
    while (left < right) {
        while (left < right && !isAlphaNumeric(s[left])) left++;
        while (left < right && !isAlphaNumeric(s[right])) right--;
        if (s[left].toLowerCase() !== s[right].toLowerCase()) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
    csharp: `public bool IsPalindrome(string s) {
    int left = 0, right = s.Length - 1;
    while (left < right) {
        while (left < right && !char.IsLetterOrDigit(s[left])) left++;
        while (left < right && !char.IsLetterOrDigit(s[right])) right--;
        if (char.ToLower(s[left]) != char.ToLower(s[right])) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
    cpp: `bool isPalindrome(string s) {
    int left = 0, right = s.size() - 1;
    while (left < right) {
        while (left < right && !isalnum(s[left])) left++;
        while (left < right && !isalnum(s[right])) right--;
        if (tolower(s[left]) != tolower(s[right])) {
            return false;
        }
        left++;
        right--;
    }
    return true;
}`,
    go: `func isPalindrome(s string) bool {
    left, right := 0, len(s)-1
    for left < right {
        for left < right && !isAlphaNum(rune(s[left])) {
            left++
        }
        for left < right && !isAlphaNum(rune(s[right])) {
            right--
        }
        if unicode.ToLower(rune(s[left])) != unicode.ToLower(rune(s[right])) {
            return false
        }
        left++
        right--
    }
    return true
}

func isAlphaNum(c rune) bool {
    return unicode.IsLetter(c) || unicode.IsDigit(c)
}`
  },
  "longest-common-prefix": {
    java: `public String longestCommonPrefix(String[] strs) {
    if (strs == null || strs.length == 0) return "";
    String prefix = strs[0];
    for (int i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) != 0) {
            prefix = prefix.substring(0, prefix.length() - 1);
            if (prefix.isEmpty()) return "";
        }
    }
    return prefix;
}`,
    python: `def longest_common_prefix(strs):
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix`,
    javascript: `function longestCommonPrefix(strs) {
    if (!strs || strs.length === 0) return "";
    let prefix = strs[0];
    for (let i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, -1);
            if (!prefix) return "";
        }
    }
    return prefix;
}`,
    typescript: `function longestCommonPrefix(strs: string[]): string {
    if (!strs || strs.length === 0) return "";
    let prefix: string = strs[0];
    for (let i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.slice(0, -1);
            if (!prefix) return "";
        }
    }
    return prefix;
}`,
    csharp: `public string LongestCommonPrefix(string[] strs) {
    if (strs == null || strs.Length == 0) return "";
    string prefix = strs[0];
    for (int i = 1; i < strs.Length; i++) {
        while (strs[i].IndexOf(prefix) != 0) {
            prefix = prefix.Substring(0, prefix.Length - 1);
            if (prefix.Length == 0) return "";
        }
    }
    return prefix;
}`,
    cpp: `string longestCommonPrefix(vector<string>& strs) {
    if (strs.empty()) return "";
    string prefix = strs[0];
    for (int i = 1; i < strs.size(); i++) {
        while (strs[i].find(prefix) != 0) {
            prefix = prefix.substr(0, prefix.size() - 1);
            if (prefix.empty()) return "";
        }
    }
    return prefix;
}`,
    go: `func longestCommonPrefix(strs []string) string {
    if len(strs) == 0 {
        return ""
    }
    prefix := strs[0]
    for i := 1; i < len(strs); i++ {
        for !strings.HasPrefix(strs[i], prefix) {
            prefix = prefix[:len(prefix)-1]
            if prefix == "" {
                return ""
            }
        }
    }
    return prefix
}`
  },
  "reverse-words": {
    java: `public String reverseWords(String s) {
    String[] words = s.trim().split("\\\\s+");
    StringBuilder sb = new StringBuilder();
    for (int i = words.length - 1; i >= 0; i--) {
        sb.append(words[i]);
        if (i > 0) sb.append(" ");
    }
    return sb.toString();
}`,
    python: `def reverse_words(s):
    return ' '.join(s.split()[::-1])`,
    javascript: `function reverseWords(s) {
    return s.trim().split(/\\s+/).reverse().join(' ');
}`,
    typescript: `function reverseWords(s: string): string {
    return s.trim().split(/\\s+/).reverse().join(' ');
}`,
    csharp: `public string ReverseWords(string s) {
    var words = s.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
    Array.Reverse(words);
    return string.Join(" ", words);
}`,
    cpp: `string reverseWords(string s) {
    vector<string> words;
    stringstream ss(s);
    string word;
    while (ss >> word) words.push_back(word);
    reverse(words.begin(), words.end());
    string result;
    for (int i = 0; i < words.size(); i++) {
        if (i > 0) result += " ";
        result += words[i];
    }
    return result;
}`,
    go: `func reverseWords(s string) string {
    words := strings.Fields(s)
    for i, j := 0, len(words)-1; i < j; i, j = i+1, j-1 {
        words[i], words[j] = words[j], words[i]
    }
    return strings.Join(words, " ")
}`
  }
};
