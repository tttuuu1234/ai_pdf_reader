import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { db } from '../../stores/db'
import { useChatStore } from '../../stores/useChatStore'
import { truncate } from '../../lib/truncate'

export function HistoryTab() {
  const activeDocId = useChatStore((s) => s.activeDocId)
  const selectTerm = useChatStore((s) => s.selectTerm)
  const [search, setSearch] = useState('')

  const threads = useLiveQuery(
    async () => {
      if (!activeDocId) return []
      const all = await db.threads.where('docId').equals(activeDocId).toArray()

      // 各スレッドのメッセージ数と最新のAI回答を取得
      const enriched = await Promise.all(
        all.map(async (t) => {
          const msgs = await db.messages.where('threadId').equals(t.id).sortBy('at')
          const lastAi = [...msgs].reverse().find((m) => m.role === 'ai')
          return {
            ...t,
            messageCount: msgs.length,
            lastAiText: lastAi?.text ?? '',
            lastAt: msgs.at(-1)?.at ?? t.createdAt,
          }
        }),
      )

      // 最新順にソート
      enriched.sort((a, b) => b.lastAt - a.lastAt)
      return enriched
    },
    [activeDocId],
  )

  const filtered = (threads ?? []).filter((t) =>
    search ? t.term.includes(search.toLowerCase()) : true,
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 検索ボックス */}
      <div className="border-b border-gray-100 p-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="用語を検索..."
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      {/* スレッド一覧 */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            {threads === undefined ? '読み込み中...' : '質問履歴がありません'}
          </div>
        ) : (
          filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTerm(t.term)}
              className="w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-gray-800">{t.term}</span>
                <span className="text-xs text-gray-400">
                  {t.messageCount}件
                </span>
              </div>
              {t.lastAiText && (
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                  {truncate(t.lastAiText, 80)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-300">
                {new Date(t.lastAt).toLocaleDateString('ja-JP')}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
