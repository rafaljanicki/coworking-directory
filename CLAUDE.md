# Bash commands
- `npm run build`: Build the project
- `npm run dev`: Run the application
- `npm run stop`: Stop both frontend and backend services

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

## Backend (server directory)
- **Framework**: AWS SAM (Serverless Application Model) with Express
- **Compute**: AWS Lambda functions 
- **API**: API Gateway with custom domain
- **Database**: DynamoDB tables
- **Authentication**: API Key with usage plan

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
- **shared/**: Code shared between frontend and backend (schemas, types)

## SEO Status
- Missing meta description tag
- No sitemap.xml or robots.txt
- No structured data (JSON-LD)
- Limited semantic HTML
- No image optimization
- No SEO library implementation