// src/_api/folders.api.js

// This folder contains all apis related to folders
import { request } from "./request";

/* Function: Returns folders avaliable to user. 
Example Success Response:
HTTP/1.1 200
Content-Type: application/json

[
  {
    "id":1,
    "uid": "nErXDvCkzz",
    "title": "Department ABC"
  },
  {
    "id":2,
    "uid": "k3S1cklGk",
    "title": "Department RND"
  }
]
*/
export const getFolders = () =>
  request("/grafana/user-folders", {}, "Failed to fetch user folders");