import { AddressHash, CURRENCIES } from '@alephium/shared'
import { Check } from 'lucide-react-native'
import { useMemo } from 'react'
import { GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import Animated from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AddressColorSymbol from '~/components/AddressColorSymbol'
import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
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
  const dispatch = useAppDispatch()

  if (!address) return

  const handlePress = (e: GestureResponderEvent) => {
    vibrate(ImpactStyle.Heavy)
    onPress?.(e)
  }

  const handleLongPress = () => {
    vibrate(ImpactStyle.Heavy)
    dispatch(openModal({ name: 'AddressQuickActionsModal', props: { addressHash } }))
  }

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
            <AppText numberOfLines={1} semiBold size={16} color={isSelected ? theme.global.accent : theme.font.primary}>
              {address.settings.label}
            </AppText>
          )}
          <AppText
            numberOfLines={1}
            ellipsizeMode="middle"
            semiBold={!address?.settings.label}
            color={isSelected ? theme.global.accent : address.settings.label ? theme.font.tertiary : theme.font.primary}
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
  overflow: hidden;
  border-radius: 22px;
  padding: 0 15px;
  margin-bottom: ${VERTICAL_GAP / 2}px;
`

const BadgeContainer = styled.View`
  justify-content: flex-start;
  align-items: center;
  width: 26px;
  padding: 15px 0;
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
