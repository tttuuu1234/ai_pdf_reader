import type { Message } from '../../types'

type Props = {
  message: Message
}

export function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-gray-200 px-3.5 py-2 text-sm text-gray-800 whitespace-pre-wrap">
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
      {message.text}
    </div>
  )
}
