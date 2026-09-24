import { Link } from 'react-router-dom'
import type { PdfDoc } from '../../types'

type Props = {
  doc: PdfDoc
}

export function PdfCard({ doc }: Props) {
  const progress = doc.pageCount > 0 ? Math.round((doc.currentPage / doc.pageCount) * 100) : 0
  const isComplete = doc.currentPage >= doc.pageCount

  return (
    <Link
      to={`/read/${doc.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* 表紙プレースホルダー */}
      <div className="flex h-40 items-center justify-center rounded bg-gray-100 text-4xl text-gray-400">
        PDF
      </div>

      <h3 className="mt-3 truncate text-sm font-medium text-gray-900" title={doc.name}>
        {doc.name}
      </h3>

      <div className="mt-2 text-xs text-gray-500">
        {doc.currentPage} / {doc.pageCount} ページ
        {isComplete && <span className="ml-2 text-green-600">完了</span>}
      </div>

      {/* 進捗バー */}
      <div className="mt-1.5 h-1.5 rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </Link>
  )
}
