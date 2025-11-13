import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { router } from "./routes";

export const AppRouter = () => (
  <Suspense fallback={<div className="p-8">Loading…</div>}>
    <RouterProvider router={router} />
  </Suspense>
);
