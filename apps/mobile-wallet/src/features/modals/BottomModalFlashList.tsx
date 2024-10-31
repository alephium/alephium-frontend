/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/
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
    <BottomModalBase title={title} modalId={modalId} navHeight={navHeight} {...modalState}>
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
