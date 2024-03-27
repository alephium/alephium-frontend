import { BaseQueryFn } from '@reduxjs/toolkit/query'

export const alephiumBaseQuery: BaseQueryFn<
  () => Promise<any>, // Expecting a function that returns a promise
  unknown,
  { message: string }
> = async (fn) => {
  try {
    const result = await fn()
    return { data: result }
  } catch (error: any) {
    return { error: { message: error.message || 'An error occurred' } }
  }
}
