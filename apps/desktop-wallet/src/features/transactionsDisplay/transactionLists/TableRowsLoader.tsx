import SkeletonLoader from '@/components/SkeletonLoader'
import { TableRow } from '@/components/Table'

const TableRowsLoader = () =>
  Array.from({ length: 3 }).map((_, i) => (
    <TableRow key={i} style={{ padding: '20px 0' }}>
      <SkeletonLoader height="37.5px" />
    </TableRow>
  ))

export default TableRowsLoader
