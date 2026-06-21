'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, Cpu, Brain, Users, Cloud, Terminal } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const FACES = [
  { id: 'front',  label: 'DSA',            sub: 'Patterns & Problems',  icon: Code2,    gradient: ['#059669','#10b981'], route: '/courses?category=Data+Structures+%26+Algorithms' },
  { id: 'back',   label: 'System Design',  sub: 'Scale & Architecture', icon: Cpu,      gradient: ['#2563eb','#3b82f6'], route: '/practice/system-design' },
  { id: 'right',  label: 'AI / ML',        sub: 'Models & Pipelines',   icon: Brain,    gradient: ['#7c3aed','#a78bfa'], route: '/courses?category=AI+%26+Machine+Learning' },
  { id: 'left',   label: 'Behavioral',     sub: 'Stories & Frameworks', icon: Users,    gradient: ['#d97706','#fbbf24'], route: '/courses' },
  { id: 'top',    label: 'DevOps',         sub: 'CI/CD & Cloud',        icon: Cloud,    gradient: ['#0891b2','#22d3ee'], route: '/courses?category=DevOps' },
  { id: 'bottom', label: 'Programming',    sub: 'Languages & Craft',    icon: Terminal, gradient: ['#dc2626','#f87171'], route: '/courses?category=Programming+Languages' },
];

const SIZE = 190;
const HALF = SIZE / 2;

