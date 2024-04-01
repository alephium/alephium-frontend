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

import { keyring } from '@alephium/keyring'
import Tagify, { BaseTagData, ChangeEventData, TagData } from '@yaireo/tagify'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import TextAreaTags from '@/components/Inputs/TextAreaTags'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import { useStepsContext } from '@/contexts/steps'
import { useWalletContext } from '@/contexts/wallet'
import { bip39Words } from '@/utils/bip39'

const ImportWordsPage = () => {
  const { t } = useTranslation()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { setMnemonic } = useWalletContext()

  const [phrase, setPhrase] = useState<{ value: string }[]>([])
  const allowedWords = useRef(bip39Words.split(' '))
  const defaultPlaceholder = t('Type your recovery phrase')
  const [customPlaceholder, setCustomPlaceholder] = useState(defaultPlaceholder)
  const tagifyRef = useRef<Tagify<TagData> | undefined>()

  // Alephium's node code uses 12 as the minimal mnemomic length.
  const isPhraseLongEnough = phrase.length >= 12

  const handlePhraseChange = (event: CustomEvent<ChangeEventData<BaseTagData>>) => {
    // Split words where spaces are
    const newPhrase = event.detail.value && JSON.parse(event.detail.value)
    setPhrase(newPhrase || [])
    setCustomPlaceholder(
      newPhrase.length > 0 ? t('{{ amount }} words entered', { amount: newPhrase.length }) : defaultPlaceholder
    )
  }

  useEffect(() => {
    if (tagifyRef.current) {
      tagifyRef.current.DOM.input.setAttribute('data-placeholder', customPlaceholder)
    }
  }, [customPlaceholder])

  const handleNextButtonPress = () => {
    if (!isPhraseLongEnough) return

    try {
      setMnemonic(keyring.importMnemonicString(phrase.map((word) => word.value).join(' ')))

      onButtonNext()
    } catch (e) {
      console.error(e)
    } finally {
      setPhrase([])
    }
  }

  return (
    <FloatingPanel>
      <PanelTitle color="primary">{t('Secret recovery phrase')}</PanelTitle>
      <PanelContentContainer>
        <Section>
          <TextAreaTags
            tagifyRef={tagifyRef}
            placeholder={phrase.length.toString()}
            whitelist={allowedWords.current}
            onChange={handlePhraseChange}
          />
        </Section>
        <Paragraph secondary centered>
          {!isPhraseLongEnough
            ? t("Make sure to store the words in a secure location! They are your wallet's secret recovery phrase.")
            : t("All good? Let's continue!")}
        </Paragraph>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button role="secondary" onClick={onButtonBack}>
          {t('Cancel')}
        </Button>
        <Button onClick={handleNextButtonPress} disabled={!isPhraseLongEnough}>
          {t('Continue')}
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default ImportWordsPage
