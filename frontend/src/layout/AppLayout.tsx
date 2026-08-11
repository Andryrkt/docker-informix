import Header from "@/components/common/navigation/Header";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import LogoHff from "@/assets/logoHFF.jpg";
import { useAuth } from "@/context/authContext";
import { AppBreadcrumb } from "@/components/common/AppBreadcrumb";
import { usePageTracker } from "@/hooks/usePageTracker";
import { useMatches } from "react-router-dom";

import { PermissionBar } from "@/components/common/PermissionBar";

function AppLayouts() {
  const { user } = useAuth();

  usePageTracker({ enabled: !!user });

  const matches = useMatches();

  const appName = import.meta.env.VITE_APP_NAME;
  const pageTitle = (matches[matches.length - 1]?.handle as any)?.title;

  const currentRoute = matches[matches.length - 1];
  const handle = currentRoute?.handle as {
    title?: string;
    hideHeader?: boolean;
    hideBreadcrumb?: boolean;
  };

  const hideHeader = handle?.hideHeader ?? false;
  const hideBreadcrumb = handle?.hideBreadcrumb ?? false;

  useEffect(() => {
    document.title = pageTitle ? `${appName} | ${pageTitle}` : appName;
  }, [pageTitle, appName]);

  return (
    <div className="flex max-w-screen">
      <div className="w-full  flex flex-col flex-1 sticky  top-0">
        {user && (
          <>
            {!hideHeader && (
              <Header logoSrc={LogoHff} userName={user.displayName} />
            )}
            {!hideBreadcrumb && (
              <div className="py-2 px-8 my-2">
                <AppBreadcrumb />
              </div>
            )}
          </>
        )}
        <main className="grow flex flex-col justify-center items-center relative  ">
          <PermissionBar />
          <Outlet />
          {/* <ScrollRestoration /> */}
          <Toaster richColors />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default AppLayouts;
