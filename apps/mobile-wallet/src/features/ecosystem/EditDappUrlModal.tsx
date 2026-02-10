import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import { getValidUrl } from '~/features/ecosystem/ecosystemUtils'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'

export interface EditDappUrlModalProps {
  url: string
  onUrlChange: (url: string) => void
}

const EditDappUrlModal = memo<EditDappUrlModalProps>((props) => {
  const { t } = useTranslation()

  return (
    <BottomModal2 notScrollable title={t('DApp URL')}>
      <ScreenSection verticalGap>
        <EditDappUrlModalContent {...props} />
      </ScreenSection>
    </BottomModal2>
  )
})

export default EditDappUrlModal

const EditDappUrlModalContent = ({ url, onUrlChange }: EditDappUrlModalProps) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const [newUrl, setNewUrl] = useState(url)
  const [error, setError] = useState('')

  const handleSavePress = async () => {
    const urlToLoad = getValidUrl(newUrl)

    if (urlToLoad) {
      onUrlChange(urlToLoad)
      dismissModal()
    } else {
      setError(t('Invalid URL'))
    }
  }

  const handleUrlChange = (text: string) => {
    setNewUrl(text)
    setError('')
  }

  return (
    <>
      <Input isInModal defaultValue={newUrl} onChangeText={handleUrlChange} label={t('DApp URL')} error={error} />
      <Button title={t('Load dApp')} onPress={handleSavePress} variant="highlight" />
    </>
  )
}
