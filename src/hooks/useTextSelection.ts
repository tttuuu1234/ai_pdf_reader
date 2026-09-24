import { useCallback, useEffect, useRef, useState } from 'react'

export type TextSelection = {
  text: string
  /** コンテナ要素に対する相対座標。 */
  rect: { top: number; left: number }
}

/**
 * コンテナ内でのテキスト選択を検知し、選択テキストと位置を返す。
 */
export function useTextSelection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<TextSelection | null>(null)

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges()
    setSelection(null)
  }, [])

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return

      // ポップアップ内のクリックは無視
      const target = e.target as HTMLElement
      if (target.closest('[data-selection-popup]')) return

      requestAnimationFrame(() => {
        const sel = window.getSelection()
        const text = sel?.toString().trim()
        if (!text || !sel || sel.rangeCount === 0) {
          setSelection(null)
          return
        }

        const range = sel.getRangeAt(0)
        const rangeRect = range.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        setSelection({
          text,
          rect: {
            top: rangeRect.bottom - containerRect.top + container.scrollTop + 4,
            left: rangeRect.left - containerRect.left + rangeRect.width / 2,
          },
        })
      })
    }

    document.addEventListener('mouseup', handleMouseUp)
    return () => document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  return { selection, containerRef, clearSelection }
}
