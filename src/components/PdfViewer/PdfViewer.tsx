import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback, useEffect, useState } from 'react'
import { Document, Page } from 'react-pdf'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { db } from '../../stores/db'
import { useChatStore } from '../../stores/useChatStore'
import type { PdfDoc } from '../../types'
import { PageNavigationHeader, PageSideButton } from './PageNavigation'
import { SelectionPopup } from './SelectionPopup'
import { useTextSelection } from '../../hooks/useTextSelection'
import { useTermHighlight } from './useTermHighlight'
import type { OutlineItem } from './TableOfContents'

type Props = {
  doc: PdfDoc
}

export function PdfViewer({ doc }: Props) {
  const pdfBlob = useLiveQuery(() => db.pdfBlobs.get(doc.id), [doc.id])
  const [currentPage, setCurrentPage] = useState(doc.currentPage)
  const [zoom, setZoom] = useState(0.75)
  const { selection, containerRef, clearSelection } = useTextSelection()
  const customTextRenderer = useTermHighlight(doc.id, currentPage)
  const [outline, setOutline] = useState<OutlineItem[]>([])
  const requestedPage = useChatStore((s) => s.requestedPage)
  const setRequestedPage = useChatStore((s) => s.setRequestedPage)

  const handlePageChange = useCallback(
    async (page: number) => {
      if (page < 1 || page > doc.pageCount) return
      setCurrentPage(page)
      containerRef.current?.scrollTo(0, 0)
      await db.docs.update(doc.id, { currentPage: page })
    },
    [doc.id, doc.pageCount, containerRef],
  )

  // PDF読み込み時に目次データを取得
  const handleDocumentLoadSuccess = useCallback(async (pdf: PDFDocumentProxy) => {
    const rawOutline = await pdf.getOutline()
    if (!rawOutline) {
      setOutline([])
      return
    }

    async function resolveItems(items: typeof rawOutline): Promise<OutlineItem[]> {
      const resolved: OutlineItem[] = []
      for (const item of items!) {
        let pageNumber = 1
        try {
          if (typeof item.dest === 'string') {
            const dest = await pdf.getDestination(item.dest)
            if (dest) {
              const pageIndex = await pdf.getPageIndex(dest[0])
              pageNumber = pageIndex + 1
            }
          } else if (Array.isArray(item.dest)) {
            const pageIndex = await pdf.getPageIndex(item.dest[0])
            pageNumber = pageIndex + 1
          }
        } catch {
          // ページ解決に失敗した場合は1ページ目をデフォルトにする
        }
        const children = item.items.length > 0 ? await resolveItems(item.items) : []
        resolved.push({ title: item.title, pageNumber, items: children })
      }
      return resolved
    }

    const resolvedOutline = await resolveItems(rawOutline)
    setOutline(resolvedOutline)
  }, [])

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
        outline={outline}
        onPageChange={handlePageChange}
      />
      <div className="relative flex-1 overflow-hidden">
        <div ref={containerRef} className="absolute inset-0 overflow-auto bg-gray-100 p-4">
          <div className="mx-auto w-fit">
            <Document
              file={{ data: pdfBlob.blob }}
              loading={null}
              onLoadSuccess={handleDocumentLoadSuccess}
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
              docId={doc.id}
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
