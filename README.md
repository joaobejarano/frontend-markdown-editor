# Markdown Editor - Documentation

## Table of Contents
- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
- [Backend Configuration](#backend-configuration)
- [Frontend Configuration](#frontend-configuration)
- [API Endpoints](#api-endpoints)
- [Design Decisions and Challenges Faced](#design-decisions-and-challenges-faced)
- [Instructions on How to Test the Application](#instructions-on-how-to-test-the-application)

## Overview
This project is a collaborative real-time Markdown editor that allows multiple users to edit the same document simultaneously. The system consists of a backend that provides the API and manages data persistence, and a frontend that provides the interface for users to interact with the editor.

## Setup Instructions

### Backend Setup

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/joaobejarano/backend-markdown-editor.git
    cd backend-markdown-editor

2. Install the Dependencies:

    ```bash
    npm install

3. Database Setup:

    - Rename the `.env.example` file to `.env` and set the environment variables.

    - In the production environment, set the `JWT_SECRET` directly on your hosting service.

    - Change the `DB_HOST` to the address of your production database.

4. Run the Migrations:

    ```bash
    npx sequelize-cli db:migrate --env development

5. Start the Server:

- Development Environment:

    ```bash
    npm run dev

- Production Environment:

    ```bash
    npm start

### Frontend Configuration

1. **Clone the Repository:**

    ```bash
    git clone https://github.com/joaobejarano/frontend-markdown-editor.git
    cd frontend-markdown-editor

2. Install the Dependencies:

    ```bash
    npm install

3. Environment Configuration:

    - Rename the .env.example file to .env and configure the backend URL.

4. Run the Application:

    ```bash
    npm start

5. Build for Production:

    ```bash
    npm run build

## API Endpoints

### Authentication

- POST /api/auth/register

    - Description: Registers a new user.
    - Payload:
        ```json
        {
        "username": "string",
        "email": "string",
        "password": "string"
        }
- POST /api/auth/login

    - Description: Logs in a user and returns a JWT token.
    - Payload:
        ```json
        {
        "email": "string",
        "password": "string"
        }

### Documents

- GET /api/documents

    - Description: Returns a list of documents for the authenticated user.
- POST /api/documents

    - Description: Creates a new document.
    - Payload:
        ```json
        {
        "content": "string",
        "version": 1,
        "createdBy": "username"
        }
- GET /api/documents/

    - Description: Returns the content of a specific document.

- PUT /api/documents/

    - Description: Updates the content of a document.

    - Payload:
        ```json
        {
        "content": "string",
        "version": 2
        }
- POST /api/documents/saveVersion

    - Description: Saves a new version of the document.

## Design Decisions and Challenges Faced

### Design Decisions

1. MVC Architecture:

    - The backend application was designed following the MVC pattern to separate the application logic, the user interface and the data control. This makes the code easier to maintain and scalable.

2. Socket.IO for Real-Time Collaboration:

    - Socket.IO was chosen to manage real-time collaboration in the Markdown editor, allowing multiple users to edit a document simultaneously.

3. JWT for Authentication:

    - User authentication was implemented using JSON Web Tokens (JWT), which ensures that only authenticated users can access and modify documents.

### Challenges Faced

1. Edit Synchronization:

    - One of the main challenges was to ensure that edits made by different users were correctly synchronized in real time, minimizing conflicts and ensuring that the document content was updated correctly.

2. Persistence and Versioning:

    - Implementing document versioning was another challenge, ensuring that users could save and restore previous versions of a document.

3. Security:

    - Ensuring the security of communications and protecting sensitive operations, such as authentication and token storage, was a priority, especially in production.

## Instructions on How to Test the Application

### Backend

1. Unit Tests with Jest:

    - The backend includes unit tests using Jest. To run the tests:
        ```bash
        npm test

2. Integration Tests with Supertest:

- The integration tests for the API routes use Supertest to ensure that the endpoints are working correctly.

### Frontend

1. Component Tests with Cypress:

- The frontend uses Cypress to integration and end-to-end tests. To run the tests:
    ```bash
    npx cypress open

2. Automated Tests:

    - Automated tests have been set up to ensure that critical functionality, such as document editing and authentication, is working as expected.