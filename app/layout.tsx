import type { Metadata } from "next";
import "./globals.css"; // Đảm bảo bạn đã có file này
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "NhàTrọ Pro - Quản lý khu trọ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 flex h-screen overflow-hidden">
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