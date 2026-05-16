import type { Metadata, Viewport } from "next";
import "./globals.css"; // Đảm bảo bạn đã có file này
import AppShell from "@/components/AppShell";

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
      <AppShell>{children}</AppShell>
    </html>
  );
}