const STYLE_ID = 'skills-cube-v2';
const injectStyles = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes cube-rotate {
      0%   { transform: rotateX(-18deg) rotateY(0deg); }
      25%  { transform: rotateX(12deg)  rotateY(90deg); }
      50%  { transform: rotateX(-8deg)  rotateY(180deg); }
      75%  { transform: rotateX(14deg)  rotateY(270deg); }
      100% { transform: rotateX(-18deg) rotateY(360deg); }
    }
    @keyframes cube-enter {
      0%   { transform: scale(0.2) rotateX(50deg) rotateY(-40deg); opacity: 0; }
      50%  { transform: scale(1.06) rotateX(-8deg) rotateY(8deg); opacity: 1; }
      70%  { transform: scale(0.97) rotateX(3deg) rotateY(-3deg); }
      100% { transform: scale(1) rotateX(0) rotateY(0); }
    }
    @keyframes face-shine {
      0%   { left: -60%; }
      100% { left: 160%; }
    }
    @keyframes orbit-a { 0%{transform:rotate(0deg) translateX(130px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(130px) rotate(-360deg)} }
    @keyframes orbit-b { 0%{transform:rotate(120deg) translateX(120px) rotate(-120deg)} 100%{transform:rotate(480deg) translateX(120px) rotate(-480deg)} }
    @keyframes orbit-c { 0%{transform:rotate(240deg) translateX(140px) rotate(-240deg)} 100%{transform:rotate(600deg) translateX(140px) rotate(-600deg)} }
    @keyframes orbit-d { 0%{transform:rotate(60deg) translateX(125px) rotate(-60deg)} 100%{transform:rotate(420deg) translateX(125px) rotate(-420deg)} }
    @keyframes sparkle { 0%,100%{opacity:0.15;transform:scale(0.6)} 50%{opacity:0.8;transform:scale(1.3)} }
    @keyframes shadow-breathe { 0%,100%{opacity:0.2;transform:translateX(-50%) scaleX(1)} 50%{opacity:0.35;transform:translateX(-50%) scaleX(1.1)} }
  `;
  document.head.appendChild(s);
};

const transforms = {
  front:  `rotateY(0deg)   translateZ(${HALF}px)`,
  back:   `rotateY(180deg) translateZ(${HALF}px)`,
  right:  `rotateY(90deg)  translateZ(${HALF}px)`,
  left:   `rotateY(-90deg) translateZ(${HALF}px)`,
  top:    `rotateX(90deg)  translateZ(${HALF}px)`,
  bottom: `rotateX(-90deg) translateZ(${HALF}px)`,
};

const getActiveFace = (rx: number, ry: number) => {
  const x = ((rx % 360) + 360) % 360;
  const y = ((ry % 360) + 360) % 360;
  if (x > 45 && x < 135) return 'bottom';
  if (x > 225 && x < 315) return 'top';
  if (y >= 315 || y < 45) return 'front';
  if (y >= 45 && y < 135) return 'right';
  if (y >= 135 && y < 225) return 'back';
  return 'left';
};

const SkillsCube = () => {
  const navigate = useRouter();
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [entered, setEntered] = useState<boolean>(false);
  const [hovered, setHovered] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const [didDrag, setDidDrag] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rot, setRot] = useState({ x: -18, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0, rx: 0, ry: 0 });
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { injectStyles(); requestAnimationFrame(() => setEntered(true)); }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setDidDrag(false);
    setDragging(true);
    clearTimeout(resumeTimer.current ?? undefined);
    start.current = { x: e.clientX, y: e.clientY, rx: rot.x, ry: rot.y };
  }, [rot]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) {
      if (hovered && containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        setTilt({ x: -dy * 10, y: dx * 10 });
      }
      return;
    }
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      setDidDrag(true);
      setAutoRotate(false);
    }
    if (Math.sqrt(dx * dx + dy * dy) > 5) {
      setRot({ x: start.current.rx - dy * 0.5, y: start.current.ry + dx * 0.5 });
    }
  }, [dragging, hovered]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
    resumeTimer.current = setTimeout(() => setAutoRotate(true), 3000);
  }, []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const S = 45;
    if (e.key === 'ArrowLeft')  { setAutoRotate(false); setRot(p => ({ ...p, y: p.y - S })); }
    if (e.key === 'ArrowRight') { setAutoRotate(false); setRot(p => ({ ...p, y: p.y + S })); }
    if (e.key === 'ArrowUp')    { setAutoRotate(false); setRot(p => ({ ...p, x: p.x + S })); }
    if (e.key === 'ArrowDown')  { setAutoRotate(false); setRot(p => ({ ...p, x: p.x - S })); }
    if (e.key === 'Enter') {
      const f = FACES.find(f => f.id === getActiveFace(rot.x, rot.y));
      if (f) navigate.push(f.route);
    }
    clearTimeout(resumeTimer.current ?? undefined);
    resumeTimer.current = setTimeout(() => setAutoRotate(true), 3000);
  }, [rot, navigate]);

  const onContainerClick = useCallback(() => {
    if (!didDrag && autoRotate) navigate.push(FACES[0].route);
  }, [didDrag, autoRotate, navigate]);

  const activeFace = !autoRotate ? FACES.find(f => f.id === getActiveFace(rot.x, rot.y)) : null;
  const glowColor = activeFace?.gradient[0] || '#22c55e';

  const orbitParticles = [
    { anim: 'orbit-a', dur: '9s',  color: FACES[0].gradient[1] },
    { anim: 'orbit-b', dur: '11s', color: FACES[2].gradient[1] },
    { anim: 'orbit-c', dur: '13s', color: FACES[3].gradient[1] },
    { anim: 'orbit-d', dur: '10s', color: FACES[4].gradient[1] },
  ];

  const sparkles = [
    { top: '6%',  left: '10%', c: '#10b981', d: '0s',   t: '3.2s' },
    { top: '12%', left: '88%', c: '#3b82f6', d: '0.7s', t: '2.8s' },
    { top: '82%', left: '14%', c: '#fbbf24', d: '1.2s', t: '3.6s' },
    { top: '78%', left: '85%', c: '#a78bfa', d: '1.8s', t: '2.4s' },
    { top: '48%', left: '4%',  c: '#22d3ee', d: '0.4s', t: '3.0s' },
    { top: '52%', left: '96%', c: '#f87171', d: '2.2s', t: '2.6s' },
  ];

  return (
    <div
      ref={containerRef}
      data-testid="skills-cube-container"
      className="relative flex items-center justify-center select-none outline-none"
      style={{ width: 380, height: 420, perspective: 1000 }}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => { setTilt({ x: 0, y: 0 }); setHovered(false); if (dragging) onPointerUp(); }}
      onPointerEnter={() => setHovered(true)}
      onKeyDown={onKeyDown}
      onClick={onContainerClick}
      role="group"
      aria-label="3D Skills Cube - drag or arrow keys to rotate, Enter to navigate"
    >
      {/* Orbit particles */}
      {orbitParticles.map((p, i) => (
        <div key={i} className="absolute pointer-events-none" style={{
          top: '50%', left: '50%', width: 0, height: 0,
          animation: `${p.anim} ${p.dur} linear infinite`,
          opacity: hovered ? 0.7 : 0.3, transition: 'opacity 0.5s',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 10px ${p.color}, 0 0 24px ${p.color}50`,
          }} />
        </div>
      ))}

      {/* Corner sparkles */}
      {sparkles.map((s, i) => (
        <div key={`s${i}`} className="absolute pointer-events-none" style={{
          top: s.top, left: s.left,
          width: 4, height: 4, borderRadius: '50%',
          background: s.c, boxShadow: `0 0 8px ${s.c}`,
          animation: `sparkle ${s.t} ease-in-out ${s.d} infinite`,
        }} />
      ))}

      {/* Cube */}
      <div
        data-testid="skills-cube"
        style={{
          width: SIZE, height: SIZE,
          transformStyle: 'preserve-3d',
          animation: entered
            ? (autoRotate ? 'cube-rotate 12s cubic-bezier(0.45,0.05,0.55,0.95) infinite' : 'none')
            : 'cube-enter 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
          transform: autoRotate ? undefined : `rotateX(${rot.x + tilt.x}deg) rotateY(${rot.y + tilt.y}deg)`,
          transition: dragging ? 'none' : 'transform 0.35s ease-out',
          cursor: dragging ? 'grabbing' : 'grab',
          filter: hovered ? `drop-shadow(0 0 40px ${glowColor}40)` : 'none',
          scale: hovered ? '1.06' : '1',
        }}
      >
        {FACES.map((face) => {
          const Icon = face.icon;
          return (
            <div
              key={face.id}
              data-testid={`cube-face-${face.id}`}
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (!didDrag) navigate.push(face.route); }}
              style={{
                position: 'absolute', width: SIZE, height: SIZE,
                transform: transforms[face.id as keyof typeof transforms],
                backfaceVisibility: 'hidden',
                borderRadius: 18,
                overflow: 'hidden',
                cursor: 'pointer',
                background: `linear-gradient(145deg, ${face.gradient[0]}, ${face.gradient[1]})`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: isDark
                  ? `inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.5)`
                  : `inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.1), 0 8px 32px rgba(0,0,0,0.15)`,
              }}
            >
              {/* Subtle glass overlay for depth */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
                background: isDark
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(0,0,0,0.08) 100%)',
              }} />

              {/* Shine sweep */}
              <div style={{
                position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 18, pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute', top: '-20%', width: '40%', height: '140%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
                  animation: 'face-shine 5s ease-in-out infinite',
                  transform: 'rotate(15deg)',
                }} />
              </div>

              {/* Border glow ring */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
                border: `1.5px solid rgba(255,255,255,${isDark ? 0.2 : 0.35})`,
              }} />

              {/* Icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}>
                <Icon size={26} color="#fff" strokeWidth={2.2} />
              </div>

              {/* Label */}
              <span style={{
                fontSize: 16, fontWeight: 800, color: '#fff',
                letterSpacing: '0.02em', textAlign: 'center',
                textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                lineHeight: 1.2,
              }}>
                {face.label}
              </span>

              {/* Subtitle */}
              <span style={{
                fontSize: 10, color: 'rgba(255,255,255,0.8)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                fontWeight: 700, textAlign: 'center',
                textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              }}>
                {face.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reflection / ground shadow */}
      <div style={{
        position: 'absolute', bottom: 18, left: '50%',
        transform: 'translateX(-50%)',
        width: SIZE * 0.65, height: 14, borderRadius: '50%',
        background: isDark
          ? `radial-gradient(ellipse, ${glowColor}35, transparent 70%)`
          : `radial-gradient(ellipse, rgba(0,0,0,0.12), transparent 70%)`,
        filter: 'blur(6px)',
        animation: 'shadow-breathe 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Drag hint */}
      <div
        data-testid="cube-drag-hint"
        style={{
          position: 'absolute', bottom: -2, left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          fontWeight: 600, whiteSpace: 'nowrap',
          color: isDark ? '#6b7280' : '#9ca3af',
          opacity: hovered ? 0 : 0.7,
          transition: 'opacity 0.3s',
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Drag to explore
      </div>
    </div>
  );
};

export default SkillsCube;
