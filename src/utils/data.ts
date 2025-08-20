// src/utils/data.ts
import type { InputData, Mapping, PipedrivePersonPayload } from '../types/pipedrive';



type Payload = {
  [key: string]: string | Array<{ value: string; primary: boolean }>;
};

/**
 * Resolves a nested key from an object using a dot-separated path, with fallback for partial key matches.
 * @param obj - The input object to search in.
 * @param path - The dot-separated path to the desired key (e.g., 'phone.home').
 * @returns The value at the specified path, or undefined if not found.
 */
export const getNestedValue = (obj: InputData, path: string): any => {
      // Try the original path first
  let value = path.split('.').reduce((current: any, key: string) => current && current[key], obj)


  // If value is undefined, try to find a matching key at any level
if (value === undefined) {
    const pathParts = path.split('.');
let currentObj: Record<string, any> | undefined = obj;
    let fallbackPath: string[] = [];

 for (const part of pathParts) {
      if (currentObj && typeof currentObj === 'object') {
        if (part in currentObj) {
          fallbackPath.push(part);
          currentObj = currentObj[part];
        } else {
          const matchingKey = Object.keys(currentObj).find((key: string) => key.startsWith(part));
          if (matchingKey) {
            fallbackPath.push(matchingKey);
            currentObj = currentObj[matchingKey];
          } else {
            console.error(`Key "${path}" not found in input data`);
            return undefined;
          }
        }
      } else {
        console.error(`Key "${path}" not found in input data`);
        return undefined;
      }
    }

    value = fallbackPath.reduce((current: any, key: string) => current && current[key], obj);
    if (value !== undefined) {
      console.warn(`Warning: Used fallback path "${fallbackPath.join('.')}" for "${path}"`);
    }
  }

  return value;
};

/**
 * Maps input data to a Pipedrive-compatible payload based on mappings.
 * @returns A payload object with mapped fields.
 */
export const mapInputDataToPipedrive = (inputData: InputData, mappings: Mapping[]): PipedrivePersonPayload => {
  const payload: Partial<PipedrivePersonPayload> = {};

  mappings.forEach(({ pipedriveKey, inputKey }: Mapping) => {
    const value = getNestedValue(inputData, inputKey);

    if (value === undefined) {
      console.warn(`Skipping mapping for "${pipedriveKey}" as "${inputKey}" is missing or invalid`);
      return;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      console.log(`Mapping "${inputKey}" to "${pipedriveKey}": ${value}`);
      if (pipedriveKey === 'email' || pipedriveKey === 'phone') {
        payload[pipedriveKey] = [{ value, primary: true }];
      } else {
        payload[pipedriveKey] = value;
      }
    }
  });

  if (!payload.name) {
    throw new Error('Payload is missing required "name" field');
  }

  console.log('Final payload:', JSON.stringify(payload, null, 2));
  return payload as PipedrivePersonPayload;
};