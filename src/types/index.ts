/** PDF ドキュメントのメタ情報。 */
export type PdfDoc = {
  id: string
  name: string
  pageCount: number
  /** 最後に開いていたページ番号（1始まり）。 */
  currentPage: number
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
