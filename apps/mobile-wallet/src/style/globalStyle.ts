import { Platform } from 'react-native'

// ALL VALUES IN PIXELS

export const BORDER_RADIUS_HUGE = 36
export const BORDER_RADIUS_BIG = 20
export const BORDER_RADIUS = 16
export const BORDER_RADIUS_SMALL = 6

export const INPUTS_HEIGHT = 54
export const INPUTS_PADDING = 16

export const DEFAULT_MARGIN = 18
export const VERTICAL_GAP = 25

export const SCREEN_OVERFLOW = Platform.OS === 'ios' ? 'visible' : 'scroll'
export const HEADER_OFFSET_TOP = Platform.OS === 'ios' ? 0 : 16
