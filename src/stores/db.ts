import Dexie, { type EntityTable } from 'dexie'
import type { Message, PdfBlob, PdfDoc, Thread } from '../types'

const db = new Dexie('pdfReaderDB') as Dexie & {
  docs: EntityTable<PdfDoc, 'id'>
  pdfBlobs: EntityTable<PdfBlob, 'docId'>
  threads: EntityTable<Thread, 'id'>
  messages: EntityTable<Message, 'id'>
}

db.version(1).stores({
  docs: 'id, addedAt',
  pdfBlobs: 'docId',
  threads: 'id, docId, term, [docId+term]',
  messages: 'id, threadId, at',
})

export { db }
