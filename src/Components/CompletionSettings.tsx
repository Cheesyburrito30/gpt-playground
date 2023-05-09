import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { addPreset, deletePreset, getAllPresets, getPreset } from "../api/api";
import { ChatFormData } from "../types";
import { ControlledSlider } from "./ControlledSlider";

interface PresetOption {
  id: number;
  name: string;
}

export const CompletionSettings = () => {
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>({
    id: 0,
    name: "",
  });
  const [presetName, setPresetName] = useState<string>("");
  const [presets, setPresets] = useState<PresetOption[]>([]);
  const { control, watch, reset } = useFormContext<ChatFormData>();

  const values = watch();

  const modal = useDisclosure({
    onClose: () => {
      setPresetName("");
    },
  });
  const deleteModal = useDisclosure({
    onClose: () => {
      handlePresetChange(1);
    },
  });

  const handlePresetChange = async (id: number) => {
    const preset = await getPreset(id);
    setSelectedPreset(presets.find((p) => p.id === id) || { id: 0, name: "" });
    reset(preset);
  };

  useEffect(() => {
    const fetchPresets = async () => {
      const allPresets = await getAllPresets();
      setPresets(allPresets);
    };
    fetchPresets();
  }, []);

  return (
    <VStack spacing={4}>
      <FormControl>
        <FormLabel>Preset</FormLabel>
        <Select
          onChange={(event) => {
            handlePresetChange(Number.parseInt(event.target.value, 10));
          }}
        >
          <option>Placeholder</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </Select>
      </FormControl>
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
      <ButtonGroup>
        <Button onClick={modal.onOpen}>Save</Button>
        <Button onClick={deleteModal.onOpen}>Delete</Button>
      </ButtonGroup>
      <Modal {...modal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Preset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              value={presetName}
              onChange={(event) => {
                setPresetName(event.target.value);
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              variant="solid"
              colorScheme="blue"
              onClick={async () => {
                await addPreset({ name: presetName, ...values });
                modal.onClose();
              }}
              placeholder="preset name"
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal {...deleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Are you sure you want to delete {selectedPreset.name} preset?
          </ModalHeader>
          <ModalCloseButton />

          <ModalFooter>
            <Button
              variant="solid"
              colorScheme="red"
              onClick={async () => {
                await deletePreset(selectedPreset.id);
                deleteModal.onClose();
              }}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};
