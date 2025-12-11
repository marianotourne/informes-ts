import { Aerobias } from "./Aerobias";
import { Bacterias } from "./Bacterias";
import { Coliformes } from "./Coliformes";
import { Escherichia } from "./Escherichia";
import { Pseudomona } from "./Pseudomona";

export function ResultadosAgua() {
  return (
    <section className="mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Datos de la muestra
      </h2>
      <div className="space-y-4">
        <Aerobias />
        <Bacterias />
        <Coliformes />
        <Escherichia />
        <Pseudomona />
      </div>
    </section>
  );
}

