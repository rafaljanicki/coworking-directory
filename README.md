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

### Frontend (Vite)
- In the project root, run:
  ```bash
  npm run dev
  # or
  yarn dev
  ```
- Open your browser at `http://localhost:8080`

## Production Build

- Build client and server:
  ```bash
  npm run build
  # or
  yarn build
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

## Contributing

Contributions are welcome! Please open issues or submit pull requests.

## License

This project is licensed under the MIT License.

## Disclaimer

This project was created by AI (Codex) and the author takes no responsibility for its usage.