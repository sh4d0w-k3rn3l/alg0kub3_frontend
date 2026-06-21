'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { api } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AskAIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lessonSlug: string;
  lessonTitle: string;
}

const AskAIPanel = ({ isOpen, onClose, lessonSlug, lessonTitle }: AskAIPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([]);
    setSessionId('');
  }, [lessonSlug]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post<{ session_id: string; answer: string }>('/ask-ai', {
        question: input.trim(),
        lesson_slug: lessonSlug,
        session_id: sessionId,
      });
      setSessionId(res.data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMarkdown = (text: string): React.ReactNode => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith('```')) {
        const code = part.replace(/```\w*\n?/g, '').replace(/```$/g, '').trim();
        return (
          <pre key={i} className="bg-[#0d1117] rounded-md p-3 my-2 overflow-x-auto text-[13px] font-mono text-[#c9d1d9]">
            <code>{code}</code>
          </pre>
        );
      }
      const inlineparts = part.split(/(`[^`]+`)/g);
      return (
        <span key={i}>
          {inlineparts.map((ip, j) => {
            if (ip.startsWith('`') && ip.endsWith('`')) {
              return <code key={j} className="bg-[#1c2333] px-1.5 py-0.5 rounded text-[13px] text-[#e6edf3]">{ip.slice(1, -1)}</code>;
            }
            const boldParts = ip.split(/(\*\*[^*]+\*\*)/g);
            return boldParts.map((bp, k) => {
              if (bp.startsWith('**') && bp.endsWith('**')) {
                return <strong key={`${j}-${k}`} className="text-white">{bp.slice(2, -2)}</strong>;
              }
              return <span key={`${j}-${k}`}>{bp}</span>;
            });
          })}
        </span>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl mx-4 mb-[48px] rounded-t-xl border border-[#2d333b] border-b-0 overflow-hidden flex flex-col shadow-2xl"
        style={{ backgroundColor: '#0f1117', maxHeight: '70vh' }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2533]" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#22c55e]" />
            <span className="text-white text-sm font-semibold">Ask AI</span>
            <span className="text-[#484f58] text-xs">about {lessonTitle}</span>
          </div>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{ minHeight: '200px', maxHeight: '50vh' }}>
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles size={32} className="text-[#22c55e] mx-auto mb-3 opacity-50" />
              <p className="text-[#8b949e] text-sm">Ask anything about this lesson</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['Explain this concept', 'Show me an example', 'What are common mistakes?'].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setInput(q); inputRef.current?.focus(); }}
                    className="px-3 py-1.5 text-xs border border-[#2d333b] rounded-full text-[#8b949e] hover:text-white hover:border-[#484f58] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#22c55e]/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                  <Bot size={14} className="text-[#22c55e]" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#22c55e]/20 text-[#c9d1d9]'
                  : 'bg-[#161b22] text-[#c9d1d9] border border-[#2d333b]'
              }`}>
                {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#2d333b] flex-shrink-0 flex items-center justify-center mt-0.5">
                  <User size={14} className="text-[#8b949e]" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#22c55e]/20 flex-shrink-0 flex items-center justify-center">
                <Bot size={14} className="text-[#22c55e]" />
              </div>
              <div className="bg-[#161b22] border border-[#2d333b] rounded-lg px-4 py-3">
                <Loader2 size={16} className="text-[#22c55e] animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-[#1e2533] p-3" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this lesson..."
              className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] resize-none placeholder-[#484f58]"
              rows={1}
              style={{ maxHeight: '80px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="p-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-white transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAIPanel;
