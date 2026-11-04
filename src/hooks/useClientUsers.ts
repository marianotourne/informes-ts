import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchExternos,
  fetchClientUsers,
  addClientUser,
  removeClientUser,
} from "../api/clientUsersApi";
import { toast } from "../components/ui/useToast";
import type { ClientUser } from "../types/types";

const onMutationError = (e: Error) => {
  toast({ title: "Error", description: e.message });
};

// Externos y sus clientes asignados. Solo para internos (pantalla de Clientes).
export function useClientUsers() {
  const queryClient = useQueryClient();

  const externosQuery = useQuery({
    queryKey: ["externos"],
    queryFn: fetchExternos,
  });

  const assignmentsQuery = useQuery({
    queryKey: ["client_users"],
    queryFn: fetchClientUsers,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["client_users"] });

  const addMutation = useMutation({
    mutationFn: (a: ClientUser) => addClientUser(a),
    onSuccess: () => {
      toast({ title: "Usuario asignado" });
      invalidate();
    },
    onError: onMutationError,
  });

  const removeMutation = useMutation({
    mutationFn: (a: ClientUser) => removeClientUser(a),
    onSuccess: () => {
      toast({ title: "Usuario quitado" });
      invalidate();
    },
    onError: onMutationError,
  });

  return {
    externosQuery,
    assignmentsQuery,
    addClientUser: addMutation.mutate,
    removeClientUser: removeMutation.mutate,
    isAdding: addMutation.isPending,
    removingUserId: removeMutation.isPending
      ? removeMutation.variables.user_id
      : null,
  };
}
