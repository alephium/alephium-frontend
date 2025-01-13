import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import ReceiveQRCodeSection from '~/features/receive/ReceiveQRCodeSection'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'

interface ScreenProps extends StackScreenProps<ReceiveNavigationParamList, 'QRCodeScreen'>, ScrollScreenProps {}

const QRCodeScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const { screenScrollHandler, screenScrollY } = useHeaderContext()
  const { t } = useTranslation()

  useScrollToTopOnFocus(screenScrollY)

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop
      onScroll={screenScrollHandler}
      screenTitle={t('Receive assets')}
      screenIntro={t('Scan the QR code to send funds to this address.')}
      bottomButtonsRender={() => (
        <Button title={t('Done')} variant="highlight" onPress={() => navigation.getParent()?.goBack()} />
      )}
      {...props}
    >
      <ReceiveQRCodeSection addressHash={params.addressHash} />
    </ScrollScreen>
  )
}

export default QRCodeScreen
