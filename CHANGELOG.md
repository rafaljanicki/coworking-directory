import { format } from "date-fns";
import { pl } from "date-fns/locale";

## [Unreleased]

### Added
- Blog feature backend:
  - `BlogPostsTable` DynamoDB table with `id` (PK) and `slug` (GSI).
  - `BlogPost` schema added to `shared/schema.ts` **using Zod** (includes title, content, author, dates, featured image, excerpt, and SEO fields: metaTitle, metaDescription, keywords).
  - `/posts` API endpoint (`GetPostsFunction`) to list all posts.
  - `/posts/:slug` API endpoint (`GetPostBySlugFunction`) to fetch a single post by its unique slug.
  - IAM policies and API Gateway routes configured in `template.yaml`.
  - Storage layer (`server/storage.ts`, `server/mock-storage.ts`) updated with methods to interact with `BlogPostsTable` (`getPosts`, `getPostBySlug`).
  - Lambda handlers (`server/handlers/getPosts.ts`, `server/handlers/getPostBySlug.ts`) created.
- Blog feature frontend:
  - `BlogListPage` (`client/src/pages/BlogListPage.tsx`) using `react-query` to fetch and display posts.
  - `BlogPostPage` (`client/src/pages/BlogPostPage.tsx`) using `react-query` to fetch post by slug, display content (`dangerouslySetInnerHTML`), and set SEO meta tags using `react-helmet-async`.
  - `BlogPostCard` component (`client/src/components/BlogPostCard.tsx`) for the list view.
  - Routing added in `client/src/App.tsx` for `/blog` and `/blog/:slug`.
  - Navigation links added to `client/src/components/Header.tsx` (desktop and mobile).
  - Frontend API calls use `apiRequest` from `queryClient.ts`.
  - Required `@tailwindcss/typography` plugin for styling post content.

### Changed
- Consolidated `BlogPost` schema into `shared/schema.ts` (removed `shared/blogSchema.ts`) **and converted it to use Zod**.
- Removed obsolete `PricingPackage` mock data and related filtering logic from `server/mock-storage.ts`.
- **Migrated project from AWS SAM to SST (Serverless Stack Toolkit) v3.**
  - Replaced `template.yaml` and `samconfig.toml` with `sst.config.ts` for infrastructure definition and deployment.
  - Updated backend Lambda handlers in `server/` to integrate with SST, including resource binding for DynamoDB tables (e.g., `Table.Spaces.tableName`).
  - Refactored `server/storage.ts` to use AWS SDK v3 and SST table name bindings.
  - Updated `package.json` scripts to use SST commands (`npx sst dev`, `npx sst build`, `npx sst deploy`).
  - Migrated to modern SST v3 configuration style using components like `sst.aws.Dynamo`, `sst.aws.ApiGatewayV2`, and `sst.aws.StaticSite`.
  - Updated `vite` to `^6.3.5` and `@vitejs/plugin-react` to `^4.4.1`.
  - Added `sst` (version `^3.14.12`) as a dev dependency.
  - Removed obsolete files: `template.yaml`, `samconfig.toml`, `server/dev-api-key.json`.
- Updated `README.md` to reflect the new SST-based project structure, setup, development, and deployment procedures.

## [1.0.0] - 2024-05-16

### Added
- Initial project setup with Coworking Space listing and detail view.
- AWS SAM backend with Express.js (later refactored).
- React frontend with Vite, Shadcn UI, Tailwind CSS, Leaflet.
- Basic filtering for spaces.
- Report changes functionality.

### Changed
- Backend refactored from Express.js to individual Lambda handlers per endpoint.
- Added SEO improvements (meta tags, sitemap, robots.txt, JSON-LD, image optimization, React Helmet).
- UI updates (removed login/register, localized to Polish).
- Updated dependencies (`react-helmet-async`, `vite-plugin-image-optimizer` added; `@vendia/serverless-express` removed).

### Fixed
- Various bug fixes during initial development.

## 2025-04-21 - Update UI, add "Dla Właścicieli" page and private desks service

Prompt: Could you improve the logo? It's in english and it looks weird. The site's domain is biuracoworking.pl. Also, change the site's title, remove the "O nas" and "Kontakt" tabs. Also, make the filters in polish and the message of "coworking spaces found", make it in polish as well. Make the "Dla wlascicieli" page. Add a service for private desks.

