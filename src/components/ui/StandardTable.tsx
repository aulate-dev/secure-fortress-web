import type { PropsWithChildren, ReactNode, TdHTMLAttributes } from 'react'

type StandardTableProps = PropsWithChildren<{
  caption?: ReactNode
}>

export const StandardTable = ({ caption, children }: StandardTableProps) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full border-collapse text-left text-sm text-slate-700">
      {caption && (
        <caption className="border-b border-slate-200 bg-white px-4 py-3 text-left text-xs font-medium text-slate-500">
          {caption}
        </caption>
      )}
      {children}
    </table>
  </div>
)

export const StandardTableHead = ({ children }: PropsWithChildren) => (
  <thead className="bg-slate-100 text-slate-700">{children}</thead>
)

export const StandardTableBody = ({ children }: PropsWithChildren) => (
  <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>
)

export const StandardTableHeaderCell = ({ children }: PropsWithChildren) => (
  <th scope="col" className="px-4 py-3 text-sm font-semibold tracking-wide text-slate-700">
    {children}
  </th>
)

type StandardTableCellProps = PropsWithChildren<
  TdHTMLAttributes<HTMLTableCellElement> & {
    muted?: boolean
  }
>

export const StandardTableCell = ({ children, className = '', muted, ...props }: StandardTableCellProps) => (
  <td className={`px-4 py-3 text-sm ${muted ? 'text-slate-500' : 'text-slate-700'} ${className}`.trim()} {...props}>
    {children}
  </td>
)
