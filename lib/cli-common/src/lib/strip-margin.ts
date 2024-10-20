export function stripMargin(text: string): string {
  const lines = text.split('\n');
  const minIndent = lines.reduce((min, line) => {
    const trimmedLine = line.trimStart();
    if (trimmedLine.length > 0) {
      const indent = line.length - trimmedLine.length;
      return Math.min(min, indent);
    }
    return min;
  }, Infinity);

  const strippedLines = lines.map(line => {
    if (line.trim().length > 0) {
      return line.slice(minIndent);
    }
    return line.trim();
  });

  return strippedLines.join('\n').trim();
}
