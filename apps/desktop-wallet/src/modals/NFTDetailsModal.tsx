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

import { NFT } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import SideModal from '@/modals/SideModal'

interface TransactionDetailsModalProps {
  NFTId: NFT['id']
  onClose: () => void
}

const NFTDetailsModal = ({ onClose }: TransactionDetailsModalProps) => {
  const { t } = useTranslation()

  return <SideModal onClose={onClose} title={t('NFT details')} hideHeader></SideModal>
}

export default NFTDetailsModal
