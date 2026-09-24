import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { db } from '../../stores/db'
import { useChatStore, type PanelSize } from '../../stores/useChatStore'

const panelWidthMap: Record<PanelSize, string> = {
  '1/2': '50vw',
  '1/3': '33.33vw',
  '1/4': '25vw',
}
import { ChatPanel } from '../ChatPanel/ChatPanel'
import { PdfViewer } from '../PdfViewer/PdfViewer'

export function ReaderPage() {
  const { docId } = useParams<{ docId: string }>()
  const doc = useLiveQuery(() => (docId ? db.docs.get(docId) : undefined), [docId])
  const isPanelOpen = useChatStore((s) => s.isPanelOpen)
  const panelSize = useChatStore((s) => s.panelSize)
  const setActiveDocId = useChatStore((s) => s.setActiveDocId)
  const reset = useChatStore((s) => s.reset)
  const panelWidth = panelWidthMap[panelSize]

  useEffect(() => {
    if (docId) setActiveDocId(docId)
    return () => reset()
  }, [docId, setActiveDocId, reset])

  // Escape キーでパネルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        useChatStore.getState().closePanel()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPanelOpen])

  if (doc === undefined) {
    return <div className="flex h-screen items-center justify-center text-gray-400">読み込み中...</div>
  }

  if (doc === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p>ドキュメントが見つかりません</p>
        <Link to="/" className="text-gray-600 hover:underline">本棚に戻る</Link>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* ヘッダー + PDF */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              ← 本棚
            </Link>
            <span className="truncate text-sm font-medium text-gray-800">{doc.name}</span>
          </div>
          <button
            onClick={() => useChatStore.getState().openHistory()}
            title="履歴一覧"
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </button>
        </header>
        <PdfViewer doc={doc} />
      </div>

      {/* チャットパネル */}
      <div
        className="shrink-0 overflow-hidden border-l border-gray-200 transition-[width] duration-300 ease-in-out"
        style={{ width: isPanelOpen ? panelWidth : '0px', borderLeftWidth: isPanelOpen ? undefined : '0px' }}
      >
        {isPanelOpen && <ChatPanel />}
      </div>
    </div>
  )
}
