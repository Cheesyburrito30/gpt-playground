import { CreateChatCompletionRequest } from "openai";

export interface ChatFormData extends CreateChatCompletionRequest {
  systemMessage: string;
}
