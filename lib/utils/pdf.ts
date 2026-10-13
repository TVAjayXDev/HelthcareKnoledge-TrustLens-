/**
 * Shared PDF validation and filename sanitization utilities.
 */

/**
 * Validates that the file buffer begins with the PDF magic signature "%PDF-".
 */
export function isValidPdfBuffer(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}

/**
 * Sanitizes an uploaded filename:
 * - Strips directory traversal paths
 * - Removes non-alphanumeric characters except safe dots, dashes, and underscores
 * - Guarantees a safe .pdf extension
 */
export function sanitizePdfFilename(rawName: string): string {
  const baseName = rawName.replace(/^.*[\\/]/, "");
  const cleaned = baseName
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".");
  const withoutExt = cleaned.replace(/\.pdf$/i, "");
  const safeBase = withoutExt.trim() || "document_upload";
  return `${safeBase}.pdf`;
}
