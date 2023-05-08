import {
  FormControl,
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface ControlledSliderProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
}

export const ControlledSlider = <T extends FieldValues>({
  label,
  name,
  control,
  min,
  max,
  step,
  defaultValue,
}: ControlledSliderProps<T>) => {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <HStack>
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Slider
              {...field}
              value={field.value ?? defaultValue}
              min={min}
              max={max}
              step={step}
              focusThumbOnChange={false}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          )}
        />
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <NumberInput
              {...field}
              value={field.value ?? defaultValue}
              min={min}
              max={max}
              step={step}
              size="sm"
              maxW={40}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          )}
        />
      </HStack>
    </FormControl>
  );
};
