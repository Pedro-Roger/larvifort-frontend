"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-dvh flex overflow-hidden bg-[#f8f9fa] font-sans antialiased">
      <Sidebar />
      <div className="min-w-0 flex-1 flex flex-col min-h-dvh overflow-y-auto relative bg-[#f8f9fb] pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
