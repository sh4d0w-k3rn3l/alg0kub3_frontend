'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { GitBranch } from 'lucide-react';
import mermaid from 'mermaid';
import type { MermaidConfig } from 'mermaid';
import { sanitizeHtml } from '@/lib/sanitize';

interface ThemeConfig {
  theme: string;
  themeVariables?: Record<string, string>;
}

const MERMAID_THEME_CONFIGS: Record<string, ThemeConfig> = {
  brand: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#22c55e', primaryTextColor: '#ffffff', primaryBorderColor: '#16a34a',
      secondaryColor: '#3b82f6', secondaryTextColor: '#ffffff', secondaryBorderColor: '#2563eb',
      tertiaryColor: '#0d1117', tertiaryTextColor: '#c9d1d9', tertiaryBorderColor: '#2d333b',
      lineColor: '#484f58', textColor: '#c9d1d9', mainBkg: '#161b22',
      nodeBorder: '#22c55e', clusterBkg: '#0d1117', clusterBorder: '#2d333b',
      titleColor: '#c9d1d9', edgeLabelBackground: '#161b22', nodeTextColor: '#ffffff',
    }
  },
  'brand-blue': {
    theme: 'base',
    themeVariables: {
      primaryColor: '#3b82f6', primaryTextColor: '#ffffff', primaryBorderColor: '#2563eb',
      secondaryColor: '#22c55e', secondaryTextColor: '#ffffff', secondaryBorderColor: '#16a34a',
      tertiaryColor: '#0d1117', tertiaryTextColor: '#c9d1d9', tertiaryBorderColor: '#2d333b',
      lineColor: '#484f58', textColor: '#c9d1d9', mainBkg: '#161b22',
      nodeBorder: '#3b82f6', clusterBkg: '#0d1117', clusterBorder: '#2d333b',
      titleColor: '#c9d1d9', edgeLabelBackground: '#161b22', nodeTextColor: '#ffffff',
    }
  },
  'brand-purple': {
    theme: 'base',
    themeVariables: {
      primaryColor: '#a855f7', primaryTextColor: '#ffffff', primaryBorderColor: '#9333ea',
      secondaryColor: '#22c55e', secondaryTextColor: '#ffffff', secondaryBorderColor: '#16a34a',
      tertiaryColor: '#0d1117', tertiaryTextColor: '#c9d1d9', tertiaryBorderColor: '#2d333b',
      lineColor: '#484f58', textColor: '#c9d1d9', mainBkg: '#161b22',
      nodeBorder: '#a855f7', clusterBkg: '#0d1117', clusterBorder: '#2d333b',
      titleColor: '#c9d1d9', edgeLabelBackground: '#161b22', nodeTextColor: '#ffffff',
    }
  },
};

const MERMAID_LIGHT_THEME_CONFIGS: Record<string, ThemeConfig> = {
  brand: {
    theme: 'base',
    themeVariables: {
      primaryColor: '#dcfce7', primaryTextColor: '#166534', primaryBorderColor: '#22c55e',
      secondaryColor: '#dbeafe', secondaryTextColor: '#1e40af', secondaryBorderColor: '#3b82f6',
      tertiaryColor: '#f8fafc', tertiaryTextColor: '#334155', tertiaryBorderColor: '#e2e8f0',
      lineColor: '#94a3b8', textColor: '#334155', mainBkg: '#ffffff',
      nodeBorder: '#22c55e', clusterBkg: '#f8fafc', clusterBorder: '#e2e8f0',
      titleColor: '#334155', edgeLabelBackground: '#ffffff', nodeTextColor: '#166534',
    }
  },
  'brand-blue': {
    theme: 'base',
    themeVariables: {
      primaryColor: '#dbeafe', primaryTextColor: '#1e40af', primaryBorderColor: '#3b82f6',
      secondaryColor: '#dcfce7', secondaryTextColor: '#166534', secondaryBorderColor: '#22c55e',
      tertiaryColor: '#f8fafc', tertiaryTextColor: '#334155', tertiaryBorderColor: '#e2e8f0',
      lineColor: '#94a3b8', textColor: '#334155', mainBkg: '#ffffff',
      nodeBorder: '#3b82f6', clusterBkg: '#f8fafc', clusterBorder: '#e2e8f0',
      titleColor: '#334155', edgeLabelBackground: '#ffffff', nodeTextColor: '#1e40af',
    }
  },
  'brand-purple': {
    theme: 'base',
    themeVariables: {
      primaryColor: '#f3e8ff', primaryTextColor: '#7e22ce', primaryBorderColor: '#a855f7',
      secondaryColor: '#dcfce7', secondaryTextColor: '#166534', secondaryBorderColor: '#22c55e',
      tertiaryColor: '#f8fafc', tertiaryTextColor: '#334155', tertiaryBorderColor: '#e2e8f0',
      lineColor: '#94a3b8', textColor: '#334155', mainBkg: '#ffffff',
      nodeBorder: '#a855f7', clusterBkg: '#f8fafc', clusterBorder: '#e2e8f0',
      titleColor: '#334155', edgeLabelBackground: '#ffffff', nodeTextColor: '#7e22ce',
    }
  },
};

interface MermaidDiagramProps {
  code?: string;
  title?: string;
  theme: string;
  diagramTheme?: string;
  colors: Record<string, string>;
}

