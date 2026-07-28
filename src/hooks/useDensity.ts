import { useEffect, useState } from "react";

const KEY = "ui:density";
export type Density = "comfortable" | "compact";

export function useDensity() {
  const [density, setDensity] = useState<Density>(
    () => (localStorage.getItem(KEY) as Density) || "comfortable"
  );

  useEffect(() => {
    localStorage.setItem(KEY, density);
    document.documentElement.dataset.density = density;
  }, [density]);

  return {
    density,
    setDensity,
    toggle: () => setDensity((d) => (d === "compact" ? "comfortable" : "compact")),
  };
}
