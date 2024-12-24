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

import { VenetianMask } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import Button from '@/components/Button'

interface PrivateModeButtonProps {
  className?: string
}

const PrivateModeButton = (props: PrivateModeButtonProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <ButtonStyled
      title={t('Private modes')}
      role="secondary"
      Icon={VenetianMask}
      short
      onClick={() => navigate('/private-mode')}
      {...props}
    >
      {t('Private modes')}
    </ButtonStyled>
  )
}

export default PrivateModeButton

const ButtonStyled = styled(Button)`
  border-radius: var(--radius-big);
`
