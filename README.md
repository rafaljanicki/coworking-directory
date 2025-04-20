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

 - Frontend: Access at `http://localhost:8080`
 - API requests are directed to the base URL configured in `client/src/lib/config.ts` (default: `https://t4nlm7q6kd.execute-api.eu-central-1.amazonaws.com/Prod/`).
 - CORS is enabled on the backend API to allow requests from any origin.

### API Endpoints
- `GET /spaces`: List all coworking spaces (supports filtering)
- `GET /spaces/:id`: Get specific space details
- `GET /services`: Get all available services
- `GET /spaces/:id/services`: Get services for a specific space
- `GET /spaces/:id/pricing`: Get pricing for a specific space
- `POST /reports`: Submit correction reports

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

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

This project is licensed under the MIT License.

## Disclaimer

This project was created by AI (Codex) and the author takes no responsibility for its usage.