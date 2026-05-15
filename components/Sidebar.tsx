"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Home, FileText, 
  CreditCard, ScrollText, Users, Settings, MoreVertical 
} from "lucide-react";

const menuGroups = [
  {
    label: "TỔNG QUAN",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Phòng trọ", href: "/rooms", icon: Home, badge: "12" },
    ],
  },
  {
    label: "TÀI CHÍNH",
    items: [
      { name: "Hoá đơn", href: "/invoices", icon: FileText, badge: "3" },
      { name: "Thanh toán", href: "/payment", icon: CreditCard },
    ],
  },
  {
    label: "KHÁC",
    items: [
      { name: "Hợp đồng", href: "/contracts", icon: ScrollText },
      { name: "Khách thuê", href: "/tenants", icon: Users },
      { name: "Cài đặt", href: "/settings", icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-white flex flex-col h-full hidden md:flex">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
          <Home size={24} />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-none">Nhà Trọ Pro</h1>
        </div>
      </div>

      {/* Menu Navigation */}
      <nav className="flex-1 px-4 space-y-8 mt-4">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <h3 className="px-2 text-[10px] font-bold text-slate-400 tracking-wider mb-2">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-green-50 text-green-700 font-medium" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
            AN
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Anh Nguyễn</p>
            <span className="text-[10px] text-slate-500">Chủ nhà trọ</span>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600">
          <MoreVertical size={16} />
        </button>
      </div>
    </aside>
  );
}
