import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import type { RootState } from "@/app/store";

function useAnyApiLoading() {
  return useAppSelector((state: RootState) => {
    const sliceKeys = [
      "movieApi",
      "genreApi",
      "countryApi",
      "personApi",
      "seriesApi",
      "reviewApi",
      "userApi",
    ];
    return sliceKeys.some((k) => {
      const slice: any = (state as any)[k];
      if (!slice) return false;
      const queriesPending =
        slice.queries &&
        Object.values(slice.queries).some((q: any) => q?.status === "pending");
      const mutationsPending =
        slice.mutations &&
        Object.values(slice.mutations).some(
          (m: any) => m?.status === "pending"
        );
      return queriesPending || mutationsPending;
    });
  });
}

export function GlobalLoadingOverlay() {
  const loading = useAnyApiLoading();
  if (!loading) return null;
  return (
    <Dialog open>
      <DialogContent className="bg-transparent border-none shadow-none p-0 flex items-center justify-center">
        <div className="flex flex-col items-center rounded-lg bg-zinc-900/80 px-8 py-10 backdrop-blur-sm min-w-[220px]">
          <Loader2 className="h-12 w-12 animate-spin text-teal-400" />
          <p className="mt-5 text-sm text-zinc-300">Đang tải dữ liệu...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
