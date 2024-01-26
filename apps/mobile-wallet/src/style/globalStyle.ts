/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { Platform } from 'react-native'

// ALL VALUES IN PIXELS

export const BORDER_RADIUS_BIG = 16
export const BORDER_RADIUS = 10
export const BORDER_RADIUS_SMALL = 6

export const INPUTS_HEIGHT = 60
export const INPUTS_PADDING = 16

export const DEFAULT_MARGIN = 15
export const VERTICAL_GAP = 25

export const SCREEN_OVERFLOW = Platform.OS === 'ios' ? 'visible' : 'scroll'
