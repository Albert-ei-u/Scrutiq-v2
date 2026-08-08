/**
 * TECHNICAL TEXT PARSER UTILITY
 * Handles normalization of candidate dossier text for AI analysis.
 */

export const normalizeRegistryText = (text: string): string => {
  return text
    .replace(/[\r\n]+/g, " ") // Flatten line breaks
    .replace(/\s{2,}/g, " ")   // Standardize spacing
    .trim();
};

export const extractCandidateName = (filename: string): string => {
  return filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .replace(/[-_]/g, " ")    // Replace separators
    .toUpperCase();           // Admin Standard
};
