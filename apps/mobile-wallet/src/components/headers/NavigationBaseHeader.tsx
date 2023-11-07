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

import { useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import styled from 'styled-components/native'

import BaseHeader, { BaseHeaderProps } from '~/components/headers/BaseHeader'
import { useNavigationScrollContext } from '~/contexts/NavigationScrollContext'

export type NavigationBaseHeaderProps = Omit<BaseHeaderProps, 'goBack' | 'scrollY'>

const NavigationBaseHeader = (props: NavigationBaseHeaderProps) => {
  const { scrollY } = useNavigationScrollContext()
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      if (scrollY) scrollY.value = 0
    })

    return unsubscribe
  }, [navigation, scrollY])

  return (
    <BaseHeaderStyled {...props} scrollY={scrollY} goBack={navigation.canGoBack() ? navigation.goBack : undefined} />
  )
}

export default NavigationBaseHeader

const BaseHeaderStyled = styled(BaseHeader)`
  position: relative;
`
