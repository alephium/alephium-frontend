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

import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'

interface WalletSwitchButtonProps {
  style?: StyleProp<ViewStyle>
}

const WalletSwitchButton = ({ style }: WalletSwitchButtonProps) => {
  const walletName = useAppSelector((s) => s.wallet.name)

  return (
    <Button style={style} variant="contrast">
      <AppText color="contrast" semiBold size={12} numberOfLines={1}>
        {walletName.slice(0, 2).toUpperCase()}
      </AppText>
    </Button>
  )
}

export default memo(styled(WalletSwitchButton)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
  height: 40px;
  width: 40px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 40px;
`)
