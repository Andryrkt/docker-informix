import { ModuleCard } from "../components/ModuleCard";
import { type AppModule, type ModuleModal } from "../schema/moduleItems";
import { useVignetteDialog } from "../components/ModuleDialog";
import { useTranslation } from "react-i18next";
import { WelcomeDialog } from "@/components/common/WelcomeDialog";
import { useMenuNavigation } from "@/hooks/useMenuNavigation";
import { navigationToModuleItems } from "@/lib/navigationToModuleItems";
import LoaderSpinner from "@/components/common/LoaderSpinner";
import { useMemo } from "react";

function HomePage() {
  const { openDialog, ModuleDialogComponent } = useVignetteDialog();
  const { t } = useTranslation();
  const { data, isLoading, error } = useMenuNavigation();
  const modules: AppModule[] = useMemo(
    () => (data ? navigationToModuleItems(data) : []),
    [data],
  );

  if (isLoading) {
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
          {t("error:erreur")} {error.message}
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
