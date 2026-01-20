# Title

## Environment Variables

This project uses a `.env` file in the root directory - make sure to create that before doing docker build

## Setup for .env file → Single source of truth for storing all global secret values

Create the .env file in the project root directory:

>touch .env

For backend local testing:

Add the following line inside the .env file (default is true):
USE_REDIS=false
....
Include other environment variables as needed.

## Docker

This will build images (if needed) and start all services:

    docker-compose up --build
    Logs will stream to your terminal.

To stop containers, press Ctrl+C then run:

    docker-compose down

To boot specific containers:

    docker-compose up <name> <name>

i.e the following command will only boot frontend and backend.

    docker-compose up backend frontend, 

    NOTE: Some containers require

How to remove volumes and reset data:
    
    docker-compose down -v

This stops containers, removes networks, and deletes named volumes declared in your compose file. Use with caution: this will delete all persistent data in volumes.

## Local Development (without Docker)

All commands assume you are in the repository root.

- Start the backend API (and Swagger docs on port 3002):

      npm run start --prefix backend

- Run the backend in watch mode during development:

      npm run dev --prefix backend

When either command is running, reach Swagger UI at http://localhost:3002/api-docs.  
The UI is read-only (Try it Out disabled and no OAuth/API key prompts); use your preferred HTTP client or the frontend for live requests.


# Login

Grafana: 

    username = admin
    password = admin

Influxdb:

    username = myuser
    password = mypassword




## Steps to Run Create Dashboard API

1. Login to Grafana

Authenticate with Grafana through the backend.
This stores the Grafana session cookie inside your backend session.

Request

Method: POST

URL: http://localhost:3000/auth/login

Headers:

Content-Type: application/json


Body (raw JSON):

{
  "username": "admin",
  "password": "admin"
}


Response

{ "message": "Logged in to Grafana successfully" }

2. Get User Folders

List all folders for the logged-in user.

Request

Method: GET

URL: http://localhost:3000/grafana/user-folders

Response

[
  {
    "id": 1,
    "uid": "a2ff1b86-8aab-450a-8cc6-78bb1de92470",
    "title": "jane folder"
  },
  {
    "id": 2,
    "uid": "f5be18e9-f922-4e14-a70d-31053a3b9639",
    "title": "test folder"
  }
]


Save the "uid" of the folder where you want to create dashboards.

3. Create an Empty Dashboard

Create a new dashboard inside the chosen folder.

Request

Method: POST

URL: http://localhost:3000/grafana/dashboard/create

Headers:

Content-Type: application/json


Body (raw JSON):

{
  "title": "My Empty Dashboard",
  "folderUid": "{{folderUid}}"
}


Replace {{folderUid}} with the UID you copied from step 2.

Response

{
  "id": 5,
  "slug": "my-empty-dashboard",
  "status": "success",
  "uid": "b5a34778-4c40-4ba3-ad26-11105d3e199e",
  "url": "/d/b5a34778-4c40-4ba3-ad26-11105d3e199e/my-empty-dashboard",
  "version": 1
}
