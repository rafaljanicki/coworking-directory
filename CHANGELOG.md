## 2025-04-18 - CI/CD: Add GitHub Actions workflow for deployment

- Created `.github/workflows/deploy.yml` with jobs for building (Node 22), backend deployment via AWS SAM using OIDC role-to-assume, and frontend static site deployment to S3.
- Implemented artifact upload/download for `dist/public` between the build and deploy jobs using `actions/upload-artifact` and `actions/download-artifact` to ensure the frontend assets are available for S3 sync.
- Added `permissions.id-token: write` and `permissions.contents: read` to enable OIDC authentication.

## 2025-04-18 - Add basic API key authorization via API Gateway

- Configured the API Gateway proxy event in `server/template.yaml` to require API keys (`Auth: ApiKeyRequired: true`).
- Added an `ApiKey` CloudFormation parameter to pass a key at deploy time.
- Updated README with instructions for local and production usage of API keys (using `x-api-key` header).

## 2025-04-18 - Frontend: Support API key in requests

- Exported `API_KEY` from Vite env (`VITE_API_KEY`) in `client/src/lib/config.ts`.
- Enhanced `apiRequest` (`client/src/lib/queryClient.ts`) to include `x-api-key` header when present.
- Updated `useSpaces.ts` (`client/src/hooks/useSpaces.ts`) to attach API key header on GET requests.
- Updated README to document `VITE_API_KEY` usage for development and production builds.

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
