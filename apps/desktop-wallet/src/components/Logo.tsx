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

import styled from 'styled-components'

interface LogoProps {
  image: string
  size: number
}

const Logo = ({ image, size }: LogoProps) => (
  <LogoStyled size={size}>
    <LogoImage src={image} />
  </LogoStyled>
)

export default Logo

const LogoStyled = styled.div<Pick<LogoProps, 'size'>>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: ${({ size }) => size}px;
  flex-shrink: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.bg.tertiary};
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`
