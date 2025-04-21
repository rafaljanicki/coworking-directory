# Bash commands
- `npm run build`: Build the project
- `npm run dev`: Run the application
- `npm run stop`: Stop both frontend and backend services
- `npm run build:backend`: Build just the backend
- `npm run dev:backend`: Start just the backend (after building it)
- `npm run dev:frontend`: Start just the frontend

# Recent Updates (as of 2025-04-21)
- **Backend Architecture Refactor**: Replaced Express with individual Lambda handlers for each endpoint
- **SEO Improvements**: Added meta descriptions, sitemap.xml, robots.txt, structured data with JSON-LD, semantic HTML with schema.org markup, image optimization, and React Helmet for SEO management
- **UI Updates**: Removed login and registration UI elements from header and mobile menu
- **Localization**: Updated UI text to Polish language for better local targeting (primary domain: biuracoworking.pl)
- **Dependencies Added**: react-helmet-async, vite-plugin-image-optimizer
- **Dependencies Removed**: @vendia/serverless-express (no longer needed after Lambda refactoring)

# Workflow
- At the start, run both frontend and backend in the background. Frontend is accessible at http://localhost:8080 and backend at http://localhost:3000
- IMPORTANT: At the end, run `npm run stop` to stop both services
- Every API code change, stop the backend, build it and start again
- Always review Readme file after changes. Reduce scope of the review only to the changes performed. Do that only once you've completed all your changes
- While you work on the project, create dated files such as .claude/plan_2025-04-18-0800.md containing your planned milestones, and update these documents as you progress through the task. 
- For significant pieces of completed work, update the CHANGELOG.md with a dated changelog. Please start the changelog with the input prompt then followed by each functionality introduced and reference the relevant documentation

# Project Architecture

## Frontend (client directory)
- **Framework**: React with TypeScript, built with Vite
- **State Management**: React Query for server state, React hooks for local state
- **UI Library**: Shadcn UI components (based on Radix UI)
- **Styling**: Tailwind CSS
- **Routing**: Wouter (lightweight router)
- **Map**: Leaflet/React-Leaflet for interactive maps
- **SEO**: react-helmet-async for metadata management
- **Image Optimization**: vite-plugin-image-optimizer for production builds

## Backend (server directory)
- **Framework**: AWS SAM (Serverless Application Model) with individual Lambda handlers
- **Compute**: AWS Lambda functions (one per endpoint)
- **API**: API Gateway with custom domain
- **Database**: DynamoDB tables
- **Authentication**: API Key with usage plan
- **Handler Structure**: Each endpoint has its own handler file in `server/handlers/`

## Key Components
- **SpacesList.tsx/SpaceCard.tsx**: List view of coworking spaces
- **MapView.tsx**: Interactive map showing space locations
- **FiltersBar.tsx**: UI for filtering spaces
- **SpaceDetailModal.tsx**: Detailed view of a space
- **ReportChangesModal.tsx**: Form for users to report incorrect information

## API Endpoints
- `GET /spaces`: List all coworking spaces (with filtering)
- `GET /spaces/:id`: Get specific space details
- `GET /services`: Get all available services
- `GET /spaces/:id/services`: Get services for a specific space
- `GET /spaces/:id/pricing`: Get pricing for a specific space
- `POST /reports`: Submit correction reports

## Project Structure
- **client/**: Frontend React application
- **server/**: Backend serverless application
  - **handlers/**: Individual Lambda handler functions
    - **utils.ts**: Shared utilities for responses and environment setup
  - **storage.ts**: Data persistence layer (DynamoDB or mock)
  - **lambda.ts**: Re-exports handlers for backward compatibility
- **shared/**: Code shared between frontend and backend (schemas, types)

## Lambda Function Structure
Each Lambda function follows the same pattern:
1. Receives an API Gateway event
2. Sets up environment
3. Processes request parameters
4. Interacts with storage layer
5. Returns standardized response

## AWS SAM Template
The template.yaml file defines:
- DynamoDB tables
- Individual Lambda functions with their API routes
- API Gateway configuration with API Key security
- Custom domain configuration

## SEO Status
- ✅ Added meta description and keywords tags
- ✅ Created sitemap.xml and robots.txt files
- ✅ Implemented structured data (JSON-LD) via react-helmet-async
- ✅ Enhanced semantic HTML with schema.org markup
- ✅ Added image optimization with vite-plugin-image-optimizer
- ✅ Implemented SEO library (react-helmet-async)
- ✅ Localized content to Polish language for better regional targeting