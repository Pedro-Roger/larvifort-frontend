import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LarviFort CRM",
  description: "Sistema de gestão de relacionamento com clientes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>{children}</ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
