import * as Clipboard from 'expo-clipboard'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import Row from '~/components/Row'
import { showToast } from '~/utils/layout'

const CopyBytecodeRow = ({ bytecode }: { bytecode: string }) => {
  const { t } = useTranslation()

  const handleCopy = () => {
    Clipboard.setStringAsync(bytecode)
    showToast({ text1: t('Bytecode copied') })
  }

  return (
    <Row title={t('Bytecode')} titleColor="secondary">
      <Button iconProps={{ name: 'copy' }} onPress={handleCopy} />
    </Row>
  )
}

export default CopyBytecodeRow
