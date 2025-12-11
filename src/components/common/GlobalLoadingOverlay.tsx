import { Loader2, RefreshCw } from "lucide-react";
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
        Object.entries(slice.mutations).some(
          ([mutationKey, m]: [string, any]) => {
         
            if (mutationKey.startsWith("saveProgress(") || mutationKey === "saveProgress") {
              return false;
            }
            return m?.status === "pending";
          }
        );
      return queriesPending || mutationsPending;
    });
  });
}

export function GlobalLoadingOverlay() {
  const loading = useAnyApiLoading();
  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center rounded-xl bg-white border border-gray-300 px-10 py-12 min-w-[240px] shadow-xl pointer-events-auto">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#C40E61]/10 animate-ping"></div>
          <div className="relative">
            <Loader2 className="h-14 w-14 animate-spin text-[#C40E61]" />
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-[#C40E61] animate-spin" />
            <p className="text-base font-medium text-gray-900">Đang tải dữ liệu...</p>
          </div>
          <p className="text-xs text-gray-500">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    </div>
  );
}
