// src/_queries/auth.query.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../_api/auth.api";

/* ------------------- Queries ------------------- */

/**
 * Hook: Check if the current user session is valid
 * Returns cached session info if available, refetches on mount
 */
export function useCheckSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: api.checkSession,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    retry: false,             // don't retry on failure (invalid session)
  });
}

/* ------------------- Mutations ------------------- */

/**
 * Hook: Login a user
 * On success, invalidates session query so session info is updated
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }) => api.login(username, password),
    onSuccess: () => {
      // Invalidate session query to refetch latest session
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

/**
 * Hook: Logout current user
 * On success, clears session query from cache
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}