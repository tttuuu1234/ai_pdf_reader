import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { nanoid } from 'nanoid'
import { db } from '../stores/db'
import { useChatStore } from '../stores/useChatStore'
import { normalizeTerm } from '../lib/normalizeTerm'
import type { Message, Thread } from '../types'

/**
 * 選択中の term に紐づくスレッドとメッセージを管理する。
 * スレッド作成は遅延実行（質問送信時のみ）。
 */
export function useThread() {
  const selectedTerm = useChatStore((s) => s.selectedTerm)
  const activeDocId = useChatStore((s) => s.activeDocId)
  const activeThreadId = useChatStore((s) => s.activeThreadId)
  const setActiveThreadId = useChatStore((s) => s.setActiveThreadId)

  const normalizedTerm = selectedTerm ? normalizeTerm(selectedTerm) : null

  // 既存スレッドの検索（未解決=undefined、該当なし=null を区別する）
  const existingThread = useLiveQuery(
    async () => {
      if (!activeDocId || !normalizedTerm) return undefined
      const t = await db.threads.where('[docId+term]').equals([activeDocId, normalizedTerm]).first()
      return t ?? null
    },
    [activeDocId, normalizedTerm],
  )

  // 既存スレッドが見つかったら activeThreadId にセット
  useEffect(() => {
    if (existingThread) {
      setActiveThreadId(existingThread.id)
    }
  }, [existingThread, setActiveThreadId])

  // アクティブスレッドのメッセージ
  const messages = useLiveQuery(
    () => {
      if (!activeThreadId) return []
      return db.messages.where('threadId').equals(activeThreadId).sortBy('at')
    },
    [activeThreadId],
  )

  /**
   * スレッドを遅延作成し、IDを返す。既存スレッドがあればそのIDを返す。
   */
  const ensureThread = async (): Promise<string> => {
    if (activeThreadId) return activeThreadId

    if (!activeDocId || !normalizedTerm) {
      throw new Error('docId or term is missing')
    }

    // 競合防止: 再度DBを確認
    const found = await db.threads
      .where('[docId+term]')
      .equals([activeDocId, normalizedTerm])
      .first()
    if (found) {
      setActiveThreadId(found.id)
      return found.id
    }

    const thread: Thread = {
      id: nanoid(),
      docId: activeDocId,
      term: normalizedTerm,
      createdAt: Date.now(),
    }
    await db.threads.add(thread)
    setActiveThreadId(thread.id)
    return thread.id
  }

  /**
   * メッセージを追加する。
   */
  const addMessage = async (threadId: string, role: Message['role'], text: string) => {
    const msg: Message = {
      id: nanoid(),
      threadId,
      role,
      text,
      at: Date.now(),
    }
    await db.messages.add(msg)
    return msg
  }

  // existingThread が undefined = liveQuery 未完了、null = 検索済み・該当なし
  const threadResolved = existingThread !== undefined

  return {
    thread: existingThread ?? null,
    /** スレッド検索が完了したかどうか。 */
    threadResolved,
    messages: messages ?? [],
    ensureThread,
    addMessage,
    normalizedTerm,
  }
}
