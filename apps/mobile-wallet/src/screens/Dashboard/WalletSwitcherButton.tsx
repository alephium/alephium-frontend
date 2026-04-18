import { Pressable } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const WalletSwitcherButton = () => {
  const dispatch = useAppDispatch()
  const walletName = useAppSelector((s) => s.wallet.name)
  const theme = useTheme()

  const handlePress = () => dispatch(openModal({ name: 'WalletSwitchModal' }))

  return (
    <AvatarButton onPress={handlePress}>
      <AvatarText semiBold color={theme.font.contrast}>
        {getWalletInitials(walletName)}
      </AvatarText>
    </AvatarButton>
  )
}

export default WalletSwitcherButton

const getWalletInitials = (name: string): string => {
  const trimmed = name.trim()
  const words = trimmed.split(/\s+/)

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }

  return trimmed.substring(0, 2).toUpperCase()
}

const AvatarButton = styled(Pressable)`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.global.accent};
  align-items: center;
  justify-content: center;
`

const AvatarText = styled(AppText)`
  font-size: 12px;
`
