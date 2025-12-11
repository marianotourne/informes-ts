import { ClientForm } from "./clientForm";
import { ClientList } from "./clientList";
import { Toaster } from "./ui/Toaster";
import { useClients } from "@/hooks/useClients";

export function Clients() {
  const { clientsQuery, createClient, deleteClient } = useClients();

  if (clientsQuery.isLoading) return <p>Cargando...</p>;
  if (clientsQuery.isError)
    return <p>Error: {(clientsQuery.error as Error).message}</p>;

  return (
    <div className="max-w-4xl">
      <Toaster />
      <h1 className="text-4xl font-bold mb-6 text-blue-600">Clientes</h1>

      <ClientForm onSubmit={(data) => createClient(data)} />

      <ClientList
        clients={clientsQuery.data ?? []}
        onDelete={deleteClient}
        onEdit={(id) => console.log("Editar id", id)}
      />
    </div>
  );
}

