import { Modal, ModalProps, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import { CloseButton } from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'

export interface ModalWithBackdropProps extends ModalProps {
  closeModal?: () => void
  color?: string
  showCloseButton?: boolean
}

const ModalWithBackdrop = ({ children, closeModal, color, showCloseButton, ...props }: ModalWithBackdropProps) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: 'transparent' }}>
      <Modal transparent={true} animationType="none" onRequestClose={closeModal} {...props}>
        <ModalBackdrop onPress={closeModal} color={color} />
        <ModalContent>{children}</ModalContent>
        {showCloseButton && (
          <ScreenSectionHeader style={{ paddingTop: insets.top }}>
            <CloseButton onPress={closeModal} style={{ marginLeft: 'auto' }} variant="contrast" />
          </ScreenSectionHeader>
        )}
      </Modal>
    </View>
  )
}

export default ModalWithBackdrop

const ModalContent = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
`

const ModalBackdrop = styled.Pressable<{ color?: string }>`
  flex: 1;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: ${({ color }) => color || 'rgba(0, 0, 0, 0.5)'};
`

const ScreenSectionHeader = styled(ScreenSection)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`
