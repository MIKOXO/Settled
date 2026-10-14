export const pickDefined = (source) =>
  Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined));