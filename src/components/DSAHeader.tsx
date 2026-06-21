'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const DSAHeader = () => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#0a0a0b] via-[#0f0f12] to-[#0a0a0b] border-b border-[#1f1f23]/50 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            data-testid="dsa-back-to-home"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="w-px h-6 bg-[#2f2f35]/50" />

          <Link href="/animations/dsa" className="flex items-center gap-3 group" data-testid="dsa-logo-link">
            <div className="relative">
              <div className="absolute inset-0 bg-[#22c55e]/20 blur-xl rounded-full group-hover:bg-[#22c55e]/30 transition-all duration-300" />
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                  <defs>
                    <linearGradient id="dsaCubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#15803d" />
                    </linearGradient>
                    <linearGradient id="dsaCubeSide" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#16a34a" />
                      <stop offset="100%" stopColor="#14532d" />
                    </linearGradient>
                  </defs>
                  <polygon points="20,4 34,12 20,20 6,12" fill="url(#dsaCubeGradient)" className="group-hover:opacity-90 transition-opacity" />
                  <polygon points="6,12 20,20 20,36 6,28" fill="url(#dsaCubeSide)" opacity="0.8" />
                  <polygon points="20,20 34,12 34,28 20,36" fill="#15803d" opacity="0.6" />
                  <circle cx="20" cy="12" r="2" fill="#ffffff" opacity="0.9" />
                  <circle cx="13" cy="16" r="1.5" fill="#ffffff" opacity="0.7" />
                  <circle cx="27" cy="16" r="1.5" fill="#ffffff" opacity="0.7" />
                  <circle cx="20" cy="24" r="1.5" fill="#ffffff" opacity="0.5" />
                  <line x1="20" y1="12" x2="13" y2="16" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
                  <line x1="20" y1="12" x2="27" y2="16" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
                  <line x1="13" y1="16" x2="20" y2="24" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
                  <line x1="27" y1="16" x2="20" y2="24" stroke="#ffffff" strokeWidth="0.5" opacity="0.3" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-white">Algo</span>
                <span className="text-[#22c55e]">Kube</span>
              </span>
              <span className="text-[10px] text-gray-500 tracking-wider uppercase -mt-0.5">
                DSA Visualizer
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#1f1f23]/50 rounded-full border border-[#2f2f35]/50">
            <div className="w-1.5 h-1.5 bg-[#22c55e] rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">175 Algorithms</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DSAHeader;
