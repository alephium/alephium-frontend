/*
Copyright 2018 - 2022 The Alephium Authors
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

import { ComponentProps, forwardRef } from 'react'
import { Modalize as RNModalize } from 'react-native-modalize'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Modal from '~/components/layout/Modal'

const Modalize = forwardRef(function Modalize({ children, ...props }: ComponentProps<typeof RNModalize>, ref) {
  const insets = useSafeAreaInsets()

  return (
    <Modal ref={ref} {...props}>
      {children}
    </Modal>
  )
})

export default Modalize
