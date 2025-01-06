/* eslint-disable @typescript-eslint/no-explicit-any */

import { BaseQueryFn } from '@reduxjs/toolkit/query'

export const baseQuery: BaseQueryFn<() => Promise<any>, unknown, { message: string }> = async (fn) => {
  try {
    const result = await fn()
    return { data: result }
  } catch (error: any) {
    return { error: { message: error || 'An error occurred' } }
  }
}
