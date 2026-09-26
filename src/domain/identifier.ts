const IDENTIFIER = /_|\w\.\w|\(\)|[a-z][A-Z]/;

export const looksLikeIdentifier = (token: string): boolean => IDENTIFIER.test(token);

const bare = (token: string): string => token.replace(/^[^\w]+|[^\w()]+$/g, "");

export const identifiersIn = (text: string): string[] => [...new Set(text.split(/\s+/).map(bare).filter(looksLikeIdentifier))];
