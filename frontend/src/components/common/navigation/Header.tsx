// import { useAuth } from "@/context/AuthContext";
// import { DesktopNavigation } from "../atom/DesktopNavigation";
// import { publicMenuItems } from "./items/MenuItems";

type HeaderProps = {
  logoSrc: string;
};

function Header({ logoSrc }: HeaderProps) {
  const loading = false; // Replace with actual loading state from context or props
  //   const { loading } = useAuth();

  // 👉 Render skeleton while loading
  if (loading) {
    return (
      <div className="w-full flex items-center justify-between px-8 py-2 bg-gray-800  shadow-md sticky top-0 z-[9998]">
        <div className="flex items-center ">
          <img
            src={logoSrc}
            alt="HFF-logo"
            className=" h-20 w-auto object-contain border"
          />
        </div>
      </div>
    );
  }

  const baseUrl = import.meta.env.VITE_APP_BASE || "/";
  // 👉 Fallback for public users
  return (
    <div className="w-full flex items-center justify-between px-4 lg:px-8 py-2 bg-gray-800 text-white shadow-md sticky top-0 z-[9998]">
      <div className="flex items-center justify-center py-2  w-max">
        <a href={baseUrl}>
          <img
            src={logoSrc}
            alt="HFF-logo"
            className="h-10 lg:h-14 object-contain drop-shadow-xs/40 drop-shadow-amber-50"
          />
        </a>
      </div>
      {/* <DesktopNavigation menuItems={publicMenuItems} /> */}
    </div>
  );
}

export default Header;
