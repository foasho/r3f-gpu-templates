import type { ReactNode } from "react";
import { HeroUIProvider } from "@heroui/react";

export const HeroUIProviderComponent = ({ children }: { children: ReactNode }) => {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
}
