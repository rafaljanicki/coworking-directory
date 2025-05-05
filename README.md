# Coworking Offices Directory

Version: 1.0.0

## Overview

Coworking Offices Directory is a full-stack web application featuring:
- An AWS SAM–based Express.js server for RESTful API endpoints
- A Vite/React frontend for client-side rendering

## Prerequisites

- Node.js >= 22.x
- AWS SAM CLI (for local backend development)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Development

### Backend (AWS SAM)
- Navigate to the server directory:
  ```bash
  cd server
  ```
- Build the SAM application:
  ```bash
  sam build --template-file template.yaml
  ```
- Start the API locally:
  ```bash
  sam local start-api --template-file template.yaml
  ```
- The API will be available at `http://localhost:3000` by default.
- All API requests require a valid API key in the `x-api-key` header.

### Frontend (Vite)
- In the project root, run with your API key:
  ```bash
  VITE_API_KEY=<YOUR_API_KEY> npm run dev
  # or
  VITE_API_KEY=<YOUR_API_KEY> yarn dev
  ```
- Open your browser at `http://localhost:8080`

  To build for production (also include the key):
  ```bash
  VITE_API_KEY=<YOUR_API_KEY> npm run build
  # or
  VITE_API_KEY=<YOUR_API_KEY> yarn build
  ```

## Production Build
- Build client and server:
  ```bash
  npm run build:frontend
  npm run build:backend
  # or
  yarn build:frontend && yarn build:backend
  ```
- Start in production mode:
  ```bash
  npm start
  # or
  yarn start
  ```

## Usage

 - Frontend: Access at `http://localhost:5173`
 - API requests are directed to the base URL configured in `client/src/lib/config.ts` (default: `https://api.biuracoworking.pl`).
 - CORS is enabled on the backend API to allow requests from any origin.

### API Endpoints
- `GET /spaces`: List all coworking spaces (supports filtering)
- `GET /spaces/:id`: Get specific space details
- `GET /services`: Get all available services
- `GET /spaces/:id/services`: Get services for a specific space
- `GET /spaces/:id/pricing`: Get pricing for a specific space
- `POST /reports`: Submit correction reports
- `GET /posts`: List all blog posts
- `GET /posts/:slug`: Get specific blog post details by slug

### Authentication
- To call the API, include a valid API key in the `x-api-key` header.
- Retrieve the API key ID (stack output "ApiKey") from your CloudFormation stack:
  ```bash
  aws cloudformation describe-stacks --stack-name <STACK_NAME> \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiKey`].OutputValue' \
    --output text
  ```
  
- To get the actual API key value, use the AWS CLI with the `--include-value` flag:
  ```bash
  aws apigateway get-api-key --api-key <API_KEY_ID> --include-value
  ```
- API Gateway URL is available under the "ApiUrl" output of the stack.

## Project Structure and AI Instructions

This section provides an overview of the project structure and guidance for AI models interacting with the codebase.

### Directory Listing

```
website
├── .cursor/            # Cursor IDE specific settings and configurations
│   └── rules/          # Custom rules or configurations for Cursor
├── .github/            # GitHub specific configurations
│   └── workflows/      # GitHub Actions workflow definitions (e.g., CI/CD)
├── .vite/              # Vite build cache and temporary files
│   └── deps/           # Pre-bundled dependencies by Vite
├── client/             # Frontend React application source code
│   ├── public/         # Static assets served directly by the web server
│   ├── src/            # Main source code for the React application
│   │   ├── components/ # Reusable React components
│   │   │   └── ui/     # UI specific components (likely from a UI library like shadcn/ui)
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions, configuration, API clients
│   │   ├── pages/      # Page-level components representing different routes/views
│   │   ├── index.html      # Entry point HTML file for the Vite application
│   │   └── vite-env.d.ts   # TypeScript definitions for Vite environment variables
├── dist/               # Build output directory for the frontend application
│   ├── public/         # Copied static assets from client/public
│   │   └── assets/     # Compiled and optimized assets (JS, CSS, images)
├── server/             # Backend Node.js/Express application source code
│   └── handlers/       # Route handlers or controllers for API endpoints
├── shared/             # Code shared between the client and server (e.g., types, schemas)
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── CHANGELOG.md        # Log of changes made to the project over time
├── CLAUDE.md           # Specific instructions or context for the Claude AI model
├── coworking_directory_thumbnail.png # Project thumbnail image
├── dev_env.json        # Development environment configuration (if used)
├── offices.csv         # CSV data file, likely containing office information
├── package-lock.json   # Records exact versions of dependencies installed
├── package.json        # Project metadata and dependencies for Node.js/npm
├── postcss.config.js   # Configuration file for PostCSS (CSS processor)
├── README.md           # This file: project overview, setup, usage instructions
├── samconfig.toml      # Configuration file for AWS SAM CLI deployments
├── tailwind.config.ts  # Configuration file for Tailwind CSS
├── template.yaml       # AWS SAM template defining serverless resources (API Gateway, Lambda)
├── theme.json          # Theme configuration, possibly for UI components or styling
├── tsconfig.json       # TypeScript compiler configuration for the project root
└── vite.config.ts      # Vite configuration file for the frontend build process
```

### Instructions for AI Models

1.  **Understand the Stack:** This is a full-stack TypeScript project using React (Vite) for the frontend and Node.js/Express (run via AWS SAM) for the backend. Shared types/schemas are in the `shared/` directory.
2.  **Client-Side:** Frontend code is in `client/src`. Components are in `components/`, pages (routes) in `pages/`, utility functions/API logic in `lib/`, and custom hooks in `hooks/`. Styling is primarily handled by Tailwind CSS (`tailwind.config.ts`) potentially augmented by a UI library configured via `theme.json` and components in `client/src/components/ui`. State management likely uses React Query (`@tanstack/react-query`). Routing is handled by `wouter`.
3.  **Server-Side:** Backend code is in `server/`. It's an Express application designed to run as an AWS Lambda function defined in `template.yaml`. API route logic is likely within `server/handlers/`.
4.  **Shared Code:** The `shared/` directory contains code (like TypeScript types or Zod schemas) used by both the client and server to ensure consistency.
5.  **API Interaction:** The frontend interacts with the backend API. The base URL and API key are configured in `client/src/lib/config.ts` and potentially via environment variables (`VITE_API_KEY`). API request logic is likely centralized in `client/src/lib/queryClient.ts`.
6.  **Deployment:** The backend is deployed using AWS SAM (`template.yaml`, `samconfig.toml`). The frontend is built using Vite (`vite.config.ts`) and the output is in the `dist/` directory.
7.  **Dependencies:** Use `package.json` and `package-lock.json` to understand project dependencies.
8.  **Data:** The `offices.csv` file might be used for initial data seeding or be part of the backend data source logic.
9.  **Memory/Context:** Refer to previous interactions and attached file contents for specific context on ongoing tasks. Use the available MCP tools for memory management, file reading, searching, and editing.

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

This project is licensed under the MIT License.

## Disclaimer

This project was created by AI (Codex) and the author takes no responsibility for its usage.