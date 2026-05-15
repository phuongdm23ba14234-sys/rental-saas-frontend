"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Zap } from "lucide-react";
import { ROOMS_API_URL } from "@/app/lib/api";

type Room = {
  id: number;
  name: string;
  price: number;
  description?: string;
  status: string;
  prevElectricity: number;
  currElectricity: number;
  electricityPrice?: number;
  serviceFee: number;
  tenantName?: string;
  occupants: number;
  isPaid: boolean;
};

const DEFAULT_ELECTRICITY_PRICE = 3500;

function money(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
}

function totalBill(room: Room) {
  const electric =
    Math.max(room.currElectricity - room.prevElectricity, 0) *
    (room.electricityPrice || DEFAULT_ELECTRICITY_PRICE);
  return room.price + electric + (room.serviceFee || 0);
}

const emptyForm = {
  name: "",
  price: "",
  description: "",
  tenantName: "",
  occupants: "1",
  electricityPrice: String(DEFAULT_ELECTRICITY_PRICE),
  serviceFee: "0",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [electricRoom, setElectricRoom] = useState<Room | null>(null);
  const [electricForm, setElectricForm] = useState({
    prev: "",
    curr: "",
    electricityPrice: String(DEFAULT_ELECTRICITY_PRICE),
  });

  const fetchRooms = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const res = await fetch(ROOMS_API_URL);
    const data = await res.json();
    setRooms(data);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    fetch(ROOMS_API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setRooms(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    return {
      total: rooms.length,
      occupied: rooms.filter((room) => room.tenantName).length,
      unpaid: rooms.filter((room) => !room.isPaid).length,
    };
  }, [rooms]);

  const openAdd = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setIsRoomFormOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setIsRoomFormOpen(true);
    setForm({
      name: room.name,
      price: String(room.price),
      description: room.description || "",
      tenantName: room.tenantName || "",
      occupants: String(room.occupants || 0),
      electricityPrice: String(room.electricityPrice || DEFAULT_ELECTRICITY_PRICE),
      serviceFee: String(room.serviceFee || 0),
    });
  };

  const closeRoomForm = () => {
    setEditingRoom(null);
    setForm(emptyForm);
    setIsRoomFormOpen(false);
  };

  const saveRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingRoom ? `${ROOMS_API_URL}/${editingRoom.id}` : ROOMS_API_URL;
    const method = editingRoom ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          description: form.description,
          tenantName: form.tenantName,
          occupants: Number(form.occupants),
          electricityPrice: Number(form.electricityPrice),
          serviceFee: Number(form.serviceFee),
        }),
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || `Lỗi ${res.status}`);
      }

      closeRoomForm();
      fetchRooms();
    } catch (error) {
      console.error(error);
      alert(`Không lưu được phòng. ${error instanceof Error ? error.message : ""}`);
    }
  };

  const deleteRoom = async (room: Room) => {
    if (!confirm(`Xoá ${room.name}?`)) return;
    await fetch(`${ROOMS_API_URL}/${room.id}`, { method: "DELETE" });
    fetchRooms();
  };

  const togglePaid = async (room: Room) => {
    await fetch(`${ROOMS_API_URL}/${room.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPaid: !room.isPaid }),
    });
    fetchRooms();
  };

  const openElectric = (room: Room) => {
    setElectricRoom(room);
    setElectricForm({
      prev: String(room.currElectricity || 0),
      curr: String(room.currElectricity || 0),
      electricityPrice: String(room.electricityPrice || DEFAULT_ELECTRICITY_PRICE),
    });
  };

  const saveElectric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!electricRoom) return;

    await fetch(`${ROOMS_API_URL}/${electricRoom.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prevElectricity: Number(electricForm.prev),
        currElectricity: Number(electricForm.curr),
        electricityPrice: Number(electricForm.electricityPrice),
      }),
    });

    setElectricRoom(null);
    fetchRooms();
  };

  if (loading) {
    return <div className="text-sm text-slate-500">Đang tải phòng...</div>;
  }

  return (
    <div className="space-y-5">
      <header className="bg-white border rounded-xl px-5 py-4 flex items-center gap-3">
        <div className="flex-1">
          <h1 className="font-bold text-slate-800">Phòng trọ</h1>
          <p className="text-xs text-slate-500">
            {summary.total} phòng, {summary.occupied} đang thuê, {summary.unpaid} chưa thanh toán
          </p>
        </div>
        <button onClick={openAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus size={16} />
          Thêm phòng
        </button>
      </header>

      <section
        className={`grid grid-cols-1 gap-4 ${
          isRoomFormOpen ? "lg:grid-cols-[1fr_360px]" : ""
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white border rounded-xl p-4 hover:border-green-500 transition">
              <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-extrabold mb-3">
                {room.name.replace(/\D/g, "") || room.id}
              </div>

              <h2 className="font-bold text-slate-800">{room.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{room.tenantName || "Chưa có khách"}</p>
              <p className="text-sm font-semibold text-slate-800 mt-3">{money(room.price)}/tháng</p>
              <p className="text-xs text-slate-500 mt-1">
                Điện {money(room.electricityPrice || DEFAULT_ELECTRICITY_PRICE)}/kWh
              </p>

              <div className="flex gap-2 flex-wrap mt-3">
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                  {room.occupants || 0} người
                </span>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${room.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                  {room.isPaid ? "Đã thu" : "Chưa thu"}
                </span>
              </div>

              <div className="mt-4 border-t pt-3 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Tổng tháng này</span>
                  <strong className="text-slate-800">{money(totalBill(room))}</strong>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                <button onClick={() => openElectric(room)} className="h-9 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                  <Zap size={16} />
                </button>
                <button onClick={() => togglePaid(room)} className="h-9 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                  Thu
                </button>
                <button onClick={() => openEdit(room)} className="h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Pencil size={16} />
                </button>
                <button onClick={() => deleteRoom(room)} className="h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {isRoomFormOpen && (
          <form onSubmit={saveRoom} className="bg-white border rounded-xl p-4 h-fit space-y-3">
            <h2 className="font-bold text-slate-800">{editingRoom ? "Sửa phòng" : "Thêm phòng"}</h2>

            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tên phòng" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Giá thuê" type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Tên khách thuê" value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} />

            <div className="grid grid-cols-2 gap-2">
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Số người" type="number" value={form.occupants} onChange={(e) => setForm({ ...form, occupants: e.target.value })} />
              <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Phí dịch vụ" type="number" value={form.serviceFee} onChange={(e) => setForm({ ...form, serviceFee: e.target.value })} />
            </div>

            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Đơn giá điện / kWh" type="number" value={form.electricityPrice} onChange={(e) => setForm({ ...form, electricityPrice: e.target.value })} />

            <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none" rows={3} placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold">Lưu</button>
              <button type="button" onClick={closeRoomForm} className="px-4 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-semibold">Huỷ</button>
            </div>
          </form>
        )}
      </section>

      {electricRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={saveElectric} className="bg-white rounded-xl p-5 w-full max-w-sm space-y-3">
            <h2 className="font-bold text-slate-800">Ghi điện - {electricRoom.name}</h2>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" placeholder="Chỉ số cũ" value={electricForm.prev} onChange={(e) => setElectricForm({ ...electricForm, prev: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" placeholder="Chỉ số mới" value={electricForm.curr} onChange={(e) => setElectricForm({ ...electricForm, curr: e.target.value })} />
            <input className="w-full border rounded-lg px-3 py-2 text-sm" type="number" placeholder="Đơn giá điện / kWh" value={electricForm.electricityPrice} onChange={(e) => setElectricForm({ ...electricForm, electricityPrice: e.target.value })} />
            <div className="flex gap-2">
              <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold">Lưu</button>
              <button type="button" onClick={() => setElectricRoom(null)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-semibold">Huỷ</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
