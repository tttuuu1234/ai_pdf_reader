import { useLiveQuery } from 'dexie-react-hooks'
import { useRef } from 'react'
import { pdfjs } from 'react-pdf'
import { nanoid } from 'nanoid'
import { db } from '../../stores/db'
import type { PdfDoc } from '../../types'
import { PdfCard } from './PdfCard'

export function Library() {
  const docs = useLiveQuery(() => db.docs.orderBy('addedAt').reverse().toArray())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const arrayBuffer = await file.arrayBuffer()

    // pdf.js でページ数を取得
    const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise
    const pageCount = pdf.numPages

    const doc: PdfDoc = {
      id: nanoid(),
      name: file.name.replace(/\.pdf$/i, ''),
      pageCount,
      currentPage: 1,
      addedAt: Date.now(),
    }

    await db.transaction('rw', db.docs, db.pdfBlobs, async () => {
      await db.docs.add(doc)
      await db.pdfBlobs.add({ docId: doc.id, blob: arrayBuffer })
    })

    // input をリセット（同じファイルを再選択できるように）
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">本棚</h1>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + PDFを追加
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleAddPdf}
          />
        </div>

        {docs === undefined ? (
          <div className="py-20 text-center text-gray-400">読み込み中...</div>
        ) : docs.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-lg">PDFがまだありません</p>
            <p className="mt-2 text-sm">「PDFを追加」ボタンからファイルを追加してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {docs.map((doc) => (
              <PdfCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
