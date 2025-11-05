// src/components/PaginationControl.jsx

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "use-debounce"; // (Cần cài: npm install use-debounce)

export const PaginationControl = ({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}) => {
  const [pageInput, setPageInput] = useState(currentPage.toString());
  const [debouncedPage] = useDebounce(pageInput, 500);

  // Cập nhật input nếu trang (từ props) thay đổi
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  // Xử lý khi trang (đã debounce) thay đổi
  useEffect(() => {
    let newPage = parseInt(debouncedPage);
    if (!isNaN(newPage) && newPage !== currentPage) {
      if (newPage < 1) newPage = 1;
      if (newPage > totalPages) newPage = totalPages;
      onPageChange(newPage);
    }
  }, [debouncedPage, currentPage, totalPages, onPageChange]);

  const handleBlur = () => {
    // Nếu gõ linh tinh, trả về trang hiện tại
    if (pageInput !== currentPage.toString()) {
      setPageInput(currentPage.toString());
    }
  };

  return (
    <nav className="flex items-center justify-center gap-2" role="navigation">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || loading}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm text-muted-foreground">Trang</span>
      <Input
        type="number"
        className="h-9 w-16 text-center"
        value={pageInput}
        onChange={(e) => setPageInput(e.target.value)}
        onBlur={handleBlur}
        disabled={loading}
      />
      <span className="text-sm text-muted-foreground">/ {totalPages || 1}</span>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
};
