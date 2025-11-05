import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, Search, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import GuestSelector from "@/components/customer/GuestSelector";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo/logo.png";
import LocationSelector from "./LocationSelector";
import { differenceInCalendarDays, format } from "date-fns";
import Calendar05 from "../ui/calendar-05";
import AuthTabsDialog from "../auth/AuthTabsDialog";
import { useDispatch, useSelector } from "react-redux";
import UserDropdown from "./UserDropdown";
import qs from "qs";
import { searchHomestays } from "@/services/homestayService";
import { parseYMD, toYMD } from "@/utils/date";
import { toast } from "sonner";
import { addDays, isBefore, startOfDay } from "date-fns";

const HeroSection = ({ compact = false, onSearch }) => {
  const location = useLocation();
  const queryObj = useMemo(
    () => qs.parse(location.search.slice(1)),
    [location.search]
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [province, setProvince] = useState(null);
  const [dateRange, setDateRange] = useState(() => ({
    from: undefined,
    to: undefined,
  }));
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    rooms: 1,
  });
  useEffect(() => {
    setDateRange({
      from: parseYMD(queryObj.dateFrom) || null,
      to: parseYMD(queryObj.dateTo) || null,
    });
    setGuests({
      adults: queryObj.adults || 1,
      children: queryObj.children || 0,
      rooms: queryObj.rooms || 1,
    });
  }, [
    queryObj.dateFrom,
    queryObj.dateTo,
    queryObj.adults,
    queryObj.children,
    queryObj.rooms,
  ]);
  useEffect(() => {
    if (queryObj != {}) {
      searchHomestays(dispatch, queryObj);
    }
  }, [dispatch, queryObj]);

  const handleGuestChange = (next) => setGuests(next);

  const handleSearch = async () => {
    if (!dateRange.from || !dateRange.to) {
      return toast.error("Vui lòng chọn ngày nhận & trả phòng");
    }

    const today = startOfDay(new Date());

    if (!isBefore(today, dateRange.from)) {
      return toast.error("Ngày nhận phòng phải sau ngày hiện tại");
    }
    const nights =
      dateRange.from && dateRange.to
        ? differenceInCalendarDays(dateRange.from, dateRange.to)
        : 1;
    if (nights > 30) {
      return toast.error("Vui lòng không đặt homestay quá 30 ngày");
    }
    if (!province?._id) {
      return toast.error("Vui lòng chọn tỉnh / thành phố");
    }
    const params = {
      dateFrom: toYMD(dateRange.from),
      dateTo: toYMD(dateRange.to),
      adults: guests.adults,
      children: guests.children,
      rooms: guests.rooms,
      provinceId: province?._id,
      page: 1,
      limit: 5,
    };

    try {
      await searchHomestays(dispatch, params);
      navigate(`/search?${qs.stringify(params, { skipNulls: true })}`);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    }
  };
  const formatRangeLabel = (range) => {
    if (!range?.from) return "Chọn ngày";

    const fromStr = format(range.from, "dd/MM/yyyy");
    if (!range.to) return `${fromStr} – …`;

    const toStr = format(range.to, "dd/MM/yyyy");
    return `${fromStr} – ${toStr}`;
  };
  return (
    <div className="bg-white text-black pb-8">
      {/* Header Top */}
      <header className="flex items-center justify-between px-6 py-4">
        {/* LEFT */}
        <div className="flex items-center gap-6 min-w-0">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Logo" className="h-9 w-auto" />
          </Link>

          {/* Search - cố định chiều rộng và không co các item khác */}
          <div className="hidden lg:flex w-96 shrink-0">
            <Input
              type="text"
              placeholder="Tìm kiếm phim, diễn viên"
              className=""
            />
          </div>

          {/* Menu */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium shrink-0">
            <Link to="/movies/single" className="menu-link">
              Phim Lẻ
            </Link>
            <Link to="/movies/series" className="menu-link">
              Phim Bộ
            </Link>

            <Link
              to="/genres"
              className="menu-link inline-flex items-center gap-1"
            >
              Thể loại <ChevronDown size={14} />
            </Link>
            <Link
              to="/countries"
              className="menu-link inline-flex items-center gap-1"
            >
              Quốc gia <ChevronDown size={14} />
            </Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 shrink-0">
          {isAuthenticated ? (
            <UserDropdown user={user} />
          ) : (
            <AuthTabsDialog>
              <Button className="rounded-full  px-6 whitespace-nowrap">
                Thành viên
              </Button>
            </AuthTabsDialog>
          )}
        </div>
      </header>

    
      
    </div>
  );
};

export default HeroSection;
