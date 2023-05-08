import { Textarea, TextareaProps } from '@chakra-ui/react';
import React, { ChangeEvent, forwardRef, KeyboardEvent, useEffect, useState } from 'react';

export const ResizableTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (props, ref) => {
    const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(
      null
    );

    const resizeTextarea = (target: HTMLTextAreaElement | null) => {
      if (target) {
        target.style.height = "inherit";
        target.style.height = `${target.scrollHeight + 10}px`;
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      props.onKeyDown?.(e);
      const target = e.target as HTMLTextAreaElement;
      resizeTextarea(target);
    };

    const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
      props.onInput?.(e);
      const target = e.target as HTMLTextAreaElement;
      resizeTextarea(target);
    };

    useEffect(() => {
      resizeTextarea(textareaRef);
    }, [textareaRef]);

    return (
      <Textarea
        {...props}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        overflow="hidden"
        ref={(instance) => {
          setTextareaRef(instance);
          if (typeof ref === "function") {
            ref(instance);
          } else if (ref) {
            ref.current = instance;
          }
        }}
        _focus={{
          bg: "gray.800",
        }}
        _hover={{
          bg: "gray.800",
        }}
      />
    );
  }
);
