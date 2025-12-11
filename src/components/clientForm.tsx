import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ClientFormData } from "@/lib/zodSchemas";
import { clientSchema } from "@/lib/zodSchemas";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface Props {
  onSubmit: (data: ClientFormData) => void;
}

export function ClientForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const submit = (data: ClientFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex gap-4 items-start">
      <div className="flex flex-col">
        <Input placeholder="Nombre del cliente" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <Button type="submit">Agregar</Button>
    </form>
  );
}
