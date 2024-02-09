"use client";

import { ChessProvider } from "@/providers/ChessProvider/provider";
import { PuzzleProvider } from "@/providers/PuzzleProvider/provider";
import { StockfishProvider } from "@/providers/StockfishProvider/provider";
import { PropsWithChildren } from "react";

export default function Template({ children }: PropsWithChildren) {

  return (
    <ChessProvider>
      <StockfishProvider>
        <PuzzleProvider>
          {children}
        </PuzzleProvider>
      </StockfishProvider>
    </ChessProvider>
  );
}