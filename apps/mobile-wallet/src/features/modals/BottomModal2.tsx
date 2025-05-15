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
import { useTheme } from 'styled-components/native'

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
  const theme = useTheme()
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

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backdropComponent={(props: BottomSheetBackdropProps) => <BottomModalBackdrop {...props} onPress={handleClose} />}
      handleComponent={() => <BottomModalHandle style={{ backgroundColor: theme.global.complementary }} />}
      onDismiss={handleDismiss}
      topInset={safeAreaInsets.top}
      {...props.bottomSheetModalProps}
    >
      {isFlashList(props) && props.flashListProps ? (
        <BottomSheetFlashList
          ListHeaderComponent={
            <BottomModalHeader
              title={props.title}
              height={props.navHeight}
              onClose={handleClose}
              titleAlign={props.titleAlign}
            />
          }
          {...props.flashListProps}
          contentContainerStyle={{
            paddingHorizontal: props.noPadding ? 0 : DEFAULT_MARGIN,
            paddingBottom: props.noPadding ? 0 : VERTICAL_GAP
          }}
        />
      ) : (
        !isFlashList(props) &&
        BottomSheetComponent && (
          <BottomSheetComponent
            style={
              props.notScrollable
                ? {
                    gap: props.contentVerticalGap ? VERTICAL_GAP : undefined,
                    padding: props.noPadding ? 0 : DEFAULT_MARGIN
                  }
                : undefined
            }
            contentContainerStyle={
              props.notScrollable
                ? undefined
                : {
                    paddingHorizontal: props.noPadding ? 0 : DEFAULT_MARGIN,
                    paddingBottom: props.noPadding ? 0 : VERTICAL_GAP
                  }
            }
          >
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
