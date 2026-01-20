// src/_queries/keys.js
export const folderKeys = {
  all: ["folders"],                // list of all folders
};

export const dashboardKeys = {
  all: (folderUid) => ["dashboards", folderUid], // dashboards in a folder
  single: (uid) => ["dashboard", uid],           // full dashboard JSON
};

export const userKeys = {
  all: ["user"],
};

export const datasourceKeys = {
  buckets: ["buckets"],                           // list of all buckets
  bucketMetadata: (bucket) => ["bucketMetadata", bucket],  // metadata for a specific bucket
};
