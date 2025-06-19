import * as Clipboard from 'expo-clipboard'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import Row from '~/components/Row'
import { showToast } from '~/utils/layout'

interface SignModalCopyEncodedTextRowProps {
  text: string
  title: string
}

const SignModalCopyEncodedTextRow = ({ text, title }: SignModalCopyEncodedTextRowProps) => {
  const { t } = useTranslation()

  const handleCopy = () => {
    Clipboard.setStringAsync(text)
    showToast({ text1: t('Copied') })
  }

  return (
    <Row title={title} titleColor="secondary">
      <Button iconProps={{ name: 'copy' }} onPress={handleCopy} />
    </Row>
  )
}

export default SignModalCopyEncodedTextRow
