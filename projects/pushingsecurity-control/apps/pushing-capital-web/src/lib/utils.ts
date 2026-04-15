export function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function formatStorageModeLabel(mode: string) {
  return mode
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}
