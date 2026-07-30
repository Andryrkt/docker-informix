import { useConfirm } from "@/components/common/ConfirmDialog";
import DitForm from "../components/DitForm";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { createDit } from "../api/ditApi";
import { useTranslation } from "react-i18next";

function DitCreation() {
  const { t } = useTranslation(["common", "confirmation"]);
  const confirm = useConfirm();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const confirmed = await confirm({
      title: "Confirmer la création",
      description: "Voulez-vous vraiment créer cette DIT ?",
      confirmText: t("confirmation:oui-creer"),
      cancelText: t("confirmation:annuler"),
      variant: "default",
    });
    if (!confirmed) return;

    try {
      const response = await createDit(data);
      await Swal.fire({
        title: "Succès !",
        text: response.message || "DIT créée avec succès !",
        icon: "success",
        confirmButtonColor: "#22c55e",
        confirmButtonText: "OK",
        timer: 3000,
        timerProgressBar: true,
      });

      // Optionnel : Rediriger ici après la fermeture de SweetAlert
      navigate("/atelier/demande-intervention/dit-list");
    } catch (error) {
      Swal.close(); // Fermer le loader
      await Swal.fire({
        title: "Erreur",
        text: error.message || "Une erreur est survenue lors de la création.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        <div>
          <DitForm mode="create" onSubmitDit={handleSubmit}></DitForm>
        </div>
      </div>
    </div>
  );
}

export default DitCreation;
