import { useMemo, useState } from "react";
import {
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { ClientFormDialog } from "./ClientFormDialog";
import { ClientUsersDialog } from "./ClientUsersDialog";
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
  // Modal de usuarios externos asignados al cliente
  const [usersClient, setUsersClient] = useState<Client | null>(null);
  const [usersOpen, setUsersOpen] = useState(false);

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

  const renderStatus = () => {
    if (clientsQuery.isLoading) return "Cargando clientes...";
    if (clientsQuery.isError)
      return (
        <span className="text-red-600 dark:text-red-400">
          Error al cargar clientes: {clientsQuery.error.message}
        </span>
      );
    if (filteredClients.length === 0)
      return search.trim() ? (
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
      );
    return null;
  };

  const status = renderStatus();

  // En la tabla van con size "icon-sm"; en las tarjetas del celular, más grandes para tocar
  const renderActions = (
    client: Client,
    size: "icon-sm" | "icon" = "icon-sm",
  ) => {
    const whatsAppUrl = client.phone ? buildWhatsAppUrl(client.phone) : null;

    return (
      <div className="flex items-center justify-end gap-1">
        {whatsAppUrl && (
          <Button
            asChild
            variant="ghost"
            size={size}
            className="text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#1da851]"
          >
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir chat de WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size={size}
          title="Usuarios con acceso"
          className="text-muted-foreground"
          onClick={() => {
            setUsersClient(client);
            setUsersOpen(true);
          }}
        >
          <Users className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size={size}
          title="Modificar"
          className="text-muted-foreground"
          onClick={() => handleEditClient(client)}
        >
          <Pencil className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size={size}
          title="Eliminar"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl md:text-4xl font-bold text-blue-600">
          Clientes
        </h1>
        <Button
          variant="success"
          onClick={handleNewClient}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
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
        {/* Celular: una tarjeta por cliente */}
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {status ? (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
              {status}
            </div>
          ) : (
            pageItems.map((client) => (
              <div key={client.id} className="px-4 py-3">
                <div className="space-y-1 text-sm min-w-0">
                  <p className="font-medium text-base text-gray-900 dark:text-gray-100 break-words">
                    {client.name}
                  </p>
                  {client.phone && (
                    <a
                      href={`tel:${client.phone}`}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                      {client.phone}
                    </a>
                  )}
                  {client.email && (
                    <a
                      href={`mailto:${client.email}`}
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 min-w-0"
                    >
                      <Mail className="w-4 h-4 shrink-0 text-gray-400" />
                      <span className="break-all">{client.email}</span>
                    </a>
                  )}
                  {client.address && (
                    <p className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                      <span className="break-words min-w-0">
                        {client.address}
                      </span>
                    </p>
                  )}
                </div>
                <div className="mt-1 -mr-2">{renderActions(client, "icon")}</div>
              </div>
            ))
          )}
        </div>

        {/* Escritorio: tabla */}
        <div className="hidden md:block overflow-x-auto">
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
              {status ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    {status}
                  </td>
                </tr>
              ) : (
                pageItems.map((client) => (
                  <tr key={client.id}>
                    <td className={`${tdClassName} font-medium`}>
                      {client.name}
                    </td>
                    <td className={tdClassName}>{client.phone || "—"}</td>
                    <td className={tdClassName}>{client.email || "—"}</td>
                    <td className={tdClassName}>{client.address || "—"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {renderActions(client)}
                    </td>
                  </tr>
                ))
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

      <ClientUsersDialog
        open={usersOpen}
        onOpenChange={setUsersOpen}
        client={usersClient}
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
