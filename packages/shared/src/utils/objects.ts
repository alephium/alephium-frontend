export const deepMerge = <T extends object>(target: T, ...sources: Partial<T>[]): T => {
  for (const source of sources) {
    if (source == null) continue
    for (const key of Object.keys(source) as (keyof T)[]) {
      const sourceVal = source[key] as unknown
      const targetVal = target[key] as unknown
      if (
        sourceVal !== null &&
        typeof sourceVal === 'object' &&
        !Array.isArray(sourceVal) &&
        targetVal !== null &&
        typeof targetVal === 'object' &&
        !Array.isArray(targetVal)
      ) {
        target[key] = deepMerge({ ...(targetVal as object) }, sourceVal as object) as T[keyof T]
      } else {
        target[key] = sourceVal as T[keyof T]
      }
    }
  }
  return target
}
