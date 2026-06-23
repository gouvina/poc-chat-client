export enum SenderType {
  USER = "USER",
  ASSISTANT = "ASSISTANT",
}

export type Message = {
  id: string;
  content: string;
  sender: SenderType;
};

export type CreateMessagePayload = {
  content: string;
  sender: SenderType;
};
