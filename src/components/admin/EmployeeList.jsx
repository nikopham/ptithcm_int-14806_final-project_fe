import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Ban } from "lucide-react";
import { genderMap, statusMap } from "@/utils/badgeHelpers";
import { toast } from "sonner";
import { updateAccountStatus } from "@/services/authService";
import qs from "qs";
import { deleteAccount, searchEmployees } from "@/services/employeeServices";
import { clearEmployees, setError } from "@/features/employee/employeeSlice";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function EmployeeList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list: employees,
    pagination,
    loading,
  } = useSelector((s) => s.employee);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    searchEmployees(dispatch, {
      q: debouncedSearch || undefined,
      status: status !== "all" ? status : undefined,
      page,
      limit,
    }).catch((err) =>
      dispatch(
        setError(err.response?.data?.message || "Không lấy được dữ liệu")
      )
    );

    return () => dispatch(clearEmployees());
  }, [debouncedSearch, status, page, dispatch]);

  const currentQuery = useMemo(() => {
    const qObj = qs.parse(location.search, { ignoreQueryPrefix: true });

    const page = Number(qObj.page) || 1;
    const limit = Number(qObj.limit) || 10;

    const status =
      qObj.status && qObj.status !== "all" ? String(qObj.status) : undefined;

    const q = qObj.q ? String(qObj.q) : undefined;

    return { q, status, page, limit };
  }, [location.search]);

  const pageNumbers = useMemo(() => {
    const totalPages = pagination.totalPages || 1;
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);

    const arr = [1];
    if (page > 3) arr.push("prev");
    if (page > 2) arr.push(page - 1);
    if (page !== 1 && page !== totalPages) arr.push(page);
    if (page < totalPages - 1) arr.push(page + 1);
    if (page < totalPages - 2) arr.push("next");
    arr.push(totalPages);
    return arr;
  }, [page, pagination.totalPages]);

  async function handleToggleStatus(customer) {
    const nextStatus =
      customer.account.status === "active" ? "inactive" : "active";

    try {
      await updateAccountStatus(dispatch, customer.account._id, nextStatus);
      await searchEmployees(dispatch, currentQuery);
      toast.success("Cập nhật trạng thái thành công");
    } catch (err) {
      toast.error("Không thể cập nhật trạng thái!");
      console.error(err);
    }
  }

  const handleEdit = (employee) => {
    navigate(`/admin-dashboard/employee/${employee.account._id}/edit`, {
      state: { employee },
    });
  };

  const handleDelete = async (employee) => {
    try {
      await deleteAccount(dispatch, { id: employee?.account?._id });
      await searchEmployees(dispatch, {
        q: debouncedSearch || undefined,
        status: status !== "all" ? status : undefined,
        page,
        limit,
      });
      toast.success("Xóa tài khoản thành công");
    } catch (err) {
      toast.error("Không thể xóa tài khoản!");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Input
          placeholder="Tìm kiếm tên, email, SĐT…"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="w-full sm:max-w-xs"
        />

        <Select
          value={status}
          onValueChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Khóa</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Trang trước
        </Button>
        <span className="text-sm text-muted-foreground">
          Trang {pagination?.page || 1}/{pagination?.totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={
            (pagination?.page || 1) >= (pagination?.totalPages || 1) || loading
          }
          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
        >
          Trang sau
        </Button>
      </div>
      {/* <div className="flex justify-end">
        <Pagination className={"justify-end"}>
          <PaginationContent className="justify-end">
            <PaginationItem>
              <PaginationLink
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              >
                Trước
              </PaginationLink>
            </PaginationItem>

            {pageNumbers.map((num, idx) =>
              typeof num === "number" ? (
                <PaginationItem key={idx}>
                  <PaginationLink
                    isActive={num === page}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </PaginationLink>
                </PaginationItem>
              ) : (
                <PaginationEllipsis key={idx} />
              )
            )}

            <PaginationItem>
              <PaginationLink
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                className={
                  page === pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              >
                Sau
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div> */}

      {/* TABLE */}
      <div className="border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>CCCD</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Xóa</TableHead>
              <TableHead className="text-right">Chỉnh sửa</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Đang tải…
                </TableCell>
              </TableRow>
            ) : employees.length ? (
              employees.map((c) => {
                const g = genderMap[c.gender] || {
                  label: "—",
                  color: "bg-slate-50",
                };
                const s = statusMap[c.account.status] || {
                  label: c.account.status,
                  color: "bg-slate-50",
                };

                return (
                  <TableRow key={c._id}>
                    <TableCell>{c.full_name}</TableCell>
                    <TableCell>{c.account.email}</TableCell>
                    <TableCell>{c.phone || "Chưa cập nhật"}</TableCell>
                    <TableCell>{c.identity_number}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium ${g.color}`}
                      >
                        {g.label}
                      </span>
                    </TableCell>

                    <TableCell>
                      {c.dob
                        ? format(new Date(c.dob), "dd/MM/yyyy")
                        : "Chưa cập nhật"}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${s.color}`}
                          >
                            <s.Icon className="w-3.5 h-3.5" />
                            {s.label}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              handleToggleStatus(c);
                            }}
                            className="cursor-pointer"
                          >
                            {s.action.label}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => handleDelete(c)}
                      >
                        <Pencil className="w-4 h-4" />
                        Xóa
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => handleEdit(c)}
                      >
                        <Pencil className="w-4 h-4" />
                        Sửa
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                {/* ⬅️ sửa colSpan = 6 */}
                <TableCell colSpan={6} className="text-center py-10">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
