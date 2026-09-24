import { create } from 'zustand'

export type PanelSize = '1/2' | '1/3' | '1/4'

type ChatStore = {
  /** チャットパネルが開いているかどうか。 */
  isPanelOpen: boolean
  /** パネルの幅（画面に対する比率）。 */
  panelSize: PanelSize
  /** 現在選択中の用語（正規化前の生テキスト）。 */
  selectedTerm: string | null
  /** アクティブなスレッドID。 */
  activeThreadId: string | null
  /** 現在開いているドキュメントID。 */
  activeDocId: string | null

  openPanel: () => void
  closePanel: () => void
  setPanelSize: (size: PanelSize) => void
  /** 用語を選択してパネルを開く。 */
  selectTerm: (term: string) => void
  setActiveThreadId: (id: string | null) => void
  setActiveDocId: (id: string | null) => void
  /** パネルを閉じて選択状態をリセットする。 */
  reset: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  isPanelOpen: false,
  panelSize: '1/3',
  selectedTerm: null,
  activeThreadId: null,
  activeDocId: null,

  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  setPanelSize: (size) => set({ panelSize: size }),
  selectTerm: (term) => set({ selectedTerm: term, isPanelOpen: true, activeThreadId: null }),
  setActiveThreadId: (id) => set({ activeThreadId: id }),
  setActiveDocId: (id) => set({ activeDocId: id }),
  reset: () => set({ isPanelOpen: false, selectedTerm: null, activeThreadId: null }),
}))
