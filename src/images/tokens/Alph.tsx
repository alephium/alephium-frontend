/*
Copyright 2018 - 2022 The Alephium Authors
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

import { View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'

import { SvgProps } from '../../types/images'

const svg = ({ style, color = 'white' }: SvgProps) => (
  <View style={style}>
    <Svg width="100%" height="100%" viewBox="0 0 45 46" preserveAspectRatio="slice">
      <Rect y="0.666668" width="45" height="45" rx="22.5" fill="#202020" />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M29.4281 11.0039C29.4281 10.6784 29.1879 10.4626 28.8913 10.5229L25.3464 11.2436C25.0498 11.3039 24.8097 11.6173 24.8097 11.9428V19.1268C24.8097 19.4532 25.0498 19.669 25.3464 19.6087L28.8913 18.888C29.1879 18.8277 29.4281 18.5143 29.4281 18.188V11.0039ZM20.1903 27.2057C20.1903 26.8801 19.9501 26.6644 19.6535 26.7247L16.1086 27.4453C15.812 27.5056 15.572 27.819 15.572 28.1446V35.3286C15.572 35.6549 15.812 35.8707 16.1086 35.8104L19.6535 35.0898C19.9501 35.0295 20.1903 34.716 20.1903 34.3897V27.2057ZM20.1247 12.2229C20.4552 12.1588 20.8312 12.3695 20.965 12.6941L29.1882 32.634C29.3221 32.9586 29.1636 33.2752 28.833 33.3393L24.8828 34.1058C24.5523 34.1699 24.1756 33.9573 24.0417 33.6326L15.8185 13.6927C15.6847 13.3681 15.8439 13.0535 16.1744 12.9894L20.1247 12.2229Z"
        fill="white"
      />
    </Svg>
  </View>
)

export default svg
