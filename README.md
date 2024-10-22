# Project Name: GoWagr

## Description

GoWagr is a backend service built with NestJS for a money transfer system. It allows users to create accounts, transfer funds, and manage their transactions securely.

## Table of Contents

- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Docker](#docker)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Technologies Used

- **Node.js**: JavaScript runtime built on Chrome's V8 engine.
- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications.
- **TypeScript**: A superset of JavaScript that compiles to plain JavaScript.
- **PostgreSQL**: A powerful, open-source relational database.
- **Docker**: Platform for developing, shipping, and running applications in containers.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 14 or higher)
- **Yarn** (or npm)
- **Docker** (if using Docker)
- **Docker Compose** (if using Docker)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/gowagr.git
   cd gowagr
   ```

2. Install the dependencies
   ```bash
     yarn install
   ```

## Configuration

1. Create a .env file in the root of the project based on the provided .env.example file. Adjust the configuration as needed:

```bash
  NODE_ENV='DEV'
  DB_HOST = 'localhost'
  DB_PORT=5432
  DB_USERNAME=''
  DB_PASSWORD=''
  DB_DATABASE='gowagr_dev'
  JWT_SECRET='this is a secret thou'
  JWT_EXPIRES_IN='45m'
  REDIS_PASS = 'gowagr'
  REDIS_HOST = 'localhost'
  REDIS_PORT = 6379
  REDIS_USERNAME = ''
```

2. Ensure the Database is up and running

## Running the application

1. Start up the database and the cache on local host by running

```bash
docker compose up -d
```

2. Start the server using:
   ```bash
   yarn start:dev
   ```
3. The application should be running on http://localhost:3000

## Testing

To run test, use:
`bash
      yarn test
    `

## Docker

To run the application using Docker, follow these steps:

1. Build the Docker containers using:

```bash
  docker compose up
```

2. Access the application at http://localhost:3000

3. To stop the services, press CTRL + C and run:

```bash
  docker compose down
```

## Usage

1. After the application is up, you can access various endpoints to create accounts, perform transactions, and manage users.

2. The API endpoints and their usage will be provided in the API documentation section.

## API Documentation

After running the server, You can access the API docs using

- http://localhost:3000/api-docs
  OR
- https://documenter.getpostman.com/view/27073736/2sAXxY58rj
