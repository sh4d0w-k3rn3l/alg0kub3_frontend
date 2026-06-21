'use client';
import Link from 'next/link';
import { BookOpen, Info, Lightbulb, Hash } from 'lucide-react';
import { algorithmInfo } from '@/data/algorithmInfo';
import { algorithms } from '@/data/mockData';

interface AlgorithmInfo {
  title?: string;
  description?: string;
  howItWorks?: string;
  whenToUse?: string;
  interviewTip?: string;
  relatedProblems?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
  difficulty?: string;
}

interface InfoPanelsProps {
  algorithmId: string;
  algorithm?: AlgorithmInfo;
}

const InfoPanels = ({ algorithmId, algorithm = {} }: InfoPanelsProps) => {
  const info = (algorithmInfo as Record<string, AlgorithmInfo | undefined>)[algorithmId];
  
  if (!info) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6" data-testid="info-panels">
      {/* Algorithm Description Panel */}
      <div className="bg-[#141416] border border-[#1f1f23] rounded-lg overflow-hidden" data-testid="how-it-works-panel">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f1f23] bg-[#0f0f11]">
          <BookOpen className="w-4 h-4 text-[#3b82f6]" />
          <h3 className="text-white font-semibold">How It Works</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {info.description}
            </p>
          </div>
          
          <div className="bg-[#0c0c0e] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="text-[#22c55e] font-medium text-xs uppercase tracking-wide">Algorithm</span>
            </div>
            <p className="text-gray-400 text-sm">
              {info.howItWorks}
            </p>
          </div>

          <div className="bg-[#0c0c0e] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span className="text-[#f59e0b] font-medium text-xs uppercase tracking-wide">When to Use</span>
            </div>
            <p className="text-gray-400 text-sm">
              {info.whenToUse}
            </p>
          </div>
        </div>
      </div>

      {/* Interview Tips & Related Problems */}
      <div className="bg-[#141416] border border-[#1f1f23] rounded-lg overflow-hidden" data-testid="interview-tips-panel">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1f1f23] bg-[#0f0f11]">
          <Lightbulb className="w-4 h-4 text-[#f59e0b]" />
          <h3 className="text-white font-semibold">Interview Tips</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-r from-[#f59e0b]/10 to-transparent border-l-2 border-[#f59e0b] rounded-r-lg p-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              💡 {info.interviewTip}
            </p>
          </div>

          {/* Related Problems */}
          {info.relatedProblems && info.relatedProblems.length > 0 && (
            <div data-testid="related-problems">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="text-[#3b82f6] font-medium text-xs uppercase tracking-wide">Related Problems</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {info.relatedProblems.map((relatedId) => {
                  const relatedAlgo = algorithms.find(a => a.id === relatedId);
                  if (!relatedAlgo) return null;
                  return (
                    <Link
                      key={relatedId}
                      href={`/animations/dsa/${relatedId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1f1f23] hover:bg-[#2a2a2e] text-gray-300 hover:text-white text-sm rounded-full transition-colors"
                      data-testid={`related-problem-${relatedId}`}
                    >
                      <span>{relatedAlgo.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        relatedAlgo.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                        relatedAlgo.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {relatedAlgo.difficulty}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Complexity Info */}
          {(algorithm.timeComplexity || algorithm.spaceComplexity) && (
            <div className="flex gap-4 pt-2 border-t border-[#1f1f23]" data-testid="complexity-info">
              {algorithm.timeComplexity && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">Time:</span>
                  <code className="text-[#22c55e] font-mono text-sm bg-[#22c55e]/10 px-2 py-0.5 rounded">
                    {algorithm.timeComplexity}
                  </code>
                </div>
              )}
              {algorithm.spaceComplexity && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">Space:</span>
                  <code className="text-[#3b82f6] font-mono text-sm bg-[#3b82f6]/10 px-2 py-0.5 rounded">
                    {algorithm.spaceComplexity}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPanels;
