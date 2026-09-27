import Dexie, { type EntityTable } from 'dexie'
import type { Highlight, Message, PdfBlob, PdfDoc, Thread } from '../types'

const db = new Dexie('pdfReaderDB') as Dexie & {
  docs: EntityTable<PdfDoc, 'id'>
  pdfBlobs: EntityTable<PdfBlob, 'docId'>
  threads: EntityTable<Thread, 'id'>
  messages: EntityTable<Message, 'id'>
  highlights: EntityTable<Highlight, 'id'>
}

db.version(1).stores({
  docs: 'id, addedAt',
  pdfBlobs: 'docId',
  threads: 'id, docId, term, [docId+term]',
  messages: 'id, threadId, at',
})

// pageNumber フィールドを Thread に追加（インデックス変更なし）
db.version(2).stores({})

// highlights テーブルを追加
db.version(3).stores({
  highlights: 'id, docId, [docId+pageNumber]',
})

export { db }
