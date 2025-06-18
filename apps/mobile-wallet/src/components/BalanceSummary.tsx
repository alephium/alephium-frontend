import { CURRENCIES } from '@alephium/shared'
import { colord } from 'colord'
import { ActivityIndicator, View } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BalanceSummaryProps {
  worth: number
  isLoading: boolean
  label: string
  error?: Error | null | boolean
}

const BalanceSummary = ({ worth, isLoading, label, error }: BalanceSummaryProps) => {
  const theme = useTheme()
  const currency = useAppSelector((s) => s.settings.currency)

  return (
    <BalanceSummaryBox>
      <TextContainer>
        <View>
          <AppText color={colord(theme.font.primary).alpha(0.6).toHex()}>{label}</AppText>
          {error && <DataFetchErrorIndicator error={error} />}
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

const DataFetchErrorIndicator = ({ error }: Pick<BalanceSummaryProps, 'error'>) => {
  const dispatch = useAppDispatch()

  const handlePress = () => {
    const message = typeof error !== 'boolean' && error ? error.toString() : undefined

    dispatch(openModal({ name: 'DataFetchErrorModal', props: { message } }))
  }

  return (
    <DataFetchIndicatorStyled onPress={handlePress}>
      <DataFetchErrorIndicatorDot />
    </DataFetchIndicatorStyled>
  )
}

export default BalanceSummary

export const BalanceSummaryBox = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const TextContainer = styled.View`
  align-items: center;
  margin: 10px ${DEFAULT_MARGIN + 10}px 15px ${DEFAULT_MARGIN + 10}px;
`

const DataFetchIndicatorStyled = styled.Pressable`
  position: absolute;
  top: -5px;
  left: -15px;
  padding: 5px;
`

const DataFetchErrorIndicatorDot = styled.View`
  width: 6px;
  height: 6px;
  background-color: ${({ theme }) => theme.global.alert};
  border-radius: 50%;
`
