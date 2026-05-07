/**
 * Extracts the most relevant sections of a scientific article for QUADAS-2 analysis.
 * Prioritizes: Abstract, Methods, Results (and their variants in English/Portuguese).
 * Falls back to beginning + middle + end if sections cannot be detected.
 */

const SECTION_PATTERNS = [
  // High priority — always include fully
  { key: "abstract", pattern: /\b(abstract|resumo|sum[aá]rio)\b/i, priority: 1 },
  { key: "methods", pattern: /\b(methods?|metodologia|m[eé]todos?|materials?\s+and\s+methods?|material\s+e\s+m[eé]todos?|patients?\s+and\s+methods?|study\s+design|delineamento)\b/i, priority: 1 },
  { key: "results", pattern: /\b(results?|resultados?|findings?)\b/i, priority: 1 },
  // Medium priority — include if space allows
  { key: "participants", pattern: /\b(participants?|pacientes?|population|popula[çc][aã]o|eligib|crit[eé]rios?|inclus|exclus)\b/i, priority: 2 },
  { key: "discussion", pattern: /\b(discuss[aã]o|discussion)\b/i, priority: 3 },
];

interface Section {
  key: string;
  priority: number;
  start: number;
  end: number;
  text: string;
}

function findSections(text: string): Section[] {
  const lines = text.split("\n");
  const found: Section[] = [];
  const lineOffsets: number[] = [];

  // Compute char offset of each line
  let offset = 0;
  for (const line of lines) {
    lineOffsets.push(offset);
    offset += line.length + 1;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Section headers are typically short lines (< 80 chars) that match a pattern
    if (line.length === 0 || line.length > 80) continue;

    for (const def of SECTION_PATTERNS) {
      if (def.pattern.test(line)) {
        // Check not already captured
        if (found.some((s) => s.key === def.key)) continue;
        found.push({
          key: def.key,
          priority: def.priority,
          start: lineOffsets[i],
          end: -1, // will fill below
          text: "",
        });
        break;
      }
    }
  }

  // Determine end of each section (start of next detected section)
  found.sort((a, b) => a.start - b.start);
  for (let i = 0; i < found.length; i++) {
    found[i].end = i + 1 < found.length ? found[i + 1].start : text.length;
    found[i].text = text.slice(found[i].start, found[i].end).trim();
  }

  return found;
}

export function extractRelevantText(fullText: string, maxChars = 18000): string {
  const sections = findSections(fullText);

  if (sections.length === 0) {
    // No sections detected — use beginning + middle chunk (covers abstract + methods usually)
    const beginning = fullText.slice(0, Math.floor(maxChars * 0.7));
    const midStart = Math.floor(fullText.length * 0.3);
    const middle = fullText.slice(midStart, midStart + Math.floor(maxChars * 0.3));
    return (beginning + "\n\n" + middle).slice(0, maxChars);
  }

  // Sort by priority then by position
  const priority1 = sections.filter((s) => s.priority === 1);
  const priority2 = sections.filter((s) => s.priority === 2);
  const priority3 = sections.filter((s) => s.priority === 3);

  let result = "";
  const addSection = (s: Section) => {
    const snippet = s.text.slice(0, 8000); // cap each section at 8000 chars
    if (result.length + snippet.length <= maxChars) {
      result += `\n\n### ${s.key.toUpperCase()} ###\n` + snippet;
    } else {
      // Add as much as fits
      const remaining = maxChars - result.length - 30;
      if (remaining > 200) {
        result += `\n\n### ${s.key.toUpperCase()} ###\n` + snippet.slice(0, remaining);
      }
    }
  };

  for (const s of priority1) addSection(s);
  for (const s of priority2) addSection(s);
  for (const s of priority3) addSection(s);

  // If we still have room, add the beginning of the article (usually has title + abstract)
  if (result.length < maxChars * 0.5) {
    const intro = fullText.slice(0, 3000);
    result = `### INÍCIO DO ARTIGO ###\n${intro}\n` + result;
  }

  return result.slice(0, maxChars);
}
