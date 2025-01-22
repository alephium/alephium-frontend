import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AnimatedBackground from '~/components/AnimatedBackground'
import AppText from '~/components/AppText'
import Badge from '~/components/Badge'
import BalanceSummary from '~/components/BalanceSummary'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import RoundedCard from '~/components/RoundedCard'
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
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

interface AddressDetailsModalHeaderProps {
  addressHash: string
  parentModalId: ModalInstance['id']
}

const AddressDetailsModalHeader = ({ addressHash, parentModalId }: AddressDetailsModalHeaderProps) => {
  const { t } = useTranslation()
  const selectAddressTokens = useMemo(makeSelectAddressesTokens, [])
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

      {hasTokens && (
        <>
          <HorizontalSeparator />

          <TokensBadges>
            <FungibleTokensBadge addressHash={addressHash} />
            <AddressNftsBadge addressHash={addressHash} />
          </TokensBadges>
        </>
      )}
    </AddressDetailsModalHeaderStyled>
  )
}

export default AddressDetailsModalHeader

const FungibleTokensBadge = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash, true))
  const theme = useTheme()

  return (
    <BadgeStyled rounded solid>
      <AppText color={theme.font.contrast} semiBold>
        {t('Tokens')}
      </AppText>
      <AppText color={theme.font.contrast} semiBold>
        {knownFungibleTokens.length}
      </AppText>
    </BadgeStyled>
  )
}

const AddressNftsBadge = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))

  const handlePress = () => dispatch(openModal({ name: 'NftGridModal', props: { addressHash } }))

  return (
    <Pressable onPress={handlePress}>
      <BadgeStyled rounded>
        <AppText semiBold>{t('NFTs')}</AppText>
        <AppText semiBold>{nfts.length}</AppText>
      </BadgeStyled>
    </Pressable>
  )
}

const AddressAnimatedBackground = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return <AnimatedBackground shade={address.settings.color} isAnimated />
}

const AddressDetailsModalHeaderStyled = styled.View`
  padding: ${VERTICAL_GAP / 2}px 0 ${VERTICAL_GAP}px 0;
`

const ActionButtons = styled.View`
  margin-top: ${VERTICAL_GAP / 2}px;
  flex-direction: row;
  gap: 10px;
`

const HorizontalSeparator = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
  margin-top: ${DEFAULT_MARGIN}px;
`

const TokensBadges = styled.View`
  flex-direction: row;
  gap: 10px;
  padding-top: ${DEFAULT_MARGIN * 2}px;
`

const BadgeStyled = styled(Badge)`
  padding: 8px 12px;
  gap: 10px;
`
