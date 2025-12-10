import { useSelector, useDispatch } from "react-redux";
import {
  hideErrorModal,
  selectErrorModal,
} from "@/features/ui/errorModalSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Code } from "lucide-react";

export function GlobalErrorModal() {
  const dispatch = useDispatch();
  const { isOpen, title, message, code } = useSelector(selectErrorModal);
  const handleClose = () => {
    dispatch(hideErrorModal());
  };

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <AlertDialogContent className="bg-white border-gray-300 text-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-gray-900">
            <AlertTriangle className="size-5 text-red-600" />
            {title || "Đã xảy ra lỗi"}
          </AlertDialogTitle>

          <AlertDialogDescription className="space-y-3 pt-2 text-gray-500">
            <p className="text-base">{message}</p>
            {code && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                <Code className="size-4 text-red-600" />
                <p className="text-sm text-red-700">
                  Mã lỗi: <strong className="font-mono">{code}</strong>
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={handleClose}
            className="bg-[#C40E61] hover:bg-[#C40E61]/90 text-white"
          >
            Đã hiểu
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
