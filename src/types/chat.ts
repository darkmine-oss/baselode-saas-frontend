export interface ChatInstance {
  id: string;
  createdAt: string;
}

export interface ChatDataAttachment {
  type: string;
  payload: unknown;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  data?: ChatDataAttachment[];
}
