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

import { CSSProperties } from 'react'
import { RiLoader4Line } from 'react-icons/ri'
import styled from 'styled-components'

interface LoadingSpinnerProps {
  size?: number
  style?: CSSProperties
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ size, style }) => (
  <SpinnerContainer style={{ height: size, width: size }}>
    <Spinner style={style} />
  </SpinnerContainer>
)

export default LoadingSpinner

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const Spinner = styled(RiLoader4Line)`
  animation: spin 1s infinite;
  color: ${({ theme }) => theme.font.secondary};
`
