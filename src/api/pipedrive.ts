// src/api/pipedrive.ts
import axios, { AxiosError } from 'axios';
import type { PipedrivePerson, PipedrivePersonPayload } from '../types/pipedrive';


const apiKey = process.env.PIPEDRIVE_API_KEY;
const companyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;
const baseUrl = `https://${companyDomain}.pipedrive.com/api/v1`;


if (!apiKey || !companyDomain) {
  throw new Error('PIPEDRIVE_API_KEY or PIPEDRIVE_COMPANY_DOMAIN is missing in .env');
}

const retryRequest = async <T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limit hit, retrying after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
};


/**
 * Searches for a person in Pipedrive by name.
 * @param name - The name to search for.
 * @returns A PipedrivePerson object if found, otherwise null.
 * @throws Error if the API request fails.
 */
export const findPersonByName = async (name: string): Promise<PipedrivePerson | null> => {
  try {
    const response = await axios.get(`${baseUrl}/persons/search`, {
      params: {
        term: name,
        fields: 'name',
        api_token: apiKey,
      },
    });

    const persons = response.data?.data?.items || [];
    if (persons.length > 1) {
      console.warn(`Multiple persons found with name "${name}". Selecting the first one.`);
    }
    return persons.length > 0 ? (persons[0].item as PipedrivePerson) : null;
  } catch (error) {
    handleApiError(error, `Failed to search for person with name: ${name}`);
    throw error;
  }
};

/**
 * Creates a new person in Pipedrive.
 * @param payload - The data payload for the new person.
 * @returns The created PipedrivePerson object.
 * @throws Error if the API request fails.
 */
export const createPerson = async (payload: PipedrivePersonPayload): Promise<PipedrivePerson> => {
  return retryRequest(async () => {
    const response = await axios.post(`${baseUrl}/persons`, payload, {
      params: { api_token: apiKey },
    });
    if (!response.data?.data) {
      throw new Error('Invalid response from Pipedrive API');
    }
    return response.data.data as PipedrivePerson;
  });
};

/**
 * Updates an existing person in Pipedrive.
 * @param id - The ID of the person to update.
 * @param payload - The data payload for updating the person.
 * @returns The updated PipedrivePerson object.
 * @throws Error if the API request fails.
 */
export const updatePerson = async (id: number, payload: PipedrivePersonPayload): Promise<PipedrivePerson> => {
  return retryRequest(async () => {
    const response = await axios.put(`${baseUrl}/persons/${id}`, payload, {
      params: { api_token: apiKey },
    });
    if (!response.data?.data) {
      throw new Error('Invalid response from Pipedrive API');
    }
    return response.data.data as PipedrivePerson;
  });
};
/**
 * Handles API errors with specific logging for Axios and general errors.
 * @param error - The error object.
 * @param context - The context message for the error.
 */
const handleApiError = (error: unknown, context: string): void => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    console.error(`${context} - Axios error: ${error.message}`);
    if (status === 401) {
      console.error('Invalid API token. Please verify PIPEDRIVE_API_KEY in .env');
    } else if (status === 429) {
      console.error('Rate limit exceeded. Consider retrying after a delay.');
    } else if (error.response) {
      console.error(`Status: ${status}, Data: ${JSON.stringify(error.response.data)}`);
    }
  } else if (error instanceof Error) {
    console.error(`${context} - General error: ${error.message}`);
  } else {
    console.error(`${context} - Unknown error:`, error);
  }
};