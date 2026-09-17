import { Conversation } from "./conversation";

export enum SenderType {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
}

export type Message = {
  id: string
  content: string
  sender: SenderType
  createdAt: string
  updatedAt: string
};

export type CreateMessagePayload = {
  content: string
  sender: SenderType
};

export type SendMessageResponse = {
  conversation: Conversation
} & Message
