type Props = {
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
  zoom: number
  onZoomChange: (zoom: number) => void
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function PageNavigation({ currentPage, pageCount, onPageChange, zoom, onZoomChange }: Props) {
  const zoomIn = () => {
    const next = ZOOM_STEPS.find((s) => s > zoom)
    if (next) onZoomChange(next)
  }

  const zoomOut = () => {
    const next = [...ZOOM_STEPS].reverse().find((s) => s < zoom)
    if (next) onZoomChange(next)
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center gap-3">
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
      <div className="flex items-center gap-1">
        <button
          onClick={zoomOut}
          disabled={zoom <= ZOOM_STEPS[0]}
          className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-12 text-center text-xs text-gray-500">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
          className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}
