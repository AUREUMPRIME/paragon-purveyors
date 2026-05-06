export function assetPath(path) {
  const basePath = import.meta.env.BASE_URL || "/";
  const cleanPath = String(path).replace(/^\/+/, "");

  return `${basePath}${cleanPath}`;
}
