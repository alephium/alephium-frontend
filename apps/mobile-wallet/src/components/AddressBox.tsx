import { AddressHash, CURRENCIES } from '@alephium/shared'
import { Token } from '@alephium/web3'
import { Check, Lock } from 'lucide-react-native'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressColorSymbol from '~/components/AddressColorSymbol'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs,
  makeSelectAddressesTokensWorth,
  selectAddressByHash
} from '~/store/addresses/addressesSelectors'
import { BORDER_RADIUS, BORDER_RADIUS_BIG, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

export interface AddressBoxProps extends PressableProps {
  addressHash: AddressHash
  origin: 'addressesScreen' | 'originAddress' | 'destinationAddress' | 'walletConnectPairing' | 'selectAddressModal'
  isSelected?: boolean
  isLast?: boolean
  rounded?: boolean
  tokenId?: Token['id']
}

const maxNbOfTokenLogos = 5

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// TODO: Use ListItem

const AddressBox = ({
  addressHash,
  isSelected,
  onPress,
  isLast,
  style,
  rounded,
  tokenId,
  origin,
  ...props
}: AddressBoxProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const currency = useAppSelector((s) => s.settings.currency)
  const dispatch = useAppDispatch()

  const fade = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fade.value
  }))

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

  const hasLabel = !!address?.settings.label

  return (
    <AddressBoxStyled
      {...props}
      onPressIn={() => {
        fade.value = withTiming(0.5, { duration: 150 })
      }}
      onPressOut={() => {
        fade.value = withTiming(1, { duration: 150 })
      }}
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[
        style,
        {
          borderRadius: rounded ? BORDER_RADIUS : 0,
          backgroundColor: isSelected ? theme.bg.accent : theme.bg.tertiary,
          borderColor: isSelected ? theme.global.accent : theme.border.secondary,
          borderWidth: 1
        },
        animatedStyle
      ]}
    >
      <BadgeContainer>
        {isSelected ? (
          <SelectedBadge>
            <Check color="white" size={16} />
          </SelectedBadge>
        ) : (
          <Animated.View>
            <AddressColorSymbol addressHash={addressHash} size={16} />
          </Animated.View>
        )}
      </BadgeContainer>
      <TextualContent>
        <AddressBoxColumnLeft>
          <TopRow>
            <AppText
              truncate
              ellipsizeMode={hasLabel ? 'tail' : 'middle'}
              size={17}
              semiBold
              color={isSelected ? theme.global.accent : theme.font.primary}
              style={{ maxWidth: !hasLabel ? 100 : undefined, flexShrink: 1 }}
            >
              {address?.settings.label || addressHash}
            </AppText>
            <AddressAmount addressHash={addressHash} tokenId={tokenId} />
          </TopRow>

          {hasLabel && (
            <AppText
              truncate
              ellipsizeMode="middle"
              size={12}
              style={{ maxWidth: 100 }}
              color={
                isSelected ? theme.global.accent : address.settings.label ? theme.font.tertiary : theme.font.primary
              }
            >
              {address.hash}
            </AppText>
          )}

          <TokensRow>
            {tokenId ? (
              <AddressTokenDetails tokenId={tokenId} addressHash={addressHash} />
            ) : (
              <AddressAllTokensDetails addressHash={addressHash} />
            )}
          </TokensRow>
        </AddressBoxColumnLeft>
      </TextualContent>
    </AddressBoxStyled>
  )
}

export default AddressBox

const AddressAmount = ({
  addressHash,
  tokenId
}: Pick<AddressBoxProps, 'addressHash'> & Pick<AddressBoxProps, 'tokenId'>) => {
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddessesTokensWorth(s, addressHash))

  // Suboptimal way to fetch token, will be fixed when migrated to Tanstack
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const token = knownFungibleTokens.find((t) => t.id === tokenId)

  return token ? (
    <Amount isFiat value={token.worth} suffix={CURRENCIES[currency].symbol} semiBold size={17} adjustsFontSizeToFit />
  ) : (
    <Amount isFiat value={balanceInFiat} suffix={CURRENCIES[currency].symbol} semiBold size={17} adjustsFontSizeToFit />
  )
}

const AddressAllTokensDetails = ({ addressHash }: Pick<AddressBoxProps, 'addressHash'>) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const { t } = useTranslation()

  return (
    (knownFungibleTokens.length > 0 || nfts.length > 0) && (
      <AssetsRow>
        {knownFungibleTokens.length > 0 && (
          <AssetListContainer rounded>
            {knownFungibleTokens.slice(0, maxNbOfTokenLogos).map(({ id }) => (
              <AssetLogo key={id} assetId={id} size={15} />
            ))}
            {knownFungibleTokens.length > 5 && (
              <NbOfAssetsText>+{knownFungibleTokens.length - maxNbOfTokenLogos}</NbOfAssetsText>
            )}
          </AssetListContainer>
        )}

        {nfts.length > 0 && (
          <Badge>
            <NbOfAssetsText>{t('nfts_in_addresses', { count: nfts.length })}</NbOfAssetsText>
          </Badge>
        )}
      </AssetsRow>
    )
  )
}

const AddressTokenDetails = ({
  addressHash,
  tokenId
}: Pick<AddressBoxProps, 'addressHash'> & Required<Pick<AddressBoxProps, 'tokenId'>>) => {
  // Suboptimal way to fetch token, will be fixed when migrated to Tanstack
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const token = knownFungibleTokens.find((t) => t.id === tokenId)

  if (!token) return null

  return (
    <AssetsRow>
      <AssetAmountWithLogo assetId={tokenId} amount={token.balance} />

      {token.lockedBalance > 0 && (
        <LockedAmount>
          <Lock size={16} />
          <AssetAmountWithLogo assetId={tokenId} amount={token.lockedBalance} />
        </LockedAmount>
      )}
    </AssetsRow>
  )
}

const AddressBoxStyled = styled(AnimatedPressable)`
  flex-direction: row;
  overflow: hidden;
  border-radius: ${BORDER_RADIUS_BIG}px;
  padding: 0 10px;
  margin-bottom: ${VERTICAL_GAP / 2}px;
`

const BadgeContainer = styled.View`
  align-items: center;
  width: 26px;
  padding: 16px 0;
`

const SelectedBadge = styled(Animated.View)`
  height: 20px;
  width: 20px;
  background-color: ${({ theme }) => theme.global.accent};
  border-radius: 20px;
  align-items: center;
  justify-content: center;
`

const TopRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  justify-content: space-between;
`

const TokensRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const TextualContent = styled.View`
  flex: 3;
  min-height: 60px;
  flex-direction: row;
  gap: ${DEFAULT_MARGIN / 2}px;
  padding: 14px 0;
  margin-left: ${DEFAULT_MARGIN / 2}px;
`

const AddressBoxColumnLeft = styled.View`
  flex: 1.5;
  gap: ${VERTICAL_GAP / 4}px;
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
  padding-right: 4px;
`

const LockedAmount = styled.View`
  flex-direction: row;
  gap: 4px;
  align-items: center;
`
