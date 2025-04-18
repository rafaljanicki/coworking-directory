## 2025-04-18 - Centralize API Base URL in Frontend

Prompt: Make the API base URL "https://t4nlm7q6kd.execute-api.eu-central-1.amazonaws.com/Prod/" in the frontend (client directory)

- Created `client/src/lib/config.ts` exporting `API_BASE_URL`.
- Updated `useSpaces.ts` to use `API_BASE_URL` for fetch URLs and React Query keys.
- Updated `useFilters.ts` to invalidate queries using `API_BASE_URL`.
- Updated `ReportChangesModal.tsx` to post to `${API_BASE_URL}/reports`.
- References: configuration in `client/src/lib/config.ts`.

## 2025-04-18 - Add DynamoDB tables to the template.yaml. Plan the tables based on the shared/schema.ts file.

- Added AWS::Serverless::SimpleTable resources in server/template.yaml for:
  - CoworkingSpacesTable
  - ServicesTable
  - SpaceServicesTable
  - PricingPackagesTable
  - ReportsTable
- Updated ApiFunction environment variables to reference the new DynamoDB tables.
- Tables use numeric 'id' partition key matching serial PK definitions in shared/schema.ts.
- References: AWS SAM SimpleTable documentation, shared/schema.ts.
