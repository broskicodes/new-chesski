import { OPENAI_ASSISTANT_ID, RunStarterMsgMap, RunType } from "@/utils/types";
import { ChangeEvent, FormEvent, PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AssistantStatus, Message, useAssistant as useVercelAssistant } from 'ai/react';
import { useAuth } from "./AuthProvider/context";
import { useUserData } from "./UserDataProvider/context";
import posthog from "posthog-js";

export interface AssistantProviderContext {
  assistantId: string;
  threadId: string | null;  
  input: string;
  status: AssistantStatus;
  messages:  Message[];
  runType: RunType;
  createThread: () => Promise<void>;
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
  runType: RunType.Onboarding,
  createThread: () => {
    throw new Error("AssistantProvider not initialized");
  },
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
  const [runType, setRunType] = useState<RunType>(RunType.Onboarding);
  const [threadEmpty, setThreadEmpty] = useState(true);
  
  const { session, supabase } = useAuth();
  const { experienceText, playstyle, goals, weaknesses, hasProfile, getData } = useUserData();
  const { status, messages, input, threadId: tid, setInput, submitMessage, handleInputChange, setMessages } = useVercelAssistant({
    api: "/chat/assistant",
    body: {
      assistantId,
      tid: threadId,
      runType,
      threadEmpty,
      weaknesses,
      playstyle,
      goals,
      experience: experienceText
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
      posthog.capture("thread_created");
      setThreadId(await res.text());
    }
  }, [])
  
  const clearChat = useCallback(async () => {
    setMessages([]);
    setThreadEmpty(true);
    await createThread();

  }, [setMessages, createThread]);

  useEffect(() => {
    if (status === "awaiting_message") {
    // console.log(messages);
      messages.slice(-2).forEach((m) => {
        saveMessage(m);
      })
    }

  }, [messages, status, saveMessage]);

  useEffect(() => {
    if (messages.length > 1) {
      setThreadEmpty(false);
    }

    (async () => {
      for (const message of messages.slice().reverse()) {
        if (message.role === "data") {
          if (typeof message.data === 'object' && message.data !== null) {
            // @ts-ignore
            if (message.data["type"] === "onboarding_complete") {
              await getData();
            }

            break;
          }
        }
      }
    })();
  }, [messages, getData]);

  useEffect(() => {
    if (hasProfile) {
      setRunType(RunType.General);
    } else {
      setRunType(RunType.Onboarding)
    }
  }, [hasProfile])

  useEffect(() => {
    if (threadId !== tid) {
      setMessages([
        {
          id: Math.random().toString().substring(32),
          role: "assistant",
          content: RunStarterMsgMap[runType]
        }
      ]);
    }
  }, [threadId, tid, runType, setMessages])

  const value: AssistantProviderContext = useMemo(() => ({
    threadId: threadId ?? null,
    assistantId,
    input,
    messages,
    status,
    runType,
    createThread,
    clearChat,
    handleInputChange,
    submitMessage,
  }), [threadId, assistantId, input, messages, status, runType, createThread, submitMessage, handleInputChange, clearChat]);

  return (
    <AssistantContext.Provider value={value}>
      {children}
    </AssistantContext.Provider>
  )
}