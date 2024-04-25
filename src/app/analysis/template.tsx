"use client";

import { AnalysisProvider } from "@/providers/AnalysisProvider";
import { PropsWithChildren } from "react";

export default function Template({ children }: PropsWithChildren) {

  return (
    <AnalysisProvider>
      {children}
    </AnalysisProvider>
  )
}
