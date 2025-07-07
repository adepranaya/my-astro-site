export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase to camel-Case
    .replace(/[\s_]+/g, '-')             // spaces and underscores to dashes
    .toLowerCase();
}
