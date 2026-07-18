import { useEffect } from 'react';

const SITE_NAME = 'VITTA';

function setMeta(name, content, attr = 'name') {
  if (!content) return;
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/** Sets document.title and meta description/OG tags for the current page.
 * Call once per page component with a short title and 1-2 sentence description. */
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
    if (description) {
      setMeta('description', description);
      setMeta('og:title', title ? `${title} — ${SITE_NAME}` : SITE_NAME, 'property');
      setMeta('og:description', description, 'property');
    }
  }, [title, description]);
}
