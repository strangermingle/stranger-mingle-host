import { MessageSquare } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

type Props = {
  post: {
    id: string
    user_id: string
    message: string
    created_at: string
    is_anonymous: boolean
    user?: {
      username: string
      anonymous_alias: string
    }
  }
}

export function DiscussionPost({ post }: Props) {
  const displayName = post.is_anonymous 
    ? (post.user?.anonymous_alias || 'Anonymous Member')
    : (post.user?.username || 'Member')

  return (
    <div className="flex space-x-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 transition">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-gray-500 font-bold">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {displayName}
            </span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {post.message}
        </p>
      </div>
    </div>
  )
}
