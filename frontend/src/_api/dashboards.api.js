// src/_api/dashboards.api.js

// This folder contains all apis related to dashboards.
import { request } from "./request";


/* Function: Returns dashboards in a folder given folderUid. 
Example Success Response:
HTTP/1.1 200
Content-Type: application/json

[
  {
    "id":1,
    "uid": "cIBgcSjkk",
    "orgId": 1,
    "title":"Production Overview",
    "url": "/d/cIBgcSjkk/production-overview",
    "type":"dash-db",
    "tags":[prod],
    "isStarred":true,
    "folderId": 2,
    "folderUid": "000000163",
    "folderTitle": "Folder",
    "folderUrl": "/dashboards/f/000000163/folder",
    "uri":"db/production-overview" // deprecated in Grafana v5.0
  }
]
*/
export const getDashboards = (folderUid) =>
  request(
    `/grafana/user-dashboards?folderUid=${encodeURIComponent(folderUid)}`,
    {},
    `Failed to fetch dashboards for folder: ${folderUid}`
  );

/* Function: Returns dashboard + meta of an individual dashboard given dashboardUid. 
Example Success Response:
HTTP/1.1 200
Content-Type: application/json

{
  "dashboard": {
    "id": 1,
    "panels": [],
    "uid": "cIBgcSjkk",
    "title": "Production Overview",
    "tags": [ "templated" ],
    "timezone": "browser",
    "schemaVersion": 16,
    "version": 0
  },
  "meta": {
    "isStarred": false,
    "url": "/d/cIBgcSjkk/production-overview",
    "folderId": 2,
    "folderUid": "l3KqBxCMz",
    "slug": "production-overview" //deprecated in Grafana v5.0
  }
}
*/
export const getDashboard = (uid) =>
  request(
    `/grafana/api/dashboards/uid/${encodeURIComponent(uid)}`,
    {},
    "Failed to fetch dashboard"
  );


/* Function: Post request to update a dashboard given a folderUid and dashboard.
Example Success Response:
HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8
Content-Length: 78

{
    "id": 1,
    "uid": "e883f11b-77c0-4ee3-9a70-3ba223d66e56",
    "url": "/d/e883f11b-77c0-4ee3-9a70-3ba223d66e56/production-overview-updated",
    "status": "success",
    "version": 2
    "slug": "production-overview-updated",
}
*/
export const updateDashboard = (folderUid, dashboard) => {
  if (!folderUid || !dashboard) {
    throw new Error("folderUid and dashboard are required");
  }

  return request(
    "/grafana/dashboard/update",
    {
      method: "POST",
      body: JSON.stringify({ folderUid, dashboard }),
    },
    "Failed to update dashboard"
  );
};

/* Function: POST request to create a dashboard given a folderUid and dashboard.
Example Success Response:
HTTP/1.1 200 OK
Content-Type: application/json; charset=UTF-8
Content-Length: 78

{
    "id": 1,
    "uid": "e883f11b-77c0-4ee3-9a70-3ba223d66e56",
    "url": "/d/e883f11b-77c0-4ee3-9a70-3ba223d66e56/production-overview-updated",
    "status": "success",
    "version": 2
    "slug": "production-overview-updated",
}
*/
export const createNewDashboard = async (payload) => {
  const data = await request(
    "/grafana/dashboard/create",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Failed to create dashboard"
  );

  console.log("Dashboard create result:", data);
  return data;
};

/* Function: DELETE request to delete a dashboard given a dashboardUid.
Example Success Response:
HTTP/1.1 200
Content-Type: application/json

{
  "title": "Production Overview",
  "message": "Dashboard Production Overview deleted",
  "id": 2
}
*/
export const deleteDashboard = async (uid) => {
  if (!uid) {
    throw new Error("Dashboard UID is required");
  }

  const data = await request(
    `/grafana/dashboard/delete/${encodeURIComponent(uid)}`,
    { method: "DELETE" },
    "Failed to delete dashboard"
  );

  console.log("Dashboard delete result:", data);
  return data;
};


// ----------------------------------------------------------------
//                            DEPRECATED                           
// ----------------------------------------------------------------


// Reason: Updating panels requires updating entire dashboard anyway. Therefore instead this will be handled by updateDashboard function above.
export const updatePanelQuery = (folderUid, dashboardUid, panelId, newFluxQuery) => {
  if (!folderUid || !dashboardUid || !panelId || !newFluxQuery) {
    throw new Error(
      "folderUid, dashboardUid, panelId, and newFluxQuery are required"
    );
  }

  return request(
    "/grafana/dashboard/panel-update",
    {
      method: "POST",
      body: JSON.stringify({ folderUid, dashboardUid, panelId, newQuery: newFluxQuery }),
    },
    "Failed to update panel query"
  );
};