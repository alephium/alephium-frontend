import { AddressHash, CURRENCIES } from '@alephium/shared'
import { Token } from '@alephium/web3'
import { Check, Lock } from 'lucide-react-native'
import { useMemo } from 'react'
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
          backgroundColor: isSelected ? theme.bg.accent : theme.bg.secondary
        },
        animatedStyle
      ]}
    >
      <BadgeContainer>
        {isSelected ? (
          <SelectedBadge>
            <Check color="white" size={18} />
          </SelectedBadge>
        ) : (
          <Animated.View>
            <AddressColorSymbol addressHash={addressHash} size={18} />
          </Animated.View>
        )}
      </BadgeContainer>
      <TextualContent>
        <AddressBoxColumn>
          {address.settings.label && (
            <AppText truncate semiBold size={16} color={isSelected ? theme.global.accent : theme.font.primary}>
              {address.settings.label}
            </AppText>
          )}
          <AppText
            truncate
            ellipsizeMode="middle"
            semiBold={!address?.settings.label}
            color={isSelected ? theme.global.accent : address.settings.label ? theme.font.tertiary : theme.font.primary}
          >
            {address.hash}
          </AppText>
        </AddressBoxColumn>
        <AddressBoxColumnRight>
          {tokenId ? (
            <AddressTokenDetails addressHash={addressHash} tokenId={tokenId} />
          ) : (
            <AddressAllTokensDetails addressHash={addressHash} />
          )}
        </AddressBoxColumnRight>
      </TextualContent>
    </AddressBoxStyled>
  )
}

export default AddressBox

const AddressAllTokensDetails = ({ addressHash }: Pick<AddressBoxProps, 'addressHash'>) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddessesTokensWorth(s, addressHash))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))

  return (
    <>
      <Amount isFiat value={balanceInFiat} suffix={CURRENCIES[currency].symbol} semiBold size={16} />
      {(knownFungibleTokens.length > 0 || nfts.length > 0) && (
        <AssetsRow>
          <Badge rounded>
            {knownFungibleTokens.map(
              (asset, i) => i < maxNbOfTokenLogos && <AssetLogo key={asset.id} assetId={asset.id} size={15} />
            )}
            {knownFungibleTokens.length > 5 && (
              <NbOfAssetsText>+{knownFungibleTokens.length - maxNbOfTokenLogos}</NbOfAssetsText>
            )}
          </Badge>
          {nfts.length > 0 && (
            <Badge>
              <NbOfAssetsText>{nfts.length} NFTs</NbOfAssetsText>
            </Badge>
          )}
        </AssetsRow>
      )}
    </>
  )
}

const AddressTokenDetails = ({
  addressHash,
  tokenId
}: Pick<AddressBoxProps, 'addressHash'> & Required<Pick<AddressBoxProps, 'tokenId'>>) => {
  const currency = useAppSelector((s) => s.settings.currency)

  // Suboptimal way to fetch token, will be fixed when migrated to Tanstack
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const token = knownFungibleTokens.find((t) => t.id === tokenId)

  if (!token) return null

  return (
    <>
      <Amount isFiat value={token.worth} suffix={CURRENCIES[currency].symbol} semiBold size={16} />
      <AssetsRow>
        <AssetAmountWithLogo assetId={tokenId} amount={token.balance} />

        {token.lockedBalance > 0 && (
          <LockedAmount>
            <Lock size={16} />
            <AssetAmountWithLogo assetId={tokenId} amount={token.lockedBalance} />
          </LockedAmount>
        )}
      </AssetsRow>
    </>
  )
}

const AddressBoxStyled = styled(AnimatedPressable)`
  flex-direction: row;
  overflow: hidden;
  border-radius: ${BORDER_RADIUS_BIG}px;
  padding: 0 15px;
  margin-bottom: ${VERTICAL_GAP / 2}px;
`

const BadgeContainer = styled.View`
  justify-content: flex-start;
  align-items: center;
  width: 26px;
  padding: 15px 0;
  justify-content: center;
`

const SelectedBadge = styled(Animated.View)`
  height: 22px;
  width: 22px;
  background-color: ${({ theme }) => theme.global.accent};
  border-radius: 22px;
  align-items: center;
  justify-content: center;
`

const TextualContent = styled.View`
  flex: 1;
  min-height: 60px;
  flex-direction: row;
  gap: ${DEFAULT_MARGIN}px;
  padding: 15px 0;
  margin-left: ${DEFAULT_MARGIN}px;
`

const AddressBoxColumn = styled.View`
  flex: 1;
  gap: ${VERTICAL_GAP / 4}px;
  justify-content: center;
`

const AddressBoxColumnRight = styled(AddressBoxColumn)`
  align-items: flex-end;
`

const AssetsRow = styled.View`
  align-items: flex-end;
  gap: 4px;
`

const NbOfAssetsText = styled(AppText)`
  text-align: right;
  font-size: 12px;
`

const LockedAmount = styled.View`
  flex-direction: row;
  gap: 4px;
  align-items: center;
`
