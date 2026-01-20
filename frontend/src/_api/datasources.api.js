// src/_api/datasources.api.js

// This folder contains all apis related to folders
import { request } from "./request";

/* Function: Returns folders avaliable to user. 
Example Success Response:
HTTP/1.1 200
Content-Type: application/json
[
	"_monitoring",
	"_tasks",
	"mybucket"
]
*/
export const getBuckets = () =>
  request("/grafana/influxdb/buckets", {}, "Failed to fetch user buckets");



/* Function: Returns metadata for a specific bucket, including measurements, fields, and tags.
Parameters:
  - bucket (string): the name of the bucket to fetch metadata for

Example Success Response:
HTTP/1.1 200
Content-Type: application/json
{
	"bucket": "mybucket",
	"tags": {
		"_start": [1757423541929],
		"_stop": [1760015541928],
		"_field": [
			"usage_active",
			"usage_guest",
			"usage_guest_nice",
            ...
		],
		"_measurement": ["cpu"],
		"cpu": [
			"cpu-total",
			"cpu0",
			"cpu1",
			"cpu2",
			"cpu3",
			"cpu4",
			"cpu5",
            ...
		],
		"host": ["710afcca6c7d"]
	}
}
*/
export const getBucketMetadata = (bucket) =>
  request(`/grafana/influxdb/metadata?bucket=${encodeURIComponent(bucket)}`, {}, "Failed to fetch bucket metadata");