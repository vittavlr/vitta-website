// Maps a service slug to a themed Unsplash image (keyword-based, no API key
// needed). If Unsplash is unreachable or a keyword has no match, components
// using this should fall back to a plain gradient (see ServiceCard/ServiceDetail).
const KEYWORDS = {
  'real-estate': 'modern-architecture',
  finance: 'finance-growth',
  insurance: 'family-protection',
  'mutual-funds': 'stock-market',
  'legal-counsel': 'law-office',
  'college-admissions': 'graduation',
};

export function serviceImageUrl(slug, width = 800, height = 600) {
  const keyword = KEYWORDS[slug] || 'business-consulting';
  return `https://source.unsplash.com/${width}x${height}/?${keyword}`;
}
