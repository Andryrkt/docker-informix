import React from "react";
import { VignetteCard } from "../components/VignetteCard";
import { VIGNETTES } from "../schema/vignette";

function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {VIGNETTES.map((v) => (
        <VignetteCard
          key={v.key}
          title={v.title}
          //   icon={v.icon}
          onClick={function (): void {
            throw new Error("Function not implemented.");
          }} //   onClick={() => setActive(v)}
        />
      ))}
    </div>
  );
}

export default HomePage;
