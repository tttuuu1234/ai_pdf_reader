import { useState } from 'react'
import { useChatStore, type PanelSize } from '../../stores/useChatStore'
import { ConversationTab } from './ConversationTab'
import { HistoryTab } from './HistoryTab'

type Tab = 'conversation' | 'history'

const sizes: PanelSize[] = ['1/4', '1/3', '1/2']

export function ChatPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('conversation')
  const closePanel = useChatStore((s) => s.closePanel)
  const panelSize = useChatStore((s) => s.panelSize)
  const setPanelSize = useChatStore((s) => s.setPanelSize)

  return (
    <div className="flex h-full flex-col bg-white">
      {/* ヘッダー */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('conversation')}
            className={`rounded-md px-3 py-1 text-sm ${
              activeTab === 'conversation'
                ? 'bg-gray-200 font-medium text-gray-800'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            会話
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-md px-3 py-1 text-sm ${
              activeTab === 'history'
                ? 'bg-gray-200 font-medium text-gray-800'
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            履歴一覧
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
      {activeTab === 'conversation' ? <ConversationTab /> : <HistoryTab />}
    </div>
  )
}
