import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useAppSelector } from "@/app/hooks";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout() {
  const { isAuth, roles } = useAppSelector((s) => s.auth);

  return (
    <>
      <Header isAuth={isAuth} roles={roles} />
      <main className="pt-2">{<Outlet />}</main>
      <Footer />
    </>
  );
}
