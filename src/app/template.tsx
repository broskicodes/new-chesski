"use client";

import { ChessProvider } from "@/providers/ChessProvider/provider";
import { PuzzleProvider } from "@/providers/PuzzleProvider/provider";
import { PropsWithChildren } from "react";

export default function Template({ children }: PropsWithChildren) {

  return (
    <ChessProvider>
      <PuzzleProvider>
        {children}
      </PuzzleProvider>
    </ChessProvider>
  );
}