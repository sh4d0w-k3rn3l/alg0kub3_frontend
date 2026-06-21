'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles, ArrowRight, BookOpen, Network, Brain, Zap,
  Target, Wrench, Layers, Bot, Share2, Workflow, CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import PageHeader from './PageHeader';
import MermaidDiagram from './article/MermaidDiagram';
import SEO from './SEO';

const COURSE_SLUG = 'ai-engineering-for-beginners';

interface Module {
  num: number;
  title: string;
  blurb: string;
  lessons: number;
  icon: React.FC<{ size?: number }>;
  firstSlug: string;
  mermaid: string;
}

const MODULES: Module[] = [
  {
    num: 1,
    title: 'LLMs — Foundations',
    blurb: 'How an LLM reads tokens, predicts the next word, and why context windows matter.',
    lessons: 11,
    icon: Brain,
    firstSlug: 'what-is-an-llm',
    mermaid: `graph LR
    IN["\\"The cat sat on\\""] --> TOK["Tokeniser"]
    TOK --> EMB["Embeddings"]
    EMB --> XFM["Transformer<br/>stack"]
    XFM --> PRED(["the →"])
    classDef a fill:#0ea5e9,stroke:#0369a1,color:#fff
    classDef b fill:#a855f7,stroke:#6b21a8,color:#fff
    classDef c fill:#22c55e,stroke:#15803d,color:#fff
    class IN a
    class TOK,EMB,XFM b
    class PRED c`,
  },
  {
    num: 2,
    title: 'Prompt Engineering',
    blurb: 'Role, examples, structure, constraints — the four levers that turn prompts into products.',
    lessons: 4,
    icon: Target,
    firstSlug: 'what-is-prompt-engineering-beginners',
    mermaid: `graph TB
    ROOT((Prompt))
    ROOT --> R[Role]
    ROOT --> EX[Examples]
    ROOT --> S[Structure]
    ROOT --> C[Constraints]
    classDef r fill:#a855f7,stroke:#6b21a8,color:#fff
    classDef l fill:#14b8a6,stroke:#0f766e,color:#fff
    class ROOT r
    class R,EX,S,C l`,
  },
  {
    num: 3,
    title: 'Fine-tuning',
    blurb: 'Full FT, LoRA, QLoRA — when to change model weights and when to leave them alone.',
    lessons: 11,
    icon: Wrench,
    firstSlug: 'what-is-fine-tuning-beginners',
    mermaid: `graph LR
    BASE["Base LLM<br/>(frozen)"] --> LORA["LoRA adapter<br/>(trainable · 0.1%)"]
    LORA --> FT(["Task-specific<br/>model"])
    classDef frozen fill:#64748b,stroke:#334155,color:#fff
    classDef trained fill:#22c55e,stroke:#15803d,color:#fff
    classDef out fill:#0ea5e9,stroke:#0369a1,color:#fff
    class BASE frozen
    class LORA trained
    class FT out`,
  },
  {
    num: 4,
    title: 'RAG — Retrieval-Augmented Generation',
    blurb: 'Give an LLM fresh knowledge it never trained on — via vector databases, chunking, and retrieval.',
    lessons: 12,
    icon: BookOpen,
    firstSlug: 'introduction-to-rag',
    mermaid: `graph LR
    Q([Query]) --> R[Retrieve]
    R --> A[Augment]
    A --> G[Generate]
    G --> OUT([Grounded<br/>answer])
    classDef q fill:#0ea5e9,stroke:#0369a1,color:#fff
    classDef step fill:#14b8a6,stroke:#0f766e,color:#fff
    classDef g fill:#a855f7,stroke:#6b21a8,color:#fff
    classDef out fill:#22c55e,stroke:#15803d,color:#fff
    class Q q
    class R,A step
    class G g
    class OUT out`,
  },
  {
    num: 5,
    title: 'Context Engineering',
    blurb: 'Write, read, compress, isolate — the four verbs that turn LLMs into reliable agents.',
    lessons: 7,
    icon: Layers,
    firstSlug: '6-types-of-contexts-for-ai-agents',
    mermaid: `graph LR
    CPU["LLM<br/>(CPU)"]
    RAM["Context<br/>(RAM)"]
    CPU <--> RAM
    P[Prompting] --> RAM
    R[Retrieval] --> RAM
    T[Tools] --> RAM
    M[Memory] --> RAM
    classDef hw fill:#a855f7,stroke:#6b21a8,color:#fff
    classDef src fill:#0ea5e9,stroke:#0369a1,color:#fff
    class CPU,RAM hw
    class P,R,T,M src`,
  },
  {
    num: 6,
    title: 'AI Agents',
    blurb: 'Thought → Action → Observation. Build a ReAct agent from scratch in ~60 lines.',
    lessons: 7,
    icon: Bot,
    firstSlug: 'introduction-to-ai-agents-beginners',
    mermaid: `graph LR
    T["💭 Thought"] --> A["⚡ Action"]
    A --> O["👁️ Observation"]
    O -->|"more?"| T
    O -->|"done"| ANS([Answer])
    classDef t fill:#a855f7,stroke:#6b21a8,color:#fff
    classDef a fill:#f59e0b,stroke:#b45309,color:#1f2937
    classDef o fill:#14b8a6,stroke:#0f766e,color:#fff
    classDef ans fill:#22c55e,stroke:#15803d,color:#fff
    class T t
    class A a
    class O o
    class ANS ans`,
  },
  {
    num: 7,
    title: 'MCP — Model Context Protocol',
    blurb: 'The USB-C of AI. One protocol, any tool, any host — no more M × N integrations.',
    lessons: 11,
    icon: Workflow,
    firstSlug: 'introduction-to-mcp',
    mermaid: `graph LR
    H["🖥️ Host<br/>(AI app)"] --> C["MCP Client"]
    C -->|"MCP"| S1["⚙️ Server A"]
    C -->|"MCP"| S2["⚙️ Server B"]
    C -->|"MCP"| S3["⚙️ Server C"]
    classDef h fill:#a855f7,stroke:#6b21a8,color:#fff
    classDef c fill:#0ea5e9,stroke:#0369a1,color:#fff
    classDef s fill:#14b8a6,stroke:#0f766e,color:#fff
    class H h
    class C c
    class S1,S2,S3 s`,
  },
  {
    num: 8,
    title: 'Agent Protocol Landscape',
    blurb: 'MCP + A2A + AG-UI — the three-lane stack that connects agents to tools, other agents, and users.',
    lessons: 5,
    icon: Share2,
    firstSlug: 'the-agent-protocol-landscape',
    mermaid: `graph TB
    USR(["👤 User"]) -->|"AG-UI"| AG["Agent"]
    AG -->|"A2A"| AG2["Other agents"]
    AG -->|"MCP"| T["🛠️ Tools"]
    classDef usr fill:#0ea5e9,stroke:#0369a1,color:#fff
    classDef ag fill:#22c55e,stroke:#15803d,color:#fff
    classDef a2a fill:#f59e0b,stroke:#b45309,color:#1f2937
    classDef mcp fill:#14b8a6,stroke:#0f766e,color:#fff
    class USR usr
    class AG ag
    class AG2 a2a
    class T mcp`,
  },
];

