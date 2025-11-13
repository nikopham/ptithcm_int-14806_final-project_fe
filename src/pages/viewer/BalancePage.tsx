import { useState } from "react";
import {
  ChevronRight,
  Coins,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import clsx from "clsx";
import { BankTransferInfo } from "@/components/viewer/BankTransferInfo";

/* ─── mock user ─── */
const me = {
  name: "harry maguire",
  avatar: "https://i.pravatar.cc/120?img=12",
  balance: 0,
};

/* ─── packages & payments ─── */
const packs = [
  { id: "100k", label: "Gói 100K", amount: 100_000 },
  { id: "200k", label: "Gói 200K", amount: 200_000 },
  { id: "500k", label: "Gói 500K", amount: 500_000 },
  { id: "1m", label: "Gói 1M", amount: 1_000_000 },
];

const payments = [
  { id: "bank", icon: CreditCard, label: "Chuyển khoản\nngân hàng" },
  { id: "momo", icon: Wallet, label: "Thanh toán ví\nMomo" },
  { id: "telco", icon: Smartphone, label: "Thanh toán bằng thẻ\ndiện thoại" },
];

export default function BalancePage() {
  const [pack, setPack] = useState("100k");
  const [method, setMethod] = useState<string | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 text-white">
      {/* title */}
      <h1 className="mb-10 text-center text-3xl font-extrabold md:text-4xl">
        Nạp Ro-coin vào tài khoản
      </h1>

      {/* user header */}
      <div className="mx-auto mb-12 flex max-w-sm flex-col items-center gap-2">
        <img
          src={me.avatar}
          alt={me.name}
          className="h-20 w-20 rounded-full border-2 border-red-500 object-cover"
        />
        <p className="text-sm font-medium">{me.name}</p>
        <p className="flex items-center gap-1 text-sm text-zinc-300">
          <Coins className="size-4 text-red-400" /> số dư
          <span className="font-semibold text-white">{me.balance}</span>
        </p>
        <a
          href="#"
          className="flex items-center gap-1 text-xs text-red-400 hover:underline"
        >
          Xem lịch sử nạp <ChevronRight className="size-3" />
        </a>
      </div>

      {/* step 1 */}
      <h2 className="mb-4 text-lg font-semibold text-red-400">
        Bước 1: <span className="text-white">Chọn gói Ro-coin thích hợp</span>
      </h2>

      <RadioGroup
        value={pack}
        onValueChange={setPack}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {packs.map((p) => (
          <label
            key={p.id}
            className={clsx(
              "relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl bg-gradient-to-br from-red-800/60 to-indigo-900/60 text-center hover:ring-2 hover:ring-red-500",
              pack === p.id && "ring-2 ring-red-400"
            )}
          >
            <p className="mb-1 text-sm font-semibold">{p.label}</p>
            <p className="text-xs text-zinc-300">
              {p.amount.toLocaleString("vi-VN")} vnđ
            </p>

            {/* radio circle */}
            <RadioGroupItem value={p.id} className="absolute bottom-4" />
          </label>
        ))}
      </RadioGroup>

      {/* step 2 */}
      <h2 className="my-6 text-lg font-semibold text-red-400">
        Bước 2: <span className="text-white">Chọn phương thức thanh toán</span>
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {payments.map((pm) => {
          const active = method === pm.id;
          return (
            <div
              key={pm.id}
              className={clsx(
                "rounded-xl bg-zinc-800/40 p-6",
                active && "ring-2 ring-red-400"
              )}
            >
              <pm.icon className="mb-4 size-8 text-red-300" />
              <p className="mb-6 whitespace-pre-line text-sm font-medium text-white">
                {pm.label}
              </p>

              <Button
                variant="secondary"
                className={clsx(
                  "w-full bg-zinc-700",
                  active && "bg-red-400 text-black hover:bg-red-500"
                )}
                onClick={() => setMethod(pm.id)}
              >
                Chọn
              </Button>
            </div>
          );
        })}
      </div>
      {method === "bank" && (
        <BankTransferInfo
          amount={packs.find((p) => p.id === pack)!.amount}
          bank="MB QUÂN ĐỘI"
          account="797921127979"
          holder="LE DUC KHANH"
          orderCode="1fn6z09"
          minutes={30}
        />
      )}
      {/* info box */}
      <div className="mt-16 flex max-w-xl gap-4 rounded-lg bg-zinc-800/40 p-6">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-red-400 text-black">
          ✨
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-white">Ro-Coin là gì?</p>
          <p className="text-zinc-400">
            Với Ro-Coin, các bạn có thể nâng cấp tài khoản, tắt quảng cáo, xem
            phim chất lượng cao và cá nhân hoá thông tin của bạn. Rất nhiều tiện
            ích có thể sử dụng trong hệ sinh thái của Rỗ. Hãy cùng đón chờ nhé.
          </p>
        </div>
      </div>
    </section>
  );
}
