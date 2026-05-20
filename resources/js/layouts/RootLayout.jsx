import { Outlet } from "react-router-dom";
import PageProgressBar from "../components/common/PageProgressBar";
import { PageProgressProvider } from "../hooks/progress/PageProgressContext";

export default function RootLayout() {
  return (
    <PageProgressProvider>
      <PageProgressBar />
      <Outlet />
    </PageProgressProvider>
  );
}
