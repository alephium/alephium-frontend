import { colord, extend } from 'colord'
import mixPlugin from 'colord/plugins/mix'
import { useMemo } from 'react'
import { useTheme } from 'styled-components'
extend([mixPlugin])

export const labelColorPalette = ['#5fb772', '#ffa977', '#f8888a', '#a896ff', '#60b7ff', '#eb70a5']

export const getRandomLabelColor = () => labelColorPalette[Math.floor(Math.random() * labelColorPalette.length)]

export const useDisplayColor = (inputColor?: string, matchDefaultPalette?: boolean) => {
  const theme = useTheme()

  return useMemo(() => {
    if (!inputColor) return undefined

    const color = matchDefaultPalette ? getClosestColorInPalette(inputColor, labelColorPalette) : inputColor

    if (theme.name === 'light') return color

    // For dark theme, modify the color to a pastel variant more suitable for dark backgrounds
    const { h } = colord(color).toHsl()

    return colord({ h, s: 70, l: 75 }).toHex()
  }, [inputColor, matchDefaultPalette, theme.name])
}

export const useHashToColor = (hash?: string) => {
  const theme = useTheme()

  return useMemo(() => {
    if (!hash) return undefined

    let hue = hashToHue(hash)

    // If the hue falls into a brownish range, shift it for a fresher look
    if (hue >= 20 && hue <= 50) hue = (hue + 30) % 360

    const saturation = 70
    const lightness = theme.name === 'dark' ? 75 : 65

    return colord({ h: hue, s: saturation, l: lightness }).toHex()
  }, [hash, theme.name])
}

const hashToHue = (hash: string) => {
  let hashNum = 0
  for (let i = 0; i < hash.length; i++) {
    hashNum = (hashNum * 31 + hash.charCodeAt(i)) >>> 0
  }
  return hashNum % 360
}

const getRgbDistance = (rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }) =>
  Math.sqrt(Math.pow(rgb1.r - rgb2.r, 2) + Math.pow(rgb1.g - rgb2.g, 2) + Math.pow(rgb1.b - rgb2.b, 2))

const getClosestColorInPalette = (inputColor: string, palette: string[]) => {
  const inputRgb = colord(inputColor).toRgb()
  let closest = palette[0]
  let minDistance = Infinity
  palette.forEach((color) => {
    const distance = getRgbDistance(inputRgb, colord(color).toRgb())
    if (distance < minDistance) {
      minDistance = distance
      closest = color
    }
  })
  return closest
}
