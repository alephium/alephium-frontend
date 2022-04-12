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

import { useState } from 'react'

import PinCodeInput from '../../components/inputs/PinCodeInput'
import Screen from '../../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'

const instructions: Instruction[] = [
  { text: 'Choose a passcode to protect your wallet 🔐', type: 'primary' },
  { text: 'Try not to forget it!', type: 'secondary' },
  { text: 'Why?', type: 'link', url: 'https://wiki.alephium.org/Frequently-Asked-Questions.html' }
]

const PinCodeCreationScreen = () => {
  const [pinCode, setPinCode] = useState('')

  return (
    <Screen>
      <CenteredInstructions instructions={instructions} />
      <PinCodeInput pinLenght={6} value={pinCode} onPinChange={setPinCode} />
    </Screen>
  )
}

export default PinCodeCreationScreen
