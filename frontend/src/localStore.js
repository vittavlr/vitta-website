const FAV_KEY = 'vitta_favorites';
const VIEWED_KEY = 'vitta_recently_viewed';

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; }
}
export function toggleFavorite(property) {
  const favs = getFavorites();
  const exists = favs.find((f) => f.id === property.id);
  const next = exists ? favs.filter((f) => f.id !== property.id) : [...favs, { id: property.id, title: property.title }];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  return next;
}
export function isFavorite(id) {
  return getFavorites().some((f) => f.id === id);
}

export function getRecentlyViewed() {
  try { return JSON.parse(localStorage.getItem(VIEWED_KEY)) || []; } catch { return []; }
}
export function addRecentlyViewed(item) {
  const list = getRecentlyViewed().filter((x) => x.link !== item.link);
  list.unshift(item);
  localStorage.setItem(VIEWED_KEY, JSON.stringify(list.slice(0, 6)));
}
