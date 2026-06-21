'use client';

interface SyntaxTheme {
  keyword: string;
  string: string;
  comment: string;
  function: string;
  number: string;
  class: string;
  text: string;
}

interface SyntaxHighlightProps {
  code: string;
  language: string;
  theme?: SyntaxTheme;
}

const SyntaxHighlight = ({ code, language, theme }: SyntaxHighlightProps) => {
  // Default theme colors (VS Code Dark+)
  const defaultTheme: SyntaxTheme = {
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    function: '#dcdcaa',
    number: '#b5cea8',
    class: '#4ec9b0',
    text: '#d4d4d4'
  };

  const colors: SyntaxTheme = theme || defaultTheme;

  const keywords: Record<string, string[]> = {
    java: ['public', 'private', 'protected', 'void', 'int', 'boolean', 'String', 'for', 'if', 'else', 'while', 'return', 'true', 'false', 'new', 'class', 'static', 'final', 'null', 'this', 'super', 'extends', 'implements', 'import', 'package', 'try', 'catch', 'throw', 'throws', 'break', 'continue', 'switch', 'case', 'default', 'double', 'float', 'long', 'short', 'byte', 'char'],
    python: ['def', 'for', 'if', 'elif', 'else', 'while', 'return', 'True', 'False', 'None', 'in', 'range', 'len', 'not', 'and', 'or', 'class', 'self', 'import', 'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'yield', 'pass', 'break', 'continue', 'global', 'nonlocal', 'assert', 'del', 'is'],
    javascript: ['function', 'const', 'let', 'var', 'for', 'if', 'else', 'while', 'return', 'true', 'false', 'null', 'undefined', 'new', 'class', 'this', 'super', 'extends', 'import', 'export', 'default', 'try', 'catch', 'throw', 'finally', 'break', 'continue', 'switch', 'case', 'typeof', 'instanceof', 'async', 'await', 'yield', 'of', 'in'],
    typescript: ['function', 'const', 'let', 'var', 'for', 'if', 'else', 'while', 'return', 'true', 'false', 'null', 'undefined', 'new', 'class', 'this', 'super', 'extends', 'import', 'export', 'default', 'try', 'catch', 'throw', 'finally', 'break', 'continue', 'switch', 'case', 'typeof', 'instanceof', 'async', 'await', 'yield', 'of', 'in', 'interface', 'type', 'enum', 'implements', 'public', 'private', 'protected', 'readonly', 'static', 'abstract', 'as', 'is', 'keyof', 'never', 'unknown', 'any', 'void', 'number', 'string', 'boolean'],
    csharp: ['public', 'private', 'protected', 'internal', 'void', 'int', 'bool', 'string', 'for', 'foreach', 'if', 'else', 'while', 'return', 'true', 'false', 'new', 'class', 'static', 'readonly', 'const', 'null', 'this', 'base', 'extends', 'implements', 'using', 'namespace', 'try', 'catch', 'throw', 'finally', 'break', 'continue', 'switch', 'case', 'default', 'double', 'float', 'long', 'short', 'byte', 'char', 'var', 'async', 'await', 'virtual', 'override', 'abstract', 'sealed', 'partial', 'get', 'set', 'out', 'ref', 'in', 'where', 'select', 'from'],
    cpp: ['public', 'private', 'protected', 'void', 'int', 'bool', 'string', 'for', 'if', 'else', 'while', 'return', 'true', 'false', 'new', 'class', 'static', 'const', 'nullptr', 'this', 'virtual', 'override', 'include', 'namespace', 'using', 'try', 'catch', 'throw', 'break', 'continue', 'switch', 'case', 'default', 'double', 'float', 'long', 'short', 'char', 'auto', 'template', 'typename', 'sizeof', 'delete', 'struct', 'enum', 'typedef', 'extern', 'inline', 'constexpr', 'noexcept', 'vector', 'map', 'set', 'unordered_map', 'unordered_set', 'pair', 'stack', 'queue', 'priority_queue'],
    go: ['func', 'for', 'if', 'else', 'switch', 'case', 'default', 'return', 'true', 'false', 'nil', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'range', 'break', 'continue', 'goto', 'fallthrough', 'defer', 'go', 'select', 'package', 'import', 'make', 'new', 'len', 'cap', 'append', 'copy', 'delete', 'panic', 'recover', 'int', 'int8', 'int16', 'int32', 'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float32', 'float64', 'bool', 'string', 'byte', 'rune', 'error']
  };

  const langKeywords: string[] = keywords[language] || keywords.java;
  
  // Simple regex-based highlighting
  let result: string = code;
  
  // Comments
  if (code.trim().startsWith('//') || code.trim().startsWith('#')) {
    return <span style={{ color: colors.comment }}>{code}</span>;
  }
  
  // String literals
  const stringPattern = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
  const strings: string[] = [];
  result = result.replace(stringPattern, (match: string) => {
    strings.push(match);
    return `__STRING_${strings.length - 1}__`;
  });
  
  // Tokenize and highlight
  const tokens = result.split(/(\s+|[(){}[\];,.<>=!+\-*/%&|^~?:])/g).filter(Boolean);
  
  return (
    <>
      {tokens.map((token: string, i: number) => {
        // Restore strings
        if (token.startsWith('__STRING_')) {
          const idx = parseInt(token.replace('__STRING_', '').replace('__', ''));
          return <span key={i} style={{ color: colors.string }}>{strings[idx]}</span>;
        }
        
        // Keywords
        if (langKeywords.includes(token)) {
          return <span key={i} style={{ color: colors.keyword }}>{token}</span>;
        }
        
        // Numbers
        if (/^-?\d+\.?\d*$/.test(token)) {
          return <span key={i} style={{ color: colors.number }}>{token}</span>;
        }
        
        // Class names (PascalCase)
        if (/^[A-Z][a-zA-Z0-9]*$/.test(token)) {
          return <span key={i} style={{ color: colors.class }}>{token}</span>;
        }
        
        // Methods/functions
        if (/^[a-z][a-zA-Z0-9]*$/.test(token) && i + 1 < tokens.length && tokens[i + 1] === '(') {
          return <span key={i} style={{ color: colors.function }}>{token}</span>;
        }
        
        return <span key={i}>{token}</span>;
      })}
    </>
  );
};

export default SyntaxHighlight;
