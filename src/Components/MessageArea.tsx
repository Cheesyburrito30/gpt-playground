import { CopyIcon } from '@chakra-ui/icons';
import {
  Box,
  Code,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Link,
  ListItem,
  OrderedList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
  useClipboard,
  VisuallyHidden,
} from '@chakra-ui/react';
import { debounce } from 'lodash';
import { memo, useCallback } from 'react';
import { FieldArrayWithId, useFormContext } from 'react-hook-form';
import { CodeComponent } from 'react-markdown/lib/ast-to-react';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

import { ChatFormData } from '../types';
import { ResizableTextarea } from './ResizeableTextarea';

export interface MessageAreaProps {
  field: FieldArrayWithId<ChatFormData, "messages", "id">;
  index: number;
}

export const MessageArea = memo(({ field, index }: MessageAreaProps) => {
  const { register, setValue } = useFormContext<ChatFormData>();
  const debouncedOnChange = useCallback(
    debounce((value: string) => {
      setValue(`messages.${index}.content`, value);
    }, 300),
    [setValue, index]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    debouncedOnChange(event.target.value);
  };

  if (field.role === "assistant") {
    return (
      <Box px={4}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <Heading as="h1" size="2xl" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <Heading as="h2" size="xl" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <Heading as="h3" size="lg" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <Heading as="h4" size="md" {...props} />
            ),
            h5: ({ node, ...props }) => (
              <Heading as="h5" size="sm" {...props} />
            ),
            h6: ({ node, ...props }) => (
              <Heading as="h6" size="xs" {...props} />
            ),
            p: ({ node, ...props }) => <Text {...props} />,
            a: ({ node, ...props }) => <Link {...props} />,
            img: ({ node, ...props }) => <Image {...props} />,
            table: ({ node, ...props }) => (
              <Table {...props} bg="gray.900" my={4} />
            ),
            thead: ({ node, ...props }) => <Thead {...props} />,
            tbody: ({ node, ...props }) => <Tbody {...props} />,
            tr: ({ node, ...props }) => <Tr {...props} />,
            th: ({ node, ...props }) => <Th {...props} />,
            td: ({ node, ...props }) => <Td {...props} />,
            ol: ({ node, ...props }) => <OrderedList {...props} start={1} />,
            ul: ({ node, ...props }) => <UnorderedList {...props} />,
            li: ({ node, ...props }) => <ListItem {...props} />,
            code: CodeBox,
          }}
        >
          {field.content}
        </ReactMarkdown>
      </Box>
    );
  }

  return (
    <FormControl>
      <VisuallyHidden>
        <FormLabel>Message</FormLabel>
      </VisuallyHidden>
      <ResizableTextarea
        {...register(`messages.${index}.content`)}
        onChange={handleInputChange}
        placeholder="Message"
        border="none"
        resize="none"
      />
    </FormControl>
  );
});

const CodeBox: CodeComponent = memo(
  ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const { onCopy } = useClipboard(String(children));
    return !inline && match ? (
      <Box position="relative">
        <IconButton
          aria-label="Copy code"
          position="absolute"
          top={3}
          right={3}
          onClick={onCopy}
          icon={<CopyIcon />}
          size="sm"
        />
        <SyntaxHighlighter
          {...props}
          showLineNumbers
          children={String(children).replace(/\n$/, "")}
          style={coldarkDark}
          language={match[1]}
          PreTag="div"
        />
      </Box>
    ) : (
      <Code
        {...props}
        className={className}
        colorScheme="orange"
        maxW="full"
        overflowX="auto"
        mb={-1.5}
      >
        {children}
      </Code>
    );
  }
);
