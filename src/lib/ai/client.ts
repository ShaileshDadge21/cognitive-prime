import { integrationStatus } from "@/lib/config/env";

type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type CompletionResult = {
  text: string;
};

export const aiClient = {
  isConfigured: integrationStatus.geminiConfigured,
  async complete(messages: AIMessage[]): Promise<CompletionResult> {
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
    const prompt = lastUserMessage?.content?.trim();

    if (!prompt) {
      return { text: "Share what you are working on, and I will help prioritize your next block." };
    }

    return {
      text: `Integration placeholder: Gemini response for "${prompt.slice(0, 80)}".`,
    };
  },
};

export type { AIMessage, CompletionResult };
