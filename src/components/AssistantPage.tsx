import { PageHeader } from "@/components/nav/PageHeader";
import { ChatAssistant } from "@/components/chat/ChatAssistant";

export default function AssistantPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Ask Navigator"
        description="Your AI pension assistant. Ask about UK 2026/27 tax rules, allowances, drawdown options, or how to do something in the app. Guidance only — not regulated advice."
      />
      <ChatAssistant className="min-h-[70vh]" />
    </div>
  );
}
