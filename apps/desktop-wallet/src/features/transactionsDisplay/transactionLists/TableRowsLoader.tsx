import SkeletonLoader from '@/components/SkeletonLoader'
import { TableRow } from '@/components/Table'

const TableRowsLoader = () =>
  Array.from({ length: 3 }).map((_, i) => (
    <TableRow key={i}>
      <SkeletonLoader height="37.5px" />
    </TableRow>
  ))

export default TableRowsLoader
