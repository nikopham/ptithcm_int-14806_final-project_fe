import { Link } from "react-router-dom";
import { Facebook, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  const year = new Date().getFullYear();

  const colCls = "space-y-2 text-sm leading-6";
  const headCls = "mb-4 text-base font-semibold text-white";
  const linkCls = "block transition-colors duration-200 hover:text-white";

  return (
    <footer className="mt-20  px-4 text-zinc-400">
      {/* top columns ---------------------------------------------------- */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 gap-x-8 py-14 md:grid-cols-6">
        {/* Home */}
        <div className={colCls}>
          <h6 className={headCls}>Trang Chủ</h6>
          <Link to="/categories" className={linkCls}>
            Thể Loại
          </Link>
          <Link to="/devices" className={linkCls}>
            Thiết Bị
          </Link>
          <Link to="/pricing" className={linkCls}>
            Giá Cả
          </Link>
          <Link to="/faq" className={linkCls}>
            Câu Hỏi Thường Gặp
          </Link>
        </div>

        <div className={colCls}>
          <h6 className={headCls}>Phim</h6>
          <Link to="/movies/genres" className={linkCls}>
            Thể Loại
          </Link>
          <Link to="/movies/trending" className={linkCls}>
            Đang Thịnh Hành
          </Link>
          <Link to="/movies/new" className={linkCls}>
            Mới Phát Hành
          </Link>
          <Link to="/movies/popular" className={linkCls}>
            Phổ Biến
          </Link>
        </div>

        <div className={colCls}>
          <h6 className={headCls}>Chương Trình</h6>
          <Link to="/shows/genres" className={linkCls}>
            Thể Loại
          </Link>
          <Link to="/shows/trending" className={linkCls}>
            Đang Thịnh Hành
          </Link>
          <Link to="/shows/new" className={linkCls}>
            Mới Phát Hành
          </Link>
          <Link to="/shows/popular" className={linkCls}>
            Phổ Biến
          </Link>
        </div>

        <div className={colCls}>
          <h6 className={headCls}>Hỗ Trợ</h6>
          <Link to="/contact" className={linkCls}>
            Liên Hệ
          </Link>
        </div>

        <div className={colCls}>
          <h6 className={headCls}>Đăng Ký</h6>
          <Link to="/plans" className={linkCls}>
            Gói Dịch Vụ
          </Link>
          <Link to="/features" className={linkCls}>
            Tính Năng
          </Link>
        </div>

        {/* Connect */}
        <div className={colCls}>
          <h6 className={headCls}>Kết Nối Với Chúng Tôi</h6>
          <div className="flex gap-3 pt-1">
            {[Facebook, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-md bg-zinc-800 text-zinc-200 transition hover:bg-red-600 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* divider line --------------------------------------------------- */}
      <div className="mx-auto h-px max-w-7xl bg-zinc-700/60" />

      {/* bottom bar ----------------------------------------------------- */}
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 py-6 text-xs md:flex-row">
        <p>©{year} Streamify, Bảo Lưu Mọi Quyền</p>

        <nav className="flex flex-wrap items-center gap-4 text-zinc-300">
          <Link to="/terms" className={linkCls}>
            Điều Khoản Sử Dụng
          </Link>
          <span className="hidden select-none text-zinc-600 md:inline">│</span>
          <Link to="/privacy" className={linkCls}>
            Chính Sách Bảo Mật
          </Link>
          <span className="hidden select-none text-zinc-600 md:inline">│</span>
          <Link to="/cookies" className={linkCls}>
            Chính Sách Cookie
          </Link>
        </nav>
      </div>
    </footer>
  );
};
