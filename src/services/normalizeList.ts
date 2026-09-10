function asObject(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function normalizeList<T>(
  raw: unknown,
  normalizer: (item: unknown) => T,
): T[] {
  const directItems = Array.isArray(raw) ? raw : null;
  const envelope = asObject(raw);
  const data = envelope.data;
  const items = directItems ?? (Array.isArray(data) ? data : []);

  return items.map(normalizer);
}
