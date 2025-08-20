// src/index.ts
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { findPersonByName, createPerson, updatePerson } from './api/pipedrive';
import { getNestedValue, mapInputDataToPipedrive } from './utils/data';
import mappings from './mappings/mappings.json';
import inputData from './mappings/inputData.json';
import type { Mapping, PipedrivePerson } from './types/pipedrive';




/**
 * Synchronizes a person to Pipedrive by creating or updating based on name existence.
 * @returns A Promise resolving to the created or updated PipedrivePerson.
 * @throws Error if required mappings or data are missing, or if API calls fail.
 */
export const syncPdPerson = async (): Promise<PipedrivePerson> => {
  try {

    if (!mappings || !Array.isArray(mappings)) {
      throw new Error('mappings.json is invalid or not an array');
    }
    if (!inputData || typeof inputData !== 'object') {
      throw new Error('inputData.json is invalid or not an object');
    }

    if (mappings.length === 0) {
      throw new Error('#mappings.json is empty');
    }

    // Find the name mapping
   const typedMappings: Mapping[] = mappings as Mapping[];
    const nameMapping = typedMappings.find((m) => m.pipedriveKey === 'name');
    if (!nameMapping) {
      throw new Error('No mapping found for "name" in mappings.json');
    }

    // Get the name value from inputData
const name = getNestedValue(inputData, nameMapping.inputKey);
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error(`Name value is missing or invalid in inputData.json for key "${nameMapping.inputKey}"`);
    }

    // Check if person exists
    const existingPerson = await findPersonByName(name);

    // Map input data to Pipedrive payload
   const payload = mapInputDataToPipedrive(inputData, typedMappings);

    // Update or create person
  if (existingPerson) {
  
      return await updatePerson(existingPerson.id, payload);
    } else {
      
      return await createPerson(payload);
    }
  } catch (error) {
    console.error('Failed to sync person:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

// Execute the function
syncPdPerson()
  .then((person) => console.log('Person synced successfully:', person))
  .catch((error) => console.error('Error syncing person:', error));