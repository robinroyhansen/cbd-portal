'use client';

import { useEffect } from 'react';

interface GlossaryViewTrackerProps {
  slug: string;
}

export function GlossaryViewTracker({ slug }: GlossaryViewTrackerProps) {
  useEffect(() => {
    // Only track once per session per term
    const viewedKey = `glossary_viewed_${slug}`;
    const hasViewed = sessionStorage.getItem(viewedKey);

    if (!hasViewed) {
      // Record the view
      fetch(`/api/glossary/${slug}/view`, {
        method: 'POST',
      }).catch(() => {
        // Silently fail - view tracking is non-critical
      });

      // Mark as viewed for this session
      sessionStorage.setItem(viewedKey, '1');
    }
  }, [slug]);

  // This component renders nothing
  return null;
}
