import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import qs from "qs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { debounce } from "lodash";

import HeroSection from "@/components/customer/HeroSection";
import { searchHomestays } from "@/services/homestayService";
import Footer from "@/components/customer/Footer";
import ImageGalleryDialog from "@/components/customer/ImageGalleryDialog";
import ImageGallerySheet from "@/components/customer/ImageGalleryDialog";
import * as MdIcons from "react-icons/md";
import { fetchCommunesByProvinceId } from "@/services/communeService";
import { fetchAmenities } from "@/services/amenityService";
import HomestayDetail from "@/components/customer/HomestayDetail";

const PriceSlider = ({ value, onChange }) => (
  <div className="px-4 py-2">
    <Slider
      value={value}
      min={0}
      max={50_000_000}
      step={50_000}
      onValueChange={onChange}
    />
    <div className="mt-2 text-sm text-muted-foreground">
      {value[0].toLocaleString()} – {value[1].toLocaleString()} ₫ / đêm
    </div>
  </div>
);

export default function SearchPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    list: homestays,
    loading,
    pagination,
  } = useSelector((state) => state.homestay);

  const queryObj = useMemo(
    () => qs.parse(location.search.slice(1)),
    [location.search]
  );
  const baseQuery = qs.parse(location.search.slice(1));
  const { search } = useLocation();
  const { homestayId } = qs.parse(search.slice(1));
  const { communeIds } = qs.parse(search.slice(1));
  const { amenityIds } = qs.parse(search.slice(1));
  const parsed = qs.parse(search.slice(1));
  const minStars1 = parsed.minStars;

  
  const [sortBy, setSortBy] = useState(queryObj.sortBy || "default");
  const [priceRange, setPriceRange] = useState([0, 50_000_000]);
  const selectedProvinceId = queryObj.provinceId;

  const { list: communes, loading: loadingCommune } = useSelector(
    (s) => s.commune
  );
  const { list: amenities, loading: loadingAmenity } = useSelector(
    (s) => s.amenity
  );
  const [selectedCommunes, setSelectedCommunes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [minStars, setMinStars] = useState(0);

  const handlePageChange = (page) => {
    const params = { ...queryObj, page };
    const query = qs.stringify(params, { skipNulls: true });
    navigate(`/search?${query}`);
    searchHomestays(dispatch, params);
  };
  useEffect(() => {
    if (!communeIds) {
      setSelectedCommunes([]);
    }
    if (!amenityIds) {
      setSelectedAmenities([]);
    }
    if (!minStars1) {
      setMinStars(0);
    }
  }, [communeIds, amenityIds, minStars1]);
  useEffect(() => {
    if (selectedProvinceId) {
      fetchCommunesByProvinceId(dispatch, selectedProvinceId);
      setSelectedCommunes([]);
    }
  }, [dispatch, selectedProvinceId]);

  useEffect(() => {
    fetchAmenities(dispatch);
    setSelectedAmenities([]);
  }, [dispatch]);

  const toggleCommune = (id) =>
    setSelectedCommunes((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );
  const toggleAmenity = (id) =>
    setSelectedAmenities((p) =>
      p.includes(id) ? p.filter((i) => i !== id) : [...p, id]
    );

  const toggleStar = (val) => setMinStars((cur) => (cur === val ? 0 : val));

  const doSearch = async (filters) => {
    navigate(`/search?${qs.stringify(filters, { skipNulls: true })}`);
  };

  const debouncedSearch = useMemo(() => debounce(doSearch, 500), []);

  const buildFilters = () => {
    const f = {
      ...queryObj,
      communeIds: selectedCommunes.join(",") || undefined,
      amenityIds: selectedAmenities.join(",") || undefined,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      page: 1,
      sortBy: sortBy,
      minStars: minStars || undefined,
    };

    return f;
  };

  useEffect(() => {
    debouncedSearch(buildFilters());
    return () => debouncedSearch.cancel();
  }, [selectedCommunes, selectedAmenities, priceRange, sortBy, minStars]);

  useEffect(() => {
    const filters = qs.parse(location.search.slice(1));
    searchHomestays(dispatch, filters);
  }, [location.search, dispatch]);

  const handleSearchClick = () => doSearch(buildFilters());

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* HeroSection ở chế độ compact */}
        <HeroSection
          compact
          key={location.search}
          onSearch={handleSearchClick}
        />

        {homestayId ? (
          <HomestayDetail />
        ) : (
          <>
            {/* Toolbar */}
            <div className="container max-w-6xl flex items-center justify-between mt-6 mx-auto">
              {/* Left: Pagination + count */}
              <div className="flex items-center gap-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        aria-disabled={pagination.page <= 1}
                        tabIndex={pagination.page <= 1 ? -1 : undefined}
                        className={
                          pagination.page <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                        onClick={() =>
                          pagination.page > 1 &&
                          handlePageChange(pagination.page - 1)
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    ).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === pagination.page}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationNext
                      href="#"
                      aria-disabled={pagination.page >= pagination.totalPages}
                      tabIndex={
                        pagination.page >= pagination.totalPages
                          ? -1
                          : undefined
                      }
                      className={
                        pagination.page >= pagination.totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                      onClick={() =>
                        pagination.page < pagination.totalPages &&
                        handlePageChange(pagination.page + 1)
                      }
                    />
                  </PaginationContent>
                </Pagination>

                {/* Count */}
                <span className="font-semibold whitespace-nowrap">
                  {loading ? "Đang tải…" : `${pagination.totalItems} kết quả`}
                </span>
              </div>

              {/* Right: sort */}
              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] h-8">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Mặc định</SelectItem>
                    <SelectItem value="price_asc">Giá tăng dần</SelectItem>
                    <SelectItem value="price_desc">Giá giảm dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main content */}
            <div className="container max-w-6xl mt-4 flex gap-4 mx-auto">
              {/* Sidebar */}
              <aside className="hidden lg:block w-64 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Lọc</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2 text-sm">
                        Giá tiền (1 đêm)
                      </h4>
                      <PriceSlider
                        value={priceRange}
                        onChange={setPriceRange}
                      />
                    </div>
                  </CardContent>
                </Card>
                {/* Lọc theo xã */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Khu vực</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2 p-2">
                    {loadingCommune ? (
                      <p className="text-sm px-2">Đang tải…</p>
                    ) : communes.length === 0 ? (
                      <p className="text-sm px-2">Không có xã/phường</p>
                    ) : (
                      <ScrollArea className="h-60 pr-2">
                        {communes.map((c) => (
                          <label
                            key={c._id}
                            className="flex items-center gap-2 text-sm mb-1 cursor-pointer"
                          >
                            <Checkbox
                              id={`commune-${c._id}`}
                              checked={selectedCommunes.includes(c._id)}
                              onCheckedChange={() => toggleCommune(c._id)}
                            />
                            {c.name}
                          </label>
                        ))}
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
                {/* Lọc theo tiện ích */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tiện ích</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2 p-2">
                    {loadingAmenity ? (
                      <p className="text-sm px-2">Đang tải…</p>
                    ) : amenities.length === 0 ? (
                      <p className="text-sm px-2">Không có tiện ích</p>
                    ) : (
                      <ScrollArea className="h-60 pr-2">
                        {amenities.map((amenity) => {
                          const Icon =
                            MdIcons[amenity.icon_url] ||
                            MdIcons.MdCheckBoxOutlineBlank;

                          return (
                            <label
                              key={amenity._id}
                              className="flex items-center gap-2 text-sm mb-1 cursor-pointer"
                            >
                              <Checkbox
                                id={`amenity-${amenity._id}`} // Sửa lại id cho đúng ngữ cảnh
                                checked={selectedAmenities.includes(
                                  amenity._id
                                )}
                                // Giả sử bạn có hàm toggleAmenity
                                onCheckedChange={() =>
                                  toggleAmenity(amenity._id)
                                }
                              />
                              <div className="flex items-center">
                                <Icon className="mr-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
                                {amenity.name}
                              </div>
                            </label>
                          );
                        })}
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
                {/* Lọc theo sao */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Đánh giá</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2 p-2">
                    <ScrollArea className="h-60 pr-2">
                      {[5, 4, 3, 2, 1].map((s) => (
                        <label
                          key={s}
                          className="flex items-center gap-2 text-sm mb-1 cursor-pointer"
                        >
                          {/* Chỉ cho phép 1 checkbox “bật” cùng lúc */}
                          <Checkbox
                            id={`star-${s}`}
                            checked={minStars === s}
                            onCheckedChange={() => toggleStar(s)}
                          />

                          {/* Nhãn sao + số sao */}
                          <div className="flex items-center justify-between w-full">
                            {/* icon sao lặp s lần */}
                            <span className="flex gap-[2px]">
                              {Array.from({ length: s }).map((_, i) => (
                                <MdIcons.MdStar
                                  key={i}
                                  className="h-4 w-4 text-yellow-500 shrink-0"
                                />
                              ))}
                            </span>
                            <span className="ml-auto">{s}+</span>
                          </div>
                        </label>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </aside>

              {/* Results */}
              <main className="flex-1">
                {loading ? (
                  <p className="text-center py-20">Đang tải kết quả…</p>
                ) : homestays.length === 0 ? (
                  <p className="text-center py-20">
                    Không tìm thấy chỗ ở phù hợp.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {homestays.map((item) => (
                      <Card key={item._id} className="flex overflow-hidden">
                        <ImageGallerySheet images={item.images}>
                          {(() => {
                            const thumb = item.images?.find(
                              (img) => img.is_thumb
                            );
                            const others = item.images
                              ?.filter((img) => !img.is_thumb)
                              .slice(0, 3);

                            return (
                              <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-72 mx-4">
                                {/* Ảnh lớn – chiếm 2 cột × 3 hàng */}
                                <img
                                  src={thumb?.url || "/placeholder.png"}
                                  alt={item.name}
                                  className="col-span-2 row-span-3 w-full h-full object-cover rounded-l-md"
                                />

                                {/* 3 ảnh nhỏ – cột phải */}
                                {others.map((o, i) => (
                                  <img
                                    key={i}
                                    src={o.url}
                                    alt={item.name}
                                    className={`
            col-start-3 row-start-${i + 1}
            w-full h-full object-cover
            ${i === 0 ? "rounded-tr-md" : ""}
            ${i === 2 ? "rounded-br-md" : ""}
          `}
                                  />
                                ))}
                              </div>
                            );
                          })()}
                        </ImageGallerySheet>

                        {/* --------- TEXT & ACTION --------- */}
                        <CardContent className="p-4 flex-1 flex flex-col justify-between">
                          {/* ---------- Info ---------- */}
                          <div>
                            <h3 className="font-semibold text-base mb-1">
                              {item.name}
                            </h3>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.address}
                            </div>

                            {/* Description */}
                            <p className="text-sm mt-2 line-clamp-2">
                              {item.description}
                            </p>

                            {/* Amenities */}

                            {(() => {
                              const shown = item.amenity?.slice(0, 8) || [];
                              const hidden =
                                (item.amenity?.length || 0) - shown.length;

                              return (
                                <>
                                  {/* Danh sách amenity */}
                                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 max-h-[3.5rem] overflow-hidden">
                                    {shown.map((a) => {
                                      const Icon =
                                        MdIcons[a.icon_url] || MdIcons.MdCheck;
                                      return (
                                        <span
                                          key={a._id}
                                          className="flex items-center text-xs"
                                        >
                                          <Icon className="mr-1 h-4 w-4 shrink-0" />
                                          {a.name}
                                        </span>
                                      );
                                    })}
                                    {hidden > 0 && (
                                      <span className="flex items-center text-xs">
                                        · …
                                      </span>
                                    )}
                                  </div>

                                  {/* Xem chi tiết nếu còn ẩn */}
                                  {hidden > 0 && (
                                    <button
                                      className="text-xs text-primary underline mt-1"
                                      // onClick={() => openAmenityDialog(item)}
                                    >
                                      Xem chi tiết
                                    </button>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          {/* ---------- Price & CTA ---------- */}
                          <div className="text-right">
                            <p className="font-semibold">
                              {item.price.toLocaleString()} ₫ / đêm
                            </p>
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                navigate(
                                  `/search?${qs.stringify(
                                    { ...baseQuery, homestayId: item._id },
                                    { skipNulls: true }
                                  )}`
                                );
                              }}
                            >
                              Xem chi tiết
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </main>
            </div>
          </>
        )}
      </div>
      <div className="mt-32">
        <Footer />
      </div>
    </>
  );
}
