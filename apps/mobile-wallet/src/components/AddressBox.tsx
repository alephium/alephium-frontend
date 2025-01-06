import { AddressHash, CURRENCIES } from '@alephium/shared'
import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { Check } from 'lucide-react-native'
import { useMemo } from 'react'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AddressColorSymbol from '~/components/AddressColorSymbol'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesTokensWorth } from '~/store/addresses/addressesSelectors'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs,
  selectAddressByHash
} from '~/store/addressesSlice'
import { BORDER_RADIUS, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

interface AddressBoxProps extends PressableProps {
  addressHash: AddressHash
  isSelected?: boolean
  isLast?: boolean
  rounded?: boolean
}

const maxNbOfTokenLogos = 5

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const AnimatedSelectedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

// TODO: Use ListItem

const AddressBox = ({ addressHash, isSelected, onPress, isLast, style, rounded, ...props }: AddressBoxProps) => {
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const currency = useAppSelector((s) => s.settings.currency)
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector((s) => selectAddessesTokensWorth(s, addressHash))
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))

  if (!address) return

  const handlePress = (e: GestureResponderEvent) => {
    vibrate(ImpactStyle.Heavy)
    onPress && onPress(e)
  }

  return (
    <AddressBoxStyled {...props} onPress={handlePress} style={[style, { borderRadius: rounded ? BORDER_RADIUS : 0 }]}>
      {isSelected && (
        <SelectedLinearGradient
          pointerEvents="none"
          style={{ width: 100, height: '100%' }}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 1]}
          colors={[colord(theme.global.accent).alpha(0.4).toHex(), colord(theme.global.accent).alpha(0).toHex()]}
          entering={FadeIn}
          exiting={FadeOut}
        />
      )}
      <BadgeContainer>
        {isSelected ? (
          <SelectedBadge entering={FadeIn} exiting={FadeOut}>
            <Check color="white" size={18} />
          </SelectedBadge>
        ) : (
          <Animated.View entering={FadeIn} exiting={FadeOut}>
            <AddressColorSymbol addressHash={addressHash} size={18} />
          </Animated.View>
        )}
      </BadgeContainer>
      <TextualContent style={{ borderBottomWidth: !isLast ? 1 : 0 }}>
        <AddressBoxColumn>
          {address.settings.label && (
            <AppText numberOfLines={1} semiBold size={16}>
              {address.settings.label}
            </AppText>
          )}
          <AppText
            numberOfLines={1}
            ellipsizeMode="middle"
            semiBold={!address?.settings.label}
            color={address.settings.label && theme.font.tertiary}
          >
            {address.hash}
          </AppText>
        </AddressBoxColumn>
        <AddressBoxColumnRight>
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
        </AddressBoxColumnRight>
      </TextualContent>
    </AddressBoxStyled>
  )
}

export default AddressBox

const AddressBoxStyled = styled(AnimatedPressable)`
  flex-direction: row;
  align-items: center;
  overflow: hidden;
`

const BadgeContainer = styled.View`
  justify-content: center;
`

const SelectedBadge = styled(Animated.View)`
  height: 26px;
  width: 26px;
  background-color: ${({ theme }) => theme.global.accent};
  border-radius: 26px;
  align-items: center;
  justify-content: center;
`

const SelectedLinearGradient = styled(AnimatedSelectedLinearGradient)`
  position: absolute;
  left: -${DEFAULT_MARGIN}px;
`

const TextualContent = styled.View`
  flex: 1;
  min-height: 60px;
  flex-direction: row;
  gap: ${DEFAULT_MARGIN}px;
  align-items: center;
  border-color: ${({ theme }) => theme.border.secondary};
  padding: ${VERTICAL_GAP / 2}px 0;
  margin-left: ${DEFAULT_MARGIN}px;
`

const AddressBoxColumn = styled.View`
  flex: 1;
  gap: ${VERTICAL_GAP / 4}px;
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
