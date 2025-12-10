import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Info } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định nếu cần
    onConfirm();
  };

  // Chọn icon dựa trên variant
  const getIcon = () => {
    if (variant === "destructive") {
      return <AlertTriangle className="size-6 text-red-600" />;
    }
    return <Info className="size-6 text-[#C40E61]" />;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-white border-gray-300 text-gray-900 sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              {getIcon()}
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-gray-900">{title}</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 mt-2">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-white"
          >
            {cancelText}
          </AlertDialogCancel>

          {/* Dùng Button thay vì AlertDialogAction để dễ custom style và loading */}
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
