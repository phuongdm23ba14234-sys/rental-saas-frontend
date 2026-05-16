"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  QrCode,
  RefreshCcw,
  Search,
  WalletCards,
} from "lucide-react";
import { ROOMS_API_URL } from "@/app/lib/api";

type Room = {
  id: number;
  name: string;
  price: number;
  serviceFee: number;
  prevElectricity: number;
  currElectricity: number;
  electricityPrice?: number;
  tenantName?: string | null;
  isPaid: boolean;
};

type BankSettings = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferTemplate: string;
};

const DEFAULT_ELECTRICITY_PRICE = 3500;
const BANK_STORAGE_KEY = "rental-saas-bank-settings";
const DEFAULT_BANK_SETTINGS: BankSettings = {
  bankName: "MB Bank",
  accountNumber: "123456789",
  accountName: "NGUYEN VAN A",
  transferTemplate: "{room} TIEN TRO",
};

function money(value: number) {
  return value.toLocaleString("vi-VN") + " đ";
}

function totalBill(room: Room) {
  const electricityUsage = Math.max(room.currElectricity - room.prevElectricity, 0);
  const electricityTotal =
    electricityUsage * (room.electricityPrice || DEFAULT_ELECTRICITY_PRICE);

  return room.price + electricityTotal + (room.serviceFee || 0);
}

function transferContent(room: Room, template: string) {
  return template
    .replaceAll("{room}", room.name)
    .replaceAll("{tenant}", room.tenantName || "KHACH THUE")
    .replaceAll("{amount}", String(totalBill(room)));
}

