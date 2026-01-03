/**
 * Config 객체에서 value 타입 추출
 * @example
 * const MyConfig = { A: { value: 'a', label: 'A' } } as const;
 * type MyType = ConfigValue<typeof MyConfig>; // 'a'
 */
export type ConfigValue<
  T extends Record<string, { value: string; label: string }>,
> = T[keyof T]['value'];
