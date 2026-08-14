import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Placeholder API functions – replace with your real ones
import { fetchORDetail, fetchRIDetail } from "../api/ditApi";
import ListeCmdeTable from "./atom/ListeCmdeTable";
import ListeRi from "./atom/ListeRi";

function DetailDialog({
  open,
  onOpenChange,
  type,
  id,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "or" | "ri" | null;
  id: string | null;
}) {
  // Determine which query to use
  const queryFn =
    type === "or"
      ? () => fetchORDetail(id!)
      : type === "ri"
        ? () => fetchRIDetail(id!)
        : null;
  const queryKey =
    type === "or"
      ? ["or-detail", id]
      : type === "ri"
        ? ["ri-detail", id]
        : null;

  const { data, isLoading, error } = useQuery({
    queryKey: queryKey!,
    queryFn: queryFn!,
    enabled: open && !!type && !!id, // only fetch when dialog is open
  });

  // Render loading or error
  if (!open) return null;

  let title = "";
  let content = null;

  if (type === "or") {
    title = `Détails de la commande OR – ${id}`;
    content = isLoading ? (
      <Skeleton className="h-20 w-full" />
    ) : error ? (
      <p className="text-red-500">Erreur de chargement cmde OR</p>
    ) : (
      // Assume data contains the list of command details
      <ListeCmdeTable data={data} />
    );
  } else if (type === "ri") {
    title = `Liste des RI – ${id}`;
    content = isLoading ? (
      <Skeleton className="h-20 w-full" />
    ) : error ? (
      <p className="text-red-500">Erreur de chargement RI</p>
    ) : (
      <ListeRi data={data} />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{content}</div>
      </DialogContent>
    </Dialog>
  );
}

export default DetailDialog;
