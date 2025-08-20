# Pipedrive Data Synchronization Assignment

## Overview
This project implements a TypeScript-based solution to synchronize person data with Pipedrive, using the provided `inputData.json` and `mappings.json`. The core function, `syncPdPerson()`, reads mappings to transform input data into the Pipedrive Person payload. It first checks if a person with the mapped name exists in Pipedrive, updates that person if found, or creates a new person otherwise.

The codebase follows TypeScript best practices for type safety and maintainability. It is modular, includes robust error handling for API calls, and gracefully handles key edge cases.




   ## Project Setup and Usage

### Prerequisites
- Node.js (v16+ recommended)
- npm or pnpm package manager
- Pipedrive account with API key

### Installation Steps
1. Clone the repository:
git clone https://github.com/Aswin-K-22/pd-sync-assignment.git
cd pd-sync-assignment

2. Install dependencies:
npm install
or
pnpm install

3. Create a `.env` file in the project root with the following variables:

PIPEDRIVE_API_KEY=your_pipedrive_api_key
PIPEDRIVE_COMPANY_DOMAIN=your_pipedrive_company_domain

## Code Structure

- `src/index.ts` — Main executable file containing `syncPdPerson()` implementation.  
- `src/api/pipedrive.ts` — API interaction functions with Pipedrive.  
- `src/mappings/inputData.json` — Sample input data about a person.  
- `src/mappings/mappings.json` — Field mappings between input data and Pipedrive payload keys.  
- `src/utils/data.ts` — Utility functions (e.g., nested value extraction with fallback).  
- `src/types/pipedrive.ts` — TypeScript interfaces and types related to Pipedrive API.



## Edge Cases and Handling
The following edge cases are handled in the implementation:

1. **Empty `mappings.json`**:
   - **Description**: If `mappings.json` is empty (`[]`), no fields can be mapped to the Pipedrive API payload.
   - **Handling**: The `syncPdPerson` function checks if `mappings` is empty and throws an error: `"mappings.json is empty"`. Tested with an empty `mappings.json`, resulting in the expected error.

2. **Missing Name Mapping or Value**:
   - **Description**: If the `name` mapping is missing in `mappings.json` or its corresponding value is missing or invalid (e.g., empty string) in `inputData.json`, the function cannot proceed.
   - **Handling**: The `syncPdPerson` function validates the presence of the `name` mapping and its value, throwing specific errors (e.g., `"No mapping found for 'name' in mappings.json"` or `"Name value is missing or invalid in inputData.json for key 'fullName'"`). Tested with `fullName: ""` and missing `name` mapping, resulting in the expected errors.

3. **Incorrect Input Key in `mappings.json`**:
   - **Description**: The provided `mappings.json` includes an incorrect `inputKey` (e.g., `phone.home` instead of `phoneNumber.home`), which does not match the structure of `inputData.json`.
   - **Handling**: The `getNestedValue` function implements a fallback mechanism that searches for a matching key in `inputData.json` (e.g., using `phoneNumber.home` if `phone.home` is not found) and logs a warning (e.g., `"Used fallback path 'phoneNumber.home' instead of 'phone.home'"`). Tested with the provided `mappings.json`.

4. **Duplicate Persons in Pipedrive**:
   - **Description**: If multiple persons with the same name exist in Pipedrive, the function might select the wrong one, potentially affecting data accuracy.
   - **Handling**: The `findPersonByName` function logs a warning if multiple persons are found (e.g., `"Multiple persons found with name 'Jason'. Selecting the first one."`) and selects the first match to avoid creating duplicates. Tested with multiple 'Jason' persons in Pipedrive, resulting in the expected warning and successful update.

   



## Testing and Validation

- Manual testing was performed using the `npm run dev` command, successfully syncing persons to Pipedrive with correct payloads.  
- The console logs show mapping steps, payload construction, and API response verification.  
- Tested edge cases by modifying `mappings.json` and `inputData.json` to confirm proper error handling and fallback logic.  
- Verified handling of multiple persons with the same name in Pipedrive through logs and update confirmation.

## Author

**Aswin K**  
Email: aswinkwebdeveloper@gmail.com  
GitHub: https://github.com/Aswin-K-22

---

*Thank you for reviewing my assignment. Please feel free to reach out if you have any questions or feedback.*