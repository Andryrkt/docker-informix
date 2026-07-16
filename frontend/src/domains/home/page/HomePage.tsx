import { VignetteCard } from "../components/VignetteCard";
import { vignetteMock } from "../schema/vignetteMock";
import { useVignetteDialog } from "../components/VignetteModal";
import { useTranslation } from "react-i18next";

function HomePage() {
  const { openDialog, VignetteDialogComponent } = useVignetteDialog();
  const { t } = useTranslation("vignette");

  return (
    <div className="w-full h-full flex-1 ">
      <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-10 px-40 py-20   ">
        {vignetteMock.map((item) => {
          const Icon = item.icon;

          return (
            <VignetteCard
              key={item.titleKey}
              title={t(`${item.titleKey}.title`)}
              icon={
                <Icon className="size-20 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
              }
              onClick={() => openDialog(item.modal)}
            />
          );
        })}

        <VignetteDialogComponent />
      </div>
    </div>
  );
}

export default HomePage;
