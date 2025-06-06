import { isValidRemoteHttpUrl } from '@alephium/shared'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'

export interface EditDappUrlModalProps {
  url: string
  onUrlChange: (url: string) => void
}

const EditDappUrlModal = memo<EditDappUrlModalProps & ModalBaseProp>(({ id, url, onUrlChange }) => {
  const { t } = useTranslation()
  const { dismiss } = useBottomSheetModal()

  const [newUrl, setNewUrl] = useState(url)
  const [error, setError] = useState('')

  const handleSavePress = async () => {
    const missingProtocol = !newUrl.startsWith('http://') && !newUrl.startsWith('https://')
    const urlToLoad = missingProtocol ? `https://${newUrl}` : newUrl

    if (isValidRemoteHttpUrl(urlToLoad)) {
      onUrlChange(urlToLoad)
      dismiss(id)
    } else {
      setError(t('Invalid URL'))
    }
  }

  const handleUrlChange = (text: string) => {
    setNewUrl(text)
    setError('')
  }

  return (
    <BottomModal2 notScrollable modalId={id} title={t('DApp URL')}>
      <ScreenSection verticalGap>
        <Input
          isInModal
          defaultValue={newUrl}
          onChangeText={handleUrlChange}
          label={t('DApp URL')}
          autoFocus
          error={error}
        />
        <Button title={t('Load dApp')} onPress={handleSavePress} variant="highlight" />
      </ScreenSection>
    </BottomModal2>
  )
})

export default EditDappUrlModal
