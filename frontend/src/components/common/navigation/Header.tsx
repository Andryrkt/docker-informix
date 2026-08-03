// import { useAuth } from "@/context/AuthContext";
// import { DesktopNavigation } from "../atom/DesktopNavigation";
// import { publicMenuItems } from "./items/MenuItems";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/authContext";
import NotificationBell from "@/domains/notifications/components/NotificationBell";
import VisualTimer from "@/layout/VisualTimer";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Globe,
  Info,
  Layers,
  LogOut,
  LogOutIcon,
  ShieldUser,
  User2Icon,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useConfirm } from "../ConfirmDialog";
import { useTranslation } from "react-i18next";

type HeaderProps = {
  logoSrc: string;
  userName: string;
};

function Header({ logoSrc, userName }: HeaderProps) {
  const { loading, user, logout, activeCompany } = useAuth();

  const baseUrl = import.meta.env.VITE_APP_BASE || "/";

  const confirm = useConfirm();
  const { t, i18n } = useTranslation("header");

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: t("logoutTitle"),
      description: t("logoutDescription"),
      confirmText: t("confirm"),
      cancelText: t("cancel"),
      variant: "brand",
      icon: <LogOutIcon></LogOutIcon>,
    });
    if (!confirmed) return;
    logout();
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === "fr" ? "en" : "fr";
    i18n.changeLanguage(nextLang);
  };

  // Render skeleton while loading
  if (loading) {
    return (
      <div className="w-full flex items-center justify-between px-8 py-2 bg-brand-dark shadow-md sticky top-0 z-9998">
        <div className="flex items-center border">
          <img
            src={logoSrc}
            alt="HFF-logo"
            className="w-10 object-contain border border-white"
          />
        </div>
      </div>
    );
  }

  // Render skeleton while loading
  if (loading) {
    return (
      <div className="w-full flex items-center justify-between px-8 py-2 bg-brand-dark  shadow-md sticky top-0 z-9998">
        <div className="flex items-center border">
          <img
            src={logoSrc}
            alt="HFF-logo"
            className="w-10 object-contain border border-white"
          />
        </div>
      </div>
    );
  }

  return (
    <nav className="w-full flex items-center justify-between px-4 lg:px-8 py-2 bg-brand-dark text-white sticky top-0 z-50">
      <div className="flex justify-between py-2 gap-2 w-full">
        <div className="flex items-center gap-4 ">
          <a
            href={baseUrl}
            className="flex items-center justify-center py-2 gap-2 w-max"
          >
            <img src={logoSrc} alt="HFF-logo" className="h-10 object-contain" />
          </a>
          <VisualTimer />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative lg:block hidden ">
            <Button
              // onClick={() => setIsProfileOpen(!false)}
              className="flex items-center focus:outline gap-2 bg-transparent hover:bg-transparent text-neutral-200"
              aria-label="User menu"
            >
              <span className="text-[0.65rem]">version :V20261606.258</span>
            </Button>
          </div>
          <div className="relative">
            {/* // Tooltip */}
            {/* <Tooltip>
              <TooltipTrigger>
                {" "}
                <Button
                  // onClick={() => setIsProfileOpen(!false)}
                  className="flex items-center focus:outline gap-2 bg-transparent hover:bg-transparent text-neutral-200 hover:text-blue-500 focus:text-blue-500"
                  aria-label="User menu"
                >
                  <Info />
                  <span className="text-[0.65rem]">
                    Guide utilisateur intranet
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="rounded-sm">
                <p>Guide utilisateur intranet</p>
              </TooltipContent>
            </Tooltip> */}

            <Button
              // onClick={() => setIsProfileOpen(!false)}
              className="flex items-center focus:outline gap-2 bg-transparent hover:bg-transparent text-neutral-200 hover:text-blue-500 focus:text-blue-500"
              aria-label={t("user-menu")}
            >
              <Info />
              <span className="text-[0.65rem] lg:block hidden">
                {t("userGuide")}
              </span>
            </Button>
          </div>
          <div className="">
            <Button
              onClick={toggleLanguage}
              className=" flex items-center justify-center bg-transparent hover:bg-transparent text-neutral-200 hover:text-blue-500 focus:text-blue-500"
              aria-label={t("changer-la-langue")}
            >
              <span className=" uppercase  ">{i18n.language}</span>
            </Button>
          </div>
          <div className="relative">
            <NotificationBell />
          </div>
          <div className="relative ">
            <DropdownMenu>
              {/* The Trigger replaces your manual button click logic */}
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center focus:outline gap-2 bg-transparent hover:bg-transparent text-brand-primary cursor-pointer shadow-none p-0 group"
                  aria-label={t("user-menu")}
                >
                  <User2Icon className="h-5 w-5" />
                  <span className="text-[0.65rem]  truncate text-left font-medium lg:block hidden">
                    {user?.displayName}
                  </span>
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-full  mt-2 bg-brand-dark text-brand-primary"
              >
                {user.companies.map((company) => (
                  <DropdownMenuItem key={company.id} className="cursor-pointer">
                    <span className="text-[0.65rem]">{company.name}</span>

                    {activeCompany?.id === company.id && (
                      <span className="ml-auto text-xs">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuItem
                  asChild
                  className="lg:hidden block on bg-inherit"
                >
                  <Button
                    // onClick={() => setIsProfileOpen(!false)}
                    className="flex items-center focus:outline gap-2 bg-transparent hover:bg-transparent text-neutral-200"
                    aria-label={t("user-menu")}
                  >
                    <span className="text-[0.65rem]">
                      version : V20261606.258
                    </span>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="lg:hidden block"></DropdownMenuSeparator>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center w-full cursor-pointer">
                    <ShieldUser className="mr-2 h-4 w-4" />
                    <span>{t("administration")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-brand-dark text-brand-primary">
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/societes"
                        className="flex items-center w-full cursor-pointer"
                      >
                        <Building2 className="mr-2 h-4 w-4" />
                        <span>{t("companies")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/agences"
                        className="flex items-center w-full cursor-pointer"
                      >
                        <Layers className="mr-2 h-4 w-4" />
                        <span>{t("agencies")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/services"
                        className="flex items-center w-full cursor-pointer"
                      >
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>{t("services")}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin/utilisateurs"
                        className="flex items-center w-full cursor-pointer"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>{t("users")}</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;
