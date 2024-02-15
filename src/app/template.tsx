"use client";

import { ChessProvider } from "@/providers/ChessProvider/provider";
import { PuzzleProvider } from "@/providers/PuzzleProvider/provider";
import { StockfishProvider } from "@/providers/StockfishProvider/provider";
import { PropsWithChildren } from "react";
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

import dynamic from 'next/dynamic'
import { CoachProvider } from "@/providers/CoachProvider/provider";

const PostHogPageView = dynamic(() => import('../components/PostHogPageView'), {
  ssr: false,
})

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false // Disable automatic pageview capture, as we capture manually
  })
}

export default function Template({ children }: PropsWithChildren) {

  return (
    <PostHogProvider client={posthog}>
      <ChessProvider>
        <StockfishProvider>
          <PuzzleProvider>
            <CoachProvider>
              <PostHogPageView />
              {children}
            </CoachProvider>
          </PuzzleProvider>
        </StockfishProvider>
      </ChessProvider>
    </PostHogProvider>
  );
}