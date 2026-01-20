// src/_api/users.api.js

// This folder contains all apis related to user
import { request } from "./request";

/* Function: Returns user data. 
Example Success Response:
HTTP/1.1 200 
Content-Type: application/json
{
  "id":1,
  "email":"admin@mygraf.com",
  "name":"Admin",
  "login":"admin",
  "theme":"light",
  "orgId":1,
  "isGrafanaAdmin":true,
  "isDisabled":false
  "isExternal": false,
  "authLabels": [],
  "updatedAt": "2019-09-09T11:31:26+01:00",
  "createdAt": "2019-09-09T11:31:26+01:00",
  "avatarUrl": ""
}
*/
export const getUserData = () =>
  request("/grafana/user-data", {}, "Failed to fetch user data");