- Replaced text logo with logo.png image to match biuracoworking.pl domain
- Updated site title to "Biura Coworking - Znajdź Przestrzenie Coworkingowe w Polsce"
- Removed "O nas" and "Kontakt" tabs from both desktop and mobile navigation
- Translated all UI elements to Polish:
  - Filters, buttons, labels, placeholders and sort options
  - Updated "coworking spaces found" message with proper Polish grammar
- Created comprehensive "Dla Właścicieli" page with:
  - Information about promoting coworking spaces
  - Example of promoted listing with premium features
  - Pricing packages with different tiers
  - Contact information (kontakt@biuracoworking.pl)
- Added "Private Desks" (Biurka prywatne) service:
  - Added as a filter option in frontend
  - Added to backend service list with proper ID
  - Created private desk pricing packages with premium pricing
  - Updated mock data to automatically assign service to relevant spaces
- References: client/src/components/Header.tsx, client/src/components/FiltersBar.tsx, client/src/components/SpacesList.tsx, client/src/pages/ForOwnersPage.tsx, server/mock-storage.ts

## 2025-04-21 - Refactor backend to use individual Lambda functions

Prompt: I get following error when running the AWS SAM CLI (by running command npm run dev:backend): "Dynamic require of "util" is not supported","stack":["Error: Dynamic require of "util" is not supported","    at file:///var/task/lambda.mjs:12:9"". Could you fix that somehow?

- Refactored backend to use individual Lambda functions instead of Express
- Created dedicated handler files in `server/handlers/` directory for each API endpoint
- Added shared utilities in `server/handlers/utils.ts` for standardized responses
- Fixed ESM dynamic require issues by adding Banner property to esbuild config
- Updated template.yaml to point to individual handler functions
- Removed dependency on @vendia/serverless-express
- Updated CLAUDE.md with comprehensive project documentation
- References: server/handlers/, server/lambda.ts, template.yaml

## 2025-04-20 - Fix API routing and add mock data for development

Prompt: GET /spaces returns 404, why is that? Make the analysis before you try to fix it

- Created mock-storage.ts with realistic test data for development environment
- Updated storage.ts to use mock data in development or when DynamoDB fails
- Added error handling and graceful fallbacks to storage implementation
- Enhanced lambda.ts with better logging and error handling
- Updated SAM template with explicit API routes for all endpoints (/spaces, /services, etc.)
- Added a development API key configuration for local testing
- Updated the dev scripts to pass API key parameters to SAM local
- Fixed routes to correctly handle paths without the /api prefix

## 2025-04-20 - Remove login and registration UI elements

Prompt: Remove Login and Register, no need for that

- Removed login button from main navigation bar
- Removed registration button from main navigation bar
- Removed login button from mobile menu
- Simplified header UI without authentication controls
- References: client/src/components/Header.tsx

## 2025-04-20 - SEO improvements for biuracoworking.pl

Prompt: Fix the SEO issues

- Added meta description and keywords tags to improve search engine visibility
- Created sitemap.xml and robots.txt files for better site indexing
- Implemented structured data with JSON-LD via react-helmet-async
- Enhanced semantic HTML with proper schema.org markup in space listings
- Added image optimization with vite-plugin-image-optimizer
- Localized UI text to Polish language for better regional targeting
- Created SEO components for consistent metadata across pages
- References: client/index.html, client/src/components/SEO.tsx, client/src/components/SpaceCard.tsx

## 2025-04-18 - Backend: Create API Gateway API Key and Usage Plan

- Added `ApiGatewayApiKey`, `ApiGatewayUsagePlan`, and `ApiGatewayUsagePlanKey` resources to `server/template.yaml` for API key management.
- The API key resource auto-generates a key bound to the Prod stage and assigns it to a usage plan.
- Exported the API key ID in CloudFormation Outputs under the key `ApiKey`. Use AWS CLI `get-api-key --include-value` to retrieve the actual key value.

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

## 2025-04-19 - Fix: Backend module format and build scripts

- Updated `build:backend` script in `package.json` to output CommonJS modules (`--format=cjs`) and removed externalization of AWS SDK (`--external:aws-sdk`) so that the AWS SDK v2 is bundled into the Lambda bundle, resolving the "Cannot find module 'aws-sdk'" error and supporting the Node.js22.x runtime.
- Added a top-level `build` script to run both frontend (`build:frontend`) and backend (`build:backend`) builds.
- Updated README.md to clarify separate production build steps for client and server.

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