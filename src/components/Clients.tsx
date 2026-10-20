import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { ClientFormDialog } from "./ClientFormDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import { TablePagination } from "./TablePagination";
import { WhatsAppIcon } from "./icons/WhatsAppIcon";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useClients } from "@/hooks/useClients";
import { usePagination } from "@/hooks/usePagination";
import { buildWhatsAppUrl } from "@/lib/utils";
import type { Client } from "@/types/types";

const thClassName =
  "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider";
const tdClassName =
  "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100";

const filterClients = (clients: Client[], search: string): Client[] => {
  const query = search.trim().toLowerCase();
  if (!query) return clients;

  return clients.filter((c) =>
    [c.name, c.phone, c.email, c.address].some((field) =>
      field?.toLowerCase().includes(query),
    ),
  );
};

export function Clients() {
  const {
    clientsQuery,
    createClient,
    updateClient,
    deleteClient,
    isSaving,
    deletingId,
  } = useClients();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  // Separado del ítem para que el texto no se vacíe durante la animación de cierre
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filteredClients = useMemo(
    () => filterClients(clientsQuery.data ?? [], search),
    [clientsQuery.data, search],
  );

  const { pageItems, setPage, ...pagination } = usePagination(filteredClients);

  const handleNewClient = () => {
    setEditingClient(null);
    setDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) deleteClient(clientToDelete.id);
  };

  const handleSubmit = (data: Omit<Client, "id">) => {
    const options = { onSuccess: () => setDialogOpen(false) };

    if (editingClient) {
      updateClient({ id: editingClient.id, data }, options);
    } else {
      createClient(data, options);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-blue-600">Clientes</h1>
        <Button onClick={handleNewClient} className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Buscar cliente
        </label>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Razón social, teléfono, correo o dirección..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className={thClassName}>
                  Razón Social
                </th>
                <th scope="col" className={thClassName}>
                  Teléfono
                </th>
                <th scope="col" className={thClassName}>
                  Correo electrónico
                </th>
                <th scope="col" className={thClassName}>
                  Dirección
                </th>
                <th scope="col" className={`${thClassName} text-right`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {clientsQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    Cargando clientes...
                  </td>
                </tr>
              ) : clientsQuery.isError ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-red-600 dark:text-red-400"
                  >
                    Error al cargar clientes: {clientsQuery.error.message}
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {search.trim() ? (
                      <p className="text-sm">
                        No se encontraron clientes para "{search.trim()}"
                      </p>
                    ) : (
                      <>
                        <p className="text-sm">No hay clientes cargados aún</p>
                        <p className="text-xs mt-1">
                          Hacé clic en "Nuevo Cliente" para agregar uno
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                pageItems.map((client) => {
                  const whatsAppUrl = client.phone
                    ? buildWhatsAppUrl(client.phone)
                    : null;

                  return (
                    <tr key={client.id}>
                      <td className={`${tdClassName} font-medium`}>
                        {client.name}
                      </td>
                      <td className={tdClassName}>{client.phone || "—"}</td>
                      <td className={tdClassName}>{client.email || "—"}</td>
                      <td className={tdClassName}>{client.address || "—"}</td>

                      {/* Acciones */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-3">
                          {whatsAppUrl && (
                            <a
                              href={whatsAppUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir chat de WhatsApp"
                              className="text-[#25D366] hover:text-[#1da851]"
                            >
                              <WhatsAppIcon className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            type="button"
                            title="Modificar"
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                            onClick={() => handleEditClient(client)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            title="Eliminar"
                            className="text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => {
                              setClientToDelete(client);
                              setConfirmOpen(true);
                            }}
                            disabled={deletingId === client.id}
                          >
                            {deletingId === client.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <TablePagination {...pagination} onPageChange={setPage} />
      </div>

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editingClient}
        isSaving={isSaving}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar cliente"
        description={
          <>
            ¿Estás seguro de que querés eliminar a{" "}
            <strong>{clientToDelete?.name}</strong>? Esta acción no se puede
            deshacer.
          </>
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
