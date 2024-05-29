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

import { useCallback, useState } from 'react'

import FundPasswordModal, { FundPasswordModalProps } from '~/features/fund-password/FundPasswordModal'
import { useAppSelector } from '~/hooks/redux'

const useFundPasswordGuard = () => {
  const usesFundPassword = useAppSelector((s) => s.settings.usesFundPassword)

  const [onCorrectPasswordCallback, setOnCorrectPasswordCallback] = useState<() => void>(() => () => null)
  const [isFundPasswordModalOpen, setIsFundPasswordModalOpen] = useState(false)

  const triggerFundPasswordAuthGuard = useCallback(
    ({ successCallback }: Pick<FundPasswordModalProps, 'successCallback'>) => {
      if (usesFundPassword) {
        setOnCorrectPasswordCallback(() => () => successCallback())
        setIsFundPasswordModalOpen(true)
      } else {
        successCallback()
      }
    },
    [usesFundPassword]
  )

  const fundPasswordModal = (
    <FundPasswordModal
      isOpen={isFundPasswordModalOpen}
      onClose={() => setIsFundPasswordModalOpen(false)}
      successCallback={onCorrectPasswordCallback}
    />
  )

  return {
    triggerFundPasswordAuthGuard,
    fundPasswordModal
  }
}

export default useFundPasswordGuard
