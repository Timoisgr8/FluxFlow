// src/_queries/folders.query.js
import { useQuery } from "@tanstack/react-query";
import * as api from "../_api/folders.api";
import { folderKeys } from "./keys";

export function useFolders() {
  return useQuery({
    queryKey: folderKeys.all,
    queryFn: api.getFolders,
    staleTime: 5 * 60 * 1000, // cache folders for 5 min
  });
}