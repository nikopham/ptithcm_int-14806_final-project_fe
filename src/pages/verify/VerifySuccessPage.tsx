// src/pages/VerifySuccessPage.tsx

import { useSearchParams, Link } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VerifySuccessPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900 text-black dark:text-white">
      <div className="p-8 bg-white dark:bg-zinc-800 rounded-lg shadow-xl text-center">
        <div className="flex flex-col items-center gap-4">
          <CircleCheck className="size-16 text-green-500" />
          <h1 className="text-3xl font-bold">Verification Successful!</h1>
          {email && (
            <p className="text-lg text-zinc-600 dark:text-zinc-300">
              Your email <strong>{email}</strong> has been verified.
            </p>
          )}
          <p className="text-lg">You can now log in to your account.</p>
          <Button asChild className="mt-4">
            {/* You can open the Login Dialog from here, or go to home */}
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
