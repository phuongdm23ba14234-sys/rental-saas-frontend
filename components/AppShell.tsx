"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ServiceWorkerRegister from "@/app/ServiceWorkerRegister";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <body className="bg-slate-50 text-slate-900 h-screen overflow-hidden">
      <ServiceWorkerRegister />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex h-full min-w-0 flex-col">
        <header className="h-14 shrink-0 border-b bg-white px-4 flex items-center gap-3">
          <button
            type="button"
            aria-label="Mở menu"
            onClick={() => setIsSidebarOpen(true)}
            className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200"
          >
            <Menu size={21} />
          </button>
          <div>
            <div className="text-sm font-bold leading-none text-slate-800">Nhà Trọ Pro</div>
            <div className="text-[11px] text-slate-500 mt-1">Quản lý phòng trọ</div>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="h-full overflow-y-auto p-4 md:p-8">{children}</div>
        </main>
      </div>
    </body>
  );
}
