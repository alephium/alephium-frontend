export type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K
}[keyof T]

export type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}[keyof T]

export type HasRequiredProps<T> = [RequiredKeys<T>] extends [never] ? false : true

export type HasOptionalProps<T> = [OptionalKeys<T>] extends [never] ? false : true
