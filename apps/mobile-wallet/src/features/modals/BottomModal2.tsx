import {
  BottomSheetBackdropProps,
  BottomSheetFlashList,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView
} from '@gorhom/bottom-sheet'
import { BottomSheetFlashListProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/BottomSheetFlashList'
import { useCallback, useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import BottomModalBackdrop from '~/features/modals/BottomModalBackdrop'
import { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import BottomModalHandle from '~/features/modals/BottomModalHandle'
import BottomModalHeader from '~/features/modals/BottomModalHeader'
import { closeModal, removeModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export type BottomModal2Props<T> = BottomModalWithChildrenProps | BottomModalFlashListProps<T>

interface BottomModalWithChildrenProps extends BottomModalBaseProps {
  notScrollable?: boolean
  bottomSheetModalProps?: Omit<BottomSheetModalProps, 'children'>
}

interface BottomModalFlashListProps<T> extends Omit<BottomModalBaseProps, 'children'> {
  flashListProps?: BottomSheetFlashListProps<T>
  bottomSheetModalProps?: Omit<BottomSheetModalProps, 'children'>
}

const BottomModal2 = <T,>(props: BottomModal2Props<T>) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const dispatch = useAppDispatch()
  const safeAreaInsets = useSafeAreaInsets()

  useEffect(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleClose = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, [])

  const handleDismiss = useCallback(() => {
    dispatch(closeModal({ id: props.modalId }))
    dispatch(removeModal({ id: props.modalId }))
  }, [dispatch, props.modalId])

  const BottomSheetComponent = !isFlashList(props)
    ? props.notScrollable
      ? BottomSheetView
      : BottomSheetScrollView
    : undefined

  const styles = {
    paddingHorizontal: props.noPadding ? 0 : DEFAULT_MARGIN,
    paddingBottom: props.noPadding ? 0 : VERTICAL_GAP,
    gap: props.contentVerticalGap ? VERTICAL_GAP : undefined
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backdropComponent={(props: BottomSheetBackdropProps) => <BottomModalBackdrop {...props} onPress={handleClose} />}
      handleComponent={() => <BottomModalHandle />}
      onDismiss={handleDismiss}
      topInset={safeAreaInsets.top}
      name={props.modalId}
      {...props.bottomSheetModalProps}
    >
      {isFlashList(props) && props.flashListProps ? (
        <BottomSheetFlashList
          contentContainerStyle={styles}
          {...props.flashListProps}
          ListHeaderComponent={
            <>
              {/* Note: The header is kept INSIDE the sheet so that it behaves properly. Moving it outside creates issues with calculating its height. To be looked into. */}
              <BottomModalHeader
                title={props.title}
                height={props.navHeight}
                onClose={handleClose}
                titleAlign={props.titleAlign}
              />
              {typeof props.flashListProps.ListHeaderComponent === 'function' ? (
                <props.flashListProps.ListHeaderComponent />
              ) : (
                props.flashListProps.ListHeaderComponent
              )}
            </>
          }
        />
      ) : (
        !isFlashList(props) &&
        BottomSheetComponent && (
          <BottomSheetComponent
            style={props.notScrollable ? styles : undefined}
            contentContainerStyle={props.notScrollable ? undefined : styles}
            // stickyHeaderIndices={props.title ? [0] : undefined} // Could be combined with HeaderGradient
          >
            {/* Note: Same as above regarding header. */}
            <BottomModalHeader
              title={props.title}
              height={props.navHeight}
              onClose={handleClose}
              titleAlign={props.titleAlign}
            />
            {props.children}
          </BottomSheetComponent>
        )
      )}
    </BottomSheetModal>
  )
}

export default BottomModal2

const isFlashList = <T,>(
  props: BottomModalWithChildrenProps | BottomModalFlashListProps<T>
): props is BottomModalFlashListProps<T> => 'flashListProps' in props
