import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetScrollableCreator
} from '@gorhom/bottom-sheet'
import { FlashList, FlashListProps } from '@shopify/flash-list'
import { useCallback, useEffect, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from 'styled-components/native'

import BottomModalBackdrop from '~/features/modals/BottomModalBackdrop'
import { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import BottomModalHandle from '~/features/modals/BottomModalHandle'
import BottomModalHeader from '~/features/modals/BottomModalHeader'
import ModalContextProvider, { useModalContext } from '~/features/modals/ModalContext'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export type BottomModal2Props<T> = BottomModalWithChildrenProps | BottomModalFlashListProps<T>

interface BottomModalWithChildrenProps extends BottomModalBaseProps {
  notScrollable?: boolean
  bottomSheetModalProps?: Omit<BottomSheetModalProps, 'children'>
}

interface BottomModalFlashListProps<T> extends Omit<BottomModalBaseProps, 'children'> {
  flashListProps?: FlashListProps<T>
  bottomSheetModalProps?: Omit<BottomSheetModalProps, 'children'>
}

const BottomModal2 = <T,>(props: BottomModal2Props<T>) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const safeAreaInsets = useSafeAreaInsets()
  const modalContext = useModalContext()
  const theme = useTheme()
  const BottomSheetScrollable = useBottomSheetScrollableCreator()

  useEffect(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleClose = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, [])

  const BottomSheetComponent = !isFlashList(props)
    ? props.notScrollable
      ? BottomSheetView
      : BottomSheetScrollView
    : undefined

  const styles = {
    paddingHorizontal: props.noPadding ? 0 : DEFAULT_MARGIN,
    paddingBottom: safeAreaInsets.bottom || VERTICAL_GAP
  }
  const stylesWithGap = { ...styles, gap: props.contentVerticalGap ? VERTICAL_GAP : undefined }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      backdropComponent={(props: BottomSheetBackdropProps) => <BottomModalBackdrop {...props} onPress={handleClose} />}
      handleComponent={() => <BottomModalHandle />}
      topInset={safeAreaInsets.top}
      name={modalContext.id}
      backgroundStyle={{ backgroundColor: theme.bg.back1 }}
      {...props.bottomSheetModalProps}
      onDismiss={modalContext.onDismiss}
    >
      {/* @gorhom/bottom-sheet renders the PortalHost in the PortalProvider which is in BottomSheetModalProvider which
      is outside of our ModalContextProvider, so the children of the modal do not have access to the modal context. To
      fix that, we wrap the children of the modal in our ModalContextProvider.
      See: https://github.com/gorhom/react-native-portal/blob/master/src/components/portalProvider/PortalProvider.tsx#L21 */}
      <ModalContextProvider {...modalContext}>
        {isFlashList(props) && props.flashListProps ? (
          <FlashList
            contentContainerStyle={styles}
            {...props.flashListProps}
            renderScrollComponent={BottomSheetScrollable}
            ListHeaderComponent={
              <>
                {/* Note: The header is kept INSIDE the sheet so that it behaves properly. Moving it outside creates issues with calculating its height. To be looked into. */}
                <BottomModalHeader
                  title={props.title}
                  height={props.navHeight}
                  onClose={handleClose}
                  titleAlign={props.titleAlign}
                  rightButton={props.titleButton}
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
              style={props.notScrollable ? stylesWithGap : undefined}
              contentContainerStyle={props.notScrollable ? undefined : stylesWithGap}
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
      </ModalContextProvider>
    </BottomSheetModal>
  )
}

export default BottomModal2

const isFlashList = <T,>(
  props: BottomModalWithChildrenProps | BottomModalFlashListProps<T>
): props is BottomModalFlashListProps<T> => 'flashListProps' in props
