import { useCallback, useRef, useState } from 'react'
import type { Message } from '../types'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const MODEL = 'gemini-3.5-flash-lite'
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`

type AiChatOptions = {
  ensureThread: () => Promise<string>
  addMessage: (threadId: string, role: Message['role'], text: string) => Promise<Message>
  existingMessages: Message[]
}

export type AiError = {
  message: string
  retryable: boolean
}

/**
 * Gemini API とのチャットを管理する。SSEストリーミング対応。
 */
export function useAiChat({ ensureThread, addMessage, existingMessages }: AiChatOptions) {
  /** ストリーミング中の部分テキスト。 */
  const [streamingText, setStreamingText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<AiError | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (userText: string, term: string) => {
      setError(null)
      setIsLoading(true)
      setStreamingText('')

      try {
        const threadId = await ensureThread()
        await addMessage(threadId, 'user', userText)

        // 会話履歴を Gemini 形式に変換
        const history = existingMessages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        }))

        const systemInstruction = {
          parts: [
            {
              text: `あなたは技術書を読んでいるユーザーを助けるAIアシスタントです。ユーザーが技術書の中で「${term}」というテキストを選択して質問しています。技術的に正確で、分かりやすい日本語で回答してください。`,
            },
          ],
        }

        const body = {
          system_instruction: systemInstruction,
          contents: [
            ...history,
            { role: 'user', parts: [{ text: userText }] },
          ],
        }

        const controller = new AbortController()
        abortRef.current = controller

        const res = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        if (!res.ok) {
          const retryable = res.status === 429 || res.status >= 500
          throw { message: `API エラー (${res.status})`, retryable }
        }

        const reader = res.body?.getReader()
        if (!reader) throw { message: 'レスポンスの読み取りに失敗しました', retryable: false }

        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const jsonStr = line.slice(6)
            if (jsonStr === '[DONE]') continue

            try {
              const parsed = JSON.parse(jsonStr)
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) {
                accumulated += text
                setStreamingText(accumulated)
              }
            } catch {
              // JSON パースエラーは無視（部分的なチャンクの可能性）
            }
          }
        }

        // ストリーミング完了 → IndexedDB に保存
        if (accumulated) {
          await addMessage(threadId, 'ai', accumulated)
        }
        setStreamingText(null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setStreamingText(null)
          return
        }
        const aiError: AiError =
          err && typeof err === 'object' && 'retryable' in err
            ? (err as AiError)
            : { message: 'ネットワークエラーが発生しました', retryable: true }
        setError(aiError)
        setStreamingText(null)
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [ensureThread, addMessage, existingMessages],
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return { sendMessage, streamingText, isLoading, error, abort, clearError }
}
