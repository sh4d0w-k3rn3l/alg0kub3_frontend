'use client';
import React, { useState } from 'react';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { displayDifficulty } from '@/hooks/useAnimations';

interface Algorithm {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

interface AlgorithmCardProps {
  algorithm: Algorithm;
}

const AlgorithmCard = ({ algorithm }: AlgorithmCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getDifficultyStyles = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-[#0d2818] text-[#22c55e] border border-[#22c55e]/30';
      case 'medium':
        return 'bg-[#2d2305] text-[#eab308] border border-[#eab308]/30';
      case 'hard':
        return 'bg-[#2d0a0a] text-[#ef4444] border border-[#ef4444]/30';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <Link
      href={`/animations/dsa/${algorithm.id}`}
      className="block group"
    >
      <div className="bg-[#141416] border border-[#1f1f23] rounded-lg p-4 hover:border-[#2f2f35] hover:bg-[#18181b] transition-all duration-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium text-base mb-1 group-hover:text-[#22c55e] transition-colors truncate">
              {algorithm.title}
            </h3>
            <p className="text-gray-500 text-sm line-clamp-2">
              {algorithm.description}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyStyles(algorithm.difficulty)}`}>
              {displayDifficulty(algorithm.difficulty)}
            </span>
            <button
              onClick={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              className="p-1 text-gray-500 hover:text-white transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-white text-white' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AlgorithmCard;
