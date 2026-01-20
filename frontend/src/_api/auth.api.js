
import { request } from "./request";


/* Function: Checks if the current user session is valid. 
Example Success Response: 
HTTP/1.1 200 
Content-Type: application/json  
{   
  "loggedIn": true,   
  "username": "admin" 
}  

Example Failure Response: 
HTTP/1.1 401 
Content-Type: application/json  
{   
  "loggedIn": false,   
  "error": "Not authenticated" 
} 
*/
export const checkSession = async () => {
  try {
    const response = await fetch("/auth/check-session", {
      method: "GET",
      credentials: "include", // Important: includes cookies/session
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Session check failed");
    }

    const data = await response.json();
    return data; // This will return { loggedIn: true, username: "admin" }
  } catch (error) {
    throw new Error("Session check failed");
  }
};

/* Function: Logs in a user to Grafana and stores the session cookie.
Example Request:
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}

Example Success Response:
HTTP/1.1 200
Content-Type: application/json

{
  "message": "Logged in to Grafana successfully"
}

Example Failure Responses:

Invalid credentials:
HTTP/1.1 401
Content-Type: application/json

{
  "error": "Invalid credentials"
}

No session cookie from Grafana / other server error:
HTTP/1.1 500
Content-Type: application/json

{
  "error": "No session cookie received from Grafana"
}

Or

{
  "error": "Grafana login failed",
  "details": "Error message here"
}
*/
export const login = (username, password) =>
  request(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    "Login failed"
  ).then(() => true);

/* Function: Logs out the current user by destroying the session.
Example Request:
POST /auth/logout

Example Success Response:
HTTP/1.1 200
Content-Type: application/json

{
  "message": "Logged out successfully"
}

Example Failure Response:
HTTP/1.1 500
Content-Type: application/json

{
  "error": "Logout failed"
}
*/
export const logout = () =>
  request("/auth/logout", { method: "POST" }, "Logout failed").then(() => true);