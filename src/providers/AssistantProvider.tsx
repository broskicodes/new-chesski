import { OPENAI_ASSISTANT_ID } from "@/utils/types";
import { ChangeEvent, FormEvent, PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AssistantStatus, Message, useAssistant as useVercelAssistant } from 'ai/react';
import { useAuth } from "./AuthProvider/context";

export interface AssistantProviderContext {
  assistantId: string;
  threadId: string | null;  
  input: string;
  status: AssistantStatus;
  messages:  Message[];
  submitMessage: (event?: FormEvent<HTMLFormElement> | undefined, requestOptions?: {
    data?: Record<string, string> | undefined;
} | undefined) => Promise<void>;
  handleInputChange: (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  clearChat: () => void;
}

export const AssistantContext = createContext<AssistantProviderContext>({
  assistantId: OPENAI_ASSISTANT_ID,
  threadId: null,
  status: "awaiting_message",
  input: "",
  messages: [],
  submitMessage: () => {
    throw new Error("AssistantProvider not initialized");
  },
  handleInputChange: () => {
    throw new Error("AssistantProvider not initialized");
  },
  clearChat: () => {
    throw new Error("AssistantProvider not initialized");
  },
});

export const useAssistant = () => useContext(AssistantContext);

export const AssistantProvider = ({ children }: PropsWithChildren) => {
  const [assistantId] = useState(OPENAI_ASSISTANT_ID);
  const [threadId, setThreadId] = useState<string | null>(null);

  const { session, supabase } = useAuth();
  const { status, messages, input, threadId: tid, setInput, submitMessage, handleInputChange, setMessages } = useVercelAssistant({
    api: "/chat/assistant",
    body: {
      assistantId,
      tid: threadId
    },
  });

  const saveMessage = useCallback(async (message: Message) => {
    if (!session || !supabase || !message.id) {
      return;
    }

    await supabase.from("chat_messages")
      .insert({
        msg_id: message.id,
        content: message.content,
        role: message.role,
        user_id: session.id,
        thread_id: threadId,
        created_at: message.createdAt
      })
  }, [session, supabase, threadId]);
  
  const createThread = useCallback(async () => {
    const res = await fetch("/chat/assistant/thread", {
      method: "POST"
    });
    
    if (res.ok) {
      setThreadId(await res.text());
    }
  }, [])
  
  const clearChat = useCallback(async () => {
    setMessages([]);
    await createThread();

  }, [setMessages, createThread, setInput]);

  useEffect(() => {
    if (status === "awaiting_message") {
    // console.log(messages);
      messages.slice(-2).forEach((m) => {
        saveMessage(m);
      })
    }

  }, [messages, status, saveMessage]);

  useEffect(() => {
    createThread();
  }, [createThread]);

  useEffect(() => {
    if (threadId) {
      setMessages([
        {
          id: Math.random().toString().substring(32),
          role: "assistant",
          content: "Hi! I'm Chesski, here to help you improve on your chess journey. What would you like to talk about today?"
        }
      ]);
    }
  }, [threadId, setMessages])

  const value: AssistantProviderContext = useMemo(() => ({
    threadId: threadId ?? null,
    assistantId,
    input,
    messages,
    status,
    clearChat,
    handleInputChange,
    submitMessage,
  }), [threadId, assistantId, input, messages, status, submitMessage, handleInputChange, clearChat]);

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  )
}