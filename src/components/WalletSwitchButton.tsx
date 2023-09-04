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

import { memo, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { Portal } from 'react-native-portalize'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BottomModal from '~/components/layout/BottomModal'
import { useAppSelector } from '~/hooks/redux'
import SwitchWalletModal from '~/screens/SwitchWalletModal'

interface WalletSwitchButtonProps {
  style?: StyleProp<ViewStyle>
}

const WalletSwitchButton = ({ style }: WalletSwitchButtonProps) => {
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <Button style={style} variant="contrast" onPress={() => setModalOpen(true)}>
        <AppText color="contrast" semiBold size={12} numberOfLines={1}>
          {activeWalletName.slice(0, 2).toUpperCase()}
        </AppText>
      </Button>

      <Portal>
        <BottomModal Content={SwitchWalletModal} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </Portal>
    </>
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