interface Stat {
  value: string;
  label: string;
}

const STATS: Stat[] = [
  { value: '68', label: 'Lessons' },
  { value: '8', label: 'Modules' },
  { value: '85+', label: 'Diagrams' },
  { value: '~8 hrs', label: 'Deep-dive content' },
];

const YOU_WILL_LEARN = [
  'Build a ReAct agent from scratch — no frameworks, just Python',
  'Design a production RAG pipeline with the right chunking strategy',
  'Pick between prompting, fine-tuning, LoRA, and RAG for any task',
  'Connect agents to tools, other agents, and UIs via MCP / A2A / AG-UI',
  'Ship agents to production with cost caps, guardrails, and observability',
];

const AIEngBeginnersLaunchPage = () => {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const goto = (slug: string) => router.push(`/learn/${COURSE_SLUG}/${slug}`);
  const startCourse = () => goto(MODULES[0].firstSlug);

  const heroGrad = useMemo(
    () => (isDark
      ? 'radial-gradient(ellipse at top, rgba(34,197,94,0.12), transparent 60%)'
      : 'radial-gradient(ellipse at top, rgba(26,127,55,0.10), transparent 60%)'),
    [isDark],
  );

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text, minHeight: '100vh' }} data-testid="ai-eng-launch-page">
      <SEO
        title="AI Engineering for Beginners — 68 lessons, 8 modules, zero to production"
        description="The hands-on AI engineering curriculum. LLMs, prompt engineering, fine-tuning, RAG, context engineering, agents, MCP, and the full agent protocol landscape — in 68 diagram-driven lessons."
        path="/ai-engineering-for-beginners"
        type="website"
        image={`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/og-ai-eng-beginners.svg`}
        course={{
          title: 'AI Engineering for Beginners',
          name: 'AI Engineering for Beginners',
          category: 'AI & Machine Learning',
          difficulty: 'Beginner',
          lesson_count: 68,
          section_count: 8,
          price: 0,
          read_time: '~8 hours',
        }}
      />
      <PageHeader />

      <section
        className="relative overflow-hidden border-b"
        style={{ borderColor: colors.border, background: heroGrad }}
        data-testid="hero-section"
      >
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
              style={{ backgroundColor: colors.greenBg, color: colors.green, border: `1px solid ${colors.green}40` }}
              data-testid="launch-pill"
            >
              <Sparkles size={14} /> NOW LIVE · 68 lessons, fully hand-crafted
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
              style={{ color: colors.text }}
              data-testid="hero-heading"
            >
              AI Engineering for Beginners.
              <br />
              <span style={{ color: colors.green }}>Zero to production — 8 modules.</span>
            </h1>

            <p className="text-base sm:text-lg max-w-2xl mb-10 leading-relaxed" style={{ color: colors.textSecondary }}>
              A beginner-friendly path through the full AI engineering stack. How LLMs actually work, how to
              prompt and fine-tune them, how to build RAG systems, how to design agents, and how to wire
              everything together via MCP, A2A, and AG-UI.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={startCourse}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: colors.green, color: '#fff' }}
                data-testid="hero-start-course-btn"
              >
                Start the course <ArrowRight size={16} />
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border transition-colors"
                style={{ borderColor: colors.border, color: colors.text, backgroundColor: 'transparent' }}
                data-testid="hero-view-pricing-btn"
              >
                See pricing
              </button>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t"
            style={{ borderColor: colors.border }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            data-testid="stats-strip"
          >
            {STATS.map((s) => (
              <div key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, '-')}`}>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: colors.green }}>{s.value}</div>
                <div className="text-xs uppercase tracking-widest mt-1" style={{ color: colors.textSecondary }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20" data-testid="modules-section">
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-3">
            <Network size={16} style={{ color: colors.green }} />
            <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: colors.green }}>
              The curriculum
            </span>
          </div>
          <h2 className="text-base md:text-lg font-semibold mb-2" style={{ color: colors.text }}>
            8 modules · every concept with a diagram you actually understand
          </h2>
          <p className="text-sm md:text-base max-w-2xl" style={{ color: colors.textSecondary }}>
            Each module opens with the flagship diagram below. Click any card to jump straight into that module.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="modules-grid">
          {MODULES.map((m, idx) => (
            <ModuleCard key={m.num} module={m} colors={colors} isDark={isDark} onOpen={() => goto(m.firstSlug)} idx={idx} />
          ))}
        </div>
      </section>

      <section
        className="border-t"
        style={{ borderColor: colors.border, backgroundColor: colors.bgSecondary }}
        data-testid="learn-section"
      >
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} style={{ color: colors.green }} />
              <span className="text-xs uppercase tracking-widest font-semibold" style={{ color: colors.green }}>
                By the end
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: colors.text }}>
              You'll ship real things, not just know definitions.
            </h2>
            <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
              Every lesson ends with a concrete outcome. No filler, no lecture slides — each topic has a
              diagram, a code sample, and a production tip.
            </p>
          </div>

          <ul className="space-y-4" data-testid="learn-outcomes-list">
            {YOU_WILL_LEARN.map((item) => (
              <li key={item} className="flex items-start gap-3" data-testid="learn-outcome-item">
                <CheckCircle2 size={18} className="mt-1 shrink-0" style={{ color: colors.green }} />
                <span className="text-sm md:text-base" style={{ color: colors.text }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center" data-testid="final-cta-section">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
          style={{ backgroundColor: colors.greenBg, color: colors.green, border: `1px solid ${colors.green}40` }}>
          <Sparkles size={14} /> Free first lesson in every module
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ color: colors.text }}>
          Ready to build?
        </h2>
        <p className="text-base md:text-lg max-w-xl mx-auto mb-10" style={{ color: colors.textSecondary }}>
          Start with Lesson 1 of Module 1 — <em>What is an LLM?</em>. No sign-up needed to begin.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={startCourse}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: colors.green, color: '#fff' }}
            data-testid="final-cta-start-btn"
          >
            Start learning now <ArrowRight size={16} />
          </button>
          <button
            onClick={() => router.push(`/course/${COURSE_SLUG}`)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm border"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: 'transparent' }}
            data-testid="final-cta-preview-btn"
          >
            View full syllabus
          </button>
        </div>
      </section>
    </div>
  );
};

interface ModuleCardProps {
  module: Module;
  colors: Record<string, string>;
  isDark: boolean;
  onOpen: () => void;
  idx: number;
}

function ModuleCard({ module: m, colors, isDark, onOpen, idx }: ModuleCardProps) {
  const Icon = m.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, delay: idx * 0.04 }}
      className="group rounded-xl overflow-hidden border transition-all cursor-pointer"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.bgCard,
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = colors.green; }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = colors.border; }}
      onClick={onOpen}
      data-testid={`module-card-${m.num}`}
    >
      <div
        className="px-4 py-4 border-b"
        style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, minHeight: 180 }}
        data-testid={`module-mermaid-${m.num}`}
      >
        <MermaidDiagram
          code={m.mermaid}
          theme={isDark ? 'dark' : 'light'}
          diagramTheme="brand"
          colors={colors}
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ backgroundColor: colors.greenBg, color: colors.green }}
            >
              <Icon size={16} />
            </div>
            <span className="text-xs font-mono uppercase tracking-widest" style={{ color: colors.textMuted }}>
              Module {m.num} · {m.lessons} lessons
            </span>
          </div>
          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
            style={{ color: colors.green }}
          />
        </div>
        <h3 className="text-base md:text-lg font-semibold mb-2" style={{ color: colors.text }} data-testid={`module-title-${m.num}`}>
          {m.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
          {m.blurb}
        </p>
      </div>
    </motion.div>
  );
}

export default AIEngBeginnersLaunchPage;
