import { Button } from "@/components/ui/button";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import { MoreVerticalIcon } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type MenuAction = {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  // Option 1: Standard click handler (e.g., Cloturer)
  onClick?: () => void;
  // Option 2: Navigation link (e.g., Dupliquer)
  to?: string;
  // Option 3: Custom component element for Dialog content
  dialogContent?: React.ReactNode;
};

type Props = {
  actions: MenuAction[];
  triggerClassName?: string;
  contentClassName?: string;
};

function DotsMenu({ actions, triggerClassName, contentClassName }: Props) {
  // Track which specific dialog action is currently active/open
  const [activeDialogOpenIndex, setActiveDialogOpenIndex] = useState<
    number | null
  >(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("h-4 w-4 p-0 focus-visible:ring-0", triggerClassName)}
        >
          <span className="sr-only">Open menu</span>
          <MoreVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "w-40 px-2 py-2 bg-brand-dark  text-white",
          contentClassName,
        )}
      >
        {actions.map((action, index) => {
          const Icon = action.icon;

          // Render Strategy A: Action triggers an interactive modal dialog
          if (action.dialogContent) {
            return (
              <Dialog
                key={index}
                open={activeDialogOpenIndex === index}
                onOpenChange={(open) =>
                  setActiveDialogOpenIndex(open ? index : null)
                }
              >
                {/* 
                  CRITICAL: e.preventDefault() on selection stops Radix from focus-shifting 
                  and forcing the dropdown to tear down the Dialog nodes unexpectedly. 
                */}
                <DropdownMenuItem
                  className={cn(
                    "cursor-pointer hover:bg-brand-primary duration-100 transition focus:bg-brand-primary",
                    action.className,
                  )}
                  onSelect={(e) => {
                    e.preventDefault();
                    setActiveDialogOpenIndex(index);
                  }}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </DropdownMenuItem>

                {action.dialogContent}
              </Dialog>
            );
          }

          // Render Strategy B: Action is an internal router navigation link
          if (action.to) {
            return (
              <DropdownMenuItem
                key={index}
                asChild
                className={cn(
                  " hover:bg-brand-primary duration-100 transition focus:bg-brand-primary",
                  action.className,
                )}
              >
                <Link
                  to={action.to}
                  className="w-full flex items-center cursor-pointer"
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {action.label}
                </Link>
              </DropdownMenuItem>
            );
          }

          // Render Strategy C: Action is a standard function click trigger
          return (
            <DropdownMenuItem
              key={index}
              onClick={action.onClick}
              className={cn(
                "cursor-pointer flex items-center",
                action.className,
              )}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default React.memo(DotsMenu);
