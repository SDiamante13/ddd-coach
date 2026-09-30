const IDENTIFIER = /_|\w\.\w|\(\)|[a-z][A-Z]/;
const CLASS_NAME = /^[A-Z][A-Za-z0-9]*$/;
const CLASS_WORD = /^class(es)?$/i;

export const looksLikeIdentifier = (token: string): boolean => IDENTIFIER.test(token);

const bare = (token: string): string => token.replace(/^[^\w]+|[^\w()]+$/g, "");

const namesAClass = (tokens: readonly string[], index: number): boolean =>
  CLASS_NAME.test(tokens[index]!) && [tokens[index - 1], tokens[index + 1]].some((next) => next !== undefined && CLASS_WORD.test(next));

export const identifiersIn = (text: string): string[] => {
  const tokens = text.split(/\s+/).map(bare);
  return [...new Set(tokens.filter((token, index) => looksLikeIdentifier(token) || namesAClass(tokens, index)))];
};
