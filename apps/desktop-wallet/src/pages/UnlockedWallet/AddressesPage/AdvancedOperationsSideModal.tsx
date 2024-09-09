/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { Codesandbox, HardHat, Lightbulb, Search } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useAnalytics from '@/features/analytics/useAnalytics'
import { openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import SideModal from '@/modals/SideModal'
import OperationBox from '@/pages/UnlockedWallet/AddressesPage/OperationBox'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

const AdvancedOperationsSideModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { generateAndSaveOneAddressPerGroup, discoverAndSaveUsedAddresses } = useAddressGeneration()
  const { sendAnalytics } = useAnalytics()
  const dispatch = useAppDispatch()
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)
  const defaultAddress = useAppSelector(selectDefaultAddress)

  const handleOneAddressPerGroupClick = () => {
    isPassphraseUsed
      ? generateAndSaveOneAddressPerGroup()
      : dispatch(openModal({ name: 'NewAddressModal', props: { title: t('Generate one address per group') } }))
    sendAnalytics({ event: 'Advanced operation to generate one address per group clicked' })
  }

  const handleDiscoverAddressesClick = () => {
    discoverAndSaveUsedAddresses()
    sendAnalytics({ event: 'Advanced operation to discover addresses clicked' })
  }

  const handleConsolidationClick = () => {
    dispatch(
      openModal({ name: 'AddressSweepModal', props: { addressHash: defaultAddress.hash, isUtxoConsolidation: true } })
    )
    sendAnalytics({ event: 'Advanced operation to consolidate UTXOs clicked' })
  }

  const handleTellUsIdeasClick = () => {
    openInWebBrowser(links.discord)
    sendAnalytics({ event: 'Advanced operation to share ideas clicked' })
  }

  return (
    <SideModal id={id} title={t('Advanced operations')}>
      <AdvancedOperations>
        <OperationBox
          title={t('Discover active addresses')}
          Icon={<Search color={theme.global.complementary} strokeWidth={1} size={55} />}
          description={t('Scan the blockchain for addresses you used in the past.')}
          buttonText={t('Search')}
          onButtonClick={handleDiscoverAddressesClick}
          infoLink={links.miningWallet}
        />
        <OperationBox
          title={t('Generate one address per group')}
          Icon={<HardHat color="#a880ff" strokeWidth={1} size={55} />}
          description={t('Useful for miners or DeFi use.')}
          buttonText={isPassphraseUsed ? t('Generate') : t('Start')}
          onButtonClick={handleOneAddressPerGroupClick}
          infoLink={links.miningWallet}
        />
        <OperationBox
          title={t('Consolidate UTXOs')}
          Icon={<Codesandbox color="#64f6c2" strokeWidth={1} size={46} />}
          description={t('Consolidate (merge) your UTXOs into one.')}
          buttonText={t('Start')}
          onButtonClick={handleConsolidationClick}
          infoLink={links.utxoConsolidation}
        />
        <OperationBox
          placeholder
          title={t('More to come...')}
          Icon={<Lightbulb color={theme.font.secondary} strokeWidth={1} size={28} />}
          description={t('You have great ideas you want to share?')}
          buttonText={t('Tell us!')}
          onButtonClick={handleTellUsIdeasClick}
        />
      </AdvancedOperations>
    </SideModal>
  )
})

export default AdvancedOperationsSideModal

const AdvancedOperations = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 22px 28px;
`
