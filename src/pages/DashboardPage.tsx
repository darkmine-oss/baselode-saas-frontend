import { useChat } from '../hooks/useChat';
import { AppLayout } from '../layouts/AppLayout';

export function DashboardPage() {
  const { messages, streaming, sendMessage } = useChat();

  return (
    <AppLayout messages={messages} streaming={streaming} sendMessage={sendMessage} />
  );
}
