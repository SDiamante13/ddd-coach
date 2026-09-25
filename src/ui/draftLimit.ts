const countFormat = new Intl.NumberFormat("en-US");

export function formatCount(count: number): string {
  return countFormat.format(count);
}
