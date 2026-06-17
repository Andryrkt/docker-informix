import { ShoppingCart } from "lucide-react";

type VignetteCardProps = {
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
};

export function VignetteCard({
  title,
  icon = (
    <ShoppingCart className="size-20 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
  ),
  onClick,
}: VignetteCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative mx-auto w-full max-w-sm cursor-pointer overflow-hidden border-gray-100 bg-zinc-50 bg-[linear-gradient(45deg,transparent_10%,rgba(255,255,255,.65)_45%,rgba(255,255,255,.85)_50%,rgba(255,255,255,.65)_55%,transparent_90%)]
bg-position-[-150%_0]
bg-no-repeat py-10 text-center shadow-black drop-shadow-xs/30 drop-shadow-black transition-all duration-250 ease-in-out hover:scale-105 hover:bg-position-[200%_0,0_0] hover:shadow-md/20 hover:drop-shadow-md/20 hover:duration-400 rounded-xs"
    >
      <span className="text-gray-300 mx-auto inline-flex w-full items-center justify-center  transition-colors group-hover:text-brand-primary">
        {icon}
      </span>
      <h3 className="text-gray-300 mt-2 text-xl font-medium tracking-tight uppercase transition-all duration-300 group-hover:scale-110 group-hover:text-brand-primary">
        {title}
      </h3>
    </div>
  );
}
