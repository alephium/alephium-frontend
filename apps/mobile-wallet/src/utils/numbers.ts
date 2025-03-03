import { isNumber } from '@alephium/shared'

export const isNumericStringValid = (str: string, allowFloat = true) =>
  isNumber(str) &&
  !str.endsWith(' ') &&
  !str.endsWith('-') &&
  !str.startsWith('.') &&
  !str.endsWith('..') &&
  !(allowFloat && str.length >= 2 && str.startsWith('0') && str.indexOf('.') !== 1) &&
  !(!allowFloat && str.startsWith('0')) &&
  !(!allowFloat && str.endsWith('.')) &&
  !(allowFloat && str.indexOf('.') !== str.length - 1 && str.endsWith('.'))
