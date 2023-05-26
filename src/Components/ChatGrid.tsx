import { MinusIcon, NotAllowedIcon, PlusSquareIcon, RepeatClockIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Select,
  VisuallyHidden,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef } from 'react';
import { Controller, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove, useFormContext } from 'react-hook-form';

import { ChatFormData } from '../types';
import { MessageArea } from './MessageArea';

export interface ChatGridProps {
  fields: FieldArrayWithId<ChatFormData, "messages", "id">[];
  remove: UseFieldArrayRemove;
  append: UseFieldArrayAppend<ChatFormData, "messages">;
  isLoading: boolean;
  abortChat: () => void;
}

export const ChatGrid = ({
  fields,
  isLoading,
  abortChat,
  remove,
  append,
}: ChatGridProps) => {
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const { control } = useFormContext<ChatFormData>();
  const removeChildMessages = useCallback(
    (index: number) => {
      const indicesToRemove = Array.from(
        { length: fields.length - index - 1 },
        (_, i) => i + index + 1
      );
      remove(indicesToRemove);
    },
    [fields, remove]
  );
  useEffect(() => {
    if (isLoading && chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current?.scrollHeight;
    }
  }, [isLoading, fields]);
  return (
    <>
      <Box w="full" h="calc(100vh - 136px)" overflowY="auto" ref={chatAreaRef}>
        <VStack spacing={0} position="sticky" bottom={0}>
          {fields.map((field, index) => (
            <Grid
              templateAreas={`
      "role message actions"
    `}
              templateColumns="15% 75% 10%"
              key={field.id}
              w="full"
              py={4}
              borderBottom="solid 1px"
              borderBottomColor="gray.700"
              _hover={{
                bg: "gray.700",
              }}
              _focusWithin={{
                bg: "gray.700",
              }}
            >
              <Box gridArea="role" alignItems="start" display="flex" px={4}>
                <FormControl>
                  <VisuallyHidden>
                    <FormLabel>Role</FormLabel>
                  </VisuallyHidden>
                  <Controller
                    control={control}
                    name={`messages.${index}.role`}
                    render={({ field }) => (
                      <Select
                        {...field}
                        border="none"
                        w="fit-content"
                        bg="gray.800"
                      >
                        <option value="user">User</option>
                        <option value="assistant">Assistant</option>
                      </Select>
                    )}
                  />
                </FormControl>
              </Box>
              <GridItem area="message" alignItems="center">
                <MessageArea field={field} index={index} />
              </GridItem>
              <Box gridArea="actions" alignItems="start" display="flex">
                <ButtonGroup variant="ghost" size="xs">
                  <IconButton
                    onClick={() => remove(index)}
                    aria-label="remove"
                    icon={<MinusIcon />}
                  />
                  <IconButton
                    onClick={() => removeChildMessages(index)}
                    aria-label="remove child messages"
                    icon={<RepeatClockIcon />}
                  />
                </ButtonGroup>
              </Box>
            </Grid>
          ))}
        </VStack>
      </Box>
      <Box
        w="full"
        position="sticky"
        bottom={0}
        bg="gray.800"
        boxShadow="0px -4px 4px rgba(0, 0, 0, 0.25)"
      >
        <Button
          borderRadius={0}
          py={8}
          justifyContent="start"
          variant="ghost"
          w="full"
          onClick={() => append({ role: "user", content: "" })}
          leftIcon={<PlusSquareIcon />}
        >
          Add Message
        </Button>
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
      </Box>
    </>
  );
};
