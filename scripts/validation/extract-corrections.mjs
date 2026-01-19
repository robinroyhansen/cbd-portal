/**
 * Extract all study IDs needing correction from batch files
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Find all batch files
const files = readdirSync(__dirname)
  .filter(f => f.match(/^batch-\d+\.json$/))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

console.log(`Found ${files.length} batch files`);

const approvedToReject = []; // Currently approved, should be rejected
const rejectedToApprove = []; // Currently rejected, should be approved
const parseErrors = [];

for (const file of files) {
  try {
    const content = readFileSync(join(__dirname, file), 'utf8');
    const data = JSON.parse(content);

    for (const result of data.results) {
      if (!result.is_correct) {
        if (result.current_status === 'approved' && result.correct_status === 'rejected') {
          approvedToReject.push({
            id: result.id,
            title: result.title,
            notes: result.notes,
            batch: data.batch_number
          });
        } else if (result.current_status === 'rejected' && result.correct_status === 'approved') {
          rejectedToApprove.push({
            id: result.id,
            title: result.title,
            notes: result.notes,
            batch: data.batch_number
          });
        }
      }
    }
  } catch (err) {
    parseErrors.push({ file, error: err.message });
    console.error(`Error parsing ${file}: ${err.message}`);
  }
}

console.log(`\nCorrections needed:`);
console.log(`  Approved → Rejected: ${approvedToReject.length}`);
console.log(`  Rejected → Approved: ${rejectedToApprove.length}`);
console.log(`  Total: ${approvedToReject.length + rejectedToApprove.length}`);

if (parseErrors.length > 0) {
  console.log(`\nParse errors: ${parseErrors.length}`);
  parseErrors.forEach(e => console.log(`  ${e.file}: ${e.error}`));
}

// Save to files
const corrections = {
  generated_at: new Date().toISOString(),
  summary: {
    approved_to_reject: approvedToReject.length,
    rejected_to_approve: rejectedToApprove.length,
    total: approvedToReject.length + rejectedToApprove.length
  },
  parse_errors: parseErrors,
  approved_to_reject: approvedToReject,
  rejected_to_approve: rejectedToApprove
};

writeFileSync(
  join(__dirname, 'corrections-needed.json'),
  JSON.stringify(corrections, null, 2)
);

console.log(`\nSaved to corrections-needed.json`);
