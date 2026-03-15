import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CaseStatus, ForensicsCase } from "../backend.d";
import { useActor } from "./useActor";

export type { ForensicsCase, CaseStatus };

export function useGetAllCases() {
  const { actor, isFetching } = useActor();
  return useQuery<ForensicsCase[]>({
    queryKey: ["cases"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCases();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCaseById(id: string) {
  const { actor, isFetching } = useActor();
  return useQuery<ForensicsCase>({
    queryKey: ["case", id],
    queryFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.getCaseById(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useCreateCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      imageId,
    }: { title: string; imageId: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createCase(title, imageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

export function useUpdateCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      findings,
    }: {
      id: string;
      status: CaseStatus;
      notes: string;
      findings: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCase(id, status, notes, findings);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case", vars.id] });
    },
  });
}

export function useDeleteCase() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCase(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return "guest";
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}
