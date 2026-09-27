/** PDF ドキュメントのメタ情報。 */
export type PdfDoc = {
  id: string
  name: string
  pageCount: number
  /** 最後に開いていたページ番号（1始まり）。 */
  currentPage: number
  /** 1ページ目のサムネイル（data URL）。 */
  thumbnail?: string
  addedAt: number
}

/** PDF バイナリデータ。docs とは別テーブルに分離し liveQuery でバイナリを読み込まない。 */
export type PdfBlob = {
  docId: string
  blob: ArrayBuffer
}

/** 選択テキスト（用語）ごとの会話スレッド。 */
export type Thread = {
  id: string
  docId: string
  /** 正規化済みの選択テキスト。 */
  term: string
  /** テキストを選択したページ番号（1始まり）。 */
  pageNumber?: number
  createdAt: number
}

/** チャットメッセージ。 */
export type Message = {
  id: string
  threadId: string
  role: 'user' | 'ai'
  text: string
  at: number
}

/** マーカー（ハイライト）の色。 */
export type HighlightColor = 'red' | 'blue' | 'yellow' | 'green' | 'orange'

/** テキストマーカー（ハイライト）。 */
export type Highlight = {
  id: string
  docId: string
  pageNumber: number
  text: string
  color: HighlightColor
  createdAt: number
}
