import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type VignetteCardProps = {
  title: string;
  icon?: IconDefinition;
  onClick?: () => void;
};

export function VignetteCard({
  title,
  icon = faHome,
  onClick,
}: VignetteCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-[linear-gradient(45deg,transparent_5%,rgba(180,180,180,.2)_60%,transparent_75%,transparent_100%)] bg-size-[250%_250%,100%_100%]
       bg-position-[-100%_0,0_0] bg-no-repeat transition-[background-position_1s_ease] hover:bg-position-[200%_0,0_0]
       group relative mx-auto w-70  h-56 cursor-pointer overflow-hidden border border-gray-100/50 bg-gray-50 py-10 text-center shadow-brand-dark shadow-xl/10 drop-shadow-black  duration-400 ease-in-out hover:scale-105 hover:shadow-xl/30 hover:duration-500 rounded-md"
    >
      <span className="relative z-10 text-zinc-200 mx-auto inline-flex w-full items-center justify-center transition-colors group-hover:text-brand-primary">
        <FontAwesomeIcon
          icon={icon}
          style={{
            width: "87.5px",
            height: "100px",
          }}
          className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
        />
      </span>
      <h3 className="relative z-10 text-brand-dark/75 mt-4 text-xl font-bold tracking-tight capitalise transition-all duration-300 group-hover:scale-110 group-hover:text-brand-primary">
        {title}
      </h3>
    </div>
  );
}
