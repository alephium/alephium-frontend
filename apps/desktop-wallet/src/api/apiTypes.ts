export interface ApiContextProps<T> {
  data: T
  isLoading: boolean
  isFetching?: boolean
  error?: boolean
}
