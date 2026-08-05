import { Message } from "./message";
import { User } from "./user";

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  user?: User;
  createdAt?: string;
};
