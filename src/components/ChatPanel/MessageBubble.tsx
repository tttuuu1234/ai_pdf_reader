import Markdown from 'react-markdown'
import type { Message } from '../../types'

type Props = {
  message: Message
}

export function MessageBubble({ message }: Props) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-gray-200 px-3.5 py-2 text-sm text-gray-800 whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="prose prose-sm max-w-none text-gray-700">
      <Markdown>{message.text}</Markdown>
    </div>
  )
}
