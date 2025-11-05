import { CheckCircle, Ban } from "lucide-react";

export const statusMap = {
  active: {
    label: "Hoạt động",
    color: "bg-green-100 text-green-700",
    Icon: CheckCircle,
    action: { label: "Khóa", next: "inactive" },
  },
  inactive: {
    label: "Khóa",
    color: "bg-gray-100 text-gray-600",
    Icon: Ban,
    action: { label: "Mở khóa", next: "active" },
  },
};

export const genderMap = {
  male: { label: "Nam", color: "bg-indigo-100 text-indigo-700" },
  female: { label: "Nữ", color: "bg-pink-100 text-pink-700" },
  other: { label: "Khác", color: "bg-slate-100 text-slate-700" },
};