const MermaidDiagram = ({ code = '', title = '', theme: appTheme, diagramTheme = 'brand', colors }: MermaidDiagramProps) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = appTheme === 'dark';
  const renderedCodeRef = useRef<string>('');
  // Detect if code has classDef AND actually applies them via :::
  const hasClassApplied = code?.includes('classDef ') && code?.includes(':::');

  const themeConfig = useMemo(() => {
    if (hasClassApplied) {
      // Minimal theme: only set background, lines, text — let classDef handle node colors.
      // We still provide explicit text colors for elements NOT covered by classDef
      // (sequence-diagram actors, messages, notes, flowchart nodes without :::).
      return isDark ? {
        theme: 'base',
        themeVariables: {
          lineColor: '#484f58', textColor: '#e6edf3', mainBkg: '#161b22',
          clusterBkg: '#0d111780', clusterBorder: '#2d333b',
          titleColor: '#e6edf3', edgeLabelBackground: '#161b22',
          // explicit text colors so every auto-styled element stays readable
          primaryTextColor: '#e6edf3', secondaryTextColor: '#e6edf3',
          tertiaryTextColor: '#e6edf3', nodeTextColor: '#e6edf3',
          // sequence-diagram specific
          actorBkg: '#161b22', actorBorder: '#30363d', actorTextColor: '#e6edf3',
          actorLineColor: '#30363d', signalColor: '#e6edf3', signalTextColor: '#e6edf3',
          labelBoxBkgColor: '#161b22', labelBoxBorderColor: '#30363d', labelTextColor: '#e6edf3',
          loopTextColor: '#e6edf3', noteBkgColor: '#fde68a', noteTextColor: '#1f2937', noteBorderColor: '#f59e0b',
          activationBkgColor: '#30363d', activationBorderColor: '#484f58',
          sequenceNumberColor: '#0d1117',
          // state diagram
          stateBkg: '#161b22', stateLabelColor: '#e6edf3', altBackground: '#0d1117',
          // pie chart
          pieTitleTextColor: '#e6edf3', pieSectionTextColor: '#0d1117', pieLegendTextColor: '#e6edf3',
        }
      } : {
        theme: 'base',
        themeVariables: {
          lineColor: '#64748b', textColor: '#0f172a', mainBkg: '#ffffff',
          clusterBkg: '#f8fafc', clusterBorder: '#cbd5e1',
          titleColor: '#0f172a', edgeLabelBackground: '#ffffff',
          primaryTextColor: '#0f172a', secondaryTextColor: '#0f172a',
          tertiaryTextColor: '#0f172a', nodeTextColor: '#0f172a',
          actorBkg: '#f1f5f9', actorBorder: '#94a3b8', actorTextColor: '#0f172a',
          actorLineColor: '#94a3b8', signalColor: '#0f172a', signalTextColor: '#0f172a',
          labelBoxBkgColor: '#f1f5f9', labelBoxBorderColor: '#cbd5e1', labelTextColor: '#0f172a',
          loopTextColor: '#0f172a', noteBkgColor: '#fef3c7', noteTextColor: '#78350f', noteBorderColor: '#f59e0b',
          activationBkgColor: '#e2e8f0', activationBorderColor: '#94a3b8',
          sequenceNumberColor: '#ffffff',
          stateBkg: '#f1f5f9', stateLabelColor: '#0f172a', altBackground: '#f8fafc',
          pieTitleTextColor: '#0f172a', pieSectionTextColor: '#ffffff', pieLegendTextColor: '#0f172a',
        }
      };
    }
    const themeConfigs = isDark ? MERMAID_THEME_CONFIGS : MERMAID_LIGHT_THEME_CONFIGS;
    return themeConfigs[diagramTheme] || themeConfigs.brand;
  }, [isDark, diagramTheme, hasClassApplied]);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code?.trim()) { setSvg(''); setError(''); return; }
      const key = `${code}|${isDark}|${diagramTheme}`;
      if (renderedCodeRef.current === key && svg) return;
      renderedCodeRef.current = key;
      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          ...themeConfig
        } as MermaidConfig);
        const uniqueId = `mermaid-article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(uniqueId, code);
        setSvg(renderedSvg);
        setError('');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Invalid diagram');
        setSvg('');
        document.querySelectorAll(`[id^="dmermaid-"]`).forEach(el => el.remove());
      }
    };
    renderDiagram();
  }, [code, themeConfig, isDark, diagramTheme, svg]);

  return (
    <div className="mb-5">
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <GitBranch size={16} style={{ color: '#22c55e' }} />
          <span className="font-medium" style={{ color: colors.text }}>{title}</span>
        </div>
      )}
      <div ref={containerRef} className="rounded-lg border p-4 overflow-auto" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
        {svg && <div className="flex items-center justify-center mermaid-diagram" dangerouslySetInnerHTML={{ __html: sanitizeHtml(svg) }} />}
        {error && (
          <div className="text-red-400 text-sm text-center py-4">
            <GitBranch size={24} className="mx-auto mb-2 opacity-50" />
            <p>Diagram error: {error}</p>
          </div>
        )}
        {!svg && !error && (
          <div className="text-center py-4" style={{ color: colors.textMuted }}>
            <GitBranch size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No diagram</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MermaidDiagram;
