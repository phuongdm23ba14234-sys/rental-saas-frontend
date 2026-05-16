import type { Metadata, Viewport } from "next";
import "./globals.css"; // Đảm bảo bạn đã có file này
import Sidebar from "@/components/Sidebar";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Nhà Trọ Pro",
  description: "Manage rental rooms, tenants, invoices, electricity usage, service fees, and payment status.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Rental SaaS",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 flex h-screen overflow-hidden">
        <ServiceWorkerRegister />
        {/* Sidebar bên trái */}
        <Sidebar />
        
        {/* Vùng nội dung bên phải */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
