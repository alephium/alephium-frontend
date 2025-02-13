import { colord } from 'colord'
import { useMemo } from 'react'
import { useTheme } from 'styled-components'

export const labelColorPalette = ['#1fb741', '#FFC400', '#64C9E1', '#8871ff', '#0D92FF', '#eb70a5']

export const getRandomLabelColor = () => labelColorPalette[Math.floor(Math.random() * labelColorPalette.length)]

export const useDisplayPaletteColor = (inputColor: string) => {
  const theme = useTheme()

  return useMemo(() => {
    const { h } = colord(inputColor).toHsl()
    const saturation = 70
    const lightness = theme.name === 'dark' ? 85 : 65

    return colord({ h, s: saturation, l: lightness }).toHex()
  }, [inputColor, theme.name])
}

const hashToHue = (hash: string) => {
  let hashNum = 0
  for (let i = 0; i < hash.length; i++) {
    hashNum = (hashNum * 31 + hash.charCodeAt(i)) >>> 0 // ensure unsigned 32-bit integer
  }
  return hashNum % 360
}

export const useHashToColor = (hash?: string) => {
  const theme = useTheme()

  return useMemo(() => {
    if (!hash) return undefined

    let hue = hashToHue(hash)

    // If the hue falls into a brownish range, shift it for a fresher look
    if (hue >= 20 && hue <= 50) hue = (hue + 30) % 360

    const saturation = 70
    const lightness = theme.name === 'dark' ? 85 : 65

    return colord({ h: hue, s: saturation, l: lightness }).toHex()
  }, [hash, theme.name])
}
