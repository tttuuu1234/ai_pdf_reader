import { useChatStore, type PanelSize } from '../../stores/useChatStore'
import { ConversationTab } from './ConversationTab'
import { HighlightTab } from './HighlightTab'
import { HistoryTab } from './HistoryTab'

const sizes: PanelSize[] = ['1/4', '1/3', '1/2']

export function ChatPanel() {
  const panelTab = useChatStore((s) => s.panelTab)
  const setPanelTab = useChatStore((s) => s.setPanelTab)
  const closePanel = useChatStore((s) => s.closePanel)
  const panelSize = useChatStore((s) => s.panelSize)
  const setPanelSize = useChatStore((s) => s.setPanelSize)

  return (
    <div className="flex h-full flex-col bg-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex gap-1">
          <button
            onClick={() => setPanelTab('conversation')}
            className={`rounded-md px-3 py-1 text-sm ${
              panelTab === 'conversation'
                ? 'bg-gray-200 font-medium text-gray-800'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            会話
          </button>
          <button
            onClick={() => setPanelTab('history')}
            className={`rounded-md px-3 py-1 text-sm ${
              panelTab === 'history'
                ? 'bg-gray-200 font-medium text-gray-800'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            履歴一覧
          </button>
          <button
            onClick={() => setPanelTab('highlights')}
            className={`rounded-md px-3 py-1 text-sm ${
              panelTab === 'highlights'
                ? 'bg-gray-200 font-medium text-gray-800'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            マーカー
          </button>
        </div>
        <div className="flex items-center gap-1">
          {/* パネル幅切替 */}
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setPanelSize(size)}
              className={`rounded px-1.5 py-0.5 text-xs ${
                panelSize === size
                  ? 'bg-gray-200 font-medium text-gray-700'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
            >
              {size}
            </button>
          ))}
          <button
            onClick={closePanel}
            className="ml-1 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      {panelTab === 'conversation' && <ConversationTab />}
      {panelTab === 'history' && <HistoryTab onOpenThread={() => setPanelTab('conversation')} />}
      {panelTab === 'highlights' && <HighlightTab />}
    </div>
  )
}
