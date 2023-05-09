// api.ts
import axios from "axios";

import { ChatFormData } from "../types";

export async function addPreset({
  messages,
  ...presetData
}: ChatFormData & { name: string }): Promise<number | null> {
  try {
    const response = await axios.post(
      "http://localhost:3001/presets",
      presetData
    );
    return response.data.id;
  } catch (error) {
    console.error("Error adding preset:", error);
    return null;
  }
}

// Get all presets
export async function getAllPresets(): Promise<any[]> {
  try {
    const response = await axios.get("http://localhost:3001/presets");
    return response.data;
  } catch (error) {
    console.error("Error getting presets:", error);
    return [];
  }
}

// Get a single preset by id
export async function getPreset(id: number): Promise<any | null> {
  try {
    const response = await axios.get(`http://localhost:3001/presets/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error getting preset:", error);
    return null;
  }
}

// Update an existing preset
export async function updatePreset(
  id: number,
  presetData: ChatFormData & { name: string }
): Promise<boolean> {
  try {
    await axios.put(`http://localhost:3001/presets/${id}`, presetData);
    return true;
  } catch (error) {
    console.error("Error updating preset:", error);
    return false;
  }
}

// Delete a preset by id
export async function deletePreset(id: number): Promise<boolean> {
  try {
    await axios.delete(`http://localhost:3001/presets/${id}`);
    return true;
  } catch (error) {
    console.error("Error deleting preset:", error);
    return false;
  }
}
