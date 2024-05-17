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

import FundingPasswordModal, { FundingPasswordModalProps } from '~/components/FundingPasswordModal'
import { useAppSelector } from '~/hooks/redux'

const useFundingPassword = () => {
  const usesFundingPassword = useAppSelector((s) => s.settings.usesFundingPassword)

  const [onCorrectPasswordCallback, setOnCorrectPasswordCallback] = useState<() => void>(() => () => null)
  const [isFundingPasswordModalOpen, setIsFundingPasswordModalOpen] = useState(false)

  const triggerFundingPasswordAuthGuard = useCallback(
    ({ successCallback }: Pick<FundingPasswordModalProps, 'successCallback'>) => {
      if (usesFundingPassword) {
        setOnCorrectPasswordCallback(() => () => successCallback())
        setIsFundingPasswordModalOpen(true)
      } else {
        successCallback()
      }
    },
    [usesFundingPassword]
  )

  const fundingPasswordModal = (
    <FundingPasswordModal
      isOpen={isFundingPasswordModalOpen}
      onClose={() => setIsFundingPasswordModalOpen(false)}
      successCallback={onCorrectPasswordCallback}
    />
  )

  return {
    triggerFundingPasswordAuthGuard,
    fundingPasswordModal
  }
}

export default useFundingPassword
