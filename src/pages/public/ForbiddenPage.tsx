import { Link } from "react-router-dom";
import { Ban } from "lucide-react"; // 'Ban' (cấm) là icon phù hợp
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900 text-black dark:text-white">
      <div className="p-10 bg-white dark:bg-zinc-800 rounded-lg shadow-xl text-center">
        <div className="flex flex-col items-center gap-4">
          <Ban className="size-16 text-red-500" />
          <h1 className="text-4xl font-bold text-red-500">403</h1>
          <h2 className="text-2xl font-semibold">Access Denied</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-md">
            Sorry, you do not have the necessary permissions to access this
            page.
          </p>
          <Button asChild className="mt-4">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
