'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, ChevronDown, Bookmark } from 'lucide-react';
import Header from '@/components/DSAHeader';
import AlgorithmCard from '@/components/AlgorithmCard';
import { algorithms, categories, difficulties } from '@/data/mockData';

const DSAAnimations = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All Difficulties');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showBookmarked, setShowBookmarked] = useState(false);

  const filteredAlgorithms = useMemo(() => {
    return algorithms.filter((algo: any) => {
      const matchesSearch = algo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All Categories' || algo.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All Difficulties' || algo.difficulty === selectedDifficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const groupedAlgorithms = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredAlgorithms.forEach((algo: any) => {
      if (!groups[algo.category]) {
        groups[algo.category] = [];
      }
      groups[algo.category].push(algo);
    });
    return groups;
  }, [filteredAlgorithms]);

  const categoryOrder = categories.filter((c: string) => c !== 'All Categories');

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header />

      <main className="max-w-[1000px] mx-auto px-4 py-8">
        <Link
          href="/animations/dsa"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Animations
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              AlgoKube DSA Animations
            </h1>
            <p className="text-gray-400">
              Interactive visualizations for data structures and algorithms
            </p>
          </div>
          <Link
            href="/animations/dsa/compare"
            className="flex items-center gap-2 px-4 py-2 bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            Compare Algorithms
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search algorithms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141416] border border-[#1f1f23] rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#2f2f35] text-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowDifficultyDropdown(false);
              }}
              className="flex items-center gap-2 bg-[#141416] border border-[#1f1f23] rounded-md px-4 py-2 text-gray-300 hover:border-[#2f2f35] transition-colors text-sm min-w-[160px]"
            >
              <span className="flex-1 text-left">{selectedCategory}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#141416] border border-[#1f1f23] rounded-md shadow-xl z-50 w-64 max-h-80 overflow-y-auto">
                {categories.map((cat: string) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#1f1f23] transition-colors ${
                      selectedCategory === cat ? 'text-[#22c55e]' : 'text-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowDifficultyDropdown(!showDifficultyDropdown);
                setShowCategoryDropdown(false);
              }}
              className="flex items-center gap-2 bg-[#141416] border border-[#1f1f23] rounded-md px-4 py-2 text-gray-300 hover:border-[#2f2f35] transition-colors text-sm min-w-[140px]"
            >
              <span className="flex-1 text-left">{selectedDifficulty}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {showDifficultyDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#141416] border border-[#1f1f23] rounded-md shadow-xl z-50 w-40">
                {difficulties.map((diff: string) => (
                  <button
                    key={diff}
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      setShowDifficultyDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#1f1f23] transition-colors ${
                      selectedDifficulty === diff ? 'text-[#22c55e]' : 'text-gray-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowBookmarked(!showBookmarked)}
            className={`p-2 rounded-md border transition-colors ${
              showBookmarked
                ? 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]'
                : 'bg-[#141416] border-[#1f1f23] text-gray-400 hover:border-[#2f2f35]'
            }`}
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {(showCategoryDropdown || showDifficultyDropdown) && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowCategoryDropdown(false);
              setShowDifficultyDropdown(false);
            }}
          />
        )}

        <div className="space-y-8">
          {categoryOrder.map((category: string) => {
            const algos = groupedAlgorithms[category];
            if (!algos || algos.length === 0) return null;

            return (
              <section key={category}>
                <h2 className="text-xl font-semibold text-white mb-4">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {algos.map((algo: any) => (
                    <AlgorithmCard key={algo.id} algorithm={algo} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          {filteredAlgorithms.length} of {algorithms.length} algorithms shown
        </div>
      </main>
    </div>
  );
};

export default DSAAnimations;
