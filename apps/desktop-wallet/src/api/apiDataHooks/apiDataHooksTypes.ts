export type DataHook<T> = {
  data: T
  isLoading: boolean
}

export interface SkipProp {
  skip?: boolean
}
