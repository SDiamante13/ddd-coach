const IDENTIFIER = /_|\w\.\w|\(\)|[a-z][A-Z]/;
const CLASS_NAME = /^[A-Z][A-Za-z0-9]*$/;
const CLASS_WORD = /^class(es)?$/i;
const NOT_A_NAME = new Set(["The", "A", "An", "This", "That", "These", "Those", "Each", "Every", "Our", "Its", "Their", "Your", "Uses", "Use", "Any", "No", "One", "Some"]);

const isClassName = (token: string | undefined): token is string => token !== undefined && CLASS_NAME.test(token) && !NOT_A_NAME.has(token);

export const looksLikeIdentifier = (token: string): boolean => IDENTIFIER.test(token);

const bare = (token: string): string => token.replace(/^[^\w]+|[^\w()]+$/g, "");

function classNamedAt(tokens: readonly string[], index: number): string[] {
  if (!CLASS_WORD.test(tokens[index]!)) return [];
  const [before, after] = [tokens[index - 1], tokens[index + 1]];
  if (isClassName(after)) return [after];
  return isClassName(before) ? [before] : [];
}

export const identifiersIn = (text: string): string[] => {
  const tokens = text.split(/\s+/).map(bare);
  const named = tokens.flatMap((token, index) => (looksLikeIdentifier(token) ? [token] : classNamedAt(tokens, index)));
  return [...new Set(named)];
};
