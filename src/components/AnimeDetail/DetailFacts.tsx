'use client';

import React from 'react';

interface DetailFactsProps {
  facts: { fact: string }[];
}

export default function DetailFacts({ facts }: DetailFactsProps) {
  if (!facts || facts.length === 0) return null;

  return (
    <div className="mt-12 p-8 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
      <h3 className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
        Did You Know? (Anime Facts)
      </h3>
      <div className="space-y-4">
        {facts.slice(0, 3).map((f, i) => (
          <p key={i} className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-gray-800 pl-4">
            "{f.fact}"
          </p>
        ))}
      </div>
    </div>
  );
}