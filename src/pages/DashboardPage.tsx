import { useChat } from '../hooks/useChat';
import { AppLayout } from '../layouts/AppLayout';

export function DashboardPage() {
  const { messages, streaming, sendMessage, resetChat, savedExtents, addExtent, chatInstanceId } = useChat();

  return (
    <AppLayout
      messages={messages}
      streaming={streaming}
      sendMessage={sendMessage}
      resetChat={resetChat}
      savedExtents={savedExtents}
      addExtent={addExtent}
      chatInstanceId={chatInstanceId}
    />
  );
}
