'use client';

import React from 'react';
import { ArticleContent, GlossaryTerm } from '../ArticleContent';
import { QuickAnswer, extractQuickAnswer } from './QuickAnswer';
import { KeyNumbers, extractKeyNumbers, KeyNumber } from './KeyNumbers';
import { MyTake, extractMyTake } from './MyTake';
import { SafetySection, extractSafetyInfo, SafetyItem } from './SafetySection';

interface EnhancedArticleContentProps {
  content: string;
  glossaryTerms?: GlossaryTerm[];
  excludeSlugs?: string[];
  stripReferences?: boolean;
  articleType?: string;
}

interface ExtractedSections {
  quickAnswer: string | null;
  keyNumbers: KeyNumber[];
  myTake: string | null;
  safetyItems: SafetyItem[];
  remainingContent: string;
}

function extractAllSections(content: string): ExtractedSections {
  let remainingContent = content;

  // Extract Quick Answer
  const { answer: quickAnswer, content: afterQuickAnswer } = extractQuickAnswer(remainingContent);
  remainingContent = afterQuickAnswer;

  // Extract Key Numbers
  const { numbers: keyNumbers, content: afterKeyNumbers } = extractKeyNumbers(remainingContent);
  remainingContent = afterKeyNumbers;

  // Extract My Take
  const { take: myTake, content: afterMyTake } = extractMyTake(remainingContent);
  remainingContent = afterMyTake;

  // Extract Safety Info
  const { items: safetyItems, content: afterSafety } = extractSafetyInfo(remainingContent);
  remainingContent = afterSafety;

  return {
    quickAnswer,
    keyNumbers,
    myTake,
    safetyItems,
    remainingContent,
  };
}

export function EnhancedArticleContent({
  content,
  glossaryTerms = [],
  excludeSlugs = [],
  stripReferences = false,
  articleType,
}: EnhancedArticleContentProps) {
  // Extract all special sections
  const sections = React.useMemo(() => extractAllSections(content), [content]);

  // Determine where to place My Take based on article type
  const showMyTakeInline = ['news', 'science-explainer'].includes(articleType || '');

  return (
    <div className="enhanced-article-content">
      {/* Quick Answer at the top */}
      {sections.quickAnswer && (
        <QuickAnswer answer={sections.quickAnswer} />
      )}

      {/* Key Numbers after intro (rendered at top) */}
      {sections.keyNumbers.length > 0 && (
        <KeyNumbers numbers={sections.keyNumbers} />
      )}

      {/* Main article content */}
      <ArticleContent
        content={sections.remainingContent}
        glossaryTerms={glossaryTerms}
        excludeSlugs={excludeSlugs}
        stripReferences={stripReferences}
      />

      {/* Safety section before My Take */}
      {sections.safetyItems.length > 0 && (
        <SafetySection items={sections.safetyItems} />
      )}

      {/* My Take at the bottom (or inline for news/science) */}
      {sections.myTake && (
        <MyTake content={sections.myTake} />
      )}
    </div>
  );
}

// Re-export the base ArticleContent for cases where enhanced features aren't needed
export { ArticleContent };
