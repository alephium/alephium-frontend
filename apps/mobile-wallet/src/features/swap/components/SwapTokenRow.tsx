import { calculateTokenAmountWorth, fromHumanReadableAmount } from '@alephium/shared/numbers'
import { isFT, TokenId } from '@alephium/shared/types'
import { useFetchToken, useFetchTokenPrice } from '@alephium/shared-react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import { BORDER_RADIUS, BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

interface SwapTokenRowProps {
  label: string
  amount: string
  editable: boolean
  tokenId?: TokenId
  onSelectTokenPress: () => void
  onAmountChange?: (value: string) => void
  onMaxPress?: () => void
  formattedBalance?: string
  error?: string
  disabled?: boolean
}

const SwapTokenRow = ({
  label,
  amount,
  editable,
  tokenId,
  onSelectTokenPress,
  onAmountChange,
  onMaxPress,
  formattedBalance,
  error,
  disabled
}: SwapTokenRowProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { data: token } = useFetchToken(tokenId ?? '')

  const tokenSymbol = token && isFT(token) ? token.symbol : undefined

  return (
    <Container>
      <TopRow>
        <AppText color="secondary" size={13}>
          {label}
        </AppText>
        {editable && !disabled && formattedBalance !== undefined && (
          <MaxButton onPress={onMaxPress}>
            <AppText color="accent" size={12} semiBold>
              {t('Available: {{ amount }}', { amount: formattedBalance })}
            </AppText>
          </MaxButton>
        )}
      </TopRow>

      <MainRow>
        {editable ? (
          <AmountInput
            value={amount}
            onChangeText={onAmountChange}
            editable={!disabled}
            placeholder="0"
            placeholderTextColor={theme.font.tertiary}
            keyboardType="decimal-pad"
            style={{ color: error ? theme.global.alert : theme.font.primary }}
          />
        ) : (
          <ReadonlyAmount numberOfLines={1} color={amount && amount !== '0' ? 'primary' : 'tertiary'}>
            {amount || '0'}
          </ReadonlyAmount>
        )}

        <TokenSelector onPress={onSelectTokenPress} disabled={disabled}>
          {tokenId ? (
            <>
              <AssetLogo assetId={tokenId} size={24} />
              <AppText semiBold size={16}>
                {tokenSymbol ?? '?'}
              </AppText>
            </>
          ) : (
            <AppText semiBold size={15}>
              {t('Select a token')}
            </AppText>
          )}
          <Ionicons name="chevron-down" size={16} color={theme.font.secondary} />
        </TokenSelector>
      </MainRow>

      {tokenId && amount ? <FiatWorth tokenId={tokenId} amount={amount} /> : null}
      {error ? (
        <AppText color="alert" size={12}>
          {error}
        </AppText>
      ) : null}
    </Container>
  )
}

export default SwapTokenRow

interface FiatWorthProps {
  tokenId: TokenId
  amount: string
}

const FiatWorth = ({ tokenId, amount }: FiatWorthProps) => {
  const { data: token } = useFetchToken(tokenId)
  const symbol = token && isFT(token) ? token.symbol : ''
  const { data: tokenPrice } = useFetchTokenPrice(symbol)

  if (!token || !isFT(token) || !amount) return null

  const tokenAmount = fromHumanReadableAmount(amount, token.decimals)
  const worth = calculateTokenAmountWorth(tokenAmount, tokenPrice ?? 0, token.decimals)

  if (!worth) return null

  return <Amount value={worth} isFiat color="tertiary" size={13} />
}

const Container = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: ${BORDER_RADIUS}px;
  padding: ${DEFAULT_MARGIN}px;
  gap: 10px;
`

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const MaxButton = styled.Pressable``

const MainRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const AmountInput = styled(TextInput)`
  flex: 1;
  font-size: 28px;
  font-weight: 600;
`

const ReadonlyAmount = styled(AppText)`
  flex: 1;
  font-size: 28px;
  font-weight: 600;
`

const TokenSelector = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.bg.primary};
`
