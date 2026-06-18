import Header from "@/components/common/navigation/Header";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import LogoHff from "@/assets/logoHFF.jpg";
import Footer from "./components/Footer";
import { useAuth } from "@/context/AuthContext";

function AppLayouts() {
  const appName = import.meta.env.VITE_APP_NAME;
  const title = import.meta.env.VITE_APP_TITLE;
  useEffect(() => {
    document.title = `${appName} | ${title}`;
  }, [appName, title]);

  const { user } = useAuth();

  //   const { user } = useAuth();
  return (
    <div className="flex max-w-screen">
      {/* {user && <AuthSideBar />} */}
      <div className="w-full min-h-screen flex flex-col flex-1">
        {user && (
          <Header
            logoSrc={LogoHff}
            userName={"Andrialazantsoa Narindra Hajaina"}
          />
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
