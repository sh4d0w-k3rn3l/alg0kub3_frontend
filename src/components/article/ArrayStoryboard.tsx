'use client';

interface StoryboardPointer {
  name: string;
  index: number;
  position?: 'above' | 'below';
}

interface StoryboardStep {
  description?: string;
  array?: (string | number)[];
  pointers?: StoryboardPointer[];
  highlights?: number[];
  finalized?: number[];
  swapping?: number[];
}

/**
 * ArrayStoryboard — static multi-step vertical layout for array walkthroughs.
 *
 * Unlike `ArrayWalkthrough` (which has playback controls and shows one step at a time),
 * the storyboard renders ALL steps stacked, each with a numbered circle, a description,
 * and an array figure. Ideal for "Approach 1" style explanations where the reader
 * wants to see the entire logical progression at a glance without pressing Play.
 *
 * Content block shape:
 *   { type: 'walkthrough_storyboard', title?, steps: [
 *       { description, array, pointers?, highlights?, finalized?, swapping? }
 *   ]}
 */
const COLORS = {
  default:   { bg: '#0d1117',  border: '#30363d', text: '#e5e5e5' },
  highlight: { bg: '#052e16',  border: '#22c55e', text: '#bbf7d0' },
  swapping:  { bg: '#431407',  border: '#f97316', text: '#fed7aa' },
  finalized: { bg: '#064e3b',  border: '#22c55e', text: '#ecfdf5' },
};

const POINTER_PALETTE = ['#3b82f6', '#f97316', '#a855f7', '#eab308', '#ec4899'];

const Cell = ({ value, index, cellState }: { value: string | number; index: number; cellState: string }) => {
  const c = COLORS[cellState as keyof typeof COLORS] || COLORS.default;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ fontSize: 11, color: '#8b949e', fontFamily: 'ui-monospace,SFMono-Regular,monospace' }}>{index}</div>
      <div
        style={{
          minWidth: 52, minHeight: 52, padding: '8px 10px',
          display: 'grid', placeItems: 'center',
          background: c.bg, border: `2px solid ${c.border}`, borderRadius: 8,
          fontFamily: 'ui-monospace,SFMono-Regular,monospace', fontWeight: 700, fontSize: 16,
          color: c.text,
        }}
      >
        {value}
      </div>
    </div>
  );
};

const Pointer = ({ name, color, offsetCells, position = 'above' }: { name: string; color: string; offsetCells: number; position?: 'above' | 'below' }) => {
  const isBelow = position === 'below';
  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(${offsetCells * 60}px + 6px)`,
        top: 0,
        display: 'flex', flexDirection: isBelow ? 'column-reverse' : 'column', alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color, padding: '2px 8px', background: `${color}22`, border: `1px solid ${color}66`, borderRadius: 6, fontFamily: 'ui-monospace,SFMono-Regular,monospace', whiteSpace: 'nowrap' }}>
        {name}
      </div>
      <div style={{ fontSize: 14, color, lineHeight: 1 }}>{isBelow ? '↑' : '↓'}</div>
    </div>
  );
};

interface ArrayStoryboardProps {
  title?: string;
  steps?: StoryboardStep[];
  isDark?: boolean;
}

const ArrayStoryboard = ({ title, steps = [], isDark = true }: ArrayStoryboardProps) => {
  const allNames = Array.from(new Set(steps.flatMap((s: StoryboardStep) => (s.pointers || []).map((p: StoryboardPointer) => p.name))));
  const colorMap = Object.fromEntries(allNames.map((n: string, i: number) => [n, POINTER_PALETTE[i % POINTER_PALETTE.length]]));

  const cellState = (step: StoryboardStep, i: number): string => {
    if ((step.swapping || []).includes(i)) return 'swapping';
    if ((step.finalized || []).includes(i)) return 'finalized';
    if ((step.highlights || []).includes(i)) return 'highlight';
    return 'default';
  };

  return (
    <div
      data-testid="walkthrough-storyboard"
      style={{
        background: isDark ? 'rgba(13,17,23,0.6)' : 'rgba(246,248,250,0.9)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 14, padding: 0, margin: '20px 0',
        overflow: 'hidden',
      }}
    >
      {title && (
        <div
          style={{
            padding: '12px 20px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            fontSize: 13, fontWeight: 600, color: isDark ? '#9ca3af' : '#4b5563',
            textTransform: 'uppercase', letterSpacing: 0.5,
          }}
        >
          {title}
        </div>
      )}

      {steps.map((step: StoryboardStep, i: number) => {
        const hasAbove = (step.pointers || []).some((p: StoryboardPointer) => (p.position || 'above') === 'above');
        const hasBelow = (step.pointers || []).some((p: StoryboardPointer) => p.position === 'below');
        return (
          <div
            key={i}
            style={{
              display: 'flex', gap: 16, padding: '20px',
              borderBottom: i < steps.length - 1 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none',
            }}
          >
            <div
              style={{
                flex: '0 0 32px', width: 32, height: 32, borderRadius: 999,
                background: '#22c55e', color: '#0a0a0a', fontWeight: 700,
                display: 'grid', placeItems: 'center', fontSize: 14,
                fontFamily: 'ui-monospace,SFMono-Regular,monospace',
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {step.description && (
                <div style={{ fontSize: 14, color: isDark ? '#d1fae5' : '#065f46', fontFamily: 'ui-monospace,SFMono-Regular,monospace', marginBottom: 12 }}>
                  {step.description}
                </div>
              )}
              <div style={{ position: 'relative', overflowX: 'auto' }}>
                {hasAbove && (
                  <div style={{ position: 'relative', height: 42 }}>
                    {(step.pointers || []).filter((p: StoryboardPointer) => (p.position || 'above') === 'above').map((p: StoryboardPointer, pi: number) => (
                      <Pointer key={`a-${pi}`} name={p.name} color={colorMap[p.name] || POINTER_PALETTE[0]} offsetCells={p.index} position="above" />
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
                  {(step.array || []).map((v: string | number, ci: number) => (
                    <Cell key={ci} value={v} index={ci} cellState={cellState(step, ci)} />
                  ))}
                </div>
                {hasBelow && (
                  <div style={{ position: 'relative', height: 42, marginTop: 4 }}>
                    {(step.pointers || []).filter((p: StoryboardPointer) => p.position === 'below').map((p: StoryboardPointer, pi: number) => (
                      <Pointer key={`b-${pi}`} name={p.name} color={colorMap[p.name] || POINTER_PALETTE[0]} offsetCells={p.index} position="below" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ArrayStoryboard;
