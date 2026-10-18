export type Birthday = { year: number; month: number; day: number; iso: string };
export function parseBirthday(value: unknown): Birthday | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const actual = new Date(Date.UTC(year, month - 1, day));
  if (year < 1900 || year > new Date().getUTCFullYear() || month < 1 || month > 12 ||
    actual.getUTCFullYear() !== year || actual.getUTCMonth() !== month - 1 ||
    actual.getUTCDate() !== day || actual.getTime() > Date.now()) return null;
  return { year, month, day, iso: value };
}
export function prettyDate(birth: Birthday): string {
  return new Date(Date.UTC(2000, birth.month - 1, birth.day)).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', timeZone: 'UTC',
  });
}
export function monthName(month: number): string {
  return new Date(Date.UTC(2000, month - 1, 1)).toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
}
