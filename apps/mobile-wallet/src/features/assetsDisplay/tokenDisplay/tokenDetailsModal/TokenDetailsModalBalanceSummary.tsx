import { isFT } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Badge from '~/components/Badge'
import { BalanceSummaryBox } from '~/components/BalanceSummary'
import FtWorth from '~/components/tokensLists/FtWorth'
import { TokenDetailsModalCommonProps } from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { selectAddressesWithToken, selectAllAddresses } from '~/store/addresses/addressesSelectors'
import { VERTICAL_GAP } from '~/style/globalStyle'

export interface TokenDetailsModalBalanceSummaryProps extends TokenDetailsModalCommonProps {
  label: string
  balance?: bigint
  fontColor?: string
  onPress?: () => void
}

const TokenDetailsModalBalanceSummary = ({
  tokenId,
  onPress,
  label,
  balance,
  fontColor
}: TokenDetailsModalBalanceSummaryProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isFT(token)) return null

  return (
    <BalanceSummaryBox>
      <AppText color={fontColor}>{label}</AppText>
      <Amount
        size={34}
        semiBold
        value={balance}
        suffix={token.symbol}
        decimals={token.decimals}
        color={fontColor}
        adjustsFontSizeToFit
      />
      <AmountAndAddresses>
        <FtWorth tokenId={tokenId} balance={balance} size={20} color={fontColor} />
        <AddressesWithTokenBadge tokenId={tokenId} onPress={onPress} fontColor={fontColor} />
      </AmountAndAddresses>
    </BalanceSummaryBox>
  )
}

export default TokenDetailsModalBalanceSummary

const AddressesWithTokenBadge = ({
  tokenId,
  onPress,
  fontColor
}: Pick<TokenDetailsModalBalanceSummaryProps, 'tokenId' | 'onPress' | 'fontColor'>) => {
  const addresses = useAppSelector((s) => selectAddressesWithToken(s, tokenId))
  const totalNumberOfAddresses = useAppSelector(selectAllAddresses).length
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  if (addresses.length === 0 || totalNumberOfAddresses === 1) return null

  const handlePress = () => {
    onPress?.()
    dispatch(openModal({ name: 'AddressesWithTokenModal', props: { tokenId } }))
  }

  return (
    <Pressable onPress={handlePress}>
      <Badge color={fontColor}>{t('token_in_addresses', { count: addresses.length })}</Badge>
    </Pressable>
  )
}

const AmountAndAddresses = styled.View`
  margin-top: ${VERTICAL_GAP / 2}px;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`
