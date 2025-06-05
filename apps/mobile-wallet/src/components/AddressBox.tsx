import { AddressHash, CURRENCIES, selectAddressByHash } from '@alephium/shared'
import {
  useFetchAddressFtsSorted,
  useFetchAddressSingleTokenBalances,
  useFetchAddressTokensByType,
  useFetchAddressWorth
} from '@alephium/shared-react'
import { Token } from '@alephium/web3'
import { Check, Lock } from 'lucide-react-native'
import { useTranslation } from 'react-i18next'
import { GestureResponderEvent, PressableProps } from 'react-native'
import Animated from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressColorSymbol from '~/components/AddressColorSymbol'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import AnimatedPressable from '~/components/layout/AnimatedPressable'
import FtWorth from '~/components/tokensLists/FtWorth'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { BORDER_RADIUS, BORDER_RADIUS_BIG, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

export interface AddressBoxProps extends Omit<PressableProps, 'onPress'> {
  addressHash: AddressHash
  origin:
    | 'addressesScreen'
    | 'originAddress'
    | 'destinationAddress'
    | 'walletConnectPairing'
    | 'selectAddressModal'
    | 'connectDappModal'
  isSelected?: boolean
  isLast?: boolean
  rounded?: boolean
  showGroup?: boolean
  tokenId?: Token['id']
  onPress?: (e: GestureResponderEvent) => void
}

const maxNbOfTokenLogos = 5

// TODO: Use ListItem

const AddressBox = ({
  addressHash,
  isSelected,
  onPress,
  isLast,
  style,
  rounded,
  tokenId,
  showGroup,
  origin,
  ...props
}: AddressBoxProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  if (!address) return

  const handlePress = (e: GestureResponderEvent) => {
    vibrate(ImpactStyle.Heavy)
    onPress?.(e)
  }

  const handleLongPress = () => {
    vibrate(ImpactStyle.Heavy)
    if (origin === 'addressesScreen') {
      dispatch(openModal({ name: 'AddressQuickActionsModal', props: { addressHash } }))
    } else if (
      origin === 'originAddress' ||
      origin === 'destinationAddress' ||
      origin === 'walletConnectPairing' ||
      origin === 'selectAddressModal'
    ) {
      dispatch(
        openModal({
          name: 'AddressPickerQuickActionsModal',
          props: { addressHash, onSelectAddress: handlePress }
        })
      )
    }
    sendAnalytics({ event: 'Opened address quick actions modal', props: { origin } })
  }

  const hasLabel = !!address?.label

  return (
    <AddressBoxStyled
      {...props}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[
        style,
        {
          borderRadius: rounded ? BORDER_RADIUS : 0,
          backgroundColor: isSelected ? theme.bg.accent : theme.bg.secondary
        }
      ]}
    >
      <TextualContent>
        <AddressBoxColumnLeft>
          <TopRow>
            <AddressLabel>
              {isSelected ? (
                <SelectedBadge>
                  <Check color="white" size={14} />
                </SelectedBadge>
              ) : (
                <Animated.View>
                  <AddressColorSymbol addressHash={addressHash} size={16} />
                </Animated.View>
              )}

              <AppText
                truncate
                ellipsizeMode={hasLabel ? 'tail' : 'middle'}
                size={17}
                semiBold
                color={isSelected ? theme.global.accent : theme.font.primary}
                style={{
                  maxWidth: !hasLabel ? 100 : undefined,
                  flexShrink: 1,
                  padding: 0,
                  includeFontPadding: false
                }}
              >
                {address?.label || addressHash}
              </AppText>
            </AddressLabel>

            {tokenId ? (
              <AddressTokenWorth addressHash={addressHash} tokenId={tokenId} />
            ) : (
              <AddressTotalWorth addressHash={addressHash} />
            )}
          </TopRow>
          <BottomRow>
            {hasLabel && (
              <AppText
                truncate
                ellipsizeMode="middle"
                style={{ maxWidth: 100 }}
                color={isSelected ? theme.global.accent : address.label ? theme.font.secondary : theme.font.primary}
              >
                {address.hash}
              </AppText>
            )}

            <TokensRow>
              {tokenId ? (
                <AddressTokenBalances tokenId={tokenId} addressHash={addressHash} />
              ) : (
                <AddressTokensBadgesList addressHash={addressHash} />
              )}
              {showGroup && (
                <AppText color="tertiary" size={12} style={{ marginLeft: 'auto' }}>
                  {t('Group {{ groupNumber }}', { groupNumber: address.group })}
                </AppText>
              )}
            </TokensRow>
          </BottomRow>
        </AddressBoxColumnLeft>
      </TextualContent>
    </AddressBoxStyled>
  )
}

