import { useAppDispatch } from "@/app/hooks";


export default function Login() {
  const dispatch = useAppDispatch();
  return (
    <section className="mx-auto max-w-sm p-8 text-center">
      <h1 className="mb-6 text-2xl font-semibold">Login (demo)</h1>
      <button
        onClick={() => dispatch(loginDemo())}
        className="rounded bg-red-600 px-4 py-2 font-medium text-white"
      >
        Sign in as Viewer
      </button>
    </section>
  );
}
