import { useChatStore } from '../../stores/useChatStore'
import { db } from '../../stores/db'
import type { HighlightColor } from '../../types'

const MARKER_COLORS: { color: HighlightColor; bg: string; ring: string }[] = [
  { color: 'yellow', bg: 'bg-yellow-400', ring: 'ring-yellow-500' },
  { color: 'red', bg: 'bg-red-400', ring: 'ring-red-500' },
  { color: 'blue', bg: 'bg-blue-400', ring: 'ring-blue-500' },
  { color: 'green', bg: 'bg-green-400', ring: 'ring-green-500' },
  { color: 'orange', bg: 'bg-orange-400', ring: 'ring-orange-500' },
]

type Props = {
  text: string
  rect: { top: number; left: number }
  pageNumber: number
  docId: string
  onClose: () => void
}

export function SelectionPopup({ text, rect, pageNumber, docId, onClose }: Props) {
  const selectTerm = useChatStore((s) => s.selectTerm)

  const handleAsk = () => {
    selectTerm(text, pageNumber)
    onClose()
  }

  const handleHighlight = async (color: HighlightColor) => {
    await db.highlights.add({
      id: crypto.randomUUID(),
      docId,
      pageNumber,
      text,
      color,
      createdAt: Date.now(),
    })
    onClose()
  }

  return (
    <div
      data-selection-popup
      className="absolute z-50 -translate-x-1/2"
      style={{ top: rect.top, left: rect.left }}
    >
      <div className="flex items-center gap-1 rounded-full bg-gray-800 px-2 py-1.5 shadow-lg">
        <button
          onClick={handleAsk}
          title="AIに質問"
          className="rounded-full p-1.5 text-white hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            <path d="M12 7v2m0 4h.01" />
          </svg>
        </button>
        <div className="mx-0.5 h-5 w-px bg-gray-600" />
        {MARKER_COLORS.map(({ color, bg, ring }) => (
          <button
            key={color}
            onClick={() => handleHighlight(color)}
            title={`${color}マーカー`}
            className={`h-5 w-5 rounded-full ${bg} ring-1 ${ring} transition-transform hover:scale-125`}
          />
        ))}
      </div>
    </div>
  )
}
