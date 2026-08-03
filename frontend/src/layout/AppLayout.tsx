import Header from "@/components/common/navigation/Header";
import { lazy, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import LogoHff from "@/assets/logoHFF.jpg";
import Footer from "./components/Footer";
import { useAuth } from "@/context/authContext";
import { AppBreadcrumb } from "@/components/common/AppBreadcrumb";
import { usePageTracker } from "@/hooks/usePageTracker";
import { VignetteProvider } from "@/context/VignetteContext";
import { useMatches } from "react-router-dom";

function AppLayouts() {
  const { user } = useAuth();

  usePageTracker({ enabled: !!user });

  const matches = useMatches();

  const appName = import.meta.env.VITE_APP_NAME;
  const pageTitle = (matches[matches.length - 1]?.handle as any)?.title;

  useEffect(() => {
    document.title = pageTitle ? `${appName} | ${pageTitle}` : appName;
  }, [pageTitle, appName]);

  return (
    <VignetteProvider>
      <div className="flex max-w-screen">
        {/* {user && <AuthSideBar />} */}
        <div className="w-full  flex flex-col flex-1 sticky  top-0">
          {user && (
            <>
              <Header logoSrc={LogoHff} userName={user.displayName} />
              <div className="py-2 px-8 my-2">
                <AppBreadcrumb />
              </div>
            </>
          )}
          <main className="grow flex flex-col justify-center items-center  ">
            <Outlet />
            {/* <ScrollRestoration /> */}
            <Toaster richColors />
          </main>
          {/* <Footer /> */}
        </div>
      </div>
    </VignetteProvider>
  );
}

export default AppLayouts;
