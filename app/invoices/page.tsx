"use client";

import { useEffect, useMemo, useState } from "react";

type Room = {
  id: number;
  name: string;
  price: number;
  serviceFee: number;
  prevElectricity: number;
  currElectricity: number;
  tenantName?: string;
  isPaid: boolean;
};

type InvoiceForm = {
  prevElectricity: string;
  currElectricity: string;
  serviceFee: string;
};

const API_URL = "http://localhost:8080/rooms";
const ELECTRICITY_PRICE = 3500;

function money(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
}

function totalBill(room: Room) {
  const electric = Math.max(room.currElectricity - room.prevElectricity, 0) * ELECTRICITY_PRICE;
  return room.price + electric + (room.serviceFee || 0);
}

export default function InvoicesPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<InvoiceForm>({
    prevElectricity: "0",
    currElectricity: "0",
    serviceFee: "0",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchRooms = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setRooms(data);
  };

  useEffect(() => {
    let isMounted = true;

    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setRooms(data);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const invoices = useMemo(() => {
    if (filter === "paid") return rooms.filter((room) => room.isPaid);
    if (filter === "unpaid") return rooms.filter((room) => !room.isPaid);
    return rooms;
  }, [rooms, filter]);

  const openEdit = (room: Room) => {
    setEditingRoom(room);
    setForm({
      prevElectricity: String(room.prevElectricity || 0),
      currElectricity: String(room.currElectricity || 0),
      serviceFee: String(room.serviceFee || 0),
    });
  };

  const closeEdit = () => {
    setEditingRoom(null);
    setForm({
      prevElectricity: "0",
      currElectricity: "0",
      serviceFee: "0",
    });
  };

  const saveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    const prevElectricity = Number(form.prevElectricity);
    const currElectricity = Number(form.currElectricity);
    const serviceFee = Number(form.serviceFee);

    if (currElectricity < prevElectricity) {
      alert("Số điện tháng này không được nhỏ hơn số điện tháng trước.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/${editingRoom.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prevElectricity,
          currElectricity,
          serviceFee,
        }),
      });

      if (!res.ok) throw new Error("Không thể cập nhật hoá đơn");

      await fetchRooms();
      closeEdit();
    } catch (error) {
      console.error(error);
      alert("Lưu hoá đơn thất bại. Kiểm tra lại backend rồi thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const previewRoom = editingRoom
    ? {
        ...editingRoom,
        prevElectricity: Number(form.prevElectricity),
        currElectricity: Number(form.currElectricity),
        serviceFee: Number(form.serviceFee),
      }
    : null;

  return (
    <div className="space-y-5">
      <header className="bg-white border rounded-xl px-5 py-4">
        <h1 className="font-bold text-slate-800">Hoá đơn</h1>
        <p className="text-xs text-slate-500">Theo dõi tiền phòng, điện và phí dịch vụ hàng tháng</p>
      </header>

      <div className="flex gap-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Tất cả</FilterButton>
        <FilterButton active={filter === "paid"} onClick={() => setFilter("paid")}>Đã thu</FilterButton>
        <FilterButton active={filter === "unpaid"} onClick={() => setFilter("unpaid")}>Chưa thu</FilterButton>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr_90px] gap-3 px-4 py-3 bg-slate-50 border-b text-[11px] font-bold uppercase text-slate-500">
            <div>Khách thuê</div>
            <div>Tiền phòng</div>
            <div>Tiền điện</div>
            <div>Dịch vụ</div>
            <div>Tổng</div>
            <div></div>
          </div>

          {invoices.map((room) => {
            const electric = Math.max(room.currElectricity - room.prevElectricity, 0) * ELECTRICITY_PRICE;

            return (
              <div
                key={room.id}
                className={`grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr_90px] gap-3 px-4 py-3 border-b last:border-b-0 items-center text-sm ${
                  editingRoom?.id === room.id ? "bg-green-50/50" : ""
                }`}
              >
                <div>
                  <div className="font-semibold text-slate-800">{room.tenantName || "Phòng trống"}</div>
                  <div className="text-xs text-slate-500">
                    {room.name} · {room.currElectricity - room.prevElectricity} kWh
                  </div>
                </div>
                <div className="text-slate-700">{money(room.price)}</div>
                <div className="text-slate-700">{money(electric)}</div>
                <div className="text-slate-700">{money(room.serviceFee || 0)}</div>
                <div>
                  <div className="font-bold text-slate-800">{money(totalBill(room))}</div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${room.isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {room.isPaid ? "Đã thu" : "Chưa thu"}
                  </span>
                </div>
                <button
                  onClick={() => openEdit(room)}
                  className="h-8 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-green-100 hover:text-green-700"
                >
                  Sửa
                </button>
              </div>
            );
          })}
        </div>

        <form onSubmit={saveInvoice} className="bg-white border rounded-xl p-4 h-fit space-y-4">
          <div>
            <h2 className="font-bold text-slate-800">Chỉnh hoá đơn</h2>
            <p className="text-xs text-slate-500 mt-1">
              {editingRoom
                ? `${editingRoom.name} · ${editingRoom.tenantName || "Phòng trống"}`
                : "Bấm Sửa ở một hoá đơn để cập nhật"}
            </p>
          </div>

          <fieldset disabled={!editingRoom || isSaving} className="space-y-3 disabled:opacity-50">
            <Field
              label="Số điện tháng trước"
              value={form.prevElectricity}
              onChange={(value) => setForm({ ...form, prevElectricity: value })}
            />
            <Field
              label="Số điện tháng này"
              value={form.currElectricity}
              onChange={(value) => setForm({ ...form, currElectricity: value })}
            />
            <Field
              label="Tiền dịch vụ"
              value={form.serviceFee}
              onChange={(value) => setForm({ ...form, serviceFee: value })}
            />
          </fieldset>

          {previewRoom && (
            <div className="rounded-xl bg-slate-50 border p-3 text-sm space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Tiền phòng</span>
                <strong className="text-slate-700">{money(previewRoom.price)}</strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>
                  Tiền điện ({Math.max(previewRoom.currElectricity - previewRoom.prevElectricity, 0)} kWh)
                </span>
                <strong className="text-slate-700">
                  {money(Math.max(previewRoom.currElectricity - previewRoom.prevElectricity, 0) * ELECTRICITY_PRICE)}
                </strong>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Dịch vụ</span>
                <strong className="text-slate-700">{money(previewRoom.serviceFee || 0)}</strong>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-slate-800">
                <span>Tổng cộng</span>
                <span className="text-green-700">{money(totalBill(previewRoom))}</span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              disabled={!editingRoom || isSaving}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Đang lưu..." : "Lưu hoá đơn"}
            </button>
            <button
              type="button"
              onClick={closeEdit}
              className="px-4 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-semibold"
            >
              Huỷ
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
        active ? "bg-green-600 border-green-600 text-white" : "bg-white text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
        {label}
      </span>
      <input
        type="number"
        min={0}
        className="w-full border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
