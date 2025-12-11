import { createContext, useContext } from "react";

export const ToastContext = createContext<unknown>(null);

export function useToast() {
  return useContext(ToastContext);
}

export const toast = (props: { title: string; description?: string }) => {
  const event = new CustomEvent("toast", { detail: props });
  window.dispatchEvent(event);
};
