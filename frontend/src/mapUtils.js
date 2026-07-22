// Accepts either bare coordinates ("12.860966,79.132826"), a plain address,
// or a full Google Maps URL (embed or share link) — and returns both a
// full interactive-map URL (for "View on Map") and an embeddable URL (for
// the inline iframe preview). The raw value stays fully editable as plain
// text in admin forms; this only normalizes it for display.
export function buildMapUrls(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    // Already a full link (e.g. a pasted embed URL or Maps share link).
    const embedUrl = trimmed.includes('output=embed')
      ? trimmed
      : `${trimmed}${trimmed.includes('?') ? '&' : '?'}output=embed`;
    const viewUrl = trimmed.replace(/([&?])output=embed&?/, '$1').replace(/[&?]$/, '');
    return { viewUrl, embedUrl };
  }

  // Bare coordinates ("lat,lng") or a plain address string.
  const q = encodeURIComponent(trimmed);
  return {
    viewUrl: `https://www.google.com/maps?q=${q}`,
    embedUrl: `https://www.google.com/maps?q=${q}&output=embed`,
  };
}
