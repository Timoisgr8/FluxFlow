// src/_queries/users.query.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../_api/user.api";
import { userKeys } from "./keys";

export function useUserData() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: api.getUserData,
    staleTime: Infinity, // Unlikely to be stale
  });
}