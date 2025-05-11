# Coworking Offices Directory

Version: 2.0.0 (SST Migration)

## Overview

Coworking Offices Directory is a full-stack web application migrated to [SST (Serverless Stack Toolkit)](https://sst.dev/) for a modern, integrated development and deployment experience on AWS. It features:
- A serverless backend built with AWS Lambda and DynamoDB, managed by SST.
- A Vite/React frontend for a fast and interactive user experience.
- TypeScript throughout the stack for type safety and improved developer experience.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: AWS Lambda, Amazon DynamoDB
- **Infrastructure & Deployment**: SST (Serverless Stack Toolkit) v3
- **Language**: TypeScript

## Prerequisites

- Node.js >= 18.x (LTS recommended)
- npm (comes with Node.js) or yarn
- AWS Account: Configured with AWS CLI credentials for SST deployment.
  - Ensure your AWS CLI is configured (e.g., via `aws configure`).
- SST CLI (will be used via `npx`)

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd website
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

## Development

SST makes local development seamless by starting a live development environment that proxies requests to your local code.

1.  Start the SST live development environment:
    ```bash
    npx sst dev
    ```
    This command will:
    - Deploy a development stack to your AWS account.
    - Start the Vite development server for the frontend (typically on `http://localhost:5173`).
    - Start a local proxy for your API, allowing you to test Lambda functions locally with live AWS resources.
    - Output the URLs for your frontend and API.

    Note: The first run of `npx sst dev` might take a few minutes to deploy the initial infrastructure. Subsequent starts will be much faster.

2.  Open your browser to the frontend URL provided by the SST CLI.

## Building for Production

To build the application for production, SST will bundle both the frontend and backend:

```bash
npx sst build
```
This command creates optimized assets for deployment.

## Deployment

Deploy your application to a specific stage (e.g., `production`):

```bash
npx sst deploy --stage production
```
SST will provision all the necessary AWS resources defined in `sst.config.ts` and deploy your application code.

### Custom Domain
If a custom domain is configured in `sst.config.ts` (e.g., `biuracoworking.pl`), SST will also set up the necessary DNS records (if using SST's DNS management) and SSL certificates.

## Removing the Application

To remove all resources associated with a deployed stage:

```bash
npx sst remove --stage production
```
Be cautious with this command, as it will delete all data in DynamoDB tables for that stage unless deletion protection is configured.

## Project Structure Overview

The project has been reorganized to align with SST best practices:

```
website
├── .cursor/            # Cursor IDE specific settings
├── .github/            # GitHub Actions workflows
├── .sst/               # SST generated files (artifacts, logs, local state) - should be in .gitignore
├── client/             # Frontend React/Vite application
│   ├── public/         # Static assets
│   └── src/            # Frontend source code (components, pages, hooks, lib)
├── dist/               # Build output directory (managed by Vite/SST)
├── server/             # Backend Lambda handler code
│   └── handlers/       # Individual Lambda function handlers
├── shared/             # Code shared between client and server (e.g., types, schemas)
├── src/                # Can be used for additional shared utilities or entry points if needed
├── .gitignore          # Specifies intentionally untracked files
├── CHANGELOG.md        # Log of project changes
├── CLAUDE.md           # AI interaction context (if used)
├── package-lock.json   # Records exact versions of dependencies
├── package.json        # Project metadata and dependencies
├── postcss.config.js   # PostCSS configuration
├── README.md           # This file
├── sst.config.ts       # SST configuration file defining infrastructure and application stacks
├── tailwind.config.ts  # Tailwind CSS configuration
├── theme.json          # Theme configuration
├── tsconfig.json       # TypeScript compiler configuration
└── vite.config.ts      # Vite configuration (primarily for frontend)
```

### Key Files in SST Migration:
-   `sst.config.ts`: This is the heart of your SST application. It defines your AWS infrastructure (APIs, databases, frontend sites, etc.) as code using TypeScript. It replaces the previous `template.yaml` and `samconfig.toml`.
-   `server/`: Contains the Lambda function handlers. SST binds these to the API routes defined in `sst.config.ts`.
-   `client/`: Remains the Vite/React frontend, but its build and development are now managed by SST commands.
-   `package.json`: Scripts have been updated to use `sst` commands (e.g., `sst dev`, `sst build`, `sst deploy`).

## API and Authentication

-   The API is defined and deployed via `sst.config.ts` using `sst.aws.ApiGatewayV2`.
-   API routes are mapped to handlers in the `server/handlers/` directory.
-   Authentication (e.g., API keys) and authorization can be configured within the `ApiGatewayV2` construct in `sst.config.ts`. SST provides mechanisms to securely manage and inject API keys or other secrets into your functions.
-   CORS is configured globally within the `ApiGatewayV2` construct.

## Instructions for AI Models

1.  **Understand the Stack:** This project uses SST (Serverless Stack Toolkit) v3 to manage a full-stack TypeScript application. The frontend is Vite/React, and the backend consists of AWS Lambda functions and DynamoDB, all defined in `sst.config.ts`.
2.  **SST Configuration is Key:** Most infrastructure definitions (API routes, database tables, frontend hosting, environment variables, permissions) are in `sst.config.ts`.
3.  **Client-Side:** Frontend code is in `client/src`. Components are in `components/`, pages (routes) in `pages/`, utility functions/API logic in `lib/`, and custom hooks in `hooks/`. Styling is primarily handled by Tailwind CSS (`tailwind.config.ts`) and Shadcn UI components in `client/src/components/ui/`.
4.  **Server-Side:** Backend Lambda handler code resides in `server/handlers/`. Business logic related to data storage is typically in `server/storage.ts`, which now uses SST's resource binding (e.g., `Table.MyTable.tableName`) to access DynamoDB tables.
5.  **Shared Code:** The `shared/` directory contains TypeScript types or Zod schemas used by both the client and server.
6.  **API Interaction:** The frontend interacts with the backend API. The API URL is automatically made available to the frontend by SST. API request logic might be in `client/src/lib/queryClient.ts` or similar.
7.  **Development Workflow:** Use `npx sst dev` for local development. This command handles both frontend and backend.
8.  **Deployment:** Use `npx sst deploy --stage <stage>` for deployments.
9.  **Dependencies:** Refer to `package.json` for project dependencies. SST manages its own dependencies as well.
10. **Memory/Context:** Utilize previously provided context, attached files, and MCP tools for memory, file operations, and search.

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

This project is licensed under the MIT License.

## Disclaimer

This project was created with the assistance of AI and the author takes no responsibility for its usage.