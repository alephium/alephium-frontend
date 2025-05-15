import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView
} from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'styled-components/native'

import BottomModalBackdrop from '~/features/modals/BottomModalBackdrop'
import { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import BottomModalHandle from '~/features/modals/BottomModalHandle'
import BottomModalHeader from '~/features/modals/BottomModalHeader'
import { closeModal, removeModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface BottomModal2Props extends BottomModalBaseProps, Omit<BottomSheetModalProps, 'children'> {
  notScrollable?: boolean
}

const BottomModal2 = ({
  children,
  title,
  titleAlign,
  navHeight,
  modalId,
  noPadding,
  contentVerticalGap,
  notScrollable,
  ...props
}: BottomModal2Props) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const safeAreaInsets = useSafeAreaInsets()

  useEffect(() => {
    bottomSheetModalRef.current?.present()
  }, [dispatch, modalId])

  const handleClose = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, [])

  const handleDismiss = useCallback(() => {
    dispatch(closeModal({ id: modalId }))
    dispatch(removeModal({ id: modalId }))
  }, [dispatch, modalId])

  const BottomSheetComponent = notScrollable ? BottomSheetView : BottomSheetScrollView

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backdropComponent={(props: BottomSheetBackdropProps) => <BottomModalBackdrop {...props} onPress={handleClose} />}
      handleComponent={() => <BottomModalHandle style={{ backgroundColor: theme.global.complementary }} />}
      onDismiss={handleDismiss}
      topInset={safeAreaInsets.top}
      {...props}
    >
      <BottomSheetComponent
        style={{
          gap: contentVerticalGap ? VERTICAL_GAP : undefined,
          padding: noPadding ? 0 : DEFAULT_MARGIN
        }}
      >
        <BottomModalHeader title={title} height={navHeight} onClose={handleClose} titleAlign={titleAlign} />
        {children}
      </BottomSheetComponent>
    </BottomSheetModal>
  )
}

export default BottomModal2