export default function PaymentPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [query, setQuery] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [settings, setSettings] = useState<BankSettings>(DEFAULT_BANK_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [savingRoomId, setSavingRoomId] = useState<number | null>(null);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(ROOMS_API_URL);
      const data = await res.json();
      setRooms(data);
      setSelectedRoomId((current) => current ?? data.find((room: Room) => !room.isPaid)?.id ?? null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedSettings = window.localStorage.getItem(BANK_STORAGE_KEY);
    if (savedSettings) {
      setSettings({ ...DEFAULT_BANK_SETTINGS, ...JSON.parse(savedSettings) });
    }

    fetchRooms();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const unpaidRooms = useMemo(() => rooms.filter((room) => !room.isPaid), [rooms]);
  const paidRooms = useMemo(() => rooms.filter((room) => room.isPaid), [rooms]);
  const selectedRoom =
    rooms.find((room) => room.id === selectedRoomId) || unpaidRooms[0] || rooms[0] || null;

  const filteredRooms = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return unpaidRooms;

    return unpaidRooms.filter((room) => {
      return (
        room.name.toLowerCase().includes(keyword) ||
        (room.tenantName || "").toLowerCase().includes(keyword)
      );
    });
  }, [query, unpaidRooms]);

  const paymentSummary = useMemo(() => {
    const unpaidTotal = unpaidRooms.reduce((sum, room) => sum + totalBill(room), 0);
    const paidTotal = paidRooms.reduce((sum, room) => sum + totalBill(room), 0);

    return {
      unpaidCount: unpaidRooms.length,
      paidCount: paidRooms.length,
      unpaidTotal,
      paidTotal,
    };
  }, [paidRooms, unpaidRooms]);

  const markAsPaid = async (room: Room) => {
    setSavingRoomId(room.id);
    try {
      const res = await fetch(`${ROOMS_API_URL}/${room.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: true }),
      });

      if (!res.ok) throw new Error("Không thể xác nhận thanh toán");

      await fetchRooms();
    } catch (error) {
      console.error(error);
      alert("Xác nhận thanh toán thất bại. Kiểm tra lại backend rồi thử lại.");
    } finally {
      setSavingRoomId(null);
    }
  };

  const copyPaymentInfo = async () => {
    if (!selectedRoom) return;

    const content = [
      `Ngan hang: ${settings.bankName}`,
      `So tai khoan: ${settings.accountNumber}`,
      `Chu tai khoan: ${settings.accountName}`,
      `So tien: ${money(totalBill(selectedRoom))}`,
      `Noi dung: ${transferContent(selectedRoom, settings.transferTemplate)}`,
    ].join("\n");

    await navigator.clipboard.writeText(content);
    alert("Đã sao chép thông tin thanh toán.");
  };

  return (
    <div className="space-y-5">
      <header className="bg-white border rounded-xl px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-slate-800">Thanh toán</h1>
          <p className="text-xs text-slate-500">
            Theo dõi khoản phải thu và xác nhận thanh toán từ khách thuê
          </p>
        </div>
        <button
          onClick={fetchRooms}
          className="h-9 px-3 rounded-lg bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-2 w-fit"
        >
          <RefreshCcw size={15} />
          Làm mới
        </button>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Stat label="Chưa thanh toán" value={paymentSummary.unpaidCount.toString()} tone="red" />
        <Stat label="Đã thanh toán" value={paymentSummary.paidCount.toString()} tone="green" />
        <Stat label="Cần thu" value={money(paymentSummary.unpaidTotal)} tone="amber" />
        <Stat label="Đã thu" value={money(paymentSummary.paidTotal)} tone="blue" />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-4">
        <div className="space-y-4">
          <div className="bg-white border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <WalletCards size={21} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Tài khoản nhận tiền</h2>
                <p className="text-xs text-slate-500">Lưu trên trình duyệt của bạn</p>
              </div>
            </div>

            <div className="space-y-3">
              <Field
                label="Ngân hàng"
                value={settings.bankName}
                onChange={(value) => setSettings({ ...settings, bankName: value })}
              />
              <Field
                label="Số tài khoản"
                value={settings.accountNumber}
                onChange={(value) => setSettings({ ...settings, accountNumber: value })}
              />
              <Field
                label="Chủ tài khoản"
                value={settings.accountName}
                onChange={(value) => setSettings({ ...settings, accountName: value })}
              />
              <Field
                label="Nội dung chuyển khoản"
                value={settings.transferTemplate}
                onChange={(value) => setSettings({ ...settings, transferTemplate: value })}
              />
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-green-600 text-white flex items-center justify-center">
                <QrCode size={22} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800">Thông tin chuyển khoản</h2>
                <p className="text-xs text-slate-500">Chọn một phòng để tạo nội dung</p>
              </div>
            </div>

            {selectedRoom ? (
              <div className="border border-dashed rounded-xl bg-slate-50 p-4">
                <div className="w-32 h-32 bg-white border rounded-lg mx-auto p-3 grid grid-cols-6 gap-1">
                  {Array.from({ length: 36 }).map((_, index) => (
                    <div
                      key={index}
                      className={`rounded-sm ${
                        [
                          0, 1, 2, 6, 12, 18, 24, 30, 31, 32, 5, 11, 17, 23, 29,
                          35, 14, 15, 20, 21, 27,
                        ].includes(index)
                          ? "bg-slate-900"
                          : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <PaymentLine label="Phòng" value={selectedRoom.name} />
                  <PaymentLine label="Số tiền" value={money(totalBill(selectedRoom))} strong />
                  <PaymentLine
                    label="Nội dung"
                    value={transferContent(selectedRoom, settings.transferTemplate)}
                  />
                </div>

                <button
                  onClick={copyPaymentInfo}
                  className="mt-4 w-full h-10 rounded-lg bg-slate-900 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Clipboard size={16} />
                  Sao chép thông tin
                </button>
              </div>
            ) : (
              <div className="rounded-xl border bg-slate-50 p-4 text-sm text-slate-500">
                Chưa có phòng cần thanh toán.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-bold text-slate-800">Danh sách cần thu</h2>
              <p className="text-xs text-slate-500">Bấm xác nhận khi đã nhận tiền</p>
            </div>
            <label className="relative block md:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm phòng hoặc khách thuê"
                className="w-full h-10 rounded-lg border pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </label>
          </div>

          {isLoading ? (
            <div className="p-5 text-sm text-slate-500">Đang tải dữ liệu thanh toán...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-5 text-sm text-slate-500">
              Không có khoản chưa thanh toán phù hợp.
            </div>
          ) : (
            <div className="divide-y">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full text-left p-4 hover:bg-green-50/60 transition ${
                    selectedRoom?.id === room.id ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{room.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                          Chưa thu
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {room.tenantName || "Chưa có khách"} ·{" "}
                        {Math.max(room.currElectricity - room.prevElectricity, 0)} kWh
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800">
                          {money(totalBill(room))}
                        </div>
                        <div className="text-xs text-slate-500">Tổng cần thu</div>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          markAsPaid(room);
                        }}
                        disabled={savingRoomId === room.id}
                        className="h-9 px-3 rounded-lg bg-green-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        {savingRoomId === room.id ? "Đang lưu" : "Đã thu"}
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "red" | "green" | "amber" | "blue";
}) {
  const tones = {
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className={`w-fit rounded-lg px-2 py-1 text-[11px] font-bold ${tones[tone]}`}>
        {label}
      </div>
      <div className="mt-3 text-xl font-extrabold text-slate-800">{value}</div>
    </div>
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
        className="w-full border rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-400"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PaymentLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={`text-right ${strong ? "font-bold text-green-700" : "font-semibold text-slate-800"}`}>
        {value}
      </span>
    </div>
  );
}
