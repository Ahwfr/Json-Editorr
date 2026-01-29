import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDocument } from "@shared/routes";

// ============================================
// Documents Hooks
// Note: While the editor is primarily client-side, these hooks 
// enable saving/loading from the server if needed later.
// ============================================

export function useDocuments() {
  return useQuery({
    queryKey: [api.documents.list.path],
    queryFn: async () => {
      const res = await fetch(api.documents.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      return api.documents.list.responses[200].parse(await res.json());
    },
  });
}

export function useDocument(id: number) {
  return useQuery({
    queryKey: [api.documents.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.documents.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch document");
      return api.documents.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDocument) => {
      const res = await fetch(api.documents.create.path, {
        method: api.documents.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.documents.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create document");
      }
      return api.documents.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.documents.list.path] }),
  });
}
