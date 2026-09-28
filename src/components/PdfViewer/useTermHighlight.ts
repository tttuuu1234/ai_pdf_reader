import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import type { TextItem } from 'react-pdf'
import { db } from '../../stores/db'
import { escapeHtml } from '../../lib/escapeHtml'
import { escapeRegex } from '../../lib/escapeRegex'
import type { HighlightColor } from '../../types'

/** マーカー色 → CSS background-color の対応。 */
const HIGHLIGHT_BG: Record<HighlightColor, string> = {
  yellow: 'rgba(250, 204, 21, 0.4)',
  red: 'rgba(248, 113, 113, 0.4)',
  blue: 'rgba(96, 165, 250, 0.4)',
  green: 'rgba(74, 222, 128, 0.4)',
  orange: 'rgba(251, 146, 60, 0.4)',
}

/**
 * 質問済み用語に点線下線を付け、マーカーに背景色を付ける customTextRenderer を返す。
 */
export function useTermHighlight(docId: string, pageNumber: number) {
  const threads = useLiveQuery(
    () => db.threads.where('docId').equals(docId).toArray(),
    [docId],
  )

  const highlights = useLiveQuery(
    () => db.highlights.where('[docId+pageNumber]').equals([docId, pageNumber]).toArray(),
    [docId, pageNumber],
  )

  const terms = threads?.map((t) => t.term) ?? []
  const highlightList = highlights ?? []

  return useCallback(
    (textItem: TextItem) => {
      let str = escapeHtml(textItem.str)
      if (terms.length === 0 && highlightList.length === 0) return str

      // マーカーテキストをパターンマップに追加（複数行は行ごとに分割）
      const highlightMap = new Map<string, HighlightColor>()
      for (const h of highlightList) {
        const lines = h.text.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 0)
        for (const line of lines) {
          if (!highlightMap.has(line)) {
            highlightMap.set(line, h.color)
          }
        }
      }

      // マーカーと用語を統合してパターンを作成（長い順にマッチ）
      const allTexts = new Set<string>()
      for (const t of terms) allTexts.add(t)
      for (const t of highlightMap.keys()) allTexts.add(t)

      if (allTexts.size > 0) {
        const sorted = [...allTexts].sort((a, b) => b.length - a.length)
        const pattern = sorted.map(escapeRegex).join('|')
        const regex = new RegExp(`(${pattern})`, 'gi')

        str = str.replace(regex, (match) => {
          const isTerm = terms.some((t) => t.toLowerCase() === match.toLowerCase())
          const highlightColor = highlightMap.get(match)

          const styles: string[] = []
          if (isTerm) {
            styles.push('border-bottom: 2px dotted #3b82f6', 'cursor: pointer')
          }
          if (highlightColor) {
            styles.push(`background-color: ${HIGHLIGHT_BG[highlightColor]}`)
          }

          if (styles.length === 0) return match
          return `<span style="${styles.join('; ')}">${match}</span>`
        })
      }

      return str
    },
    [terms, highlightList],
  )
}
