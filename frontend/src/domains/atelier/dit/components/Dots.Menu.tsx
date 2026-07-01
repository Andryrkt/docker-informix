import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Share2, Edit, Trash, MoreVerticalIcon } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  numeroDemandeIntervention: string;
};

function DotsMenu({ numeroDemandeIntervention }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-4 w-4 p-0 ">
          <span className="sr-only">Open menu</span>
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="ml-4">
        <DropdownMenuItem asChild>
          <Link
            to={`/atelier/demande-intervention/duplication/${numeroDemandeIntervention}`}
          >
            Dupliquer
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Soummission</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          Cloturer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default React.memo(DotsMenu);
