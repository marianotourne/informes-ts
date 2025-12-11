import type { Client } from "../types/types";
import { Button } from "./ui/button";

interface Props {
  clients: Client[];
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export function ClientList({ clients, onDelete, onEdit }: Props) {
  return (
    <ul className="mt-6 space-y-2">
      {clients.map((c) => (
        <li
          key={c.id}
          className="flex justify-between items-center p-3 bg-white shadow rounded-lg"
        >
          <span>{c.name}</span>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => onEdit(c.id)}>
              Editar
            </Button>
            <Button variant="destructive" onClick={() => onDelete(c.id)}>
              Borrar
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
