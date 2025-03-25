import { colord } from 'colord'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AddressGroupBadge from '~/components/AddressGroupBadge'
import AnimatedBackground from '~/components/animatedBackground/AnimatedBackground'
import AppText from '~/components/AppText'
import Badge from '~/components/Badge'
import BalanceSummary from '~/components/BalanceSummary'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import Box from '~/components/layout/Box'
import RoundedCard from '~/components/RoundedCard'
import Row from '~/components/Row'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import { closeModal, openModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import SendButton from '~/features/send/SendButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesNFTs,
  makeSelectAddressesTokens,
  selectAddressByHash
} from '~/store/addresses/addressesSelectors'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { copyAddressToClipboard } from '~/utils/addresses'

interface AddressDetailsModalHeaderProps {
  addressHash: string
  parentModalId: ModalInstance['id']
}

const AddressDetailsModalHeader = ({ addressHash, parentModalId }: AddressDetailsModalHeaderProps) => {
  const { t } = useTranslation()
  const selectAddressTokens = useMemo(() => makeSelectAddressesTokens(), [])
  const hasTokens = useAppSelector((s) => selectAddressTokens(s, addressHash)).length > 0
  const dispatch = useAppDispatch()

  const handleSettingsPress = () => {
    dispatch(openModal({ name: 'AddressSettingsModal', props: { addressHash, parentModalId } }))
  }

  const handleClose = () => dispatch(closeModal({ id: parentModalId }))

  return (
    <AddressDetailsModalHeaderStyled>
      <RoundedCard>
        <AddressAnimatedBackground addressHash={addressHash} />
        <BalanceSummary addressHash={addressHash} />
      </RoundedCard>

      <ActionButtons>
        {hasTokens && <SendButton origin="addressDetails" originAddressHash={addressHash} onPress={handleClose} />}
        <ActionCardReceiveButton origin="addressDetails" addressHash={addressHash} />
        <ActionCardBuyButton origin="addressDetails" receiveAddressHash={addressHash} />
        <ActionCardButton title={t('Settings')} onPress={handleSettingsPress} iconProps={{ name: 'settings' }} />
      </ActionButtons>

      <AddressDetailsBox>
        <Row title={t('Address')} short>
          <AppText truncate ellipsizeMode="middle" onLongPress={() => copyAddressToClipboard(addressHash)}>
            {addressHash}
          </AppText>
        </Row>
        <Row title={t('Group')} isLast short>
          <AddressGroupBadge addressHash={addressHash} />
        </Row>
      </AddressDetailsBox>

      {hasTokens && (
        <TokensBadges>
          <FungibleTokensBadge addressHash={addressHash} />
          <AddressNftsBadge addressHash={addressHash} />
        </TokensBadges>
      )}
    </AddressDetailsModalHeaderStyled>
  )
}

export default AddressDetailsModalHeader

const FungibleTokensBadge = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const selectAddressesKnownFungibleTokens = useMemo(() => makeSelectAddressesKnownFungibleTokens(), [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash, true))
  const color = useAppSelector((s) => selectAddressByHash(s, addressHash)?.color)

  const editableColor = colord(color || theme.bg.contrast)
  const isLightTheme = theme.name === 'light'

  return (
    <BadgeStyled
      rounded
      solid
      color={editableColor
        .desaturate(isLightTheme ? 0.1 : 0.3)
        .alpha(isLightTheme ? 0.15 : 0.25)
        .toHex()}
    >
      <AppText
        color={editableColor
          .desaturate(isLightTheme ? 0.4 : 0.3)
          .lighten(isLightTheme ? -0.3 : 0.1)
          .toHex()}
        semiBold
      >
        {t('Tokens')}
      </AppText>

      <AssetNumberText
        color={editableColor
          .desaturate(isLightTheme ? 0.4 : 0.3)
          .lighten(isLightTheme ? -0.3 : 0.1)
          .alpha(0.5)
          .toHex()}
        size={12}
      >
        {knownFungibleTokens.length}
      </AssetNumberText>
    </BadgeStyled>
  )
}

const AddressNftsBadge = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const selectAddressesNFTs = useMemo(() => makeSelectAddressesNFTs(), [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))

  const handlePress = () => dispatch(openModal({ name: 'NftGridModal', props: { addressHash } }))

  return (
    <Pressable onPress={handlePress}>
      <BadgeStyled rounded color={theme.bg.secondary} solid>
        <AppText semiBold color="secondary">
          {t('NFTs')}
        </AppText>

        <AssetNumberText size={12} color="tertiary">
          {nfts.length}
        </AssetNumberText>
      </BadgeStyled>
    </Pressable>
  )
}

const AddressAnimatedBackground = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return <AnimatedBackground shade={address.color} />
}

const AddressDetailsModalHeaderStyled = styled.View`
  padding: ${VERTICAL_GAP / 2}px 0 ${VERTICAL_GAP}px 0;
`

// TODO: DRY
const ActionButtons = styled.View`
  margin: ${VERTICAL_GAP}px 0;
  flex-direction: row;
  gap: 10px;
`

const TokensBadges = styled.View`
  flex-direction: row;
  gap: 10px;
  padding-top: ${VERTICAL_GAP}px;
`

const AssetNumberText = styled(AppText)`
  padding: 4px 10px 4px 0px;
`

const BadgeStyled = styled(Badge)`
  padding: 7px 6px 7px 14px;
  gap: 10px;
`

const AddressDetailsBox = styled(Box)`
  padding-top: 0;
  padding-bottom: 0;
`
