import { FormControl, FormLabel, Select, VStack } from '@chakra-ui/react';
import { CreateChatCompletionRequest } from 'openai';
import { Controller, useFormContext } from 'react-hook-form';

import { ControlledSlider } from './ControlledSlider';

export const CompletionSettings = () => {
  const { control } = useFormContext<CreateChatCompletionRequest>();

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel>Model</FormLabel>
        <Controller
          control={control}
          name={"model"}
          render={({ field }) => (
            <Select {...field}>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
            </Select>
          )}
        />
      </FormControl>
      <ControlledSlider
        label="Temperature"
        name="temperature"
        control={control}
        min={0}
        max={2}
        step={0.1}
        defaultValue={0.7}
      />
      <ControlledSlider
        label="max_tokens"
        name="max_tokens"
        control={control}
        min={1}
        max={4096}
        step={1}
        defaultValue={265}
      />
      <ControlledSlider
        label="top_p"
        name="top_p"
        control={control}
        min={0}
        max={1}
        step={0.1}
        defaultValue={1}
      />
      <ControlledSlider
        label="presence_penalty"
        name="presence_penalty"
        control={control}
        min={-2}
        max={2}
        step={0.1}
        defaultValue={0}
      />
      <ControlledSlider
        label="frequency_penalty"
        name="frequency_penalty"
        control={control}
        min={-2}
        max={2}
        step={0.1}
        defaultValue={0}
      />
      <ControlledSlider
        label="n"
        name="n"
        control={control}
        min={1}
        max={10}
        step={1}
        defaultValue={1}
      />
    </VStack>
  );
};
