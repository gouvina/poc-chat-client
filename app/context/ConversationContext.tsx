"use client";

import { createContext, useContext } from "react";
import { useConversation } from "../hooks/useConversation";
import type { UseConversationResult } from "../hooks/useConversation";

const ConversationContext = createContext<UseConversationResult | null>(null);

export function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversation = useConversation();

  return (
    <ConversationContext.Provider value={conversation}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext(): UseConversationResult {
  const context = useContext(ConversationContext);

  if (!context) {
    throw new Error(
      "useConversationContext must be used within a ConversationProvider",
    );
  }

  return context;
}