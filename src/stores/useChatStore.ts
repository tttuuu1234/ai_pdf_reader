import { create } from 'zustand'

export type PanelSize = '1/2' | '1/3' | '1/4'
export type PanelTab = 'conversation' | 'history' | 'highlights'

type ChatStore = {
  /** チャットパネルが開いているかどうか。 */
  isPanelOpen: boolean
  /** パネルの幅（画面に対する比率）。 */
  panelSize: PanelSize
  /** パネルのアクティブタブ。 */
  panelTab: PanelTab
  /** 現在選択中の用語（正規化前の生テキスト）。 */
  selectedTerm: string | null
  /** 用語を選択したページ番号。 */
  selectedTermPage: number | null
  /** アクティブなスレッドID。 */
  activeThreadId: string | null
  /** 現在開いているドキュメントID。 */
  activeDocId: string | null
  /** 履歴からのページ移動リクエスト。 */
  requestedPage: number | null

  openPanel: () => void
  closePanel: () => void
  setPanelSize: (size: PanelSize) => void
  setPanelTab: (tab: PanelTab) => void
  /** 履歴タブでパネルを開く。 */
  openHistory: () => void
  /** マーカータブでパネルを開く。 */
  openHighlights: () => void
  /** 用語を選択してパネルを開く。 */
  selectTerm: (term: string, pageNumber?: number) => void
  setActiveThreadId: (id: string | null) => void
  setActiveDocId: (id: string | null) => void
  /** 指定ページへの移動をリクエストする。 */
  setRequestedPage: (page: number | null) => void
  /** パネルを閉じて選択状態をリセットする。 */
  reset: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  isPanelOpen: false,
  panelSize: '1/2',
  panelTab: 'conversation',
  selectedTerm: null,
  selectedTermPage: null,
  activeThreadId: null,
  activeDocId: null,
  requestedPage: null,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  setPanelSize: (size) => set({ panelSize: size }),
  setPanelTab: (tab) => set({ panelTab: tab }),
  openHistory: () => set({ isPanelOpen: true, panelTab: 'history' }),
  openHighlights: () => set({ isPanelOpen: true, panelTab: 'highlights' }),
  selectTerm: (term, pageNumber) => set({ selectedTerm: term, selectedTermPage: pageNumber ?? null, isPanelOpen: true, panelTab: 'conversation', activeThreadId: null }),
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  setActiveDocId: (id) => set({ activeDocId: id }),
  setRequestedPage: (page) => set({ requestedPage: page }),
  reset: () => set({ isPanelOpen: false, selectedTerm: null, selectedTermPage: null, activeThreadId: null, requestedPage: null }),
}))
