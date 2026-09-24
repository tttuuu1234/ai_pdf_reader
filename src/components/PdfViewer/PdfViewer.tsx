import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { db } from '../../stores/db'
import type { PdfDoc } from '../../types'
import { PageNavigation } from './PageNavigation'
import { SelectionPopup } from './SelectionPopup'
import { useTextSelection } from '../../hooks/useTextSelection'
import { useTermHighlight } from './useTermHighlight'

type Props = {
  doc: PdfDoc
}

export function PdfViewer({ doc }: Props) {
  const pdfBlob = useLiveQuery(() => db.pdfBlobs.get(doc.id), [doc.id])
  const [currentPage, setCurrentPage] = useState(doc.currentPage)
  const { selection, containerRef, clearSelection } = useTextSelection()
  const customTextRenderer = useTermHighlight(doc.id)

  const handlePageChange = useCallback(
    async (page: number) => {
      if (page < 1 || page > doc.pageCount) return
      setCurrentPage(page)
      await db.docs.update(doc.id, { currentPage: page })
    },
    [doc.id, doc.pageCount],
  )

  if (!pdfBlob) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">PDF読み込み中...</div>
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageNavigation
        currentPage={currentPage}
        pageCount={doc.pageCount}
        onPageChange={handlePageChange}
      />
      <div ref={containerRef} className="relative flex-1 overflow-auto bg-gray-100 p-4">
        <div className="mx-auto w-fit">
          <Document
            file={{ data: pdfBlob.blob }}
            loading={null}
            options={{
              cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.3.289/cmaps/',
              cMapPacked: true,
            }}
          >
            <Page
              pageNumber={currentPage}
              width={800}
              customTextRenderer={customTextRenderer}
            />
          </Document>
        </div>
        {selection && (
          <SelectionPopup
            text={selection.text}
            rect={selection.rect}
            onClose={clearSelection}
          />
        )}
      </div>
    </div>
  )
}
