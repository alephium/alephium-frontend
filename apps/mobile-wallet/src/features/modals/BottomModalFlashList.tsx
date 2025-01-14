import { ContentStyle } from '@shopify/flash-list'
import { ReactNode } from 'react'

import BottomModalBase, { BottomModalBaseProps } from '~/features/modals/BottomModalBase'
import { ContentScrollHandlers, useBottomModalState } from '~/features/modals/useBottomModalState'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface BottomModalFlashListProps extends Omit<BottomModalBaseProps, 'children'> {
  flashListRender: (flashListProps: {
    contentContainerStyle: ContentStyle
    onScroll: ContentScrollHandlers['onScroll']
    onScrollBeginDrag: ContentScrollHandlers['onScrollBeginDrag']
    onScrollEndDrag: ContentScrollHandlers['onScrollEndDrag']
    onContentSizeChange: (w: number, h: number) => void
  }) => ReactNode
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
        ...modalState.contentScrollHandlers,
        onContentSizeChange: modalState.handleContentSizeChange,
        contentContainerStyle: {
          padding: noPadding ? 0 : DEFAULT_MARGIN
        }
      })}
    </BottomModalBase>
  )
}

export default BottomModalFlashList
