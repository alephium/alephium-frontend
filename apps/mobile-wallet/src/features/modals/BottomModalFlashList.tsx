import { ContentStyle } from '@shopify/flash-list'
import { ReactNode } from 'react'

import BottomModalBase, { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import { useModalContext } from '~/features/modals/ModalContext'
import { useBottomModalState } from '~/features/modals/useBottomModalState'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface BottomModalFlashListProps extends Omit<BottomModalBaseProps, 'children'> {
  flashListRender: (flashListProps: FlashListRenderProps) => ReactNode
}

export interface FlashListRenderProps {
  contentContainerStyle: ContentStyle
  onContentSizeChange: (w: number, h: number) => void
}

const BottomModalFlashList = ({
  onClose,
  maximisedContent,
  minHeight,
  navHeight = 50,
  noPadding,
  flashListRender,
  ...props
}: BottomModalFlashListProps) => {
  const { id } = useModalContext()
  const modalState = useBottomModalState({
    modalId: id,
    maximisedContent,
    minHeight,
    navHeight,
    onClose
  })

  return (
    <BottomModalBase navHeight={navHeight} {...props} {...modalState}>
      {flashListRender({
        onContentSizeChange: modalState.handleContentSizeChange,
        contentContainerStyle: {
          paddingHorizontal: noPadding ? 0 : DEFAULT_MARGIN,
          paddingBottom: noPadding ? 0 : VERTICAL_GAP
        }
      })}
    </BottomModalBase>
  )
}

export default BottomModalFlashList
