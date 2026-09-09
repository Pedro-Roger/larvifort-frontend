"use client";

import { ReactNode } from "react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/ui/Toast";

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { toasts } = useToast();

  return (
    <>
      {children}
      {toasts.length > 0 && <ToastContainer />}
    </>
  );
};