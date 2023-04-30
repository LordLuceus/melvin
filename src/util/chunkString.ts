/* eslint-disable no-restricted-syntax */
export function chunkString(
  input: string,
  delimiters: string[],
  maxLength = 2000
): string[] {
  const result: string[] = [];

  if (input.length === 0 || maxLength < 1) {
    return result;
  }

  while (input.length > maxLength) {
    let splitIndex: number | null = null;

    for (const delimiter of delimiters) {
      const index = input.lastIndexOf(delimiter, maxLength);
      if (index > 0) {
        splitIndex = index;
        break;
      }
    }

    if (splitIndex === null) {
      splitIndex = maxLength;
    }

    result.push(input.slice(0, splitIndex));
    // eslint-disable-next-line no-param-reassign
    input = input.slice(splitIndex + 1);
  }

  if (input.length > 0) {
    result.push(input);
  }

  return result;
}
