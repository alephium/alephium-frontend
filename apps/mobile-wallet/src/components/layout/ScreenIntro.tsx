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

import { SharedValue } from 'react-native-reanimated'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { ScreenSection, ScreenSectionProps } from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'

interface ScreenIntroProps extends ScreenSectionProps {
  title?: string
  surtitle?: 'SEND' | 'RECEIVE'
  subtitle?: string
  scrollY?: SharedValue<number>
}

const ScreenIntro = ({ surtitle, title, subtitle, scrollY, ...props }: ScreenIntroProps) => (
  <ScreenSection {...props}>
    {surtitle && (
      <AppText size={15} semiBold color="secondary">
        {surtitle}
      </AppText>
    )}
    {title && <ScreenTitle title={title} scrollY={scrollY} />}
    {subtitle && (
      <Subtitle size={16} medium color="secondary">
        {subtitle}
      </Subtitle>
    )}
  </ScreenSection>
)

export default ScreenIntro

const Subtitle = styled(AppText)`
  width: 70%;
`
