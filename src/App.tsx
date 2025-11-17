// import { useSelector } from "react-redux";
// import type { RootState } from "./app/store";
import { GlobalErrorModal } from "./components/common/GlobalErrorModal";

function App() {
  // const status = useSelector((state: RootState) => state.auth.status);

  // if (status === "loading") {
  //   return <GlobalSpinner />;
  // }
  return (
    <>
      <GlobalErrorModal />
    </>
  );
}

export default App;
