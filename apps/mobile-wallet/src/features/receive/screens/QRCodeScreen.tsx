import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Button from '~/components/buttons/Button'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import ReceiveQRCodeSection from '~/features/receive/ReceiveQRCodeSection'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface ScreenProps extends StackScreenProps<ReceiveNavigationParamList, 'QRCodeScreen'>, ScrollScreenProps {}

const QRCodeScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const { screenScrollHandler, screenScrollY, parentNavigation } = useHeaderContext()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  useScrollToTopOnFocus(screenScrollY)

  return (
    <ScrollScreen
      verticalGap
      contentPaddingTop={insets.top + VERTICAL_GAP * 2} // TODO: avoid manual override (see TODO in DestinationScreen)
      onScroll={screenScrollHandler}
      screenTitle={t('Receive assets')}
      screenIntro={t('Scan the QR code to send funds to this address.')}
      bottomButtonsRender={() => (
        <Button title={t('Done')} variant="highlight" onPress={() => parentNavigation?.goBack()} />
      )}
      {...props}
    >
      <ReceiveQRCodeSection addressHash={params.addressHash} />
    </ScrollScreen>
  )
}

export default QRCodeScreen
