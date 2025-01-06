import { keyring } from '@alephium/keyring'
import { bip39Words } from '@alephium/shared'
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
import useAnalytics from '@/features/analytics/useAnalytics'

const ImportWordsPage = () => {
  const { t } = useTranslation()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { setMnemonic } = useWalletContext()
  const { sendAnalytics } = useAnalytics()

  const [phrase, setPhrase] = useState<{ value: string }[]>([])
  const allowedWords = useRef(bip39Words)
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

    sendAnalytics({ event: 'Importing wallet: Entering words: Clicked next' })

    try {
      setMnemonic(keyring.importMnemonicString(phrase.map((word) => word.value).join(' ')))

      onButtonNext()
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not import mnemonic string', isSensitive: true })
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
