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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useAnalytics from '@/features/analytics/useAnalytics'
import { useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import AddressSweepModal from '@/modals/AddressSweepModal'
import ModalPortal from '@/modals/ModalPortal'
import NewAddressModal from '@/modals/NewAddressModal'
import SideModal, { SideModalProps } from '@/modals/SideModal'
import OperationBox from '@/pages/UnlockedWallet/AddressesPage/OperationBox'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

type AdvancedOperationsSideModal = Pick<SideModalProps, 'onClose'>

const AdvancedOperationsSideModal = (props: AdvancedOperationsSideModal) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { generateAndSaveOneAddressPerGroup, discoverAndSaveUsedAddresses } = useAddressGeneration()
  const isPassphraseUsed = useAppSelector((s) => s.activeWallet.isPassphraseUsed)
  const { sendAnalytics } = useAnalytics()

  const [isAddressesGenerationModalOpen, setIsAddressesGenerationModalOpen] = useState(false)
  const [isConsolidationModalOpen, setIsConsolidationModalOpen] = useState(false)

  const handleOneAddressPerGroupClick = () => {
    isPassphraseUsed ? generateAndSaveOneAddressPerGroup() : setIsAddressesGenerationModalOpen(true)
    sendAnalytics({ event: 'Advanced operation to generate one address per group clicked' })
  }

  const handleDiscoverAddressesClick = () => {
    discoverAndSaveUsedAddresses()
    sendAnalytics({ event: 'Advanced operation to discover addresses clicked' })
  }

  const handleConsolidationClick = () => {
    setIsConsolidationModalOpen(true)
    sendAnalytics({ event: 'Advanced operation to consolidate UTXOs clicked' })
  }

  const handleTellUsIdeasClick = () => {
    openInWebBrowser(links.discord)
    sendAnalytics({ event: 'Advanced operation to share ideas clicked' })
  }

  return (
    <SideModal {...props} title={t('Advanced operations')}>
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
      <ModalPortal>
        {isConsolidationModalOpen && <AddressSweepModal onClose={() => setIsConsolidationModalOpen(false)} />}
        {isAddressesGenerationModalOpen && (
          <NewAddressModal
            title={t('Generate one address per group')}
            onClose={() => setIsAddressesGenerationModalOpen(false)}
          />
        )}
      </ModalPortal>
    </SideModal>
  )
}

export default AdvancedOperationsSideModal

const AdvancedOperations = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 22px 28px;
`
