'use client';
import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Palette, Type, X, Check, ChevronDown } from 'lucide-react';

interface ColorItem {
  name: string;
  value: string | null;
}

const TEXT_COLORS: ColorItem[] = [
  { name: 'Default', value: null },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
];

const HIGHLIGHT_COLORS: ColorItem[] = [
  { name: 'None', value: null },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Purple', value: '#e9d5ff' },
];

const ToolbarButton = ({ active, onClick, children, title, disabled = false }: { active: boolean; onClick: () => void; children: ReactNode; title: string; disabled?: boolean }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors ${
      active
        ? 'bg-[#22c55e]/20 text-[#22c55e]'
        : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#1c2333]'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    {children}
  </button>
);

const ColorDropdown = ({ colors, activeColor, onSelect, icon, title, label }: {
  colors: ColorItem[]; activeColor: string | null; onSelect: (value: string | null) => void; icon: ReactNode; title: string; label: string;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        title={title}
        className={`flex items-center gap-0.5 p-1.5 rounded transition-colors ${
          activeColor ? 'bg-[#1c2333]' : ''
        } text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#1c2333] cursor-pointer`}
      >
        {icon}
        {activeColor && (
          <div className="w-2 h-2 rounded-full border border-black/30" style={{ backgroundColor: activeColor }} />
        )}
        <ChevronDown size={8} />
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-2xl p-2 z-[999] min-w-[140px]"
          onMouseDown={(e) => e.preventDefault()}
        >
          <div className="text-[9px] text-[#484f58] uppercase tracking-wider mb-1.5 px-1">{label}</div>
          <div className="grid grid-cols-4 gap-1">
            {colors.map((c: ColorItem) => (
              <button
                key={c.name}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(c.value); setOpen(false); }}
                title={c.name}
                className={`w-6 h-6 rounded border transition-all hover:scale-110 flex items-center justify-center ${
                  (activeColor === c.value || (!activeColor && !c.value))
                    ? 'border-[#22c55e] ring-1 ring-[#22c55e]/50'
                    : 'border-[#2d333b] hover:border-[#484f58]'
                }`}
                style={{ backgroundColor: c.value || '#0d1117' }}
              >
                {!c.value && <X size={10} className="text-[#484f58]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const LinkPopover = ({ editor, onClose }: { editor: Editor | null; onClose: () => void }) => {
  const [url, setUrl] = useState(editor?.getAttributes('link').href || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editor) return;
    if (url.trim()) {
      const formattedUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href: formattedUrl, target: '_blank' }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 px-1">
      <div className="w-px h-4 bg-[#2d333b]" />
      <input
        ref={inputRef}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Paste URL..."
        className="bg-[#0d1117] text-[#c9d1d9] text-xs px-2 py-1 rounded border border-[#2d333b] outline-none focus:border-[#22c55e] w-44"
        data-testid="link-url-input"
      />
      <button type="submit" onMouseDown={(e) => e.preventDefault()} className="p-1 text-[#22c55e] hover:bg-[#22c55e]/10 rounded cursor-pointer" title="Apply">
        <Check size={12} />
      </button>
      {editor?.isActive('link') && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { if (editor) { editor.chain().focus().extendMarkRange('link').unsetLink().run(); } onClose(); }}
          className="p-1 text-red-400 hover:bg-red-400/10 rounded cursor-pointer"
          title="Remove link"
        >
          <X size={12} />
        </button>
      )}
    </form>
  );
};

const RichTextEditor = ({ value, onChange, placeholder = 'Start typing...' }: { value: string; onChange: (html: string) => void; placeholder?: string }) => {
  const [showLink, setShowLink] = useState<boolean>(false);
  const [initialContent] = useState<string>(() => value || '');
  const isUpdatingRef = useRef<boolean>(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
        link: false,
        hardBreak: { keepMarks: true },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#22c55e] underline underline-offset-2 hover:text-[#16a34a] cursor-pointer' },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none text-sm text-[#c9d1d9] leading-relaxed outline-none min-h-[60px] px-0 py-0',
        'data-testid': 'rich-text-editor',
      },
    },
    onUpdate: ({ editor: e }) => {
      if (isUpdatingRef.current) return;
      const html = e.getHTML();
      // Convert empty editor to empty string
      const cleanHtml = html === '<p></p>' ? '' : html;
      onChange(cleanHtml);
    },
  });

  // Sync external value changes (e.g., undo at parent level)
  useEffect(() => {
    if (!editor || !value) return;
    const currentHtml = editor.getHTML();
    const cleanCurrent = currentHtml === '<p></p>' ? '' : currentHtml;
    if (value !== cleanCurrent) {
      isUpdatingRef.current = true;
      editor.commands.setContent(value);
      isUpdatingRef.current = false;
    }
  }, [value, editor]);

  if (!editor) return null;

  const activeTextColor = editor.getAttributes('textStyle').color || null;
  const activeHighlight = editor.getAttributes('highlight').color || null;

  return (
    <div className="rich-text-wrapper relative">
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{
            offset: 8,
            placement: 'top',
          }}
        >
          <div className="flex items-center gap-0.5 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-2xl px-1 py-0.5">
          {showLink ? (
            <LinkPopover editor={editor} onClose={() => setShowLink(false)} />
          ) : (
            <>
              <ToolbarButton
                active={editor.isActive('bold')}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold (Ctrl+B)"
              >
                <Bold size={14} strokeWidth={2.5} />
              </ToolbarButton>

              <ToolbarButton
                active={editor.isActive('italic')}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic (Ctrl+I)"
              >
                <Italic size={14} />
              </ToolbarButton>

              <ToolbarButton
                active={editor.isActive('underline')}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon size={14} />
              </ToolbarButton>

              <ToolbarButton
                active={editor.isActive('strike')}
                onClick={() => editor.chain().focus().toggleStrike().run()}
                title="Strikethrough"
              >
                <Type size={14} className="line-through" />
              </ToolbarButton>

              <ToolbarButton
                active={editor.isActive('code')}
                onClick={() => editor.chain().focus().toggleCode().run()}
                title="Inline Code"
              >
                <span className="text-[11px] font-mono font-bold">{`</>`}</span>
              </ToolbarButton>

              <div className="w-px h-4 bg-[#2d333b] mx-0.5" />

              <ToolbarButton
                active={editor.isActive('link')}
                onClick={() => setShowLink(true)}
                title="Add Link"
              >
                <LinkIcon size={14} />
              </ToolbarButton>

              <div className="w-px h-4 bg-[#2d333b] mx-0.5" />

              <ColorDropdown
                colors={TEXT_COLORS}
                activeColor={activeTextColor}
                onSelect={(color: string | null) => {
                  if (color) {
                    editor.chain().focus().setColor(color).run();
                  } else {
                    editor.chain().focus().unsetColor().run();
                  }
                }}
                icon={<span className="text-[11px] font-bold">A</span>}
                title="Text Color"
                label="Text Color"
              />

              <ColorDropdown
                colors={HIGHLIGHT_COLORS}
                activeColor={activeHighlight}
                onSelect={(color: string | null) => {
                  if (color) {
                    editor.chain().focus().toggleHighlight({ color }).run();
                  } else {
                    editor.chain().focus().unsetHighlight().run();
                  }
                }}
                icon={<Palette size={13} />}
                title="Highlight"
                label="Highlight"
              />
            </>
          )}
          </div>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      <style>{`
        .rich-text-wrapper .ProseMirror {
          min-height: 60px;
          font-size: 14px;
          line-height: 1.7;
          color: #c9d1d9;
        }
        .rich-text-wrapper .ProseMirror p {
          margin: 0;
        }
        .rich-text-wrapper .ProseMirror p + p {
          margin-top: 0.5em;
        }
        .rich-text-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #484f58;
          pointer-events: none;
          height: 0;
        }
        .rich-text-wrapper .ProseMirror code {
          background: #22c55e15;
          color: #22c55e;
          padding: 0.15em 0.35em;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .rich-text-wrapper .ProseMirror a {
          color: #22c55e;
          text-decoration: underline;
          text-underline-offset: 2px;
          cursor: pointer;
        }
        .rich-text-wrapper .ProseMirror a:hover {
          color: #16a34a;
        }
        .rich-text-wrapper .ProseMirror mark {
          border-radius: 2px;
          padding: 0.1em 0.15em;
          box-decoration-break: clone;
        }
        .rich-text-wrapper .ProseMirror strong {
          font-weight: 600;
        }
        .rich-text-wrapper .ProseMirror em {
          color: #c9d1d9;
        }
        .rich-text-wrapper .ProseMirror s {
          color: #8b949e;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
