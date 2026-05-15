"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Building2, DoorOpen, Receipt, Wallet } from "lucide-react";
import { ROOMS_API_URL } from "@/app/lib/api";

type Room = {
  id: number;
  name: string;
  price: number;
  description?: string;
  status: string;
  prevElectricity: number;
  currElectricity: number;
  serviceFee: number;
  tenantName?: string;
  occupants: number;
  isPaid: boolean;
};

const ELECTRICITY_PRICE = 3500;

function money(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
}

function totalBill(room: Room) {
  const electric = Math.max(room.currElectricity - room.prevElectricity, 0) * ELECTRICITY_PRICE;
  return room.price + electric + (room.serviceFee || 0);
}

export default function DashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ROOMS_API_URL)
      .then((res) => res.json())
      .then(setRooms)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const paidRooms = rooms.filter((room) => room.isPaid);
    const unpaidRooms = rooms.filter((room) => !room.isPaid);
    const occupiedRooms = rooms.filter((room) => room.tenantName && room.tenantName !== "Chưa có khách");

    return {
      totalRooms: rooms.length,
      occupiedRooms: occupiedRooms.length,
      unpaidRooms: unpaidRooms.length,
      revenue: paidRooms.reduce((sum, room) => sum + totalBill(room), 0),
    };
  }, [rooms]);

  if (loading) {
    return <div className="text-sm text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-5">
      <header className="h-13 bg-white border rounded-xl px-5 py-4 flex items-center gap-3">
        <h1 className="font-bold text-slate-800 flex-1">Dashboard</h1>
        <button className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          <Bell size={18} />
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon={<Building2 size={19} />} label="Tổng phòng" value={stats.totalRooms.toString()} tone="green" />
        <StatCard icon={<DoorOpen size={19} />} label="Đang thuê" value={stats.occupiedRooms.toString()} tone="blue" />
        <StatCard icon={<Receipt size={19} />} label="Chưa thanh toán" value={stats.unpaidRooms.toString()} tone="red" />
        <StatCard icon={<Wallet size={19} />} label="Doanh thu đã thu" value={money(stats.revenue)} tone="amber" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-4">
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Hoá đơn gần đây</h2>
            <span className="text-xs font-semibold text-green-600">Xem tất cả</span>
          </div>

          {rooms.slice(0, 6).map((room) => (
            <div key={room.id} className="px-4 py-3 border-b last:border-b-0 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">
                {room.name.replace(/\D/g, "") || room.id}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{room.tenantName || "Phòng trống"}</div>
                <div className="text-xs text-slate-500">{room.name}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-sm font-bold text-slate-800">{money(totalBill(room))}</div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${room.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {room.isPaid ? "Đã thu" : "Chưa thu"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-bold text-slate-800">Tình trạng phòng</h2>
          </div>

          {rooms.slice(0, 6).map((room) => (
            <div key={room.id} className="px-4 py-3 border-b last:border-b-0 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${room.tenantName ? "bg-green-500" : "bg-slate-300"}`} />
              <div>
                <div className="text-sm font-semibold text-slate-800">{room.name}</div>
                <div className="text-xs text-slate-500">{room.tenantName || "Chưa có khách"}</div>
              </div>
              <span className="ml-auto text-xs font-semibold text-slate-500">
                {room.tenantName ? "Đang thuê" : "Trống"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "green" | "blue" | "red" | "amber";
}) {
  const toneClass = {
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-700",
  }[tone];

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${toneClass}`}>
        {icon}
      </div>
      <div className="text-xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
