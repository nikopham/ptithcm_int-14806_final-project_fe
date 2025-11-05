import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import ImageGalleryDialog from "@/components/customer/ImageGalleryDialog";
import { useParams } from "react-router-dom";
import axios from "@/services/axiosInstance";
import HomestayDetail from "@/components/customer/HomestayDetail";
import Footer from "@/components/customer/Footer";
import HeroSection from "@/components/customer/HeroSection";

export default function HomestayDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`/homestays/${id}`);
        setData(res.data.data.homestay);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <p className="text-center py-10">Đang tải…</p>;
  if (!data)
    return <p className="text-center py-10">Không tìm thấy homestay</p>;

  return (
    <>
      <div className="min-h-screen bg-background">
        <HeroSection compact key={location.search} />
        <HomestayDetail homestay={data} />;
      </div>
      <div className="mt-32">
        <Footer />
      </div>
    </>
  );
}
