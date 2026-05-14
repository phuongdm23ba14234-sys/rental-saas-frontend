"use client";

import { QrCode, WalletCards } from "lucide-react";

export default function PaymentPage() {
  return (
    <div className="space-y-5">
      <header className="bg-white border rounded-xl px-5 py-4">
        <h1 className="font-bold text-slate-800">Thanh toán</h1>
        <p className="text-xs text-slate-500">
          Thiết lập thông tin nhận tiền và mã QR cho khách thuê
        </p>
      </header>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <WalletCards size={22} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Tài khoản ngân hàng</h2>
              <p className="text-xs text-slate-500">Thông tin hiển thị trên hoá đơn</p>
            </div>
          </div>

          <div className="space-y-3">
            <Field label="Ngân hàng" value="MB Bank" />
            <Field label="Số tài khoản" value="123456789" />
            <Field label="Chủ tài khoản" value="NGUYEN VAN A" />
            <Field label="Nội dung chuyển khoản" value="TENPHONG - TIEN TRO THANG NAY" />
          </div>

          <div className="mt-5 flex items-center justify-between border-t pt-4">
            <div>
              <div className="text-sm font-semibold text-slate-800">Tự động đối soát</div>
              <div className="text-xs text-slate-500">Đánh dấu đã thu khi nhận thanh toán</div>
            </div>
            <div className="w-11 h-6 rounded-full bg-green-600 relative">
              <div className="w-5 h-5 rounded-full bg-white absolute right-0.5 top-0.5" />
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center">
              <QrCode size={24} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Mã QR thanh toán</h2>
              <p className="text-xs text-slate-500">Khách thuê quét mã để chuyển khoản</p>
            </div>
          </div>

          <div className="border border-dashed rounded-xl bg-slate-50 p-6 text-center">
            <div className="w-36 h-36 bg-slate-900 rounded-lg mx-auto p-3 grid grid-cols-6 gap-1">
              {Array.from({ length: 36 }).map((_, index) => (
                <div
                  key={index}
                  className={`rounded-sm ${
                    [
                      0, 1, 2, 6, 12, 18, 24, 30, 31, 32, 5, 11, 17, 23, 29, 35,
                      14, 15, 20, 21, 27,
                    ].includes(index)
                      ? "bg-white"
                      : "bg-slate-900"
                  }`}
                />
              ))}
            </div>

            <div className="mt-4 text-sm font-semibold text-slate-800">
              QR chuyển khoản nhanh
            </div>
            <div className="text-xs text-slate-500 mt-1">MB Bank - 123456789</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase font-bold text-slate-500 mb-1">
        {label}
      </span>
      <input
        className="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-800"
        value={value}
        readOnly
      />
    </label>
  );
}
