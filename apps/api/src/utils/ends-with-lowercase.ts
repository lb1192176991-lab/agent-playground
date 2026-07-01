export function endsWithLowercase(value: string): boolean {
  if (!value) return false;
  const code = value.charCodeAt(value.length - 1);
  return code >= 97 && code <= 122;
}
