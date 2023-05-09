import { NotAllowedIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Textarea,
} from "@chakra-ui/react";
import { ChatOpenAI } from "langchain/chat_models/openai";
import {
  AIChatMessage,
  HumanChatMessage,
  SystemChatMessage,
} from "langchain/schema";
import { CreateChatCompletionRequest } from "openai";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";

import { ChatGrid, CompletionSettings } from "./Components";
import { ChatFormData } from "./types";

const defaultValues: ChatFormData = {
  systemMessage: "you are a helpful assistant",
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "user",
      content: "",
    },
  ],
  temperature: 0.2,
  max_tokens: 2086,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  n: 1,
};

export const App = () => {
  const chatGridItemRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamedAIResponse, setStreamedAIResponse] = useState("");
  const formMethods = useForm<ChatFormData>({
    defaultValues,
  });

  const { control, handleSubmit } = formMethods;
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "messages",
  });

  const chat = new ChatOpenAI({
    openAIApiKey: process.env.REACT_APP_OPENAI_API_KEY,
    streaming: true,
    callbacks: [
      {
        handleLLMNewToken(token: string) {
          setStreamedAIResponse((prev) => prev + token);
        },
      },
    ],
  });
  const controller = new AbortController();

  const onSubmit = async ({ systemMessage, ...data }: ChatFormData) => {
    setIsLoading(true);
    data.messages.unshift({ role: "system", content: systemMessage });
    const {
      model,
      messages,
      temperature,
      frequency_penalty,
      presence_penalty,
      top_p,
      max_tokens,
      n,
    } = sanitizeValues(data);
    chat.modelName = model;
    chat.frequencyPenalty = frequency_penalty ?? 0;
    chat.presencePenalty = presence_penalty ?? 0;
    chat.topP = top_p ?? 1;
    chat.maxTokens = max_tokens ?? 2086;
    chat.temperature = temperature ?? 0.2;
    append(
      {
        role: "assistant",
        content: "",
      },
      { shouldFocus: false }
    );
    await chat.call(
      messages.map(({ role, content }) => {
        if (role === "system") {
          return new SystemChatMessage(content);
        }
        if (role === "assistant") {
          return new AIChatMessage(content);
        }
        return new HumanChatMessage(content);
      }),
      {
        options: {
          signal: controller.signal,
        },
      }
    );
    // const response = await openai.createChatCompletion(sanitizeValues(data));
    setIsLoading(false);
    setStreamedAIResponse("");
  };

  const abortChat = () => {
    controller.abort();
    setIsLoading(false);
  };

  const scrollToBottom = () => {
    if (chatGridItemRef.current) {
      chatGridItemRef.current.scrollTop = chatGridItemRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [fields]);

  useEffect(() => {
    if (isLoading && streamedAIResponse.length > 0) {
      update(fields.length - 1, {
        role: fields[fields.length - 1].role,
        content: streamedAIResponse,
      });
      scrollToBottom();
    }
  }, [streamedAIResponse, isLoading, update, fields]);

  return (
    <FormProvider {...formMethods}>
      <Grid
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        templateAreas={`
          "system chat settings"
        `}
        templateColumns="25% 1fr 15%"
        h="100%"
        overflow={"hidden"}
      >
        <GridItem
          area="system"
          p={4}
          borderRight="solid 1px"
          borderColor="gray.700"
          bg="gray.700"
          _hover={{
            bg: "gray.700",
          }}
          _focusWithin={{
            bg: "gray.700",
          }}
        >
          <FormControl display="flex" flexDir="column" h="full">
            <FormLabel>System</FormLabel>

            <Textarea
              {...formMethods.register("systemMessage")}
              border="none"
              resize="none"
              h="100%"
              bg="gray.800"
              _hover={{
                bg: "gray.800",
              }}
              _focus={{
                bg: "gray.800",
              }}
            />
          </FormControl>
        </GridItem>
        <GridItem
          area="chat"
          h="100%"
          overflowY="auto"
          ref={chatGridItemRef}
          position="relative"
          bottom={0}
        >
          <ChatGrid fields={fields} remove={remove} append={append} />
          <Flex p={4}>
            <ButtonGroup>
              <Button
                type="submit"
                colorScheme="blue"
                isDisabled={isLoading}
                isLoading={isLoading}
              >
                Submit
              </Button>
              {isLoading && (
                <IconButton
                  aria-label="cancel request"
                  icon={<NotAllowedIcon />}
                  onClick={abortChat}
                  variant="ghost"
                  colorScheme="red"
                />
              )}
            </ButtonGroup>
          </Flex>
        </GridItem>
        <GridItem
          area="settings"
          p={4}
          bg="gray.900"
          borderLeft="solid 1px"
          borderColor="gray.700"
        >
          <CompletionSettings />
        </GridItem>
      </Grid>
    </FormProvider>
  );
};

function sanitizeValues({
  temperature,
  max_tokens,
  top_p,
  frequency_penalty,
  presence_penalty,
  n,
  ...rest
}: CreateChatCompletionRequest): CreateChatCompletionRequest {
  return {
    ...rest,
    temperature: parseFloat(`${temperature}`),
    max_tokens: parseInt(`${max_tokens}`, 10),
    top_p: parseFloat(`${top_p}`),
    frequency_penalty: parseFloat(`${frequency_penalty}`),
    presence_penalty: parseFloat(`${presence_penalty}`),
    n: parseInt(`${n}`, 10),
  };
}
