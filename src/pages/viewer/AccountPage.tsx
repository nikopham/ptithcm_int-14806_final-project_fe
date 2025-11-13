import { useState } from "react";
import { Button } from "@/components/ui/button"; // shadcn/ui
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function AccountPage() {
  const [avatar] = useState("https://i.pravatar.cc/140?img=12");

  return (
    <section className="mx-auto max-w-3xl space-y-10">
      {/* heading */}
      <div>
        <h1 className="mb-1 text-2xl font-bold text-white">Account</h1>
        <p className="text-sm text-zinc-400">Update your account information</p>
      </div>

      {/* ---------- form body ---------- */}
      <form className="flex flex-col-reverse gap-10 md:grid md:grid-cols-[1fr_auto]">
        {/* ——— left column ——— */}
        <div className="space-y-6">
          {/* email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email</label>
            <Input
              defaultValue="toyotagyarisrally1@gmail.com"
              type="email"
              disabled
            />
          </div>

          {/* display name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Display Name
            </label>
            <Input defaultValue="harry maguire" />
          </div>

          {/* gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Gender</label>
            <RadioGroup defaultValue="other" className="flex gap-6">
              <label className="flex items-center gap-1 text-sm text-zinc-300">
                <RadioGroupItem value="male" />
                Male
              </label>
              <label className="flex items-center gap-1 text-sm text-zinc-300">
                <RadioGroupItem value="female" />
                Female
              </label>
              <label className="flex items-center gap-1 text-sm text-zinc-300">
                <RadioGroupItem value="other" />
                Other
              </label>
            </RadioGroup>
          </div>

          {/* update btn */}
          <Button className="bg-red-500 text-black hover:bg-red-600">
            Update
          </Button>

          {/* change pwd link */}
          <p className="text-sm text-zinc-400">
            To change your password, click{" "}
            <a href="#" className="font-medium text-red-500 hover:underline">
              here
            </a>
          </p>
        </div>

        {/* ——— avatar column ——— */}
        <div className="flex flex-col items-center gap-3 md:pt-2">
          <img
            src={avatar}
            className="h-32 w-32 rounded-full border-2 border-zinc-600 object-cover"
          />
          <span className="text-xs text-zinc-400">Available Avatar</span>
        </div>
      </form>
    </section>
  );
}
