import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { useIsWalletWatchOnly } from '~/features/watchOnlyWallet/useIsWalletWatchOnly'

const WatchOnlyBadge = () => {
  const { t } = useTranslation()
  const isWatchOnly = useIsWalletWatchOnly()
  const theme = useTheme()

  if (!isWatchOnly) return null

  return (
    <WatchOnlyBadgeStyled>
      <Ionicons name="eye-outline" size={12} color={theme.font.primary} />
      <AppText size={11} semiBold>
        {t('Watch only')}
      </AppText>
    </WatchOnlyBadgeStyled>
  )
}

export default WatchOnlyBadge

const WatchOnlyBadgeStyled = styled.View`
  position: absolute;
  top: 12px;
  right: 12px;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  background-color: ${({ theme }) => theme.bg.back1};
  padding: 4px 8px;
  border-radius: 8px;
  opacity: 0.85;
`
