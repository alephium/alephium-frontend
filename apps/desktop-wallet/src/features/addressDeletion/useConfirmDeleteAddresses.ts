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

import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

interface UseConfirmDeleteAddressesProps {
  confirmationText: string
  onConfirm: () => void
}

const useConfirmDeleteAddresses = ({ confirmationText, onConfirm }: UseConfirmDeleteAddressesProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const confirmDeleteAddresses = () => {
    dispatch(
      openModal({
        name: 'ConfirmModal',
        props: {
          Icon: Trash2,
          onConfirm,
          narrow: true,
          text: confirmationText,
          note: t('Forgetting addresses does not delete your assets in them.')
        }
      })
    )
  }

  return confirmDeleteAddresses
}

export default useConfirmDeleteAddresses
