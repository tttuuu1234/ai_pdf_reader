import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useState } from 'react'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { db } from '../../stores/db'
import { useChatStore } from '../../stores/useChatStore'
import type { PdfDoc } from '../../types'
import { PageNavigationHeader, PageSideButton } from './PageNavigation'
import { SelectionPopup } from './SelectionPopup'
import { useTextSelection } from '../../hooks/useTextSelection'
import { useTermHighlight } from './useTermHighlight'

type Props = {
  doc: PdfDoc
}

export function PdfViewer({ doc }: Props) {
  const pdfBlob = useLiveQuery(() => db.pdfBlobs.get(doc.id), [doc.id])
  const [currentPage, setCurrentPage] = useState(doc.currentPage)
  const [zoom, setZoom] = useState(0.75)
  const { selection, containerRef, clearSelection } = useTextSelection()
  const customTextRenderer = useTermHighlight(doc.id)
  const requestedPage = useChatStore((s) => s.requestedPage)
  const setRequestedPage = useChatStore((s) => s.setRequestedPage)

  const handlePageChange = useCallback(
    async (page: number) => {
      if (page < 1 || page > doc.pageCount) return
      setCurrentPage(page)
      await db.docs.update(doc.id, { currentPage: page })
    },
    [doc.id, doc.pageCount],
  )

  // 履歴からのページ移動リクエストを処理
  useEffect(() => {
    if (requestedPage === null) return
    handlePageChange(requestedPage)
    setRequestedPage(null)
  }, [requestedPage, handlePageChange, setRequestedPage])

  if (!pdfBlob) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">PDF読み込み中...</div>
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageNavigationHeader
        currentPage={currentPage}
        pageCount={doc.pageCount}
        zoom={zoom}
        onZoomChange={setZoom}
      />
      <div className="relative flex-1 overflow-hidden">
        <div ref={containerRef} className="absolute inset-0 overflow-auto bg-gray-100 p-4">
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
                width={800 * zoom}
                customTextRenderer={customTextRenderer}
              />
            </Document>
          </div>
          {selection && (
            <SelectionPopup
              text={selection.text}
              rect={selection.rect}
              pageNumber={currentPage}
              onClose={clearSelection}
            />
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="relative" style={{ width: 800 * zoom + 80 }}>
            <PageSideButton
              direction="prev"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            />
            <PageSideButton
              direction="next"
              disabled={currentPage >= doc.pageCount}
              onClick={() => handlePageChange(currentPage + 1)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
