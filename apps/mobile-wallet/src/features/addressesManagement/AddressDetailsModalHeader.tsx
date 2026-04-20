import { selectAddressByHash } from '@alephium/shared'
import { useFetchAddressBalances, useFetchAddressTokensByType, useFetchAddressWorth } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressGroupBadge from '~/components/AddressGroupBadge'
import AnimatedBackground from '~/components/animatedBackground/AnimatedBackground'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import ActionCardButton from '~/components/buttons/ActionCardButton'
import Box from '~/components/layout/Box'
import RoundedCard from '~/components/RoundedCard'
import Row from '~/components/Row'
import TopTabBar from '~/components/TopTabBar'
import AddressLastActivity from '~/features/addressesManagement/AddressLastActivity'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import { openModal } from '~/features/modals/modalActions'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import SendButton from '~/features/send/SendButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { copyAddressToClipboard } from '~/utils/addresses'

interface AddressDetailsModalHeaderProps {
  addressHash: string
  onForgetAddress: () => void
  onSendPress: () => void
  activeTab: number
  setActiveTab: (tab: number) => void
}

const AddressDetailsModalHeader = ({
  addressHash,
  onForgetAddress,
  onSendPress,
  activeTab,
  setActiveTab
}: AddressDetailsModalHeaderProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const {
    data: { listedFts, unlistedFtIds, nftIds }
  } = useFetchAddressTokensByType(addressHash)

  const ftsLength = listedFts.length + unlistedFtIds.length
  const nftsLength = nftIds.length

  const handleSettingsPress = () => {
    dispatch(openModal({ name: 'AddressSettingsModal', props: { addressHash, onForgetAddress } }))
  }

  return (
    <AddressDetailsModalHeaderStyled>
      <RoundedCard>
        <AddressAnimatedBackground addressHash={addressHash} />
        <AddressBalanceSummary addressHash={addressHash} />
      </RoundedCard>

      <ActionButtons>
        <AddressSendButton addressHash={addressHash} onSendPress={onSendPress} />
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

        <AddressGroupBadge addressHash={addressHash} />

        <AddressLastActivity addressHash={addressHash} />
      </AddressDetailsBox>

      <TokenTypeTabs>
        <TopTabBar
          tabLabels={[
            { name: t('Tokens'), count: ftsLength },
            { name: t('NFTs'), count: nftsLength }
          ]}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />
      </TokenTypeTabs>
    </AddressDetailsModalHeaderStyled>
  )
}

export default AddressDetailsModalHeader

const AddressBalanceSummary = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const { t } = useTranslation()
  const { data: worth, isLoading } = useFetchAddressWorth(addressHash)

  return <BalanceSummary label={t('Address worth')} worth={worth} isLoading={isLoading} />
}

const AddressSendButton = ({
  addressHash,
  onSendPress
}: Pick<AddressDetailsModalHeaderProps, 'addressHash' | 'onSendPress'>) => {
  const { data: addressBalances } = useFetchAddressBalances(addressHash)

  if (!addressBalances?.length) return null

  return <SendButton origin="addressDetails" originAddressHash={addressHash} onPress={onSendPress} />
}

const AddressAnimatedBackground = ({ addressHash }: Pick<AddressDetailsModalHeaderProps, 'addressHash'>) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return <AnimatedBackground shade={address.color} />
}

const AddressDetailsModalHeaderStyled = styled.View`
  padding: ${VERTICAL_GAP / 2}px 0 ${VERTICAL_GAP}px 0;
`

const ActionButtons = styled.View`
  margin: ${VERTICAL_GAP}px 0;
  flex-direction: row;
  gap: 10px;
`

const AddressDetailsBox = styled(Box)`
  padding-top: 0;
  padding-bottom: 0;
`

const TokenTypeTabs = styled.View`
  margin-top: ${VERTICAL_GAP}px;
  padding-top: ${VERTICAL_GAP}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.secondary};
`
