/**
 * 对话数据类
 */
export interface MessageItem {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

class ChatMessage {
  constructor(params: MessageItem) {}
}
