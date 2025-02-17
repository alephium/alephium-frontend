import { ReactNode } from 'react'
import styled from 'styled-components'

interface DataListProps {
  children: ReactNode
  title?: string
}

const DataList = ({ children, title }: DataListProps) => (
  // validateChildrenType({ children, childType: DataListRow, parentName: 'DataList' })

  <DataListStyled>
    {title && <DataListTitle>{title}</DataListTitle>}
    {children}
  </DataListStyled>
)

export interface DataListRowProps {
  label: string
  children?: ReactNode
}

const DataListRow = ({ label, children }: DataListRowProps) => (
  <DataRowStyled role="row" tabIndex={0}>
    <DetailsRowLabel tabIndex={0} role="cell">
      {label}
    </DetailsRowLabel>
    <ChildrenWrapper>{children || '-'}</ChildrenWrapper>
  </DataRowStyled>
)

export default DataList

DataList.Row = DataListRow

const DataListStyled = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-2);
`

const DataListTitle = styled.h2`
  padding-top: var(--spacing-2);
`

const DataRowStyled = styled.div`
  padding: var(--spacing-3) 0;
  display: flex;
  gap: var(--spacing-3);
  align-items: center;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const DetailsRowLabel = styled.div`
  font-weight: var(--fontWeight-medium);
  width: max(100px, 35%);
  color: ${({ theme }) => theme.font.secondary};
`

const ChildrenWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`
