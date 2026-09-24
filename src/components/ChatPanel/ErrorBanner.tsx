import type { AiError } from '../../hooks/useAiChat'

type Props = {
  error: AiError
  onDismiss: () => void
  onRetry?: () => void
}

export function ErrorBanner({ error, onDismiss, onRetry }: Props) {
  return (
    <div className="mx-3 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      <div className="flex items-start justify-between">
        <span>{error.message}</span>
        <button onClick={onDismiss} className="ml-2 text-red-400 hover:text-red-600">
          ✕
        </button>
      </div>
      {error.retryable && onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 text-xs font-medium text-red-600 hover:underline"
        >
          再試行
        </button>
      )}
    </div>
  )
}
