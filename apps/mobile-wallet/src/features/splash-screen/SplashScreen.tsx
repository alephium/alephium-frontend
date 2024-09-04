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

import { Image } from 'expo-image'
import styled from 'styled-components/native'

import splashSrc from '~/features/splash-screen/splash.png'

const SplashScreen = () => (
  <SplashScreenStyled>
    <SplashScreenImage source={splashSrc} style={{ resizeMode: 'center', objectFit: 'contain' }} />
  </SplashScreenStyled>
)

export default SplashScreen

const SplashScreenStyled = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const SplashScreenImage = styled(Image)`
  flex: 1;
  width: 100%;
`
