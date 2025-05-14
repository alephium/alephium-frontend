import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetView
} from '@gorhom/bottom-sheet'
import { useCallback, useEffect, useRef } from 'react'

import BottomModalBackdrop from '~/features/modals/BottomModalBackdrop'
import { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import BottomModalHeader from '~/features/modals/BottomModalHeader'
import { closeModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export type BottomModal2Props = BottomSheetModalProps & BottomModalBaseProps

const BottomModal2 = ({
  children,
  title,
  titleAlign,
  navHeight,
  modalId,
  noPadding,
  contentVerticalGap,
  ...props
}: BottomModal2Props) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleClose = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()

    dispatch(closeModal({ id: modalId }))
  }, [dispatch, modalId])

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backdropComponent={(props: BottomSheetBackdropProps) => <BottomModalBackdrop {...props} onPress={handleClose} />}
      {...props}
    >
      <BottomSheetView
        style={{
          gap: contentVerticalGap ? VERTICAL_GAP : undefined,
          padding: noPadding ? 0 : DEFAULT_MARGIN
        }}
      >
        <BottomModalHeader title={title} height={navHeight} onClose={handleClose} titleAlign={titleAlign} />
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

export default BottomModal2
