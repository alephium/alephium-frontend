import { selectAddressByHash } from '@alephium/shared'
import { useFetchAddressBalances, useFetchAddressTokensByType, useFetchAddressWorth } from '@alephium/shared-react'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { colord } from 'colord'
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
import { openModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import SendButton from '~/features/send/SendButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { copyAddressToClipboard } from '~/utils/addresses'

interface AddressDetailsModalHeaderProps {
  addressHash: string
  parentModalId: ModalInstance['id']
}

const AddressDetailsModalHeader = ({ addressHash, parentModalId }: AddressDetailsModalHeaderProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleSettingsPress = () => {
    dispatch(openModal({ name: 'AddressSettingsModal', props: { addressHash, parentModalId } }))
  }

  return (
    <AddressDetailsModalHeaderStyled>
      <RoundedCard>
        <AddressAnimatedBackground addressHash={addressHash} />
        <AddressBalanceSummary addressHash={addressHash} />
      </RoundedCard>

      <ActionButtons>
        <AddressSendButton addressHash={addressHash} parentModalId={parentModalId} />
        <ActionCardReceiveButton origin="addressDetails" addressHash={addressHash} />
        <ActionCardBuyButton origin="addressDetails" receiveAddressHash={addressHash} />
        <ActionCardButton
          title={t('Settings')}
          onPress={handleSettingsPress}
          iconProps={{ name: 'settings-outline' }}
        />
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

      <AddressTokensBadges addressHash={addressHash} />
    </AddressDetailsModalHeaderStyled>
  )
}

export default AddressDetailsModalHeader

const AddressBalanceSummary = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const { data: worth, isLoading } = useFetchAddressWorth(addressHash)

  return <BalanceSummary label={t('Address worth')} worth={worth} isLoading={isLoading} />
}

const AddressSendButton = ({ addressHash, parentModalId }: AddressDetailsModalHeaderProps) => {
  const { data: addressBalances } = useFetchAddressBalances(addressHash)
  const { dismiss } = useBottomSheetModal()

  if (!addressBalances?.length) return null

  const handleClose = () => dismiss(parentModalId)

  return <SendButton origin="addressDetails" originAddressHash={addressHash} onPress={handleClose} />
}

const AddressTokensBadges = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { data: addressBalances } = useFetchAddressBalances(addressHash)

  if (!addressBalances?.length) return null

  return (
    <TokensBadges>
      <FungibleTokensBadge addressHash={addressHash} />
      <AddressNftsBadge addressHash={addressHash} />
    </TokensBadges>
  )
}

const FungibleTokensBadge = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const theme = useTheme()
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
        <AddressFtsCount addressHash={addressHash} />
      </AssetNumberText>
    </BadgeStyled>
  )
}

const AddressFtsCount = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const {
    data: { listedFts, unlistedFtIds }
  } = useFetchAddressTokensByType(addressHash)

  const ftsLength = listedFts.length + unlistedFtIds.length

  return ftsLength
}

const AddressNftsBadge = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const handlePress = () => dispatch(openModal({ name: 'AddressNftsGridModal', props: { addressHash } }))

  return (
    <Pressable onPress={handlePress}>
      <BadgeStyled rounded color={theme.bg.secondary} solid>
        <AppText semiBold color="secondary">
          {t('NFTs')}
        </AppText>

        <AssetNumberText size={12} color="tertiary">
          <AddressNftsCount addressHash={addressHash} />
        </AssetNumberText>
      </BadgeStyled>
    </Pressable>
  )
}

const AddressNftsCount = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const {
    data: { nftIds }
  } = useFetchAddressTokensByType(addressHash)

  return nftIds.length
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
