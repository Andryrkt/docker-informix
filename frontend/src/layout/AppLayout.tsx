import Header from "@/components/common/navigation/Header";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import LogoHff from "@/assets/logoHFF.jpg";
import Footer from "./components/Footer";
import { useAuth } from "@/context/AuthContext";
import { AppBreadcrumb } from "@/components/common/AppBreadcrumb";
import { useBreadcrumbs } from "@/hooks/breadcrumb";

function AppLayouts() {
  const { user } = useAuth();

  const appName = import.meta.env.VITE_APP_NAME;
  const title = import.meta.env.VITE_APP_TITLE;

  useEffect(() => {
    document.title = `${appName} | ${title}`;
  }, [appName, title]);

  const location = useLocation();
  const routeKey = location.pathname;
  const { data, isLoading } = useBreadcrumbs(routeKey);

  const items = data ?? [];
  return (
    <div className="flex max-w-screen">
      {/* {user && <AuthSideBar />} */}
      <div className="w-full min-h-screen flex flex-col flex-1">
        {user && (
          <>
            <Header
              logoSrc={LogoHff}
              userName={"Andrialazantsoa Narindra Hajaina"}
            />
            <div className="px-8 py-6">
              {!isLoading && items.length > 1 && (
                <AppBreadcrumb items={items} />
              )}
            </div>
          </>
        )}
        <main className="grow flex flex-col justify-center items-center ">
          <Outlet />
          {/* <ScrollRestoration /> */}
          <Toaster richColors />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default AppLayouts;
