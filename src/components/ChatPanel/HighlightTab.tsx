import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../stores/db'
import { useChatStore } from '../../stores/useChatStore'
import { truncate } from '../../lib/truncate'
import type { HighlightColor } from '../../types'

const colorMap: Record<HighlightColor, string> = {
  red: 'bg-red-400',
  blue: 'bg-blue-400',
  yellow: 'bg-yellow-400',
  green: 'bg-green-400',
  orange: 'bg-orange-400',
}

export function HighlightTab() {
  const activeDocId = useChatStore((s) => s.activeDocId)
  const setRequestedPage = useChatStore((s) => s.setRequestedPage)

  const highlights = useLiveQuery(
    async () => {
      if (!activeDocId) return []
      const all = await db.highlights.where('docId').equals(activeDocId).toArray()
      all.sort((a, b) => a.pageNumber - b.pageNumber || a.createdAt - b.createdAt)
      return all
    },
    [activeDocId],
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {(highlights ?? []).length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            {highlights === undefined ? '読み込み中...' : 'マーカーがありません'}
          </div>
        ) : (
          highlights!.map((h) => (
            <div
              key={h.id}
              onClick={() => setRequestedPage(h.pageNumber)}
              className="flex w-full cursor-pointer items-start gap-2 border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50"
            >
              {/* 色アイコン */}
              <span className={`mt-1 inline-block h-3 w-3 shrink-0 rounded-full ${colorMap[h.color]}`} />

              {/* テキスト + ページ番号 */}
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-800">{truncate(h.text, 60)}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-gray-300">
                    {new Date(h.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                    p.{h.pageNumber}
                  </span>
                </div>
              </div>

              {/* 削除ボタン */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  db.highlights.delete(h.id)
                }}
                className="shrink-0 rounded p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                title="削除"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
