import { MinusIcon, PlusSquareIcon, RepeatClockIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Select,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { useCallback } from "react";
import {
  Controller,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useFormContext,
} from "react-hook-form";

import { ChatFormData } from "../App";
import { ResizableTextarea } from "./ResizeableTextarea";

export interface ChatGridProps {
  fields: FieldArrayWithId<ChatFormData, "messages", "id">[];
  remove: UseFieldArrayRemove;
  append: UseFieldArrayAppend<ChatFormData, "messages">;
}

export const ChatGrid = ({ fields, remove, append }: ChatGridProps) => {
  const { register, control } = useFormContext<ChatFormData>();
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
  return (
    <VStack spacing={0} w="full">
      {fields.map((field, index) => (
        <Grid
          templateAreas={`
      "role message actions"
    `}
          templateColumns="15% 1fr 10%"
          key={field.id}
          w="full"
          gap={4}
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
            <FormControl>
              <VisuallyHidden>
                <FormLabel>Message</FormLabel>
              </VisuallyHidden>
              <ResizableTextarea
                {...register(`messages.${index}.content`)}
                defaultValue={field.content}
                placeholder="Message"
                border="none"
                resize="none"
              />
            </FormControl>
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
    </VStack>
  );
};
