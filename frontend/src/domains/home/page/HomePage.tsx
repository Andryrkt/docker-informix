import { VignetteCard } from "../components/VignetteCard";
import { vignetteItems, type VignetteCardData } from "../schema/vignetteItems";
import { useVignetteDialog } from "../components/VignetteModal";
import { useTranslation } from "react-i18next";
import { WelcomeDialog } from "@/components/common/WelcomeDialog";

function HomePage() {
  const { openDialog, VignetteDialogComponent } = useVignetteDialog();

  return (
    <>
      <WelcomeDialog />
      <div className="w-full h-full flex-1 ">
        <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-10 gap-y-10 px-10 w-fit py-20 mx-auto   ">
          {vignetteItems.map((item: VignetteCardData) => {
            const Icon = item.icon;

            return (
              <VignetteCard
                key={item.title}
                title={item.title}
                icon={Icon}
                onClick={() => openDialog(item.modal as any)}
              />
            );
          })}

          <VignetteDialogComponent />
        </div>
      </div>
    </>
  );
}

export default HomePage;