export default AddressBox

const AddressTotalWorth = ({ addressHash }: Pick<AddressBoxProps, 'addressHash'>) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const { data: addressWorth } = useFetchAddressWorth(addressHash)

  return (
    <Amount isFiat value={addressWorth} suffix={CURRENCIES[currency].symbol} semiBold size={17} adjustsFontSizeToFit />
  )
}

const AddressTokenWorth = ({ addressHash, tokenId }: Required<Pick<AddressBoxProps, 'addressHash' | 'tokenId'>>) => {
  const { data: tokenBalances } = useFetchAddressSingleTokenBalances({ addressHash, tokenId })

  const balance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return <FtWorth tokenId={tokenId} amount={balance} semiBold size={17} adjustsFontSizeToFit />
}

const AddressTokensBadgesList = ({ addressHash }: Pick<AddressBoxProps, 'addressHash'>) => {
  const { t } = useTranslation()

  const { data: sortedFts } = useFetchAddressFtsSorted(addressHash)
  const {
    data: { nftIds }
  } = useFetchAddressTokensByType(addressHash)

  return (
    (sortedFts.length > 0 || nftIds.length > 0) && (
      <AssetsRow>
        {sortedFts.length > 0 && (
          <AssetListContainer rounded border light compact>
            {sortedFts.slice(0, maxNbOfTokenLogos).map(({ id }) => (
              <AssetLogo key={id} assetId={id} size={15} />
            ))}
            {sortedFts.length > 5 && <NbOfAssetsText>+{sortedFts.length - maxNbOfTokenLogos}</NbOfAssetsText>}
          </AssetListContainer>
        )}

        {nftIds.length > 0 && (
          <Badge border light compact>
            <NbOfAssetsText>{t('nfts_in_addresses', { count: nftIds.length })}</NbOfAssetsText>
          </Badge>
        )}
      </AssetsRow>
    )
  )
}

const AddressTokenBalances = ({ addressHash, tokenId }: Required<Pick<AddressBoxProps, 'addressHash' | 'tokenId'>>) => {
  const { data: tokenBalances } = useFetchAddressSingleTokenBalances({ addressHash, tokenId })

  const balance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined
  const lockedBalance = tokenBalances?.lockedBalance ? BigInt(tokenBalances.lockedBalance) : undefined

  return (
    <AssetsRow>
      {balance !== undefined && <AssetAmountWithLogo assetId={tokenId} amount={balance} />}

      {!!lockedBalance && (
        <LockedAmount>
          <Lock size={16} />
          <AssetAmountWithLogo assetId={tokenId} amount={lockedBalance} />
        </LockedAmount>
      )}
    </AssetsRow>
  )
}

const AddressBoxStyled = styled(AnimatedPressable)`
  flex-direction: row;
  overflow: hidden;
  border-radius: ${BORDER_RADIUS_BIG}px;
  padding: 0 ${DEFAULT_MARGIN}px 0 ${DEFAULT_MARGIN / 2}px;
  margin-bottom: ${VERTICAL_GAP / 2}px;
`

const AddressLabel = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex-shrink: 1;
`

const SelectedBadge = styled(Animated.View)`
  height: 16px;
  width: 16px;
  background-color: ${({ theme }) => theme.global.accent};
  border-radius: 16px;
  align-items: center;
  justify-content: center;
`

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const TokensRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 5px;
`

const BottomRow = styled.View`
  margin-left: 27px;
  gap: 10px;
`

const TextualContent = styled.View`
  flex: 3;
  min-height: 60px;
  flex-direction: row;
  padding: 14px 0;
  margin-left: ${DEFAULT_MARGIN / 2}px;
`

const AddressBoxColumnLeft = styled.View`
  flex: 1.5;
  gap: 5px;
`

const AssetsRow = styled.View`
  flex-direction: row;
  gap: 5px;
`

const AssetListContainer = styled(Badge)`
  padding-left: 4px;
  padding-right: 4px;
`

const NbOfAssetsText = styled(AppText)`
  font-size: 12px;
  color: ${({ theme }) => theme.font.secondary};
`

const LockedAmount = styled.View`
  flex-direction: row;
  gap: 4px;
  align-items: center;
`
