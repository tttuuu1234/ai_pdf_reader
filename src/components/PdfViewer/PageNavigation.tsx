type Props = {
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function PageNavigation({ currentPage, pageCount, onPageChange }: Props) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30"
      >
        ← 前
      </button>
      <span className="text-sm text-gray-700">
        {currentPage} / {pageCount}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= pageCount}
        className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30"
      >
        次 →
      </button>
    </div>
  )
}
