import { Link } from "react-router-dom";
import logo from "@/assets/logo/logo.png"; // Bạn có thể giữ logo này hoặc đổi
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"; // Thêm icon

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t pt-10 pb-6 px-4 md:px-0">
      {/* Top grid */}
      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        {/* Brand */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-16 w-16" />
            <span className="font-semibold text-lg">PhimHay</span>
            {/* <-- Đã sửa */}
          </div>
          <p className="text-sm text-muted-foreground">
            Xem phim mọi lúc, mọi nơi.
            {/* <-- Đã sửa */}
          </p>
        </div>

        {/* Company links */}
        <div className="space-y-1">
          <h4 className="font-medium">Thông tin</h4>
          {/* <-- Đã sửa */}
          <nav className="flex flex-col text-sm space-y-1">
            <Link to="/about" className="hover:underline">
              Giới thiệu
            </Link>
            <Link to="/faq" className="hover:underline">
              Hỏi đáp (FAQ)
              {/* <-- Đã sửa */}
            </Link>
            <Link to="/contact" className="hover:underline">
              Liên hệ
            </Link>
            <Link to="/advertising" className="hover:underline">
              Quảng cáo
              {/* <-- Đã sửa */}
            </Link>
          </nav>
        </div>

        {/* Support links */}
        <div className="space-y-1">
          <h4 className="font-medium">Hỗ trợ & Pháp lý</h4>
          {/* <-- Đã sửa */}
          <nav className="flex flex-col text-sm space-y-1">
            <Link to="/help" className="hover:underline">
              Trung tâm trợ giúp
            </Link>
            <Link to="/devices" className="hover:underline">
              Thiết bị hỗ trợ
              {/* <-- Đã sửa */}
            </Link>
            <Link to="/terms" className="hover:underline">
              Điều khoản sử dụng
              {/* <-- Đã sửa */}
            </Link>
            <Link to="/privacy" className="hover:underline">
              Chính sách bảo mật
              {/* <-- Đã sửa */}
            </Link>
          </nav>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-8" />

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs space-y-4 md:space-y-0">
        <span>© PhimHay {year}</span>
        {/* <-- Đã sửa */}

        {/* Social Icons */}
        {/* <-- Đã thêm */}
        <div className="flex space-x-6 text-muted-foreground">
          <a href="#" className="hover:text-primary">
            <FaFacebook className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-primary">
            <FaInstagram className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-primary">
            <FaTwitter className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-primary">
            <FaYoutube className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
