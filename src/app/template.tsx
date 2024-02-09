"use client";

import { ChessProvider } from "@/providers/ChessProvider/provider";
import { PuzzleProvider } from "@/providers/PuzzleProvider/provider";
import { PropsWithChildren } from "react";
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

import dynamic from 'next/dynamic'

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
        <PuzzleProvider>
          <PostHogPageView />
          {children}
        </PuzzleProvider>
      </ChessProvider>
    </PostHogProvider>
  );
}