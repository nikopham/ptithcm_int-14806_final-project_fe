// src/components/payment/BankTransferInfo.tsx
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  amount: number; // 100_000
  bank: string; // "MB QUÂN ĐỘI"
  account: string; // "797921127979"
  holder: string; // "LE DUC KHANH"
  orderCode: string; // "1fn6z09"
  minutes?: number; // countdown
}

export const BankTransferInfo = ({
  amount,
  bank,
  account,
  holder,
  orderCode,
  minutes = 30,
}: Props) => {
  /* -------- countdown -------- */
  const [left, setLeft] = useState(minutes * 60); // seconds

  useEffect(() => {
    const id = setInterval(() => setLeft((t) => Math.max(t - 1, 0)), 1_000);
    return () => clearInterval(id);
  }, []);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  /* -------- ui -------- */
  return (
    <div className="rounded-xl border border-dashed border-zinc-600 p-6">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
        <span className="text-xl">🏦</span> Chuyển khoản ngân hàng
      </p>
      <p className="mb-6 text-xs font-medium text-teal-300">
        Chú ý nhập chính xác nội dung bên dưới
      </p>

      <div className="grid gap-6 md:grid-cols-[1fr_auto]">
        {/* table */}
        <table className="w-full text-sm text-zinc-300">
          <tbody className="divide-y divide-zinc-700">
            {[
              ["Ngân hàng", bank],
              ["Số tài khoản", account],
              ["Chủ tài khoản", holder],
              ["Số tiền", amount.toLocaleString("vi-VN") + " vnđ"],
              ["Nội dung", orderCode],
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="py-2 pr-4 font-medium text-zinc-400">{k}</td>
                <td className="py-2">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* qr + timer */}
        <div className="flex flex-col items-center justify-center gap-3">
          <QRCodeSVG
            value={`MB:${account}|${amount}|${orderCode}`}
            size={150}
            bgColor="#ffffff"
            fgColor="#000000"
            className="rounded-lg"
          />
          <p className="text-xs text-zinc-400">Thời gian còn lại</p>
          <p className="text-2xl font-bold text-white">
            {mm}:{ss}
          </p>
        </div>
      </div>
    </div>
  );
};
