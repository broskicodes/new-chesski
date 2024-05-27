"use client";
import "./styles.css";

import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/providers/AuthProvider/context";
import { useUserData } from "@/providers/UserDataProvider/context";
import {
  API_URL,
  CHESSKI_MONTHLY_PRICE,
  CHESSKI_YEARLY_PRICE,
  SubType,
} from "@/utils/types";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import React, { Suspense, useEffect, useMemo, useState } from "react";
import { FreeTrialModal } from "@/components/FreeTrialModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SubPage = () => {
  // const [annual, setAnnual] = useState(true);
  const [currTab, setCurrTab] = useState("yearly")

  const { isPro } = useUserData();
  const { session, signInWithOAuth } = useAuth();
  const router = useRouter();

  const pricing = useMemo(
    () => ({
      tiers: [
        // {
        //   title: "Basic",
        //   price: 0,
        //   description: "Get a taste of Chesski.",
        //   features: ["Unlimited games", "Analyze 3 positions a day", "Analyze 2 games per day"],
        //   cta: "Monthly billing",
        //   mostPopular: false,
        // },
        {
          title: "Pro",
          price: currTab === "yearly" ? Math.round(CHESSKI_YEARLY_PRICE / 12 * 100) / 100 : CHESSKI_MONTHLY_PRICE,
          // description: "Unlimited access to all features.",
          promo: "Try free for 3 days",
          features: [
            "Unlimited game and position analysis",
            "Unlimited custom puzzles",
            "Custom AI insights",
            "Access to all new features",
          ],
          cta: "Try for free",
          mostPopular: true,
        },
      ],
    }),
    [currTab],
  );


  return (
    <div className="pb-8 h-full flex flex-col justify-center items-center">
      <Navbar showMobile={true} />
      {/* <Suspense>
        <FreeTrialModal />
      </Suspense> */}
      {/* <div className="flex flex-col items-center space-y-4 mt-[64px] sm:mt-0">
        <div className="font-bold text-4xl">Subscribe to Chesski</div>
        <div className="flex flex-row space-x-2 items-center">
          <Label className="text-lg">Annual</Label>
          <Switch
            checked={annual}
            onCheckedChange={(checked) => setAnnual(checked)}
          />
        </div>
      </div> */}
      <Tabs 
        className="flex flex-col items-center space-y-6"
        defaultValue="yearly"
        onValueChange={(val) => {
          setCurrTab(val);
        }} >
        <TabsList className="w-60 h-12">
          <TabsTrigger value="yearly" className="w-full h-full">Yearly</TabsTrigger>
          <TabsTrigger value="monthly" className="w-full h-full">Monthly</TabsTrigger>
        </TabsList>
        {["monthly", "yearly"].map((type: string) => (
          <TabsContent key={type} value={type}>
            {pricing.tiers.map((tier) => (
              <div key={tier.title} className="flex flex-col items-center">
                <div className="font-bold text-2xl sm:text-4xl font-m mb-8 text-center flex flex-col">
                  <span className="whitespace-nowrap">Your very own chess coach!</span> 
                  <span className="whitespace-nowrap font-medium">for only</span>
                </div>
                <div className="mb-6 flex flex-col items-center">
                  <div className="font-m"><span className="text-6xl font-semibold text-[#1b03a3]">${tier.price}</span> /month</div>
                  {type === "yearly" && <CardDescription className="text-lg font-m">billed anually</CardDescription>}
                </div>
                {session && !isPro && (
                  <Button
                    size="lg"
                    className="w-60"
                    onClick={async () => {
                      posthog.capture("sub_clicked");
                      const re = await fetch(`${API_URL}/stripe/session/checkout`, {
                        method: "POST",
                        credentials: "include",
                        headers: {
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          subType: currTab === "yearly" ? SubType.Yearly : SubType.Monthly,
                          // @ts-ignore
                          referral: window.tolt_referral,
                          trial: true
                        }),
                      });

                      const link = await re.text();

                      router.push(link);
                    }}
                  >
                    <span className="font-bold text-xl">{tier.cta}</span>
                  </Button>
                )}
                {session && isPro && (
                  <Button
                    disabled
                    className="w-60 disabled:opacity-70 disabled:bg-[#1b03a3] disabled:ring-gred:ring-4"
                  >
                    Subscibed
                  </Button>
                )}
                {!session && (
                  <Button
                    className="w-60"
                    onClick={() => {
                      signInWithOAuth("subscribe");
                    }}
                  >
                    Sign Up
                  </Button>
                )}
                <ul role="list" className="mt-6 space-y-2 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex">
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="flex-shrink-0 w-4 h-4 text-indigo-500"
                        aria-hidden="true"
                      />
                      <span className="ml-2 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              // <Card
              //   key={tier.title}
              //   // className={`${tier.mostPopular ? "border-4 border-indigo-500" : ""} relative sm:w-[312px]`}
              // >
              //   {/* {tier.mostPopular ? (
              //     <p className="absolute top-0 left-1/2 py-1.5 px-4 bg-indigo-500 rounded-full text-xs font-semibold uppercase tracking-wide text-white transform -translate-y-1/2 -translate-x-1/2">
              //       Improve faster
              //     </p>
              //   ) : null} */}
              //   <CardHeader>
              //     <CardTitle className="text-2xl">{tier.title}</CardTitle>
              //     {/* <CardDescription className="text-md">
              //       {tier.description}
              //     </CardDescription> */}
              //   </CardHeader>
              //   <CardContent className="flex flex-col space-y-2 h-[105px]">
              //     {tier.price > 0 && (
              //       <div>
              //         <span className="font-bold text-3xl">${tier.price}</span> /month
              //         {/* {annual ? "year" : "month"} */}
              //       </div>
              //     )}
              //     {tier.price === 0 && (
              //       <span className="font-semibold text-3xl">FREE</span>
              //     )}
              //     {tier.price > 0 && (
              //       <div>
              //         {session && !isPro && (
              //           <Button
              //             className="w-full"
              //             onClick={async () => {
              //               posthog.capture("sub_clicked");
              //               const re = await fetch("/api/stripe/checkout/session", {
              //                 method: "POST",
              //                 body: JSON.stringify({
              //                   subType: currTab === "yearly" ? SubType.Yearly : SubType.Monthly,
              //                   // @ts-ignore
              //                   referral: window.tolt_referral,
              //                   trial: true
              //                 }),
              //               });

              //               const link = await re.text();

              //               router.push(link);
              //             }}
              //           >
              //             {tier.cta}
              //           </Button>
              //         )}
              //         {session && isPro && (
              //           <Button
              //             disabled
              //             className="w-full disabled:opacity-70 disabled:bg-[#1b03a3] disabled:ring-gred:ring-4"
              //           >
              //             Current Plan
              //           </Button>
              //         )}
              //         {!session && (
              //           <Button
              //             className="w-full"
              //             onClick={() => {
              //               signInWithOAuth("subscribe");
              //             }}
              //           >
              //             Sign Up
              //           </Button>
              //         )}
              //       </div>
              //     )}
              //   </CardContent>
              //   <hr />
              //   <CardFooter className="h-[164px]">
                  // <ul role="list" className="mt-4 space-y-2">
                  //   {tier.features.map((feature) => (
                  //     <li key={feature} className="flex">
                  //       <FontAwesomeIcon
                  //         icon={faCircleCheck}
                  //         className="flex-shrink-0 w-6 h-6 text-indigo-500"
                  //         aria-hidden="true"
                  //       />
                  //       <span className="ml-3 text-gray-500">{feature}</span>
                  //     </li>
                  //   ))}
                  // </ul>
              //   </CardFooter>
              // </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default SubPage;