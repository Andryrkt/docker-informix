import { ModuleCard } from "../components/ModuleCard";
import {
  moduleItems,
  type AppModule,
  type ModuleModal,
} from "../schema/moduleItems";
import { useVignetteDialog } from "../components/ModuleDialog";
import { useTranslation } from "react-i18next";
import { WelcomeDialog } from "@/components/common/WelcomeDialog";
import { useMenuNavigation } from "@/hooks/useMenuNavigation";
import { navigationToModuleItems } from "@/lib/navigationToModuleItems";
import LoaderSpinner from "@/components/common/LoaderSpinner";
import { fetchNavigation } from "@/domains/authentification/api/navigationApi";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";

function HomePage() {
  const { openDialog, ModuleDialogComponent } = useVignetteDialog();
  const { t } = useTranslation();
  const { activeCompany } = useAuth(); // get the currently selected company

  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if no company is selected yet
    if (!activeCompany) {
      setModules([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadModules = async () => {
      try {
        const data = await fetchNavigation(activeCompany.id);
        console.log("Data", data);
        if (!cancelled) {
          setModules(data ? navigationToModuleItems(data) : []);
          setLoading(false);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || t("error:erreur"));
          setLoading(false);
        }
      }
    };

    loadModules();

    return () => {
      cancelled = true;
    };
  }, [activeCompany]);

  if (loading) {
    return (
      <div className="flex flex-1 h-full w-full items-center justify-center ">
        <LoaderSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-destructive">
          {t("error:erreur")} {error}
        </p>
      </div>
    );
  }

  if (!modules?.length) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">
          {t("error:aucun-module-disponible-pour-votre-profil")}
        </p>
      </div>
    );
  }

  return (
    <>
      <WelcomeDialog />
      <div className="w-full h-full flex-1 ">
        <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-10 gap-y-10 px-10 w-fit py-20 mx-auto   ">
          {modules.map((module) => {
            return (
              <ModuleCard
                key={module.nomModule}
                title={module.nomModule}
                icon={module.icon}
                onClick={() => openDialog(module.moduleModal as ModuleModal)}
              />
            );
          })}
          <ModuleDialogComponent />
        </div>
      </div>
    </>
  );
}

export default HomePage;
