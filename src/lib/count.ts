const numberFormat = new Intl.NumberFormat("en-LK");

/** "18 perfumes", "1 attar". */
export function countLabel(
  count: number,
  unit: { one: string; other: string },
): string {
  return `${numberFormat.format(count)} ${count === 1 ? unit.one : unit.other}`;
}
