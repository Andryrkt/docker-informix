import { useConfirm } from "@/components/common/ConfirmDialog";
import { createDit } from "../api/ditApi";
import DitForm from "../components/DitForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function DitCreation() {
  const confirm = useConfirm();
  const navigate = useNavigate();

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        <div>
          <DitForm
            mode="create"
            onSubmitDit={async (data) => {
              const confirmed = await confirm({
                title: "Confirmer la création de la DIT",
                description: "Voulez-vous vraiment créer cette DIT ?",
                confirmText: "Confirmer",
                cancelText: "Annuler",
              });
              if (!confirmed) return;
              const dit = await createDit(data);
              toast.success(`DIT ${dit.numeroDemandeIntervention} créée.`);
              navigate("/atelier/demande-intervention/dit-list");
            }}
          ></DitForm>
        </div>
      </div>
    </div>
  );
}

export default DitCreation;
