/**
 * Simple text diff algorithm for comparing text changes
 * Uses word-by-word comparison with LCS (Longest Common Subsequence) approach
 */

export interface DiffSegment {
  type: 'unchanged' | 'added' | 'removed';
  text: string;
}

/**
 * Compute the diff between two strings
 * @param oldText - The original text
 * @param newText - The new text
 * @param mode - 'word' for word-by-word diff, 'line' for line-by-line diff
 * @returns Array of diff segments
 */
export function computeDiff(
  oldText: string,
  newText: string,
  mode: 'word' | 'line' = 'word'
): DiffSegment[] {
  if (oldText === newText) {
    return [{ type: 'unchanged', text: oldText }];
  }

  const delimiter = mode === 'line' ? '\n' : /(\s+)/;

  // Split texts into tokens, preserving whitespace for word mode
  const oldTokens = mode === 'word'
    ? oldText.split(/(\s+)/).filter(t => t !== '')
    : oldText.split('\n');
  const newTokens = mode === 'word'
    ? newText.split(/(\s+)/).filter(t => t !== '')
    : newText.split('\n');

  // Compute LCS matrix
  const lcs = computeLCS(oldTokens, newTokens);

  // Backtrack to build diff
  const diff = backtrackDiff(oldTokens, newTokens, lcs);

  // Merge consecutive segments of the same type
  return mergeDiffSegments(diff, mode);
}

/**
 * Compute LCS (Longest Common Subsequence) matrix
 */
function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;

  // Initialize matrix with zeros
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/**
 * Backtrack through LCS matrix to build diff segments
 */
function backtrackDiff(
  oldTokens: string[],
  newTokens: string[],
  lcs: number[][]
): DiffSegment[] {
  const diff: DiffSegment[] = [];
  let i = oldTokens.length;
  let j = newTokens.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldTokens[i - 1] === newTokens[j - 1]) {
      // Common element
      diff.unshift({ type: 'unchanged', text: oldTokens[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      // Addition
      diff.unshift({ type: 'added', text: newTokens[j - 1] });
      j--;
    } else if (i > 0) {
      // Removal
      diff.unshift({ type: 'removed', text: oldTokens[i - 1] });
      i--;
    }
  }

  return diff;
}

/**
 * Merge consecutive diff segments of the same type
 */
function mergeDiffSegments(diff: DiffSegment[], mode: 'word' | 'line'): DiffSegment[] {
  if (diff.length === 0) return [];

  const merged: DiffSegment[] = [];
  let current = { ...diff[0] };

  for (let i = 1; i < diff.length; i++) {
    if (diff[i].type === current.type) {
      // Same type - merge
      current.text += (mode === 'line' ? '\n' : '') + diff[i].text;
    } else {
      merged.push(current);
      current = { ...diff[i] };
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Calculate diff statistics
 */
export function getDiffStats(diff: DiffSegment[]): {
  additions: number;
  deletions: number;
  unchanged: number;
} {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  for (const segment of diff) {
    const words = segment.text.split(/\s+/).filter(w => w.length > 0).length;
    switch (segment.type) {
      case 'added':
        additions += words;
        break;
      case 'removed':
        deletions += words;
        break;
      case 'unchanged':
        unchanged += words;
        break;
    }
  }

  return { additions, deletions, unchanged };
}

/**
 * Convert diff to HTML for rendering
 */
export function diffToHtml(diff: DiffSegment[]): string {
  return diff.map(segment => {
    const escapedText = escapeHtml(segment.text);
    switch (segment.type) {
      case 'added':
        return `<span class="bg-green-100 text-green-800">${escapedText}</span>`;
      case 'removed':
        return `<span class="bg-red-100 text-red-800 line-through">${escapedText}</span>`;
      default:
        return escapedText;
    }
  }).join('');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
