import { useEffect, useRef, useState } from 'react'

export type OutlineItem = {
  /** 目次項目のタイトル。 */
  title: string
  /** 対応するページ番号（1始まり）。 */
  pageNumber: number
  /** 子項目。 */
  items: OutlineItem[]
}

type Props = {
  outline: OutlineItem[]
  onPageChange: (page: number) => void
}

export function TableOfContents({ outline, onPageChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 外側クリックで閉じる
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (outline.length === 0) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
        title="目次"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h11.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4.167a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Zm0 4.166a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Zm0 4.167a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-80 w-72 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          <OutlineItems items={outline} depth={0} onSelect={(page) => { onPageChange(page); setOpen(false) }} />
        </div>
      )}
    </div>
  )
}

function OutlineItems({ items, depth, onSelect }: { items: OutlineItem[]; depth: number; onSelect: (page: number) => void }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={`${depth}-${i}`}>
          <button
            onClick={() => onSelect(item.pageNumber)}
            className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            <span className="min-w-0 truncate">{item.title}</span>
            <span className="shrink-0 text-xs text-gray-400">p.{item.pageNumber}</span>
          </button>
          {item.items.length > 0 && (
            <OutlineItems items={item.items} depth={depth + 1} onSelect={onSelect} />
          )}
        </div>
      ))}
    </>
  )
}
