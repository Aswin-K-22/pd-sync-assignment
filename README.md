# Pipedrive Data Synchronization Assignment

## Overview
This project implements a TypeScript-based solution to synchronize person data with Pipedrive using the provided `inputData.json` and `mappings.json`. The `syncPdPerson` function checks if a person exists in Pipedrive by name, updates them if found, or creates a new person if not. The code is modular, type-safe, and includes robust error handling for API interactions and edge cases.

## Edge Cases and Handling

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

   