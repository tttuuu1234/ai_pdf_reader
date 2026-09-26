import { useChatStore } from '../../stores/useChatStore'

type Props = {
  text: string
  rect: { top: number; left: number }
  pageNumber: number
  onClose: () => void
}

export function SelectionPopup({ text, rect, pageNumber, onClose }: Props) {
  const selectTerm = useChatStore((s) => s.selectTerm)

  const handleAsk = () => {
    selectTerm(text, pageNumber)
    onClose()
  }

  return (
    <div
      data-selection-popup
      className="absolute z-50 -translate-x-1/2"
      style={{ top: rect.top, left: rect.left }}
    >
      <button
        onClick={handleAsk}
        title="AIに質問"
        className="rounded-full bg-gray-800 p-2 text-white shadow-lg hover:bg-gray-900"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          <path d="M12 7v2m0 4h.01" />
        </svg>
      </button>
    </div>
  )
}
