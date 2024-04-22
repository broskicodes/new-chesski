import posthog from "posthog-js";
import { Button, buttonVariants } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { SubType } from "@/utils/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface Props {
  open: boolean;
}

export const FreeTrialModal = ({ open }: Props) => {
  const router = useRouter();

  return (
    <Dialog open={open}>
      <DialogContent allowClose={false}>
        <DialogHeader className="flex flex-col items-center">
          <p className="py-1.5 px-4 border border-1 border-indigo-500 text-indigo-500 rounded-full text-sm font-semibold uppercase tracking-wide">
            Exclusive Offer
          </p>
          <DialogTitle className="text-3xl font-bold">Get 7 Days Free</DialogTitle>
          <DialogDescription>Join <span className="font-bold">5000+</span> training with Chesski</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <div className="flex flex-col w-full space-y-2">
            <Button 
              className="w-full py-6" 
              variant="default" 
              size="lg"
              onClick={async () => {
                posthog.capture("trial_clicked")
                const re = await fetch("/api/stripe/checkout/session", { 
                  method: "POST", 
                  body: JSON.stringify({
                    subType: SubType.Monthly,
                    // @ts-ignore
                    referral: window.tolt_referral,
                    trial: true
                  }) 
                }); 

                const link = await re.text();

                router.push(link);
              }} >
              <span className="font-bold text-xl">Start Free Trial</span>
            </Button>
            <DialogDescription className="text-center"><span className="font-bold">Cancel Anytime</span> | Renews at $10/month</DialogDescription>
            <Link href={`/play`} className={buttonVariants({ variant: "link" })}>No interested</Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}