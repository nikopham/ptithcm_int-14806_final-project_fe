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
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription className="space-y-2 pt-2">
            <p>{message}</p>
            {code && (
              <p className="text-sm text-muted-foreground">
                Error Code: <strong>{code}</strong>
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction>Get it !</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
