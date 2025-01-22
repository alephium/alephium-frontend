import { AddressHash, CURRENCIES } from '@alephium/shared'
import { colord } from 'colord'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Pressable, View } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import Badge from '~/components/Badge'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesNFTs,
  makeSelectAddressesTokensWorth,
  selectAddressIds
} from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BalanceSummaryProps {
  addressHash?: AddressHash
}

const BalanceSummary = ({ addressHash }: BalanceSummaryProps) => {
  const theme = useTheme()
  const { t } = useTranslation()
  const currency = useAppSelector((s) => s.settings.currency)
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const selectAddressesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddressesTokensWorth(s, addressHash || addressHashes))

  const label = addressHash ? t('Address worth') : t('Wallet worth')

  return (
    <BalanceSummaryBox>
      <TextContainer>
        <View>
          <AppText color={colord(theme.font.primary).alpha(0.6).toHex()}>{label}</AppText>
        </View>

        {addressesBalancesStatus === 'uninitialized' ? (
          <ActivityIndicator size="large" color={theme.font.primary} style={{ marginTop: 10 }} />
        ) : (
          <Amount value={balanceInFiat} isFiat suffix={CURRENCIES[currency].symbol} semiBold size={44} />
        )}

        {addressHash && <AddressNftsBadge addressHash={addressHash} />}
      </TextContainer>
    </BalanceSummaryBox>
  )
}

export default BalanceSummary

const AddressNftsBadge = ({ addressHash }: Pick<BalanceSummaryProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const theme = useTheme()

  const handlePress = () => dispatch(openModal({ name: 'NftGridModal', props: { addressHash } }))

  return (
    <Pressable onPress={handlePress}>
      <Badge color={colord(theme.font.primary).alpha(0.6).toHex()}>
        {t('nfts_in_addresses', { count: nfts.length })}
      </Badge>
    </Pressable>
  )
}

export const BalanceSummaryBox = styled.View`
  justify-content: center;
  align-items: center;
  margin: 10px 0 16px 0;
`

const TextContainer = styled.View`
  align-items: center;
  margin: 10px ${DEFAULT_MARGIN + 10}px 15px ${DEFAULT_MARGIN + 10}px;
`
