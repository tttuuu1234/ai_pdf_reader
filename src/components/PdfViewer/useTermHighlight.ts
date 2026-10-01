import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useMemo, useState } from 'react'
import type { TextContent, TextItem } from 'react-pdf'
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

function isTextItem(item: unknown): item is TextItem {
  return item != null && typeof item === 'object' && 'str' in item
}

/**
 * 質問済み用語に点線下線を付け、マーカーに背景色を付ける customTextRenderer を返す。
 *
 * onGetTextSuccess を Page に渡すことでページの全 TextItem を取得し、
 * ハイライトテキストと連続一致する TextItem だけをマーキングする。
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

  // ページの全 TextItem を保持する。
  const [textItems, setTextItems] = useState<TextItem[]>([])

  /** Page の onGetTextSuccess に渡すコールバック。 */
  const onGetTextSuccess = useCallback((textContent: TextContent) => {
    const items = textContent.items.filter(isTextItem)
    setTextItems(items)
  }, [])

  // ハイライト対象の itemIndex → 色 のマップを事前計算する。
  // ページ全体のテキストを結合し、ハイライトテキストの出現位置から
  // 対応する TextItem を特定する。
  const highlightedItems = useMemo(() => {
    const map = new Map<number, HighlightColor>()
    if (textItems.length === 0 || highlightList.length === 0) return map

    // 各 TextItem の開始オフセットを計算
    const offsets: number[] = []
    let offset = 0
    for (const item of textItems) {
      offsets.push(offset)
      offset += item.str.length
    }
    const fullText = textItems.map((t) => t.str).join('')

    for (const h of highlightList) {
      // 選択テキストの改行を除去してページテキスト内で検索
      const searchText = h.text.replace(/\n/g, '')
      if (searchText.length === 0) continue

      const pos = fullText.indexOf(searchText)
      if (pos === -1) continue

      const end = pos + searchText.length
      for (let i = 0; i < textItems.length; i++) {
        const itemStart = offsets[i]
        const itemEnd = itemStart + textItems[i].str.length
        // TextItem がハイライト範囲と重なるかどうか
        if (itemEnd > pos && itemStart < end && textItems[i].str.trim().length > 0) {
          if (!map.has(i)) {
            map.set(i, h.color)
          }
        }
      }
    }

    return map
  }, [textItems, highlightList])

  const customTextRenderer = useCallback(
    (textItem: TextItem & { itemIndex: number }) => {
      let str = escapeHtml(textItem.str)
      if (terms.length === 0 && highlightedItems.size === 0) return str

      // 用語の点線下線（部分一致）
      if (terms.length > 0) {
        const sorted = [...terms].sort((a, b) => b.length - a.length)
        const pattern = sorted.map(escapeRegex).join('|')
        const regex = new RegExp(`(${pattern})`, 'gi')
        str = str.replace(regex, (match) => {
          return `<span style="border-bottom: 2px dotted #3b82f6; cursor: pointer">${match}</span>`
        })
      }

      // マーカー背景色（itemIndex で特定した TextItem 全体に適用）
      const color = highlightedItems.get(textItem.itemIndex)
      if (color) {
        str = `<span style="background-color: ${HIGHLIGHT_BG[color]}">${str}</span>`
      }

      return str
    },
    [terms, highlightedItems],
  )

  return { customTextRenderer, onGetTextSuccess }
}
