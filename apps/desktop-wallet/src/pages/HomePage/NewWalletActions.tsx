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

import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Button from '@/components/Button'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'

interface NewWalletActionsProps {
  onExistingWalletLinkClick?: () => void
}

const NewWalletActions = ({ onExistingWalletLinkClick }: NewWalletActionsProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <>
      <Paragraph centered secondary style={{ maxWidth: 360 }}>
        {t('Please choose whether you want to create a new wallet or import an existing one.')}
      </Paragraph>
      <Section inList>
        <Button onClick={() => navigate('/create/0')} tall>
          {t('New wallet')}
        </Button>
        <Button onClick={() => navigate('/import/0')} tall>
          {t('Import wallet')}
        </Button>
        {onExistingWalletLinkClick && (
          <Button onClick={onExistingWalletLinkClick} Icon={ArrowLeft} role="secondary">
            {t('Use an existing wallet')}
          </Button>
        )}
      </Section>
    </>
  )
}

export default NewWalletActions
