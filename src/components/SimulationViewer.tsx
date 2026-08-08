'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAnimationDetail } from '@/hooks/useAnimations';
import { evalBundle, type AnimationBundle } from '@/utils/bundleRuntime';

interface SimulationViewerProps {
  id: string;
  category?: string;
  premium?: boolean;
}

const SimulationViewer: React.FC<SimulationViewerProps> = ({ id, category }) => {
  const { algorithm, loading, error } = useAnimationDetail(id, category);
  const [Comp, setComp] = useState<React.ComponentType | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!algorithm) return;
    const anim = (algorithm.animation ?? {}) as Partial<AnimationBundle>;
    if (anim.type !== 'component') {
      const id = setTimeout(() => {
        if (mounted.current) setRenderError('This animation uses a different format.');
      }, 0);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => {
      try {
        const mod = evalBundle(anim as AnimationBundle);
        const Comp = (mod && (mod as { default?: React.ComponentType }).default) || (mod as React.ComponentType);
        if (typeof Comp !== 'function') {
          if (mounted.current) setRenderError('Animation bundle did not export a component.');
          return;
        }
        if (mounted.current) setComp(() => Comp as React.ComponentType);
      } catch (err) {
        if (mounted.current) {
          setRenderError(err instanceof Error ? err.message : 'Failed to render animation.');
        }
      }
    }, 0);
    return () => clearTimeout(id);
  }, [algorithm]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#14b8a6] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading animation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (renderError) {
    return (
      <div className="text-center py-32">
        <p className="text-red-400 text-sm">{renderError}</p>
      </div>
    );
  }

  if (!Comp) return null;

  return (
    <div className="w-full">
      <Comp />
    </div>
  );
};

export default SimulationViewer;
