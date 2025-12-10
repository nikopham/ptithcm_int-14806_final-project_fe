import { Smartphone, Tablet, Tv2, Laptop, Gamepad2 } from "lucide-react";

/** Card props */
interface DeviceCardProps {
  Icon: React.ElementType;
  title: string;
  desc: string;
}

const DeviceCard = ({ Icon, title, desc }: DeviceCardProps) => (
  <div className="group relative overflow-hidden rounded-xl bg-white border border-gray-300 p-8 shadow-lg transition hover:-translate-y-1 hover:bg-gray-50">
    {/* icon */}
    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100">
      <Icon className="size-7" style={{ color: "#C40E61" }} />
    </div>

    <h3 className="mb-3 text-lg font-semibold" style={{ color: "#C40E61" }}>{title}</h3>
    <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
  </div>
);

export const DeviceSection = () => {
  const desc =
    "Streamify được tối ưu hóa cho cả điện thoại thông minh Android và iOS. Tải ứng dụng của chúng tôi từ Google Play Store hoặc Apple App Store";

  const data = [
    { Icon: Smartphone, title: "Điện Thoại Thông Minh" },
    { Icon: Tablet, title: "Máy Tính Bảng" },
    { Icon: Tv2, title: "Smart TV" },
    { Icon: Laptop, title: "Máy Tính Xách Tay" },
    { Icon: Gamepad2, title: "Máy Chơi Game" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24">
      {/* heading */}
      <div className="mb-14 max-w-3xl">
        <h2 className="mb-4 text-3xl font-extrabold text-gray-900 md:text-4xl">
          Trải Nghiệm Xem Phim Trên Mọi Thiết Bị
        </h2>
        <p className="text-gray-500">
          Với Streamify, bạn có thể thưởng thức những bộ phim và chương trình TV yêu thích
          mọi lúc, mọi nơi. Nền tảng của chúng tôi được thiết kế để tương thích với nhiều
          loại thiết bị, đảm bảo bạn không bao giờ bỏ lỡ khoảnh khắc giải trí nào.
        </p>
      </div>

      {/* grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <DeviceCard key={item.title} {...item} desc={desc} />
        ))}
      </div>
    </section>
  );
};
