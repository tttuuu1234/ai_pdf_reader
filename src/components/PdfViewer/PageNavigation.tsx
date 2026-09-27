import { TableOfContents, type OutlineItem } from './TableOfContents'

type HeaderProps = {
  currentPage: number
  pageCount: number
  zoom: number
  onZoomChange: (zoom: number) => void
  outline: OutlineItem[]
  onPageChange: (page: number) => void
}

const ZOOM_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export function PageNavigationHeader({ currentPage, pageCount, zoom, onZoomChange, outline, onPageChange }: HeaderProps) {
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
      <div className="flex items-center gap-2">
        <TableOfContents outline={outline} onPageChange={onPageChange} />
        <span className="text-sm text-gray-700">
          {currentPage} / {pageCount}
        </span>
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

type SideButtonProps = {
  direction: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
}

export function PageSideButton({ direction, disabled, onClick }: SideButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="pointer-events-auto absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-600 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-gray-900 disabled:pointer-events-none disabled:opacity-0"
      style={{ [direction === 'prev' ? 'left' : 'right']: '0px' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
        {direction === 'prev' ? (
          <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
        ) : (
          <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 1 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        )}
      </svg>
    </button>
  )
}
