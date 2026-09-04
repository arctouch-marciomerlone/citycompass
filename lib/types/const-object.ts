export function defineConstObject<
  const T extends Record<PropertyKey, string | number>,
>(values: T): T {
  return values;
}

export type ValueOf<T extends Record<PropertyKey, unknown>> = T[keyof T];
