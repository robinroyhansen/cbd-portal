'use client';

import { useState } from 'react';

interface ResearchItem {
  id: string;
  title: string;
  authors: string;
  publication: string;
  year: number;
  abstract?: string;
  url: string;
  doi?: string;
  source_site?: string;
  source_type?: 'research_queue' | 'citation';
  relevance_score?: number;
  relevant_topics?: string[];
  categories?: string[];
}

interface ResearchTabsProps {
  cbdResearch: ResearchItem[];
  cannabisResearch: ResearchItem[];
  medicalCannabisResearch: ResearchItem[];
}

export function ResearchTabs({
  cbdResearch,
  cannabisResearch,
  medicalCannabisResearch
}: ResearchTabsProps) {
  const [activeTab, setActiveTab] = useState<'cbd' | 'cannabis' | 'medical-cannabis'>('cbd');

  const tabs = [
    {
      id: 'cbd' as const,
      label: 'CBD',
      count: cbdResearch.length,
      color: 'green',
      description: 'Studies specifically on cannabidiol (CBD)'
    },
    {
      id: 'cannabis' as const,
      label: 'Cannabis',
      count: cannabisResearch.length,
      color: 'blue',
      description: 'Studies on cannabis, THC, and hemp'
    },
    {
      id: 'medical-cannabis' as const,
      label: 'Medical Cannabis',
      count: medicalCannabisResearch.length,
      color: 'purple',
      description: 'Clinical and therapeutic cannabis research'
    }
  ];

  const getActiveResearch = () => {
    switch (activeTab) {
      case 'cbd': return cbdResearch;
      case 'cannabis': return cannabisResearch;
      case 'medical-cannabis': return medicalCannabisResearch;
    }
  };

  const activeResearch = getActiveResearch();

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const colorClasses: Record<string, { active: string; inactive: string; activeText: string }> = {
            green: {
              active: 'border-green-600 text-green-700 bg-green-50',
              inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              activeText: 'text-green-600'
            },
            blue: {
              active: 'border-blue-600 text-blue-700 bg-blue-50',
              inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              activeText: 'text-blue-600'
            },
            purple: {
              active: 'border-purple-600 text-purple-700 bg-purple-50',
              inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              activeText: 'text-purple-600'
            }
          };

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                isActive ? colorClasses[tab.color].active : colorClasses[tab.color].inactive
              }`}
            >
              <span className="block text-lg">{tab.label}</span>
              <span className={`text-xs ${isActive ? colorClasses[tab.color].activeText : 'text-gray-400'}`}>
                {tab.count} studies
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Description */}
      <p className="text-gray-600 mb-6">
        {tabs.find(t => t.id === activeTab)?.description}
      </p>

      {/* Research List */}
      <div className="space-y-4">
        {activeResearch.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No studies in this category yet. Check back soon.
          </p>
        ) : (
          activeResearch.map((item) => (
            <ResearchCard key={item.id} item={item} activeTab={activeTab} />
          ))
        )}
      </div>
    </div>
  );
}

function ResearchCard({ item, activeTab }: { item: ResearchItem; activeTab: string }) {
  const [expanded, setExpanded] = useState(false);

  const colorClasses: Record<string, { bg: string; hover: string; text: string; topic: string }> = {
    cbd: {
      bg: 'bg-green-600',
      hover: 'hover:bg-green-700',
      text: 'text-green-600',
      topic: 'bg-green-100 text-green-800'
    },
    cannabis: {
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      text: 'text-blue-600',
      topic: 'bg-blue-100 text-blue-800'
    },
    'medical-cannabis': {
      bg: 'bg-purple-600',
      hover: 'hover:bg-purple-700',
      text: 'text-purple-600',
      topic: 'bg-purple-100 text-purple-800'
    }
  };

  const colors = colorClasses[activeTab as keyof typeof colorClasses];

  return (
    <div className="border rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg leading-tight mb-2">{item.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {item.authors} • {item.publication} • {item.year}
          </p>

          {item.abstract && (
            <div className="mb-3">
              <p className={`text-sm text-gray-700 ${expanded ? '' : 'line-clamp-2'}`}>
                {item.abstract}
              </p>
              {item.abstract.length > 200 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className={`text-sm ${colors.text} hover:underline mt-1`}
                >
                  {expanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          {/* Topics */}
          <div className="flex flex-wrap gap-1 mb-3">
            {item.relevant_topics?.map((topic) => (
              <span
                key={topic}
                className={`px-2 py-0.5 text-xs rounded ${colors.topic}`}
              >
                {topic}
              </span>
            ))}
          </div>

          {/* Category badges */}
          {item.categories && item.categories.length > 0 && (
            <div className="flex gap-1 mb-3">
              {item.categories.includes('cbd') && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                  CBD
                </span>
              )}
              {item.categories.includes('cannabis') && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                  Cannabis
                </span>
              )}
              {item.categories.includes('medical-cannabis') && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                  Medical
                </span>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>Source: {item.source_site || 'Unknown'}</span>
            {item.doi && <span>DOI: {item.doi}</span>}
            {item.relevance_score && <span>Quality: {item.relevance_score}%</span>}
          </div>
        </div>

        {/* View Link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`shrink-0 px-4 py-2 ${colors.bg} ${colors.hover} text-white rounded-md transition-colors text-sm`}
        >
          View Study →
        </a>
      </div>
    </div>
  );
}