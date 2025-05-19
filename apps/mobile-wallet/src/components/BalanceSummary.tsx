import { CURRENCIES } from '@alephium/shared'
import { colord } from 'colord'
import { ActivityIndicator, View } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import { useAppSelector } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BalanceSummaryProps {
  worth: number
  isLoading: boolean
  label: string
}

const BalanceSummary = ({ worth, isLoading, label }: BalanceSummaryProps) => {
  const theme = useTheme()
  const currency = useAppSelector((s) => s.settings.currency)

  return (
    <BalanceSummaryBox>
      <TextContainer>
        <View>
          <AppText color={colord(theme.font.primary).alpha(0.6).toHex()}>{label}</AppText>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.font.primary} style={{ marginTop: 10 }} />
        ) : (
          <Amount value={worth} isFiat suffix={CURRENCIES[currency].symbol} semiBold size={44} adjustsFontSizeToFit />
        )}
      </TextContainer>
    </BalanceSummaryBox>
  )
}

export default BalanceSummary

export const BalanceSummaryBox = styled.View`
  justify-content: center;
  align-items: center;
  margin: 10px 0 16px 0;
`

const TextContainer = styled.View`
  align-items: center;
  margin: 10px ${DEFAULT_MARGIN + 10}px 15px ${DEFAULT_MARGIN + 10}px;
`
