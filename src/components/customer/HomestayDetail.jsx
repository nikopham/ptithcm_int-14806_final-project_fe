import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import ImageGalleryDialog from "./ImageGalleryDialog";
import * as MdIcons from "react-icons/md";
import ImageGallerySheet from "./ImageGalleryDialog";
import axios from "@/services/axiosInstance";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import qs from "qs";
import { differenceInCalendarDays } from "date-fns";
import { useSelector } from "react-redux";
import AuthTabsDialog from "../auth/AuthTabsDialog";
/**
 * Props: {
 *   homestay: {
 *     name,
 *     address,
 *     province_name,
 *     description,
 *     images: [{ _id,url,is_thumb }],
 *     amenities: [{ _id,name,icon_url }],
 *     highlights: string[],
 *     price,
 *   }
 * }
 */
export default function HomestayDetail() {
  const { search } = useLocation();
  const { homestayId } = qs.parse(search.slice(1));
  const { dateFrom } = qs.parse(search.slice(1));
  const { dateTo } = qs.parse(search.slice(1));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/homestays/${homestayId}`);
        setData(res.data.data.homestay);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [homestayId]);

  if (loading) return <p className="text-center py-10">Đang tải…</p>;
  if (!data)
    return <p className="text-center py-10">Không tìm thấy homestay</p>;

  const {
    name,
    address,
    description,
    images = [],
    amenities = [],
    price,
    reviews = [],
    avgStar,
  } = data;

  const nights =
    dateFrom && dateTo ? differenceInCalendarDays(dateTo, dateFrom) : 1;

  const total = nights * price;

  /* ---------- collage for header ---------- */
  const thumb = images.find((i) => i.is_thumb) || images[0];
  const others = images.filter((i) => i !== thumb).slice(0, 4);

  return (
    <div className="container max-w-5xl mx-auto py-6 space-y-6">
      {/* Title + address */}
      <div className="space-y-1">
        {avgStar ? (
          <span className="flex gap-[2px]">
            {Array.from({ length: avgStar }).map((_, i) => (
              <MdIcons.MdStar
                key={i}
                className="h-4 w-4 text-yellow-500 shrink-0"
              />
            ))}
          </span>
        ) : (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Chưa có đánh giá
          </p>
        )}
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          {name}
        </h1>

        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {address}
        </p>
      </div>

      {/* Image gallery trigger */}
      <ImageGallerySheet images={images}>
        {(() => {
          const thumb = images?.find((img) => img.is_thumb);
          const others = images?.filter((img) => !img.is_thumb).slice(0, 3);

          return (
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-72 mx-4">
              {/* Ảnh lớn – chiếm 2 cột × 3 hàng */}
              <img
                src={thumb?.url || "/placeholder.png"}
                alt={name}
                className="col-span-2 row-span-3 w-full h-full object-cover rounded-l-md"
              />

              {/* 3 ảnh nhỏ – cột phải */}
              {others.map((o, i) => (
                <img
                  key={i}
                  src={o.url}
                  alt={name}
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

      <div className="flex flex-col lg:flex-row gap-6 ">
        <div className="flex-1 space-y-6">
          {/* About */}
          <div className="space-y-3">
            <h2 className="font-semibold">Mô tả chỗ ở</h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Amenity list */}
          <div className="space-y-3">
            <h2 className="font-semibold">Tiện ích phổ biến</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              {amenities.slice(0, 12).map((a) => {
                const Icon = MdIcons[a.icon_url] || Star;
                return (
                  <div key={a._id} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    {a.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          <p className="text-xl font-semibold">
            {total.toLocaleString()} ₫{" "}
            <span className="text-base">cho {nights} đêm</span>
          </p>

          <p className="text-xs text-muted-foreground">
            ({price.toLocaleString()} ₫ / đêm)
          </p>
          {isAuthenticated ? (
            <Button
              className="w-full mt-1"
              onClick={() => navigate(`/check-in${location.search}`)}
            >
              Đặt ngay
            </Button>
          ) : (
            <AuthTabsDialog>
              <Button className="w-full mt-1">Đặt ngay</Button>
            </AuthTabsDialog>
          )}
        </CardContent>
      </div>
      <div className="mt-32">
        {reviews && reviews.length > 0 ? (
          <div className="space-y-3">
            <h2 className="font-semibold flex items-center gap-1">
              <MdIcons.MdStar className="h-5 w-5 text-yellow-500" />
              {avgStar.toFixed(1)} ({reviews.length} đánh giá)
            </h2>

            <ScrollArea orientation="horizontal" className="w-full">
              <div className="flex gap-4 pr-4">
                {reviews.map((rv) => {
                  const imgs = rv.images || [];
                  return (
                    <Card
                      key={rv._id}
                      className="w-64 shrink-0 overflow-hidden border border-muted"
                    >
                      {/* ----- ảnh grid 2x2 ----- */}
                      <ImageGallerySheet images={imgs}>
                        <div className="grid grid-cols-2 grid-rows-2 h-36">
                          {imgs.slice(0, 4).map((img, idx) => (
                            <img
                              key={idx}
                              src={img.url}
                              alt="review"
                              className="object-cover w-full h-full"
                            />
                          ))}
                          {imgs.length === 0 && (
                            <div className="col-span-2 row-span-2 flex items-center justify-center bg-muted text-xs text-muted-foreground">
                              Không có ảnh
                            </div>
                          )}
                        </div>
                      </ImageGallerySheet>

                      {/* ----- sao + nội dung ----- */}
                      <CardContent className="p-3 space-y-1">
                        <div className="flex items-center gap-[2px]">
                          {Array.from({ length: rv.numb_star }).map((_, i) => (
                            <MdIcons.MdStar
                              key={i}
                              className="h-4 w-4 text-yellow-500"
                            />
                          ))}
                        </div>
                        <p className="text-xs leading-snug line-clamp-20">
                          “{rv.content}”
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            Chưa có đánh giá
          </p>
        )}
      </div>
    </div>
  );
}
