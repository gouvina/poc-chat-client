import { Message } from "./message";
import { User } from "./user";

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt?: string;
  updatedAt?: string
  user?: User;
};
