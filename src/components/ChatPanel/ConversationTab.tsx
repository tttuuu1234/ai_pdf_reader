import { useEffect, useRef, useState } from 'react'
import { useAiChat } from '../../hooks/useAiChat'
import { useThread } from '../../hooks/useThread'
import { useChatStore } from '../../stores/useChatStore'
import { ErrorBanner } from './ErrorBanner'
import { LoadingIndicator } from './LoadingIndicator'
import { MessageBubble } from './MessageBubble'

export function ConversationTab() {
  const selectedTerm = useChatStore((s) => s.selectedTerm)
  const { messages, ensureThread, addMessage, normalizedTerm } = useThread()
  const { sendMessage, streamingText, isLoading, error, clearError } = useAiChat({
    ensureThread,
    addMessage,
    existingMessages: messages,
  })

  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasAutoAsked = useRef<string | null>(null)

  // 新しい用語選択時に自動質問
  useEffect(() => {
    if (!normalizedTerm || !selectedTerm) return
    if (hasAutoAsked.current === normalizedTerm) return
    // 既にメッセージがある（既存スレッド）なら自動質問しない
    if (messages.length > 0) return

    hasAutoAsked.current = normalizedTerm
    const question = `「${selectedTerm}」とは何ですか？分かりやすく説明してください。`
    sendMessage(question, selectedTerm)
  }, [normalizedTerm, selectedTerm, messages.length, sendMessage])

  // メッセージ追加時にスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading || !selectedTerm) return
    setInput('')
    sendMessage(text, selectedTerm)
  }

  if (!selectedTerm) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-400">
        PDF上でテキストを選択し、「AIに質問」をクリックしてください
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* 選択中の用語 */}
      <div className="border-b border-gray-100 px-4 py-2">
        <span className="text-xs text-gray-500">選択中: </span>
        <span className="text-sm font-medium text-gray-800">{selectedTerm}</span>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {streamingText !== null && (
          <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {streamingText || <LoadingIndicator />}
          </div>
        )}
        {isLoading && streamingText === null && <LoadingIndicator />}
        <div ref={bottomRef} />
      </div>

      {error && <ErrorBanner error={error} onDismiss={clearError} />}

      {/* 入力欄 */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="追加で質問する..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-40"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  )
}
