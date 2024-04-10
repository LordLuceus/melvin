export function hasD20(notation: string) {
  const regex = /\b\d*d20\b/;
  return regex.test(notation);
}
