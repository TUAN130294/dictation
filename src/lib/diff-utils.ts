import DiffMatchPatch from "diff-match-patch";

const dmp = new DiffMatchPatch();

export interface DiffResult {
  diffs: Array<[number, string]>;
  substitutions: number;
  deletions: number;
  insertions: number;
  matches: number;
}

export function computeWordDiff(userText: string, referenceText: string): DiffResult {
  // Normalize texts
  const normalizeText = (text: string) =>
    text.toLowerCase().trim().replace(/\s+/g, " ");

  const userNorm = normalizeText(userText);
  const refNorm = normalizeText(referenceText);

  // Compute diff
  const diffs = dmp.diff_main(refNorm, userNorm);
  dmp.diff_cleanupSemantic(diffs);

  // Count operations
  let substitutions = 0;
  let deletions = 0;
  let insertions = 0;
  let matches = 0;

  for (let i = 0; i < diffs.length; i++) {
    const [op, text] = diffs[i];
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (op === 0) {
      // Match
      matches += wordCount;
    } else if (op === -1) {
      // Deletion from reference (user missed words)
      // Check if next is insertion (substitution)
      if (i + 1 < diffs.length && diffs[i + 1][0] === 1) {
        const nextWords = diffs[i + 1][1].split(/\s+/).filter(Boolean).length;
        substitutions += Math.min(wordCount, nextWords);
        if (wordCount > nextWords) deletions += wordCount - nextWords;
        i++; // Skip next
      } else {
        deletions += wordCount;
      }
    } else if (op === 1) {
      // Insertion (user added extra words)
      insertions += wordCount;
    }
  }

  return { diffs, substitutions, deletions, insertions, matches };
}

export function getDiffSegments(diffs: Array<[number, string]>) {
  return diffs.map(([op, text]) => ({
    text,
    type: op === 0 ? "match" : op === -1 ? "deletion" : "insertion",
  }));
}
