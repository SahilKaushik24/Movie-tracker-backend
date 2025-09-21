export function getPosterUrl(path) {
  if (!path) return "/placeholder.png";
  return `https://image.tmdb.org/t/p/w92${path}`;
}
