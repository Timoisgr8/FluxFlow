// src/_queries/datasources.query.js
import { useQuery } from "@tanstack/react-query";
import * as api from "../_api/datasources.api";
import { datasourceKeys } from "./keys";

export function useBuckets() {
  return useQuery({
    queryKey: datasourceKeys.buckets,
    queryFn: api.getBuckets,
    staleTime: Infinity, // Buckets rarely change
  });
}

export function useBucketMetadata(bucket) {
  return useQuery({
    queryKey: datasourceKeys.bucketMetadata(bucket),
    queryFn: () => api.getBucketMetadata(bucket),
    enabled: !!bucket,
    staleTime: 10000,
  });
}
