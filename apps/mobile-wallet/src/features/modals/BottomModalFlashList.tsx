import { ContentStyle } from '@shopify/flash-list'
import { ReactNode } from 'react'

import BottomModalBase, { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
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
  modalId,
  onClose,
  title,
  titleAlign,
  maximisedContent,
  minHeight,
  navHeight = 50,
  noPadding,
  flashListRender
}: BottomModalFlashListProps) => {
  const modalState = useBottomModalState({
    modalId,
    maximisedContent,
    minHeight,
    navHeight,
    onClose
  })

  return (
    <BottomModalBase title={title} modalId={modalId} navHeight={navHeight} titleAlign={titleAlign} {...modalState}>
      {flashListRender({
        onContentSizeChange: modalState.handleContentSizeChange,
        contentContainerStyle: {
          paddingHorizontal: noPadding ? 0 : DEFAULT_MARGIN,
          paddingTop: 0,
          paddingBottom: noPadding ? 0 : VERTICAL_GAP
        }
      })}
    </BottomModalBase>
  )
}

export default BottomModalFlashList
