import { FormControl, FormLabel, Grid, GridItem, Textarea } from '@chakra-ui/react';
import axios from 'axios';
import { CreateChatCompletionRequest } from 'openai';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { ChatGrid, CompletionSettings } from './Components';
import { ChatFormData } from './types';

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
  const eventSourceRef = useRef<EventSource | null>(null);
  const chatGridItemRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamedAIResponse, setStreamedAIResponse] = useState("");
  const formMethods = useForm<ChatFormData>({
    defaultValues,
  });

  const { control, handleSubmit } = formMethods;
  const { fields, append, prepend, remove, update } = useFieldArray({
    control,
    name: "messages",
  });

  const onSubmit = async ({ systemMessage, ...data }: ChatFormData) => {
    setIsLoading(true);
    data.messages.unshift({ role: "system", content: systemMessage });
    append(
      {
        role: "assistant",
        content: "",
      },
      { shouldFocus: false }
    );
    const response = await axios.post("http://localhost:3001/chat", data);
    // const response = await openai.createChatCompletion(sanitizeValues(data));
    update(fields.length, {
      role: "assistant",
      content: response.data.text,
    });
    setIsLoading(false);
    setStreamedAIResponse("");
  };

  const onStreamedSubmit = async ({ systemMessage, ...data }: ChatFormData) => {
    setIsLoading(true);
    data.messages.unshift({ role: "system", content: systemMessage });
    append(
      {
        role: "assistant",
        content: "",
      },
      { shouldFocus: false }
    );
    const sse = new EventSource("http://localhost:3001/events");
    sse.onmessage = (event) => {
      setStreamedAIResponse((prev) => prev + JSON.parse(event.data));
    };
    const response = await axios.post("http://localhost:3001/trigger", data);
    console.log("chat ended");
    sse.close();
    setStreamedAIResponse("");
    setIsLoading(false);
  };

  const abortChat = async () => {
    await axios.post("http://localhost:3001/abort");
    setStreamedAIResponse("");
    setIsLoading(false);
  };

  useEffect(() => {
    if (streamedAIResponse === "end") {
      setStreamedAIResponse("");
    } else if (isLoading && streamedAIResponse.length > 0) {
      update(fields.length - 1, {
        role: fields[fields.length - 1].role,
        content: streamedAIResponse,
      });
    }
  }, [streamedAIResponse, isLoading, update, fields]);

  return (
    <FormProvider {...formMethods}>
      <Grid
        as="form"
        onSubmit={handleSubmit(onStreamedSubmit)}
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
          ref={chatGridItemRef}
          position="relative"
          bottom={0}
        >
          <ChatGrid
            fields={fields}
            remove={remove}
            append={append}
            isLoading={isLoading}
            abortChat={abortChat}
          />
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
