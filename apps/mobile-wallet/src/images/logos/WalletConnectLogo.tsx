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

import Svg, { Path } from 'react-native-svg'

interface WalletConnectLogoProps {
  width?: number
  height?: number
  color?: string
}

const WalletConnectLogo = ({ width, height, color = '#fff' }: WalletConnectLogoProps) => (
  <Svg width={width ?? 192} height={height ?? 119} fill="none" viewBox="0 0 192 119">
    <Path
      fill={color}
      d="M39.306 23.803c31.312-30.533 82.077-30.533 113.388 0l3.768 3.675a3.84 3.84 0 0 1 0 5.529l-12.891 12.57a2.04 2.04 0 0 1-2.834 0l-5.186-5.057c-21.843-21.3-57.258-21.3-79.102 0l-5.553 5.416a2.04 2.04 0 0 1-2.835 0l-12.89-12.57a3.84 3.84 0 0 1 0-5.53l4.135-4.033ZM179.353 49.8l11.473 11.188a3.842 3.842 0 0 1 0 5.528l-51.732 50.447c-1.565 1.527-4.103 1.527-5.669 0L96.709 81.16a1.02 1.02 0 0 0-1.417 0l-36.715 35.803c-1.566 1.527-4.104 1.527-5.67 0L1.174 66.516a3.84 3.84 0 0 1 0-5.529L12.647 49.8c1.566-1.527 4.104-1.527 5.67 0l36.716 35.804a1.02 1.02 0 0 0 1.417 0L93.165 49.8c1.565-1.527 4.103-1.527 5.67 0l36.716 35.804a1.02 1.02 0 0 0 1.417 0L173.684 49.8c1.565-1.526 4.104-1.526 5.669 0Z"
    />
  </Svg>
)

export default WalletConnectLogo
