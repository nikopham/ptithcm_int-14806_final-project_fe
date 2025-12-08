import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import clsx from "clsx";
import { Link } from "react-router-dom";

interface Faq {
  id: number;
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    id: 1,
    q: "Streamify là gì?",
    a: "Streamify là dịch vụ phát trực tuyến cho phép bạn xem phim và chương trình theo yêu cầu.",
  },
  { id: 2, q: "Streamify có giá bao nhiêu?", a: "Streamify cung cấp nhiều gói đăng ký với mức giá khác nhau. Bạn có thể xem chi tiết tại trang đăng ký." },
  { id: 3, q: "Nội dung nào có sẵn trên Streamify?", a: "Streamify cung cấp một thư viện phong phú các bộ phim, chương trình TV, phim tài liệu và nhiều nội dung khác từ nhiều thể loại khác nhau." },
  { id: 4, q: "Làm thế nào để xem Streamify?", a: "Bạn có thể xem Streamify trên nhiều thiết bị như điện thoại, máy tính bảng, Smart TV, máy tính xách tay và máy chơi game." },
  { id: 5, q: "Làm thế nào để đăng ký Streamify?", a: "Bạn có thể đăng ký bằng cách nhấp vào nút 'Đăng ký' ở góc trên bên phải và làm theo hướng dẫn." },
  { id: 6, q: "Gói dùng thử miễn phí của Streamify là gì?", a: "Streamify cung cấp gói dùng thử miễn phí để bạn trải nghiệm dịch vụ trước khi quyết định đăng ký." },
  { id: 7, q: "Làm thế nào để liên hệ hỗ trợ khách hàng Streamify?", a: "Bạn có thể liên hệ với chúng tôi qua email hoặc biểu mẫu liên hệ trên trang web." },
  { id: 8, q: "Các phương thức thanh toán của Streamify là gì?", a: "Streamify chấp nhận nhiều phương thức thanh toán như thẻ tín dụng, thẻ ghi nợ và các phương thức thanh toán trực tuyến khác." },
];

export const FaqSection = () => {
  const [open, setOpen] = useState<number | null>(1);

  const toggle = (id: number) => {
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24">
      {/* heading row */}
      <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="mb-3 text-3xl font-extrabold text-white md:text-4xl">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="max-w-2xl text-zinc-400">
            Có câu hỏi? Chúng tôi có câu trả lời! Xem phần FAQ của chúng tôi để tìm
            câu trả lời cho các câu hỏi phổ biến nhất về Streamify.
          </p>
        </div>

        <Link
          to="/contact"
          className="inline-flex h-11 items-center rounded-md bg-red-600 px-6 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Đặt Câu Hỏi
        </Link>
      </div>

      {/* faq grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {FAQS.map((item) => {
          const isOpen = open === item.id;
          return (
            <div
              key={item.id}
              className={clsx(
                "border-b border-zinc-700/40 pb-6",
                isOpen && "border-red-600/60"
              )}
            >
              <button
                onClick={() => toggle(item.id)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                {/* number badge */}
                <div className="flex-shrink-0">
                  <div className="grid h-12 w-12 place-items-center rounded-md bg-zinc-800">
                    <span className="font-medium text-white">
                      {item.id.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* question + answer */}
                <div className="flex-1">
                  <h3 className="mb-2 text-base font-semibold text-white">
                    {item.q}
                  </h3>
                  {isOpen && item.a && (
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {item.a}
                    </p>
                  )}
                </div>

                {/* icon */}
                {isOpen ? (
                  <Minus className="mt-1 size-4 flex-shrink-0 text-white" />
                ) : (
                  <Plus className="mt-1 size-4 flex-shrink-0 text-white" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
