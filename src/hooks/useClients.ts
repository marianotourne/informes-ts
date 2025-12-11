import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
} from "../api/clientsApi";
import { toast } from "../components/ui/useToast";
import type { Client } from "../types/types";

export function useClients() {
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  });

  const createMutation = useMutation({
    mutationFn: (data: Omit<Client, "id">) => createClient(data),
    onSuccess: () => {
      toast({ title: "Cliente creado", description: "Se agregó correctamente." });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: Error) => {
      toast({ title: "Error", description: e.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Client> }) =>
      updateClient(id, data),
    onSuccess: () => {
      toast({ title: "Cliente actualizado" });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteClient(id),
    onSuccess: () => {
      toast({ title: "Cliente eliminado" });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  return {
    clientsQuery,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
  };
}
