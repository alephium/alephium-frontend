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

import { AddressHash } from '@alephium/shared'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { ModalBaseProp } from '@/features/modals/modalTypes'
import CenteredModal from '@/modals/CenteredModal'

export interface BuyModalProps {
  addressHash: AddressHash
}

const BuyModal = memo(({ id, addressHash }: ModalBaseProp & BuyModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const banxaURL =
    'https://alephium.banxa.com/' +
    `?walletAddress=${addressHash}` +
    `&theme=${theme.name}` +
    `&backgroundColor=${theme.bg.primary.slice(1)}` +
    `&textColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&secondaryColor=${theme.global.complementary.slice(1)}`

  return (
    <CenteredModal id={id} title={t('Buy')} fullScreen dynamicContent noPadding>
      <IFrameStyled title={t('Buy')} src={banxaURL} />
    </CenteredModal>
  )
})

export default BuyModal

const IFrameStyled = styled.iframe`
  flex: 1;
  width: 100%;
  height: 100%;
  border: 0;
`
