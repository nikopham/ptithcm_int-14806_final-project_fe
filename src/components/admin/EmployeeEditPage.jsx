// src/pages/admin/EmployeeEditPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "@/services/axiosInstance";

import { getEmployeeDetailByAccountId } from "@/services/employeeServices";
import { clearEmployeeDetail } from "@/features/employee/employeeSlice"; 
import EmployeeEditForm from "@/components/admin/EmployeeEditForm";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EmployeeEditPage() {

  const { accountId } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { detail: employee, loading, error } = useSelector((s) => s.employee);

  const [saving, setSaving] = useState(false);


  useEffect(() => {
    getEmployeeDetailByAccountId(dispatch, accountId).catch(() => {});
    return () => {
      if (clearEmployeeDetail) dispatch(clearEmployeeDetail());
    };
  }, [dispatch, accountId]);

  useEffect(() => {
    if (error) {
      toast.error("Không tải được thông tin nhân viên");
    }
  }, [error, toast]);

  const saveEmployee = async (formData) => {
    try {
      setSaving(true);

      const employeeId = employee?._id;
      await axios.put(`/employees/${employeeId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await getEmployeeDetailByAccountId(dispatch, accountId);

      toast({ title: "Đã lưu thay đổi" });
    
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Lưu thất bại",
        description: err.response?.data?.message || "Vui lòng thử lại",
      });
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sửa nhân viên</CardTitle>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-9 w-80" />
            <Skeleton className="h-9 w-96" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : employee ? (
          <EmployeeEditForm
            initialData={employee}
            onSubmit={saveEmployee} 
            submitting={saving} 
            accountId={accountId}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Không tìm thấy dữ liệu nhân viên
          </div>
        )}
      </CardContent>
    </Card>
  );
}
