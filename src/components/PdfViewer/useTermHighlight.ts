import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import type { TextItem } from 'react-pdf'
import { db } from '../../stores/db'
import { escapeHtml } from '../../lib/escapeHtml'
import { escapeRegex } from '../../lib/escapeRegex'

/**
 * 質問済み用語に点線下線を付ける customTextRenderer を返す。
 */
export function useTermHighlight(docId: string) {
  const threads = useLiveQuery(
    () => db.threads.where('docId').equals(docId).toArray(),
    [docId],
  )

  const terms = threads?.map((t) => t.term) ?? []

  return useCallback(
    (textItem: TextItem) => {
      const str = textItem.str
      if (terms.length === 0) return escapeHtml(str)

      // 長い用語から先にマッチさせる
      const sorted = [...terms].sort((a, b) => b.length - a.length)
      const pattern = sorted.map(escapeRegex).join('|')
      const regex = new RegExp(`(${pattern})`, 'gi')

      return escapeHtml(str).replace(regex, (match) => {
        return `<span style="border-bottom: 2px dotted #3b82f6; cursor: pointer;">${match}</span>`
      })
    },
    [terms],
  )
}
