"use client";

import { GameProvider } from "@/providers/GameProvider";
import { SetupProvider } from "@/providers/SetupProvider";
import { PropsWithChildren } from "react";

export default function Template({ children }: PropsWithChildren) {

  return (
    <GameProvider>
      <SetupProvider>
        {children}
      </SetupProvider>
    </GameProvider>
  )
}
