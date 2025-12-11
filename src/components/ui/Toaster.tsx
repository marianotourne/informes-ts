// src/components/ui/Toaster.tsx
import { useEffect, useState } from "react";

type ToastEventDetail = {
  title: string;
  description?: string;
};

export function Toaster() {
  const [toasts, setToasts] = useState<
    { id: number; title: string; description?: string }[]
  >([]);

  useEffect(() => {
    const handler = (e: CustomEvent<ToastEventDetail>) => {
      setToasts((prev) => [...prev, { id: Date.now(), ...e.detail }]);

      // remover después de 2.5s
      setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 2500);
    };

    // Listener compatible con TypeScript
    const wrappedHandler = handler as unknown as EventListener;

    window.addEventListener("toast", wrappedHandler);
    return () => window.removeEventListener("toast", wrappedHandler);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="p-4 bg-gray-900 text-white rounded-xl shadow-lg animate-fade-in"
        >
          <p className="font-semibold">{t.title}</p>
          {t.description && (
            <p className="text-sm opacity-80">{t.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}
